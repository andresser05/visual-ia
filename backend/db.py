import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

NOMBRE_DB = os.getenv("MONGODB_DB", "pai_digital")
_uri = os.getenv("MONGODB_URI")

# Si no hay MONGODB_URI el backend arranca igual (la recomendación sigue
# funcionando) y los endpoints de usuario responden 503.
client = MongoClient(_uri, serverSelectionTimeoutMS=5000) if _uri else None
db = client[NOMBRE_DB] if client is not None else None