import os
import sys
from pathlib import Path

# Agregar directorio app al path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.core.config import settings


def setup_project_database():
    """
    Verifica si existe la base de datos 'orientacion_vocacional_db' en PostgreSQL.
    Si no existe, la crea de forma exclusiva para este proyecto.
    No interactúa ni modifica la base de datos de KASH ni ningún otro proyecto.
    """
    print("=" * 60)
    print(" NEXORA - Verificación y Creación de Base de Datos")
    print("=" * 60)

    target_db = settings.DB_NAME
    user = settings.DB_USER
    password = settings.DB_PASSWORD
    host = settings.DB_HOST
    port = settings.DB_PORT

    if not password:
        print("[!] DB_PASSWORD está vacía en backend/.env.")
        print("    Abra localmente el archivo backend/.env e ingrese su contraseña en:")
        print("    DB_PASSWORD=su_contraseña_aqui")
        return False

    print(f"[*] Conectando a PostgreSQL en {host}:{port} con usuario '{user}'...")
    try:
        # Conectar a la base administrativa 'postgres' para consultar/crear bases
        conn = psycopg2.connect(
            dbname="postgres",
            user=user,
            password=password,
            host=host,
            port=port,
            connect_timeout=3
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Verificar si la base de datos ya existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (target_db,))
        exists = cursor.fetchone()

        if exists:
            print(f"[OK] La base de datos '{target_db}' ya existe y está disponible.")
        else:
            print(f"[*] Creando la base de datos exclusiva '{target_db}'...")
            # En PostgreSQL CREATE DATABASE no puede usar parámetros parametrizados para el identificador
            # Se valida estrictamente que sea un identificador seguro
            if not target_db.isidentifier():
                raise ValueError(f"Nombre de base de datos no válido: {target_db}")
            cursor.execute(f'CREATE DATABASE "{target_db}" WITH ENCODING "UTF8";')
            print(f"[OK] Base de datos '{target_db}' creada exitosamente para Nexora.")

        cursor.close()
        conn.close()
        return True

    except psycopg2.OperationalError as e:
        error_msg = str(e)
        if "password authentication failed" in error_msg:
            print("[ERROR] Error de autenticación: la contraseña configurada en backend/.env es incorrecta.")
        elif "connection to server" in error_msg:
            print("[ERROR] No se pudo conectar al servidor PostgreSQL en localhost:5432.")
        else:
            print(f"[ERROR] Error de conexión: {error_msg}")
        print("\nPara solucionar:")
        print("1. Abra el archivo 'backend/.env'")
        print("2. Modifique la línea DB_PASSWORD con la clave de su usuario postgres local")
        print("3. Vuelva a ejecutar este script: python scripts/setup_db.py")
        return False
    except Exception as e:
        print(f"[ERROR] Ocurrió un error inesperado: {e}")
        return False


if __name__ == "__main__":
    success = setup_project_database()
    sys.exit(0 if success else 1)
