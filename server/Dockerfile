FROM python:3.6

COPY main.py /app/main.py
WORKDIR /app

RUN pip install -r requirements.txt
RUN python -m spacy download de_core_news_md

EXPOSE 8000

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
