FROM python:3.9-slim

WORKDIR /app

# Install system dependencies with correct package names
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p uploads temp

EXPOSE 5000
ENV PYTHONUNBUFFERED=1

CMD ["python", "app/main.py"]
