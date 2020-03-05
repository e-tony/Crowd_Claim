FROM python:3.6

COPY main.py /app/main.py
WORKDIR /app

RUN python -m venv /venv && /venv/vin/pip install --upgrade pip

COPY requirements.txt /requirements.txt
RUN /venv/bin/pip install -r /requirements.txt
RUN python -m spacy download de_core_news_md

EXPOSE 8000
USER 1001

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
