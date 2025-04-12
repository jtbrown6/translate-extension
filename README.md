# Quick Translator System

This project consists of two main components:

1. **Quick Translator Chrome Extension**: A browser extension that translates text between English and Spanish using the Google Gemini API.
2. **Translation History Service**: A web service that stores and displays translation history from the Chrome extension.

## Quick Translator Chrome Extension

### Features

- Automatically detects if the input text is English or Spanish
- Translates English to Spanish and Spanish to English
- Simple and clean user interface
- Uses Google Gemini API for high-quality translations
- Save translations to the Translation History Service

### Setup Instructions

1. **Generate the icon**:
   - Open `icon_generator.html` in a web browser
   - The icon will be automatically generated
   - Click the "Download Icon" button
   - Save it as `icon.png` in the extension folder

2. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" by toggling the switch in the top-right corner
   - Click "Load unpacked" and select the extension folder
   - The extension should now be installed and visible in your toolbar

3. **Using the extension**:
   - Click on the extension icon in the Chrome toolbar
   - Enter text in the input box
   - The translation will automatically appear in the output box
   - Click "Save Translation" to store the translation in the history service

### Extension Files

- `manifest.json`: Extension configuration
- `popup.html`: The popup UI structure
- `popup.css`: Styles for the popup UI
- `popup.js`: JavaScript code for handling translations
- `icon_generator.html`: Tool to generate the extension icon
- `icon.png`: Extension icon (generated using the tool)

## Translation History Service

### Features

- Store translations with original text, translated text, timestamp, and language information
- View translations in a responsive, modern web interface
- Group translations by week
- Filter translations by language direction (English to Spanish, Spanish to English)
- Search translations by content
- Sort translations by date (newest or oldest first)
- Filter translations by time period (today, this week, this month, all time)
- View statistics about your translations
- Delete individual translations or clear all history

### Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker

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

3. Access the web interface at `http://192.168.1.214:3005`

### Service Files

The Translation History Service is located in the `translation_history_service/` directory. See its [README.md](translation_history_service/README.md) for more detailed information.

## Integration

The Chrome extension is configured to send translations to the Translation History Service running at `http://192.168.1.214:3005`. When you click the "Save Translation" button in the extension, it sends the translation data to the service, which then stores it and makes it available for viewing in the web interface.

## Troubleshooting

If you encounter issues with the Chrome extension:

1. **Check the console for errors**:
   - Right-click on the extension popup
   - Select "Inspect" or "Inspect Element"
   - Go to the Console tab to see detailed error messages

2. **Common issues**:
   - API key issues: Verify the API key in `popup.js` is correct
   - Network issues: Ensure you have internet connectivity
   - CORS issues: The extension has been configured with the necessary permissions, but you may need to reload it

If you encounter issues with the Translation History Service:

1. **Check if the service is running**:
   - Verify that the Docker container is running with `docker ps`
   - Check the container logs with `docker logs translation-history`

2. **Check network connectivity**:
   - Ensure that the Chrome extension can reach the service at `http://192.168.1.214:3005`
   - Verify that port 3005 is open and accessible
