from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_listar_universidades():
    response = client.get("/api/v1/catalogo/universidades")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 20  # Existen al menos 31 IES públicas

    # Verificar presencia de UTMACH y UNEMI
    siglas = [u["siglas"] for u in data]
    assert "UTMACH" in siglas
    assert "UNEMI" in siglas

def test_detalle_universidad_utmach():
    response = client.get("/api/v1/catalogo/universidades/UTMACH")
    assert response.status_code == 200
    data = response.json()
    assert data["siglas"] == "UTMACH"
    assert "Técnica de Machala" in data["nombre"] or "TECNICA DE MACHALA" in data["nombre"].upper()
    assert data["provincia_matriz"] == "El Oro"
    assert data["ciudad_matriz"] == "Machala"
    assert data["total_carreras"] == 30
    assert len(data["facultades"]) == 5
    assert "Facultad de Ciencias Químicas y de la Salud" in data["facultades"]
    assert data["sitio_web"].startswith("https://")

def test_detalle_universidad_unemi():
    response = client.get("/api/v1/catalogo/universidades/UNEMI")
    assert response.status_code == 200
    data = response.json()
    assert data["siglas"] == "UNEMI"
    assert "Estatal de Milagro" in data["nombre"] or "ESTATAL DE MILAGRO" in data["nombre"].upper()
    assert data["provincia_matriz"] == "Guayas"
    assert data["ciudad_matriz"] == "Milagro"
    assert data["total_carreras"] == 30
    assert len(data["facultades"]) == 4
    assert data["sitio_web"].startswith("https://")

def test_filtro_carreras_por_siglas_utmach():
    response = client.get("/api/v1/catalogo/carreras?siglas=UTMACH")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 30
    # Verificar que todas corresponden a UTMACH
    for carrera in data:
        assert carrera["siglas"] == "UTMACH"

def test_filtro_carreras_por_siglas_unemi():
    response = client.get("/api/v1/catalogo/carreras?siglas=UNEMI")
    assert response.status_code == 200
    data = response.json()
    assert len(set(c["nombre"] for c in data)) == 30
    assert len(data) >= 30
    # Verificar que todas corresponden a UNEMI
    for carrera in data:
        assert carrera["siglas"] == "UNEMI"

def test_busqueda_universidades():
    response = client.get("/api/v1/catalogo/universidades?search=Milagro")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(u["siglas"] == "UNEMI" for u in data)


def test_todas_las_universidades_incorporadas():
    response = client.get("/api/v1/catalogo/universidades")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 33

    pendientes = [u for u in data if u["total_carreras"] == 0]
    activas = [u for u in data if u["total_carreras"] > 0]

    assert len(pendientes) == 0, "Todas las 33 universidades públicas deben estar incorporadas con oferta oficial de grado"
    assert len(activas) == 33, "Deben existir exactamente 33 universidades públicas activas"

    # Verificar que las 12 instituciones anteriormente pendientes ahora están activas
    siglas_activas = {u["siglas"] for u in activas}
    doce_incorporadas = [
        "EPN", "ESPAM MFL", "ESPE", "UCE", "UCUENCA", "UEA", "UG", "UNESUM", "UTA", "UTB", "UTC", "YACHAY TECH"
    ]
    for s in doce_incorporadas:
        assert s in siglas_activas
        u_info = next(u for u in activas if u["siglas"] == s)
        assert u_info["estado_catalogo"] == "INCORPORADO"
        assert u_info["total_carreras_unicas"] > 0

    # Verificar UNL: 28 carreras únicas (Administración de Empresas consolidada) y 29 ofertas
    unl = next(u for u in activas if u["siglas"] == "UNL")
    assert unl["total_carreras"] == 28, "UNL debe reportar exactamente 28 carreras únicas"
    assert unl["total_carreras_unicas"] == 28
    assert unl["total_ofertas"] == 29

    # Verificar UPEC: 16 carreras únicas en 3 facultades oficiales
    upec = next(u for u in activas if u["siglas"] == "UPEC")
    assert upec["total_carreras"] == 16, "UPEC debe reportar exactamente 16 carreras únicas"
    assert upec["total_carreras_unicas"] == 16
    assert len(upec["facultades"]) == 3
    assert not any("área" in f.lower() or "area" in f.lower() for f in upec["facultades"])

    # Verificar UNEMI: 30 carreras únicas en 4 facultades oficiales
    unemi = next(u for u in activas if u["siglas"] == "UNEMI")
    assert unemi["total_carreras"] == 30, "UNEMI debe reportar exactamente 30 carreras únicas"
    assert unemi["total_carreras_unicas"] == 30
    assert len(unemi["facultades"]) == 4

