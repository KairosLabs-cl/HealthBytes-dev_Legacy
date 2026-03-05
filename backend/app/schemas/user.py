from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration - Replica of createUserSchema"""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)
    name: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login - Replica of loginSchema"""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserUpdate(BaseModel):
    """Schema for user update - Replica of updateUserSchema"""

    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=1, max_length=128)
    name: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    role: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None


class DietaryPreferencesUpdate(BaseModel):
    """Schema for updating dietary preferences only"""

    tags: List[str] = Field(default_factory=list, description="List of dietary tag slugs")


class UserResponse(BaseModel):
    """User response schema (without password)"""

    id: int
    email: str
    role: str
    name: Optional[str]
    address: Optional[str]
    dietary_preferences: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Token response"""

    token: str


class UserWithToken(BaseModel):
    """User registration/login response"""

    user: UserResponse
    token: str
