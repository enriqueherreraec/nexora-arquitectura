"""
Script de inicialización y siembra (seeding) de la base de datos de Nexora en Render/Producción.
Ejecuta la carga inicial del catálogo de universidades y carreras públicas si la tabla está vacía.
"""
import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.core.database import engine, SessionLocal, Base
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.data import OFERTA_CARRERAS
from app.modules.cuentas.models import Usuario
from app.modules.cuentas.dependencies import get_password_hash


def seed_database():
    print("=" * 60)
    print(" NEXORA - Sembrado Inicial de Base de Datos")
    print("=" * 60)

    # Asegurar que todas las tablas existan
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Sembrado del catálogo de carreras
        total_carreras = db.query(CarreraCatalogo).count()
        if total_carreras == 0:
            print(f"[*] Tabla 'carreras_catalogo' vacía. Insertando {len(OFERTA_CARRERAS)} registros...")
            for item in OFERTA_CARRERAS:
                # Sanitizar campos
                c = CarreraCatalogo(
                    id=item.get("id"),
                    codigo_oferta=item.get("codigo_oferta"),
                    codigo_ies=item.get("codigo_ies"),
                    nombre=item.get("nombre", ""),
                    nombre_normalizado=item.get("nombre_normalizado") or item.get("nombre", "").lower(),
                    titulo_otorga=item.get("titulo_otorga"),
                    area_vocacional=item.get("area_vocacional", "General"),
                    areas_vocacionales=item.get("areas_vocacionales"),
                    institucion=item.get("institucion", ""),
                    institucion_normalizada=item.get("institucion_normalizada") or item.get("institucion", "").lower(),
                    siglas=item.get("siglas"),
                    tipo_ies=item.get("tipo_ies"),
                    tipo_financiamiento=item.get("tipo_financiamiento", "Pública"),
                    facultad=item.get("facultad"),
                    respaldo_facultad=item.get("respaldo_facultad"),
                    campo_amplio=item.get("campo_amplio"),
                    campo_conocimiento_ces=item.get("campo_conocimiento_ces"),
                    nivel_formacion=item.get("nivel_formacion", "Tercer Nivel"),
                    nivel_academico=item.get("nivel_academico", "Grado"),
                    es_tercer_nivel=item.get("es_tercer_nivel", True),
                    es_posgrado=item.get("es_posgrado", False),
                    modalidad=item.get("modalidad", "Presencial"),
                    modalidad_normalizada=item.get("modalidad_normalizada") or item.get("modalidad", "").lower(),
                    provincia=item.get("provincia", "Pichincha"),
                    provincia_normalizada=item.get("provincia_normalizada") or item.get("provincia", "").lower(),
                    canton=item.get("canton"),
                    canton_normalizado=item.get("canton_normalizado"),
                    campus=item.get("campus"),
                    lugar_ejecucion=item.get("lugar_ejecucion"),
                    duracion_semestres=item.get("duracion_semestres", 9) if isinstance(item.get("duracion_semestres"), int) else 9,
                    semestres_publicados=str(item.get("semestres_publicados", "")),
                    modalidad_duracion=item.get("modalidad_duracion"),
                    puntaje_referencial=item.get("puntaje_referencial", 750) if isinstance(item.get("puntaje_referencial"), int) else 750,
                    puntaje_fuente=item.get("puntaje_fuente", "Histórico SENESCYT"),
                    puntaje_es_simulado=bool(item.get("puntaje_es_simulado", False)),
                    nivelacion_estado=item.get("nivelacion_estado", "Sí"),
                    nivelacion_fuente=item.get("nivelacion_fuente", "Oficial"),
                    nivelacion_es_demo=bool(item.get("nivelacion_es_demo", False)),
                    enlace_oficial=item.get("enlace_oficial") or item.get("pagina_web"),
                    pagina_web=item.get("pagina_web"),
                    lat=item.get("lat"),
                    lon=item.get("lon"),
                    estado=item.get("estado", "Vigente"),
                    es_vigente=bool(item.get("es_vigente", True)),
                    estado_verificacion=item.get("estado_verificacion", "Verificado"),
                )
                db.add(c)
            db.commit()
            print(f"[OK] {len(OFERTA_CARRERAS)} carreras insertadas exitosamente.")
        else:
            print(f"[OK] Catálogo ya contiene {total_carreras} carreras. No requiere siembra.")

        # 2. Verificar usuarios iniciales
        admin_email = os.getenv("ADMIN_EMAIL", "admin@nexora.ec")
        admin_user = db.query(Usuario).filter(Usuario.email == admin_email).first()
        if not admin_user:
            default_pass = os.getenv("ADMIN_INITIAL_PASSWORD", "NexoraAdmin2026!")
            admin_user = Usuario(
                email=admin_email,
                nombre_completo="Administrador General Nexora",
                password_hash=get_password_hash(default_pass),
                rol="admin",
                activo=True
            )
            db.add(admin_user)
            db.commit()
            print(f"[OK] Usuario administrador creado: {admin_email}")

        gestor_email = os.getenv("GESTOR_EMAIL", "gestor@nexora.ec")
        gestor_user = db.query(Usuario).filter(Usuario.email == gestor_email).first()
        if not gestor_user:
            gestor_pass = os.getenv("GESTOR_INITIAL_PASSWORD", "NexoraGestor2026!")
            gestor_user = Usuario(
                email=gestor_email,
                nombre_completo="Gestor Académico Nexora",
                password_hash=get_password_hash(gestor_pass),
                rol="gestor",
                activo=True
            )
            db.add(gestor_user)
            db.commit()
            print(f"[OK] Usuario gestor creado: {gestor_email}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error durante el sembrado de base de datos: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
