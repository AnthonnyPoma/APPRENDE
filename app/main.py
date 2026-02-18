# Ubicación: app/main.py
from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, Base, engine
import shutil
import os
import uuid

# --- ROUTERS ---
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router 
from app.modules.courses.router import router as courses_router 
from app.modules.enrollments.router import router as enrollments_router
from app.modules.categories.router import router as categories_router
from app.modules.instructors.router import router as instructors_router
from app.modules.reviews.router import router as reviews_router
from app.modules.media.router import router as media_router
from app.modules.progress.router import router as progress_router

# Importamos el modelo para que SQLAlchemy lo detecte antes del create_all
from app.modules.progress.models import UserLessonProgress 

# --- CREAR TABLAS EN LA BASE DE DATOS ---
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Apprende API", version="1.0.0", description="Plataforma LMS para creadores de contenido educativo")

# --- 1. CONFIGURACIÓN DE ARCHIVOS (MEDIA) ---
# Creamos la carpeta física 'uploads'
os.makedirs("uploads", exist_ok=True) 

# Le decimos a FastAPI: "Cuando alguien pida /media/..., busca en la carpeta 'uploads'"
app.mount("/media", StaticFiles(directory="uploads"), name="media")

# --- 2. CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- 3. REGISTRO DE RUTAS ---
from app.modules.progress.router import router as progress_router
from app.modules.certificates.router import router as certificates_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(courses_router)
app.include_router(media_router)
app.include_router(categories_router)
app.include_router(enrollments_router)
app.include_router(instructors_router)
app.include_router(reviews_router)
app.include_router(progress_router)
app.include_router(certificates_router)

# --- 4. ENDPOINT DE SUBIDA DE ARCHIVOS ---
# (Eliminado: Usamos /files/upload del media router)

# --- 5. ENDPOINTS BÁSICOS ---
@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido al Backend de Apprende 🚀"}

@app.get("/probar-db")
def health_check_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"estado": "Éxito", "mensaje": "✅ Conexión a PostgreSQL exitosa"}
    except Exception as e:
        return {"estado": "Error", "mensaje": f"❌ Falló la conexión: {str(e)}"}
    






    ## .\venv\Scripts\activate
    ##  uvicorn app.main:app --reload
