FROM python:3.12

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY src/app .

RUN python download_kernels.py

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]