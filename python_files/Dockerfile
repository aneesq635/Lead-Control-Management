FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# app.py mein "app = Flask(__name__)" hai → app:app correct hai
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "app:app"]