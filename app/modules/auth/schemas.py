# app/modules/auth/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID # <--- Importamos UUID

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID # <--- Cambiamos str por UUID para que coincida con la DB
    email: EmailStr
    full_name: str
    role: str # Pydantic intentará convertir el Enum a string

    # Configuración actualizada para Pydantic v2
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str