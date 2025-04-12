import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Union

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI(title="Translation History Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the data file
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "translations.json")

# Ensure data directory exists
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

# Create empty data file if it doesn't exist
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


# Models
class Language(BaseModel):
    from_lang: str
    to: str


class Translation(BaseModel):
    original: str
    translated: str
    timestamp: str
    language: Optional[Dict[str, str]] = None


# Helper functions
def read_translations() -> List[Dict]:
    """Read translations from the JSON file."""
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        # Return empty list if file is empty or doesn't exist
        return []


def write_translations(translations: List[Dict]) -> None:
    """Write translations to the JSON file."""
    with open(DATA_FILE, "w") as f:
        json.dump(translations, f, indent=2)


# Mount static files
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")


# Routes
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page."""
    with open(os.path.join(os.path.dirname(__file__), "static", "index.html"), "r") as f:
        return f.read()


@app.get("/api/translations")
async def get_translations():
    """Get all translations."""
    return read_translations()


@app.post("/api/translations")
async def add_translation(translation: Translation):
    """Add a new translation."""
    translations = read_translations()
    
    # Convert to dict for storage
    translation_dict = translation.dict()
    
    # Add to translations list
    translations.append(translation_dict)
    
    # Write back to file
    write_translations(translations)
    
    return {"status": "success", "message": "Translation added successfully"}


@app.delete("/api/translations/{translation_id}")
async def delete_translation(translation_id: str):
    """Delete a specific translation by its ID (timestamp)."""
    translations = read_translations()
    
    # Find the translation with the matching ID (timestamp)
    original_length = len(translations)
    translations = [t for t in translations if t.get("timestamp") != translation_id]
    
    # If no translation was removed, return 404
    if len(translations) == original_length:
        raise HTTPException(status_code=404, detail="Translation not found")
    
    # Write the updated list back to the file
    write_translations(translations)
    
    return {"status": "success", "message": "Translation deleted successfully"}


@app.delete("/api/translations")
async def delete_all_translations():
    """Delete all translations."""
    # Write an empty list to the file
    write_translations([])
    
    return {"status": "success", "message": "All translations deleted successfully"}


# Run the app with: uvicorn app.main:app --host 0.0.0.0 --port 3005 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3005)
