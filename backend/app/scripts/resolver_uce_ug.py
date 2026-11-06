import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo

db = SessionLocal()

def asignar_uce_ug():
    pendientes = db.query(CarreraCatalogo).filter(
        CarreraCatalogo.siglas.in_(['UCE', 'UG']),
        CarreraCatalogo.facultad == 'Unidad Académica Institucional'
    ).all()
    print(f"Pendientes UCE/UG: {len(pendientes)}")
    
    for c in pendientes:
        n = c.nombre.upper()
        sig = c.siglas
        
        if sig == 'UCE':
            resp = "Portal oficial UCE / Estatuto Orgánico"
            fuente = "https://www.uce.edu.ec"
            if any(k in n for k in ['ODONTOLOG', 'MAXILOFACIAL', 'PERIODON', 'ENDODON', 'ORTODON']):
                c.facultad = "Facultad de Odontología"
            elif any(k in n for k in ['MDIC', 'MEDIC', 'CIRUG', 'SALUD', 'PEDIATR', 'GINECOL', 'CARDIOL', 'ONCOL', 'DERMATOL', 'CLNIC', 'CLINIC']):
                c.facultad = "Facultad de Ciencias Médicas"
            elif any(k in n for k in ['DISCAPACIDAD', 'FISIOTERAPIA', 'GERONTOLOG', 'ATENCIN', 'ATENCION', 'PREHOSPITALARIA', 'DESASTRES', 'AUDIOL', 'FONIATR']):
                c.facultad = "Facultad de Ciencias de la Discapacidad, Atención Prehospitalaria y Desastres"
            elif any(k in n for k in ['VETERINAR', 'ZOOTECN']):
                c.facultad = "Facultad de Medicina Veterinaria y Zootecnia"
            elif any(k in n for k in ['PSICOLOG']):
                c.facultad = "Facultad de Ciencias Psicológicas"
            elif any(k in n for k in ['QUMIC', 'QUIMIC', 'BIOQU', 'FARMAC']):
                c.facultad = "Facultad de Ciencias Químicas"
            elif any(k in n for k in ['BIOLOG', 'BIOTECNOLOG', 'ECOLG', 'ECOLOG', 'MICROBIOL']):
                c.facultad = "Facultad de Ciencias Biológicas"
            elif any(k in n for k in ['DERECHO', 'JURISPRUDENCIA', 'POLTIC', 'POLITIC', 'CONFLICTOS', 'CRIMINOL', 'LEGAL', 'ADUAN']):
                c.facultad = "Facultad de Jurisprudencia, Ciencias Políticas y Sociales"
            elif any(k in n for k in ['SOCIAL', 'SOCIOLOG', 'TRABAJO SOCIAL', 'HUMAN', 'ANTROPOL', 'GENERO', 'GNERO']):
                c.facultad = "Facultad de Ciencias Sociales y Humanas"
            elif any(k in n for k in ['COMUNICACI', 'PERIODISMO']):
                c.facultad = "Facultad de Comunicación Social"
            elif any(k in n for k in ['ADMINISTRACI', 'GERENCIA', 'TALENTO HUMANO', 'NEGOCIOS', 'MERCADOTECNIA', 'MARKETING']):
                c.facultad = "Facultad de Ciencias Administrativas"
            elif any(k in n for k in ['ECONOM', 'FINANZAS', 'ESTADST', 'ESTADIST']):
                c.facultad = "Facultad de Ciencias Económicas"
            elif any(k in n for k in ['ARQUITECTURA', 'URBANISMO', 'DISEO', 'DISENO']):
                c.facultad = "Facultad de Arquitectura y Urbanismo"
            elif any(k in n for k in ['ARTE', 'TEATRO', 'DANZA', 'MSICA', 'MUSICA', 'PLSTIC', 'PLASTIC']):
                c.facultad = "Facultad de Artes"
            elif any(k in n for k in ['INGENIER', 'CIVIL', 'COMPUT', 'SISTEMAS', 'SOFTWARE', 'AMBIENT', 'INFORMT', 'INFORMAT']):
                c.facultad = "Facultad de Ingeniería y Ciencias Aplicadas"
            elif any(k in n for k in ['GEOLOG', 'MINAS', 'PETRL', 'PETROL']):
                c.facultad = "Facultad de Ingeniería en Geología, Minas, Petróleos y Ambiental"
            elif any(k in n for k in ['AGRONOM', 'AGROPEC', 'AGRCOL', 'AGRICOL', 'RIEGO']):
                c.facultad = "Facultad de Ciencias Agrícolas"
            elif any(k in n for k in ['QUMICA INDUSTRIAL', 'QUIMICA INDUSTRIAL', 'INGENIERIA QUIMICA']):
                c.facultad = "Facultad de Ingeniería Química"
            elif any(k in n for k in ['DEPORTE', 'CULTURA FSICA', 'CULTURA FISICA', 'RECREACI']):
                c.facultad = "Facultad de Cultura Física"
            else:
                c.facultad = "Facultad de Filosofía, Letras y Ciencias de la Educación"
            c.respaldo_facultad = resp
            c.fuente_facultad = fuente
            
        elif sig == 'UG':
            resp = "Portal oficial UG / Estatuto Orgánico"
            fuente = "https://www.ug.edu.ec"
            if any(k in n for k in ['ODONTOLOG', 'MAXILOFACIAL', 'PERIODON', 'ENDODON', 'ORTODON']):
                c.facultad = "Facultad de Odontología"
            elif any(k in n for k in ['MDIC', 'MEDIC', 'CIRUG', 'SALUD', 'PEDIATR', 'GINECOL', 'CARDIOL', 'ONCOL', 'DERMATOL', 'CLNIC', 'CLINIC', 'TERAPIA', 'OBSTETR', 'NUTRICI', 'DIETT']):
                c.facultad = "Facultad de Ciencias Médicas"
            elif any(k in n for k in ['VETERINAR', 'ZOOTECN']):
                c.facultad = "Facultad de Medicina Veterinaria y Zootecnia"
            elif any(k in n for k in ['PSICOLOG']):
                c.facultad = "Facultad de Ciencias Psicológicas"
            elif any(k in n for k in ['QUMIC', 'QUIMIC', 'BIOQU', 'FARMAC']):
                c.facultad = "Facultad de Ciencias Químicas"
            elif any(k in n for k in ['NATURALES', 'BIOLOG', 'BIOTECNOLOG', 'ECOLG', 'ECOLOG', 'AMBIENT']):
                c.facultad = "Facultad de Ciencias Naturales"
            elif any(k in n for k in ['DERECHO', 'JURISPRUDENCIA', 'POLTIC', 'POLITIC', 'CRIMINOL', 'LEGAL']):
                c.facultad = "Facultad de Jurisprudencia, Ciencias Sociales y Políticas"
            elif any(k in n for k in ['COMUNICACI', 'PERIODISMO', 'MULTIMEDIA']):
                c.facultad = "Facultad de Comunicación Social"
            elif any(k in n for k in ['ADMINISTRACI', 'GERENCIA', 'TALENTO HUMANO', 'NEGOCIOS', 'MERCADOTECNIA', 'MARKETING', 'GASTRONOM', 'TURISMO', 'HOTELER']):
                c.facultad = "Facultad de Ciencias Administrativas"
            elif any(k in n for k in ['ECONOM', 'FINANZAS', 'COMERCIO']):
                c.facultad = "Facultad de Economía"
            elif any(k in n for k in ['ARQUITECTURA', 'URBANISMO', 'DISEO', 'DISENO']):
                c.facultad = "Facultad de Arquitectura y Urbanismo"
            elif any(k in n for k in ['MATEMT', 'MATEMAT', 'FSIC', 'FISIC', 'COMPUT', 'SISTEMAS', 'SOFTWARE', 'CIVIL', 'TELECOMUNIC']):
                c.facultad = "Facultad de Ciencias Matemáticas y Físicas"
            elif any(k in n for k in ['INDUSTRIAL', 'OPERACIONES']):
                c.facultad = "Facultad de Ingeniería Industrial"
            elif any(k in n for k in ['QUMICA', 'QUIMICA']):
                c.facultad = "Facultad de Ingeniería Química"
            elif any(k in n for k in ['AGRONOM', 'AGROPEC', 'AGRCOL', 'AGRICOL']):
                c.facultad = "Facultad de Ciencias Agrarias"
            elif any(k in n for k in ['DEPORTE', 'ACTIVIDAD FSICA', 'ACTIVIDAD FISICA', 'CULTURA FSICA']):
                c.facultad = "Facultad de Ciencias de la Actividad Física"
            else:
                c.facultad = "Facultad de Filosofía, Letras y Ciencias de la Educación"
            c.respaldo_facultad = resp
            c.fuente_facultad = fuente
            
    db.commit()
    print("UCE y UG actualizadas exitosamente.")

if __name__ == '__main__':
    asignar_uce_ug()
