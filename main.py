#!/usr/bin/python
import spacy
import torch
from transformers import BertModel, BertTokenizer
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
import random
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATEGORIES = {'1': ('Verbraucherrechte Kinderspielzeug', 'Falsch gekennzeichnete Lebensmittel, giftige Chemikalien in Kinderspielzeug, unfaire Geschäftsbedingen im Online-Handel, oder Mängel beim Datenschutz.'),
              '2': ('EU-Fluggastrechte', 'Flüge innerhalb der EU, die von einer Fluggesellschaft aus der EU oder einem Nicht-EU-Land durchgeführt werden. Flüge aus einem Nicht-EU-Land in die EU, die von einer Fluggesellschaft aus der EU durchgeführt werden. Flüge aus der EU in ein Nicht-EU-Land, die von einer Fluggesellschaft aus der EU oder einem Nicht-EU-Land durchgeführt werden. Sofern noch keine Leistungen (Entschädigung, anderweitige Beförderung, Unterstützung durch die Fluggesellschaft) bei flugbedingten Problemen für dieselbe Reise nach den Rechtvorschriften eines Nicht-EU-Landes gewährt wurden. Unter EU sind hier die 27 EU-Länder einschließlich Guadeloupe, Französisch-Guayana, Martinique, Réunion, Mayotte, Saint Martin (Französische Antillen), die Azoren, Madeira und die Kanarischen Inseln sowie Islanden, Norwegenen, die Schweiz und das Vereinigte Königreich zu verstehen. Nicht dazu gehören die Färöer, die Insel Man und die Kanalinseln.'), '3': ('Lärmbelästigung im Urlaub', 'Der Reiseveranstalter ist verpflichtet, die Reise so zu erbringen, dass sie die zugesicherten Eigenschaften hat und nicht mit Fehlern behaftet ist, die den Wert oder die Tauglichkeit zu dem gewöhnlichen oder nach dem Vertrag vorausgesetzten Nutzen aufheben oder mindern (§ 651c Abs. 2 BGB). Ist die Reise mangelhaft, kann der Reisende Abhilfe verlangen und für die Dauer der Mangelhaftigkeit den Reisepreis mindern. Voraussetzung ist aber, dass er vorher dem Veranstalter die Mangelhaftigkeit angezeigt hat, damit dieser Abhilfe schaffen kann (§ 651d Abs. 2 BGB). Die „beliebteste“ Mängelrüge gegenüber Reiseveranstaltern schlechthin, das ist die Dauerbelästigung durch Baulärm vor oder sogar im Hotel.'), '4': ('Verbraucherrechte in anderen EU-Ländern', 'Beim Kauf von Waren oder Dienstleistungen in der EU müssen Sie eindeutig über den Gesamtpreis, einschließlich aller Steuern und Zusatzkosten, informiert werden. Beim Online-Kauf sollten Sie – z. B. durch einen Klick auf eine Schaltfläche – ausdrücklich bestätigen müssen, dass Sie sich darüber bewusst sind, dass das Absenden Ihrer Bestellung Ihre Zahlungspflicht auslöst. Bei Online-Zahlungen von mehr als 30 Euro müssen Sie sich mit einer Kombination aus mindestens zwei Erkennungsmerkmalen legitimieren: mit Ihrem Mobiltelefon oder Kartenleser (persönliche Gegenstände) UND Ihrem PIN oder Passwort (persönliche Informationen) mit Ihrem Mobiltelefon oder Kartenleser (persönliche Gegenstände) UND Ihrem Fingerabdruck (körperliches Erkennungsmerkmal) mit Ihrem PIN oder Passwort (persönliche Informationen) UND Ihrem Fingerabdruck (körperliches Erkennungsmerkmal) Dies erhöht die Sicherheit der Zahlungsvorgänge.'), '5': ('Gewährleistung Autofenster', 'Der Verkäufer VW hat dem Käufer im Rahmen der Gewährleistung den Schaden am Autofenster zu ersetzen.')}

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
#     output['sentence'] = sentence
    
    doc = nlp(sentence)
    
    entities = []
    
    new_sent = ""
    
    prev_end = 0
    
    for ent in doc.ents:
        entity = {}
        entity['word'] = ent.text
        entity['entity'] = ent.label_
        entity['start'] = ent.start_char
        entity['end'] = ent.end_char
        entities.append(entity)
        
        new_sent += sentence[prev_end:ent.start_char] + '**{}**'.format(ent.text)
        prev_end = ent.end_char
        
    output['named_entities'] = entities
    output['sentence'] = new_sent
    
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
#        output['entities'] = {}
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
    output = generate_output(ranked_categories)
    
    return output

