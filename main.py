#!/usr/bin/python
import torch
from transformers import BertModel, BertTokenizer
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
import random
from fastapi import FastAPI

app = FastAPI()

CATEGORIES = {'1': ('Title 1', 'Die Fensterscheibe meines Autos fährt nicht mehr korrekt hoch und ich muss trotz Garantie 200 Euro für die Reparatur zahlen. Ich fahre einen VW.'),
              '2': ('Title 2', 'Ich bin letzte Woche Freitag, am 21.02.2020 nach München geflogen mit easyjet und mein Flug hatte 3 Stunden verspätung.')}

# load BERT model
device = "cpu"
tokenizer = BertTokenizer.from_pretrained('bert-base-german-cased')
model = BertModel.from_pretrained('bert-base-german-cased')

# load spacy model
nlp = spacy.load("de_core_news_md")

def padding(arr, pad_token, dtype=torch.long):
    lens = torch.LongTensor([len(a) for a in arr])
    max_len = lens.max().item()
    padded = torch.ones(len(arr), max_len, dtype=dtype) * pad_token
    mask = torch.zeros(len(arr), max_len, dtype=torch.long)
    for i, a in enumerate(arr):
        padded[i, :lens[i]] = torch.tensor(a, dtype=dtype)
        mask[i, :lens[i]] = 1
    return padded, lens, mask

def collate_idf(arr, tokenize, numericalize, idf_dict,
                pad="[PAD]", device='cuda:0'):

    arr = [["[CLS]"]+tokenize(a)+["[SEP]"] for a in arr]
    arr = [numericalize(a) for a in arr]

    idf_weights = [[idf_dict[i] for i in a] for a in arr]

    pad_token = numericalize([pad])[0]

    padded, lens, mask = padding(arr, pad_token, dtype=torch.long)
    padded_idf, _, _ = padding(idf_weights, pad_token, dtype=torch.float)

    padded = padded.to(device=device)
    mask = mask.to(device=device)
    lens = lens.to(device=device)
    return padded, padded_idf, lens, mask

def bert_encode(model, x, attention_mask=None):
    model.eval()
    x_seg = torch.zeros_like(x, dtype=torch.long)
    with torch.no_grad():
        if attention_mask:
            x_encoded_layers, pooled_output = model(x, x_seg, attention_mask=attention_mask)
        else:
            x_encoded_layers, pooled_output = model(x, x_seg)
    return x_encoded_layers


def get_bert_embedding(text, model, tokenizer,
                       batch_size=-1, device='cuda:0'):
    all_sens = text.split(". ")
    idf_dict = defaultdict(lambda: 1.)
    padded_sens, padded_idf, lens, mask = collate_idf(all_sens,
                                                      tokenizer.tokenize, tokenizer.convert_tokens_to_ids,
                                                      idf_dict,
                                                      device=device)

    if batch_size == -1: batch_size = len(all_sens)

    embeddings = []
    with torch.no_grad():
        for i in range(0, len(all_sens), batch_size):
            #             batch_embedding = bert_encode(model, padded_sens[i:i+batch_size],
            #                                           attention_mask=mask[i:i+batch_size])

            # TODO missing attention mask
            batch_embedding = bert_encode(model, padded_sens[i:i + batch_size])
            # batch_embedding = torch.stack(batch_embedding)
            embeddings.append(batch_embedding)
            del batch_embedding

    total_embedding = torch.cat(embeddings, dim=0)

    return total_embedding, lens, mask, padded_idf

def rank(categories):
    res = sorted(categories, key=lambda categories: categories[1], reverse=True)
    return res

def get_category_data(cat_id):
    title, description = CATEGORIES[cat_id]
    return title, description

def get_sentence_entities(sentence):
    output = {}
    output['sentence'] = sentence
    
    doc = nlp(sentence)
    
    entities = []
    
    for ent in doc.ents:
        entity = {}
        entity['word'] = ent.text
        entity['entity'] = ent.label_
        entity['start'] = ent.start_char
        entity['end'] = ent.end_char
        entities.append(entity)
        
    output['named_entities'] = entities
    
    return output

def generate_output(ranked_categories):
    outputs = []
    output = {}
    temp = {}

    for i, (cat_id, sim) in enumerate(ranked_categories):
        title, desc = get_category_data(cat_id)
        temp['title'] = title
        temp['description'] = desc
        temp['num_litigants'] = random.randint(20, 999)

        output['rank'] = i+1
        output['entities'] = get_sentence_entities(desc)
        output['case'] = temp
        outputs.append(output)
        temp = {}
        output = {}

    return outputs

@app.get('/user_inputs/{user_input}')
def run(user_input):
    
    # convert user input into embedding
    embedding_user, lens_user, mask_user, idf_user = get_bert_embedding(user_input, model, tokenizer, device=device)
    embedding_user = sum(embedding_user)  # sum up all sentences ???
    embedding_user = embedding_user  # get last BERT layer
    
    category_similarities = []
    
    # define cosine similarity
    cos = torch.nn.modules.distance.CosineSimilarity(dim=0, eps=1e-6)
    
    # calculate cosine similarity between user input and category embeddings
    for i,cat_id in enumerate(CATEGORIES):
        _, desc = get_category_data(cat_id)
        embedding_c, lens_c, mask_c, idf_c = get_bert_embedding(desc, model, tokenizer, device=device)
        embedding_c = sum(embedding_c)  # sum up all sentences ???
        embedding_c = embedding_c  # get last BERT layer
        
        sim = cos(sum(embedding_user), sum(embedding_c))
        category_similarities.append([cat_id, float(sim)])
    
    ranked_categories = rank(category_similarities)
    ranked_categories = ranked_categories[:5]  # filter top 5 results
    
#     output = generate_output(ranked_categories)
    output = generate_output_v2(ranked_categories)
    
    return output

