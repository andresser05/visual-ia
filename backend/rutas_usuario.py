from datetime import date

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from auth import crear_token, hashear, usuario_actual, verificar
from db import db

router = APIRouter()

EMAIL = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


def coleccion(nombre: str):
    if db is None:
        raise HTTPException(status_code=503, detail="Base de datos no configurada")
    return db[nombre]


def a_objectid(valor: str) -> ObjectId:
    try:
        return ObjectId(valor)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=404, detail="No encontrado")


def publico(doc: dict) -> dict:
    """Documento listo para enviar al frontend (sin hash ni ids internos)."""
    salida = {k: v for k, v in doc.items() if k not in ("_id", "usuario_id", "clave_hash")}
    salida["id"] = str(doc["_id"])
    return salida


class RegistroIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    email: str = Field(pattern=EMAIL, max_length=120)
    clave: str = Field(min_length=6, max_length=64)


class LoginIn(BaseModel):
    email: str = Field(max_length=120)
    clave: str = Field(max_length=64)


class DosisIn(BaseModel):
    vacuna: str = Field(min_length=2, max_length=80)
    fecha: date
    lugar: str | None = Field(default=None, max_length=120)


class CitaIn(BaseModel):
    punto_id: str = Field(max_length=60)
    punto_nombre: str = Field(max_length=120)
    vacuna: str = Field(min_length=2, max_length=80)
    fecha: date
    hora: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")


# ---------- Autenticación ----------

@router.post("/auth/registro", status_code=201)
def registro(datos: RegistroIn):
    usuario = {
        "nombre": datos.nombre.strip(),
        "email": datos.email.lower(),
        "clave_hash": hashear(datos.clave),
        "creado": date.today().isoformat(),
    }
    try:
        resultado = coleccion("usuarios").insert_one(usuario)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado")
    return {"token": crear_token(str(resultado.inserted_id)), "usuario": publico(usuario)}


@router.post("/auth/login")
def login(datos: LoginIn):
    usuario = coleccion("usuarios").find_one({"email": datos.email.lower()})
    if usuario is None or not verificar(datos.clave, usuario["clave_hash"]):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    return {"token": crear_token(str(usuario["_id"])), "usuario": publico(usuario)}


@router.get("/me")
def me(usuario: dict = Depends(usuario_actual)):
    return publico(usuario)


# ---------- Carnet digital ----------

@router.get("/carnet")
def listar_carnet(usuario: dict = Depends(usuario_actual)):
    docs = coleccion("carnet").find({"usuario_id": usuario["_id"]}).sort("fecha", -1)
    return [publico(d) for d in docs]


@router.post("/carnet", status_code=201)
def agregar_dosis(datos: DosisIn, usuario: dict = Depends(usuario_actual)):
    if datos.fecha > date.today():
        raise HTTPException(status_code=422, detail="La fecha de una dosis aplicada no puede ser futura")
    doc = {
        "usuario_id": usuario["_id"],
        "vacuna": datos.vacuna.strip(),
        "fecha": datos.fecha.isoformat(),
        "lugar": (datos.lugar or "").strip() or None,
    }
    coleccion("carnet").insert_one(doc)
    return publico(doc)


@router.delete("/carnet/{dosis_id}")
def borrar_dosis(dosis_id: str, usuario: dict = Depends(usuario_actual)):
    resultado = coleccion("carnet").delete_one(
        {"_id": a_objectid(dosis_id), "usuario_id": usuario["_id"]}
    )
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No encontrado")
    return {"ok": True}


# ---------- Citas ----------

@router.get("/citas")
def listar_citas(usuario: dict = Depends(usuario_actual)):
    docs = coleccion("citas").find({"usuario_id": usuario["_id"]}).sort([("fecha", 1), ("hora", 1)])
    return [publico(d) for d in docs]


@router.post("/citas", status_code=201)
def agendar_cita(datos: CitaIn, usuario: dict = Depends(usuario_actual)):
    if datos.fecha < date.today():
        raise HTTPException(status_code=422, detail="La fecha de la cita no puede ser pasada")
    citas = coleccion("citas")
    repetida = citas.find_one(
        {
            "usuario_id": usuario["_id"],
            "punto_id": datos.punto_id,
            "fecha": datos.fecha.isoformat(),
            "hora": datos.hora,
        }
    )
    if repetida is not None:
        raise HTTPException(status_code=409, detail="Ya tienes una cita en ese punto, fecha y hora")
    doc = {
        "usuario_id": usuario["_id"],
        "punto_id": datos.punto_id,
        "punto_nombre": datos.punto_nombre,
        "vacuna": datos.vacuna.strip(),
        "fecha": datos.fecha.isoformat(),
        "hora": datos.hora,
    }
    citas.insert_one(doc)
    return publico(doc)


@router.delete("/citas/{cita_id}")
def cancelar_cita(cita_id: str, usuario: dict = Depends(usuario_actual)):
    resultado = coleccion("citas").delete_one(
        {"_id": a_objectid(cita_id), "usuario_id": usuario["_id"]}
    )
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No encontrado")
    return {"ok": True}