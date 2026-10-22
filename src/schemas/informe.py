from pydantic import BaseModel, EmailStr


class InformeEnvioResponse(BaseModel):
    status: str = "success"
    mensaje: str
    destinatario: EmailStr
    evaluacion_id: int
    archivo_adjunto: str = "Informe_vocacional_Nexora.pdf"


class ErrorResponse(BaseModel):
    detail: str
