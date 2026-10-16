import os
from contextlib import asynccontextmanager

import fastapi
import fastapi.middleware.cors
from pydantic import BaseModel
import pandas as pd
import joblib

from db import db
from rutas_usuario import router as router_usuario
from asistente import router as router_asistente


@asynccontextmanager
async def lifespan(app: fastapi.FastAPI):
    # Índices de MongoDB (si la base no está disponible, el backend arranca igual)
    if db is not None:
        try:
            db.usuarios.create_index("email", unique=True)
            db.carnet.create_index("usuario_id")
            db.citas.create_index("usuario_id")
        except Exception as e:
            print(f"No se pudieron crear los índices de MongoDB: {e}")
    yield


app = fastapi.FastAPI(lifespan=lifespan)

# CORS_ORIGINS: lista separada por comas con la URL del frontend en Render.
# Si no se define, se permite cualquier origen (la autenticación usa el header
# Authorization, no cookies, así que no se necesitan credenciales).
origenes = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=origenes,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_usuario)
app.include_router(router_asistente)

# Load the trained model and label binarizer
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
mlb_path = os.path.join(os.path.dirname(__file__), "mlb.pkl")

pipeline = None
mlb = None

try:
    pipeline = joblib.load(model_path)
    mlb = joblib.load(mlb_path)
except FileNotFoundError:
    print("Model files not found. Please upload model.pkl and mlb.pkl to the backend folder.")


class PredictionRequest(BaseModel):
    edad: int
    sexo: str
    condicion_salud: str
    vacunas_aplicadas: str


class PredictionResponse(BaseModel):
    vacunas_recomendadas: list[str]
    success: bool
    message: str


@app.get("/")
def raiz() -> dict[str, str]:
    return {"servicio": "PAI Digital API", "estado": "ok"}


@app.get("/health")
def health() -> dict[str, str]:
    model_status = "loaded" if pipeline is not None and mlb is not None else "not_loaded"
    if db is None:
        db_status = "no_configurada"
    else:
        try:
            db.command("ping")
            db_status = "ok"
        except Exception:
            db_status = "sin_conexion"
    return {
        "status": "ok",
        "model_status": model_status,
        "db_status": db_status,
        "asistente": "configurado" if os.getenv("GROQ_API_KEY") else "no_configurado",
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if pipeline is None or mlb is None:
        return PredictionResponse(
            vacunas_recomendadas=[],
            success=False,
            message="Modelo no cargado. Por favor, suba los archivos model.pkl y mlb.pkl al servidor.",
        )

    try:
        # Create DataFrame with the input data
        nuevo = pd.DataFrame([{
            "Edad": request.edad,
            "Sexo": request.sexo,
            "Condicion_Salud": request.condicion_salud,
            "Vacunas_Aplicadas": request.vacunas_aplicadas,
        }])

        # Make prediction
        pred = pipeline.predict(nuevo)

        # Convert binary prediction to vaccine names
        vacunas = mlb.inverse_transform(pred)

        # Flatten the result
        vacunas_list = list(vacunas[0]) if vacunas[0] else []

        return PredictionResponse(
            vacunas_recomendadas=vacunas_list,
            success=True,
            message="Prediccion realizada exitosamente",
        )
    except Exception as e:
        return PredictionResponse(
            vacunas_recomendadas=[],
            success=False,
            message=f"Error al realizar la prediccion: {str(e)}",
        )


@app.get("/model-info")
async def model_info():
    if mlb is None:
        return {
            "loaded": False,
            "vaccines": [],
            "message": "Modelo no cargado",
        }

    return {
        "loaded": True,
        "vaccines": list(mlb.classes_),
        "message": "Modelo cargado correctamente",
    }