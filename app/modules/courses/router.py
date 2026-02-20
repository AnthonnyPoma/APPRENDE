from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# 👇 AQUÍ ESTABAN LOS ERRORES, YA CORREGIDOS:
from app.core.database import get_db  
from app.modules.users.models import User 
# ----------------------------------------
from app.modules.courses.models import Course, Section, Lesson 
from app.modules.courses.schemas import CourseCreate, CourseResponse, CourseDetailResponse
from app.modules.courses.schemas import SectionCreate, SectionResponse, LessonCreate, LessonResponse
from app.modules.auth.dependencies import get_current_user
from app.modules.enrollments.models import Enrollment
from typing import List 
import uuid
import re 

router = APIRouter(prefix="/courses", tags=["Cursos"])

def generate_slug(title: str):
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

@router.post("/", status_code=201, response_model=CourseResponse)
def create_course(
    course: CourseCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    generated_slug = generate_slug(course.title)

    new_course = Course(
        title=course.title,
        slug=generated_slug,
        price=course.price,
        description=course.description,
        level=course.level,
        thumbnail_url=course.thumbnail_url,
        user_id=current_user.id
    )
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/", response_model=List[CourseResponse])
def read_courses(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses

@router.get("/my-courses", response_model=List[CourseResponse])
def read_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve los cursos creados por el instructor actual.
    """
    if current_user.role != "INSTRUCTOR":
        raise HTTPException(status_code=403, detail="Solo los instructores pueden ver sus cursos creados")

    courses = db.query(Course).filter(Course.user_id == current_user.id).all()
    return courses

@router.post("/{course_id}/sections", response_model=SectionResponse)
def create_section(
    course_id: str, 
    section_data: SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verificar que el curso exista
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # 2. Verificar que el usuario sea el dueño (CORREGIDO AQUÍ 🚨)
    if course.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este curso")

    # 3. Crear Sección
    new_section = Section(
        course_id=course_id,
        title=section_data.title,
        order_index=section_data.order_index
    )
    db.add(new_section)
    db.commit()
    db.refresh(new_section)
    return new_section


@router.post("/{section_id}/lessons", response_model=LessonResponse)
def add_lesson(
    section_id: uuid.UUID,
    lesson: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    # Aquí deberías verificar permisos también, pero para MVP lo dejamos pasar
    last_lesson = db.query(Lesson).filter(Lesson.section_id == section_id).order_by(Lesson.order_index.desc()).first()
    new_order_index = (last_lesson.order_index + 1) if last_lesson else 0
    
    new_lesson = Lesson(
        title=lesson.title,
        video_resource_id=lesson.video_resource_id,
        lesson_type=lesson.lesson_type, 
        is_free_preview=lesson.is_free_preview,
        section_id=section_id,
        order_index=new_order_index # <--- ✨ AQUÍ ESTÁ LA MAGIA
        
    )
    
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@router.get("/{course_id}", response_model=CourseDetailResponse)
def read_course_detail(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    return course

@router.get("/{course_id}/lessons/{lesson_id}/play")
def play_lesson(
    course_id: str,
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="No has comprado este curso")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")

    video_url = lesson.video_resource_id
    
    # Si es video y está guardado localmente (empieza con /media/), usar endpoint de streaming
    if lesson.lesson_type == "video" and video_url and video_url.startswith("/media/"):
        filename = video_url.replace("/media/", "")
        video_url = f"http://localhost:8000/files/stream/{filename}"

@router.put("/{course_id}/reorder")
def reorder_course_content(
    course_id: UUID,
    reorder_data: schemas.CourseReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Verificar propiedad (o admin)
    if course.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Actualizar orden
    for section_data in reorder_data.sections:
        section = db.query(models.Section).filter(
            models.Section.id == section_data.id, 
            models.Section.course_id == course_id
        ).first()
        
        if section:
            section.order_index = section_data.order_index
            
            for lesson_data in section_data.lessons:
                lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_data.id).first()
                # Verificar que la lección pertenece a la sección (o permitir moverla)
                # Al moverla, actualizamos su section_id
                if lesson:
                    lesson.section_id = section.id
                    lesson.order_index = lesson_data.order_index
    
    db.commit()
    return {"message": "Orden actualizado correctamente"}