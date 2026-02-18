# app/modules/enrollments/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import User
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.enrollments.schemas import EnrollmentCreate, EnrollmentResponse
from typing import List # <--- Importar List

router = APIRouter(prefix="/enrollments", tags=["Inscripciones (Ventas)"])

@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_course(
    enrollment_data: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simula la compra de un curso.
    Verifica que no estés inscrito previamente.
    """
    # 1. Buscar el curso para saber el precio
    course = db.query(Course).filter(Course.id == enrollment_data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="El curso no existe")

    # 2. Verificar si YA lo compró
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == enrollment_data.course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Ya estás inscrito en este curso")

    # 3. Crear la inscripción (Cobrar)
    new_enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course.id,
        amount_paid=course.price # Tomamos el precio real del curso
    )
    
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    
    return new_enrollment

@router.get("/me", response_model=List[EnrollmentResponse])
def read_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve la lista de cursos que ha comprado el usuario logueado.
    """
    # Buscamos en la tabla Enrollment donde el user_id sea el mío
    my_enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()
    
    return my_enrollments