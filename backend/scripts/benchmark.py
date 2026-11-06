import urllib.request
import urllib.parse
import time
import json
import gzip

def get_auth_token():
    url = "http://127.0.0.1:8002/api/v1/cuentas/login"
    data = json.dumps({"email": "gestor@test.com", "password": "Password123!"}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return body.get("access_token")
    except Exception as e:
        return None

def measure(name, url, headers=None, n=5):
    if headers is None:
        headers = {}
    times = []
    size = 0
    raw_size = 0
    for _ in range(n):
        t0 = time.perf_counter()
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            size = len(data)
            if resp.headers.get("Content-Encoding") == "gzip":
                raw_size = len(gzip.decompress(data))
            else:
                raw_size = size
        times.append((time.perf_counter() - t0) * 1000)
    avg_t = sum(times) / len(times)
    min_t = min(times)
    return {
        "name": name,
        "url": url,
        "avg_ms": round(avg_t, 2),
        "min_ms": round(min_t, 2),
        "transfer_kb": round(size / 1024, 2),
        "uncompressed_kb": round(raw_size / 1024, 2)
    }

if __name__ == "__main__":
    token = get_auth_token()
    auth_headers = {"Authorization": f"Bearer {token}"} if token else {}
    gzip_headers = {"Accept-Encoding": "gzip"}
    combined_headers = {**auth_headers, **gzip_headers}

    targets = [
        ("Catálogo Carreras (Completo 984 items)", "http://127.0.0.1:8002/api/v1/catalogo/carreras", {}),
        ("Catálogo Carreras (Paginado 16 items)", "http://127.0.0.1:8002/api/v1/catalogo/carreras?limit=16&offset=0", {}),
        ("Directorio Universidades (33 IES)", "http://127.0.0.1:8002/api/v1/catalogo/universidades", {}),
    ]
    if token:
        targets.append(("Gestor Resumen (1 query agregada)", "http://127.0.0.1:8002/api/v1/gestor/resumen", auth_headers))

    print("=== MEDICIÓN: CLIENTE REAL CON COMPRESIÓN GZIP (Navegadores Modernos) ===")
    for name, url, extra_h in targets:
        h = {**gzip_headers, **extra_h}
        res = measure(name, url, headers=h)
        print(f"-> {res['name']}: {res['avg_ms']} ms (min: {res['min_ms']} ms) | Transfer: {res['transfer_kb']} KB (Payload sin comprimir: {res['uncompressed_kb']} KB)")
