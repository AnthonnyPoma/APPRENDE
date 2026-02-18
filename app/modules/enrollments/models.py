# app/modules/enrollments/models.py
from sqlalchemy import Column, ForeignKey, DECIMAL, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Enrollment(Base):
    __tablename__ = "enrollments"
    # ... (tus columnas id, user_id, course_id, amount_paid...) ...
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    amount_paid = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    purchased_at = Column(DateTime, server_default=text("NOW()"))

    # --- AGREGAR ESTAS RELACIONES ---
    user = relationship("app.modules.users.models.User")
    course = relationship("app.modules.courses.models.Course")