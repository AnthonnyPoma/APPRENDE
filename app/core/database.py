# Ubicación: app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# 1. Cargar variables del archivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Verificación de seguridad (para que sepas si falló al leer el .env)
if not DATABASE_URL:
    raise ValueError("❌ Error: No se encontró la variable DATABASE_URL en el archivo .env")

# 2. Crear el motor de conexión (Engine)
engine = create_engine(DATABASE_URL)

# 3. Crear la fábrica de sesiones (SessionLocal)
# Cada petición del usuario tendrá su propia sesión de base de datos.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Crear la clase Base para los modelos (ORM)
Base = declarative_base()

# 5. Dependencia (Dependency) para inyectar la DB en los endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()