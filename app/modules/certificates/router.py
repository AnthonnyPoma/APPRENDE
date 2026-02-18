from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user, get_current_user_from_query
from app.modules.users.models import User
from app.modules.courses.models import Course, Section, Lesson
from app.modules.progress.models import UserLessonProgress
from app.modules.certificates.service import generate_certificate_pdf
from datetime import datetime

router = APIRouter(prefix="/certificates", tags=["Certificados"])

@router.get("/{course_id}/download")
def download_certificate(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_query) # Cambiado aquí
):
    """
    Descarga el certificado si el usuario ha completado el 100% del curso.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # 1. Contar lecciones totales del curso
    # (Unirse a Section y Lesson)
    total_lessons = db.query(Lesson).join(Section).filter(Section.course_id == course_id).count()

    if total_lessons == 0:
        raise HTTPException(status_code=400, detail="Este curso no tiene contenido.")

    # 2. Contar lecciones completadas por el usuario
    completed_lessons = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == current_user.id,
        UserLessonProgress.course_id == course_id
    ).count()

    # 3. Validar progreso
    if completed_lessons < total_lessons:
        progress_pct = int((completed_lessons / total_lessons) * 100)
        raise HTTPException(
            status_code=403, 
            detail=f"Aún no has completado el curso. Progreso actual: {progress_pct}%"
        )

    # 4. Generar PDF
    pdf_buffer = generate_certificate_pdf(
        student_name=current_user.full_name,
        course_title=course.title,
        completion_date=datetime.now()
    )

    # 5. Retornar archivo
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Certificado_{course.title}.pdf"
        }
    )
