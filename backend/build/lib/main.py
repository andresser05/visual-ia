import fastapi
import fastapi.middleware.cors
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = fastapi.FastAPI()

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/health")
async def health() -> dict[str, str]:
    model_status = "loaded" if pipeline is not None and mlb is not None else "not_loaded"
    return {"status": "ok", "model_status": model_status}


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if pipeline is None or mlb is None:
        return PredictionResponse(
            vacunas_recomendadas=[],
            success=False,
            message="Modelo no cargado. Por favor, suba los archivos model.pkl y mlb.pkl al servidor."
        )
    
    try:
        # Create DataFrame with the input data
        nuevo = pd.DataFrame([{
            "Edad": request.edad,
            "Sexo": request.sexo,
            "Condicion_Salud": request.condicion_salud,
            "Vacunas_Aplicadas": request.vacunas_aplicadas
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
            message="Prediccion realizada exitosamente"
        )
    except Exception as e:
        return PredictionResponse(
            vacunas_recomendadas=[],
            success=False,
            message=f"Error al realizar la prediccion: {str(e)}"
        )


@app.get("/model-info")
async def model_info():
    if mlb is None:
        return {
            "loaded": False,
            "vaccines": [],
            "message": "Modelo no cargado"
        }
    
    return {
        "loaded": True,
        "vaccines": list(mlb.classes_),
        "message": "Modelo cargado correctamente"
    }
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def inicio():
    return {"mensaje": "API funcionando en Render"}