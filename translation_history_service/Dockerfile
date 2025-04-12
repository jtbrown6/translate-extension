FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY app/ ./app/

# Create data directory if it doesn't exist
RUN mkdir -p /app/app/data

# Expose the port
EXPOSE 3005

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3005"]
