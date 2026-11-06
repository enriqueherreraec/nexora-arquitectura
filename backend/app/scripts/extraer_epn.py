import re

with open(r'C:\Users\HP VICTUS\.gemini\antigravity-ide\brain\9ebf2dc5-b422-4ab5-a707-b5c26864cfda\.system_generated\steps\571\content.md', encoding='utf-8') as f:
    text = f.read()

idx = text.find('CARRERAS DE GRADO')
end_idx = text.find('TECNOLOGÍA SUPERIOR')
if end_idx == -1:
    end_idx = text.find('TECNOLOG')
sub = text[idx:end_idx]

# Find all img alts or titles or links
items = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', sub, re.DOTALL)
seen = set()
for href, inner in items:
    # check alt in img or text
    alts = re.findall(r'alt=["\']([^"\']+)["\']', inner)
    clean_t = re.sub(r'<[^>]+>', '', inner).strip()
    name = alts[0] if alts else clean_t
    if name and name not in seen and len(name) > 3 and not name.startswith('http'):
        seen.add(name)
        print(f"EPN Carrera: {name} -> {href}")
