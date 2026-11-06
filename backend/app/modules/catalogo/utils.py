import unicodedata
from typing import Optional


def remover_tildes(texto: Optional[str]) -> str:
    """Elimina tildes, diacríticos y normaliza a minúsculas para búsquedas."""
    if not texto:
        return ""
    texto_str = str(texto).strip()
    nfkd = unicodedata.normalize("NFKD", texto_str)
    sin_diacriticos = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return " ".join(sin_diacriticos.lower().split())
