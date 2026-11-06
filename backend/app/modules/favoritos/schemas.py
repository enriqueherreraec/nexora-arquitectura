from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class FavoritoBase(BaseModel):
    carrera_id: int


class FavoritoResponse(BaseModel):
    id: int
    usuario_id: int
    carrera_id: int
    creado_en: datetime
    carrera: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class FavoritoIdsResponse(BaseModel):
    favoritos_ids: List[int]
    total: int


class FavoritoToggleResponse(BaseModel):
    carrera_id: int
    favorito: bool
    mensaje: str
