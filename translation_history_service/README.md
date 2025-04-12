# Translation History Service

A web service that stores and displays translation history from the Quick Translator Chrome extension.

## Features

- Store translations with original text, translated text, timestamp, and language information
- View translations in a responsive, modern web interface
- Group translations by week
- Filter translations by language direction (English to Spanish, Spanish to English)
- Search translations by content
- Sort translations by date (newest or oldest first)
- Filter translations by time period (today, this week, this month, all time)
- View statistics about your translations
- Clear translation history

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker

## Project Structure

```
translation_history_service/
├── app/
│   ├── main.py        # FastAPI application
│   ├── data/          # Directory for translations.json (bind mounted)
│   └── static/        # Frontend files
│       ├── index.html # Main HTML page
│       ├── styles.css # CSS styles
│       └── script.js  # JavaScript for frontend functionality
├── Dockerfile         # Docker configuration
└── requirements.txt   # Python dependencies
```

## API Endpoints

- `GET /api/translations`: Get all translations
- `POST /api/translations`: Add a new translation
- `DELETE /api/translations/{translation_id}`: Delete a specific translation by its ID (timestamp)
- `DELETE /api/translations`: Delete all translations

## Setup and Deployment

### Prerequisites

- Docker installed on your system
- A directory on your host machine for persistent storage

### Deployment Steps

1. Build the Docker image:
   ```bash
   cd translation_history_service
   docker build -t translation-history-service .
   ```

2. Run the container with a bind mount for data persistence:
   ```bash
   docker run -d --name translation-history -p 3005:3005 -v /path/on/your/host/translation_data:/app/app/data translation-history-service
   ```
   (Replace `/path/on/your/host/translation_data` with the actual directory path on your host machine where you want the data to be stored)

3. Access the web interface at `http://localhost:3005` (or replace `localhost` with your server's IP address)

## Integration with Chrome Extension

The Quick Translator Chrome extension is configured to send translations to this service when the user clicks the "Save Translation" button. The extension sends a POST request to the `/api/translations` endpoint with the following data:

```json
{
  "original": "Original text",
  "translated": "Translated text",
  "timestamp": "2023-04-11T12:00:00Z",
  "language": {
    "from": "English",
    "to": "Spanish"
  }
}
```

## Development

To run the service locally without Docker for development:

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the FastAPI application with hot reloading:
   ```bash
   cd translation_history_service
   uvicorn app.main:app --host 0.0.0.0 --port 3005 --reload
   ```

3. Access the web interface at `http://localhost:3005`
