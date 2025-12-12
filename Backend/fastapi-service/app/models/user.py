from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration - Replica of createUserSchema"""
    email: EmailStr
    password: str = Field(..., min_length=1)
    name: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login - Replica of loginSchema"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for user update - Replica of updateUserSchema"""
    password: Optional[str] = Field(None, min_length=1)
    name: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema (without password)"""
    id: int
    email: str
    role: str
    name: Optional[str]
    address: Optional[str]
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response"""
    token: str


class UserWithToken(BaseModel):
    """User registration/login response"""
    user: UserResponse
    token: str
