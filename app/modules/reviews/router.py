# app/modules/reviews/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import User
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.reviews.models import Review
from app.modules.reviews.schemas import ReviewCreate, ReviewResponse, ReviewReply

router = APIRouter(prefix="/reviews", tags=["Reseñas"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea una reseña para un curso.
    Solo pueden dejar reseña los estudiantes que compraron el curso.
    """
    # Verificar que el curso existe
    course = db.query(Course).filter(Course.id == review_data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    # Verificar que el usuario compró el curso
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == review_data.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes comprar el curso antes de dejar una reseña"
        )
    
    # Verificar que no haya reseña previa
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.course_id == review_data.course_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya dejaste una reseña para este curso"
        )
    
    # Crear reseña
    new_review = Review(
        course_id=review_data.course_id,
        user_id=current_user.id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return ReviewResponse(
        id=new_review.id,
        course_id=new_review.course_id,
        user_id=new_review.user_id,
        rating=new_review.rating,
        comment=new_review.comment,
        instructor_reply=new_review.instructor_reply,
        created_at=new_review.created_at,
        user_name=current_user.full_name
    )


@router.get("/course/{course_id}", response_model=List[ReviewResponse])
def get_course_reviews(
    course_id: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Lista las reseñas de un curso (público)."""
    reviews = db.query(Review).filter(
        Review.course_id == course_id
    ).offset(skip).limit(limit).all()
    
    # Agregar nombre de usuario a cada reseña
    result = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        result.append(ReviewResponse(
            id=review.id,
            course_id=review.course_id,
            user_id=review.user_id,
            rating=review.rating,
            comment=review.comment,
            instructor_reply=review.instructor_reply,
            created_at=review.created_at,
            user_name=user.full_name if user else "Usuario"
        ))
    
    return result


@router.put("/{review_id}/reply", response_model=ReviewResponse)
def reply_to_review(
    review_id: str,
    reply_data: ReviewReply,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permite al instructor responder a una reseña de su curso."""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    
    # Verificar que el usuario es el dueño del curso
    course = db.query(Course).filter(Course.id == review.course_id).first()
    
    if course.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el instructor del curso puede responder"
        )
    
    review.instructor_reply = reply_data.instructor_reply
    db.commit()
    db.refresh(review)
    
    user = db.query(User).filter(User.id == review.user_id).first()
    
    return ReviewResponse(
        id=review.id,
        course_id=review.course_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment,
        instructor_reply=review.instructor_reply,
        created_at=review.created_at,
        user_name=user.full_name if user else "Usuario"
    )
