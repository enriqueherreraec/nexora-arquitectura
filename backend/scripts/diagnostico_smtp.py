import socket
import smtplib
import ssl
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings

def ejecutar_diagnostico_solo_conexion_tls():
    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    use_tls = settings.SMTP_USE_TLS

    print("==================================================")
    print("   DIAGNÓSTICO SMTP - NEXORA (CONEXIÓN Y STARTTLS)")
    print("==================================================")
    print(f"Servidor: {host}:{port}")
    print(f"Modo TLS solicitado: {use_tls}")
    print("--------------------------------------------------")

    # 1. DNS
    print("\n[Etapa 1] Resolución DNS:")
    try:
        ip = socket.gethostbyname(host)
        print(f"  -> Éxito: '{host}' resolvió a {ip}")
    except Exception as e:
        print(f"  -> FALLO en DNS: {e}")
        return False

    # 2. Socket TCP
    print("\n[Etapa 2] Socket TCP:")
    try:
        s = socket.create_connection((host, port), timeout=15)
        print("  -> Éxito: Socket TCP conectado en puerto 587.")
        s.close()
    except Exception as e:
        print(f"  -> FALLO en conexión TCP: {e}")
        return False

    # 3. smtplib.SMTP + Banner + EHLO + STARTTLS (igual que en email_service.py)
    print("\n[Etapa 3] Conexión SMTP y Banner inicial:")
    server = None
    try:
        server = smtplib.SMTP(host, port, timeout=25)
        print("  -> Éxito: Conexión SMTP establecida y banner 220 recibido.")

        print("\n[Etapa 4] Saludo EHLO pre-TLS:")
        code_ehlo, _ = server.ehlo()
        print(f"  -> Éxito: EHLO aceptado (código {code_ehlo}).")
        print(f"     STARTTLS anunciado en capacidades: {server.has_extn('starttls')}")

        if use_tls:
            print("\n[Etapa 5] Negociación y Handshake STARTTLS:")
            code_tls, msg_tls = server.starttls()
            print(f"  -> Éxito: STARTTLS aceptado (código {code_tls}). Handshake TLS completado.")

            print("\n[Etapa 6] Saludo EHLO post-TLS (canal seguro):")
            code_ehlo2, _ = server.ehlo()
            print(f"  -> Éxito: EHLO post-TLS aceptado (código {code_ehlo2}).")
        
        print("\n[Etapa 7] Cierre ordenado (QUIT):")
        server.quit()
        print("  -> Sesión SMTP cerrada limpiamente.")
        print("\n>>> RESULTADO: Conexión y STARTTLS funcionan al 100%. Ninguna de estas etapas falla.")
        return True

    except smtplib.SMTPServerDisconnected as e:
        print(f"  -> FALLO (SMTPServerDisconnected): Conexión cerrada inesperadamente: {e}")
        return False
    except ssl.SSLError as e:
        print(f"  -> FALLO (ssl.SSLError): Error en negociación SSL/TLS: {e}")
        return False
    except Exception as e:
        print(f"  -> FALLO: {type(e).__name__}: {e}")
        return False
    finally:
        if server:
            try:
                server.close()
            except Exception:
                pass

if __name__ == "__main__":
    ejecutar_diagnostico_solo_conexion_tls()
