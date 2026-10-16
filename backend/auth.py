import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from db import db

ALGORITMO = "HS256"
DIAS_TOKEN = 7
bearer = HTTPBearer(auto_error=False)


def _secreto() -> str:
    secreto = os.getenv("JWT_SECRET")
    if not secreto:
        raise HTTPException(status_code=500, detail="JWT_SECRET no está configurada en el servidor")
    return secreto


def hashear(clave: str) -> str:
    return bcrypt.hashpw(clave.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar(clave: str, hash_guardado: str) -> bool:
    try:
        return bcrypt.checkpw(clave.encode("utf-8"), hash_guardado.encode("utf-8"))
    except ValueError:
        return False


def crear_token(usuario_id: str) -> str:
    payload = {
        "sub": usuario_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=DIAS_TOKEN),
    }
    return jwt.encode(payload, _secreto(), algorithm=ALGORITMO)


def usuario_actual(cred: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if cred is None:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión")
    try:
        datos = jwt.decode(cred.credentials, _secreto(), algorithms=[ALGORITMO])
        usuario_id = ObjectId(datos["sub"])
    except (jwt.PyJWTError, InvalidId, KeyError):
        raise HTTPException(status_code=401, detail="Sesión inválida o vencida")
    if db is None:
        raise HTTPException(status_code=503, detail="Base de datos no configurada")
    usuario = db.usuarios.find_one({"_id": usuario_id})
    if usuario is None:
        raise HTTPException(status_code=401, detail="Sesión inválida o vencida")
    return usuario