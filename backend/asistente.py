import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from groq import Groq, RateLimitError, APIError

router = APIRouter()

ESQUEMA_PAI = """
Fuente: Esquema de vacunación de Colombia, MinSalud (memoficha, actualización julio 2026).
Las vacunas del PAI son gratuitas.

NIÑOS Y NIÑAS MENORES DE 6 AÑOS
- Recién nacido: BCG (dosis única; previene meningitis tuberculosa) y Hepatitis B
  (preferiblemente en las primeras 12 horas de vida).
- 2 meses: 1.ª dosis de Pentavalente (difteria, tosferina, tétanos, Haemophilus influenzae
  tipo b y hepatitis B), 1.ª de Polio VIP, 1.ª de Rotavirus y 1.ª de Neumococo.
- 4 meses: 2.ª dosis de Pentavalente, Polio VIP, Rotavirus y Neumococo.
- 6 meses: 3.ª dosis de Pentavalente y de Polio VIP; 1.ª dosis de Influenza estacional.
- 7 meses: 2.ª dosis de Influenza estacional.
- 9 meses: Fiebre amarilla (dosis única).
- 12 meses: Triple viral (sarampión, rubéola, paperas), Varicela, Hepatitis A (dosis única)
  y refuerzo de Neumococo.
- 18 meses: 1.er refuerzo de Pentavalente y de Polio VIP; refuerzo de Triple viral.
- 5 años: 2.º refuerzo de DPT y de Polio VIP; refuerzo de Varicela.
- Sarampión "dosis cero": entre los 6 y 11 meses, según lineamiento.

NOTAS DEL ESQUEMA INFANTIL
- A los 2 meses NO se aplica una dosis separada de Hepatitis B: la protección viene dentro
  de la Pentavalente. La Polio es una vacuna aparte (VIP).
- La BCG es dosis única al nacer.
- La influenza empieza a los 6 meses, no antes. Entre 6 y 35 meses sin vacunación previa
  son 2 dosis con 4 semanas de intervalo; con primovacunación, 1 dosis anual hasta los 5 años.
- Rotavirus: la 1.ª dosis se aplica entre los 2 meses y máximo 3 meses y 21 días; la 2.ª,
  hasta los 11 meses y 29 días. Sin primera dosis no hay segunda.
- Hexavalente (DPT, Hib, Hep B, VIP) reemplaza a la Pentavalente en niños con peso al nacer
  menor a 1.500 g nacidos desde el 1 de abril de 2025.
- Todos los niños y adolescentes de 9 meses a 19 años que vivan o transiten por el país
  deben recibir fiebre amarilla.
- No se reinician esquemas: se revisa el antecedente vacunal en el carné.
- Se vacuna sin barreras, sin importar el estatus migratorio.
- Si se pierde el carné, igual se puede acudir al centro de salud o IPS.

OTROS GRUPOS
- 9 a 17 años: VPH (cáncer causado por el virus del papiloma humano), dosis única;
  personas inmunocomprometidas, 2 dosis (0 y 6 meses).
- Dengue: inclusión escalonada solo en municipios priorizados, según lineamientos de MinSalud.
- Mujeres en edad fértil (10 a 49 años): Td, 5 dosis (Td1 día 0; Td2 al mes; Td3 a los
  6 meses de Td2; Td4 al año de Td3; Td5 al año de Td4) y refuerzo cada 10 años.
- Gestantes: Influenza anual desde la semana 14; TdaP en cada embarazo desde la semana 20;
  VSR en cada embarazo entre las semanas 28 y 36; COVID-19 según lineamientos.
- Adultos de 60 años y más: Influenza estacional anual.
- Existen vacunas para el abordaje de brotes de meningococo y Mpox.

El esquema puede cambiar según el contexto epidemiológico (acortamiento de intervalos,
nuevos biológicos). La memoficha no reemplaza los lineamientos de MinSalud.
"""

SISTEMA = f"""Eres el asistente de VacunaIA. Solo respondes sobre el Programa
Ampliado de Inmunización (PAI) de Colombia y el uso de esta aplicación.
Responde ÚNICAMENTE con base en el siguiente esquema oficial. Si lo que
preguntan no está ahí, di que no tienes ese dato y recomienda confirmarlo
con el Ministerio de Salud o la EPS. No inventes edades, dosis ni vacunas.
No diagnosticas, no recetas y no das consejos médicos. Ante cualquier
síntoma o reacción después de vacunarse (fiebre, llanto, hinchazón,
erupción, etc.), NO des pautas de cuidado, medicamentos, temperaturas ni
tiempos. Responde únicamente: que consulte con su EPS, el centro de salud
o un profesional de salud, y que ante signos graves como dificultad para
respirar o convulsiones acuda de inmediato a urgencias.
No agregues datos que no estén en el esquema, como "se aplican el mismo día". Si preguntan algo fuera de este tema, di amablemente
que solo puedes ayudar con vacunación.
Responde en español, en texto corto y sin tablas.

ESQUEMA OFICIAL DEL PAI:
{ESQUEMA_PAI}"""


class Mensaje(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(max_length=1000)


class Consulta(BaseModel):
    mensajes: list[Mensaje] = Field(min_length=1, max_length=20)


@router.post("/asistente")
def asistente(consulta: Consulta):
    clave = os.getenv("GROQ_API_KEY")
    if not clave:
        raise HTTPException(500, "El asistente no está configurado.")

    cliente = Groq(api_key=clave)
    historial = [m.model_dump() for m in consulta.mensajes[-8:]]

    try:
        r = cliente.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            messages=[{"role": "system", "content": SISTEMA}, *historial],
            max_tokens=1200,
            temperature=0.1,
        )
    except RateLimitError:
        raise HTTPException(429, "Hay muchas consultas ahora. Intenta de nuevo en un minuto.")
    except APIError as e:
        print(f"Error de Groq: {type(e).__name__}: {e}")
        raise HTTPException(502, "No se pudo consultar al asistente. Intenta más tarde.")

    return {"respuesta": r.choices[0].message.content}