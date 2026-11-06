from app.core.config import settings

p = settings.SMTP_PASSWORD
u = settings.SMTP_USER

print("User domain:", u.split("@")[-1] if "@" in u else "No @")
print("Password length:", len(p))
print("Password has quotes:", p.startswith('"') or p.startswith("'") or p.endswith('"') or p.endswith("'"))
print("Password has equal sign:", "=" in p)
print("Password has colon:", ":" in p)
print("Password has dash/underscore:", "-" in p or "_" in p)
