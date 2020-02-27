FROM python:3.6

COPY main.py /app/main.py
WORKDIR /app

RUN pip install transformers fastapi scikit-learn torch==1.4.0+cpu torchvision==0.5.0+cpu -f https://download.pytorch.org/whl/torch_stable.html

RUN pip install uvicorn

EXPOSE 8000

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
