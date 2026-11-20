import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserPublic(ORM):
    id: int
    first_name: str
    surname: str
    role: str
    location: str
    bio: str
    avatar_url: str | None
    created_at: datetime


class UserPrivate(UserPublic):
    email: str
    phone: str
    gender: str | None
    citizenship: str


class RegisterIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    surname: str = Field(min_length=1, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=40)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must include an uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must include a lowercase letter.")
        if not re.search(r"\d", value):
            raise ValueError("Password must include a number.")
        return value
    role: Literal["tenant", "landlord"]
    location: str = Field(min_length=1, max_length=120)
    citizenship: str = "Botswana"
    gender: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    first_name: str | None = None
    surname: str | None = None
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    gender: str | None = None


class PropertyIn(BaseModel):
    title: str = Field(min_length=4, max_length=160)
    location: str = Field(min_length=2, max_length=160)
    city: str = "Gaborone"
    price: float = Field(gt=0)
    bedrooms: int = Field(ge=0, le=30)
    bathrooms: int = Field(ge=0, le=30)
    property_type: str = "House"
    category: str = "all"
    description: str = ""
    photos: list[str] = Field(default_factory=list, max_length=10)
    amenities: list[str] = Field(default_factory=list, max_length=30)
    furnished: bool = False
    parking: bool = False
    water_included: bool = False
    electricity_included: bool = False
    deposit: float = 0
    available_from: str | None = None
    featured: bool = False

    @field_validator("photos", "amenities")
    @classmethod
    def clean_list(cls, value: list[str]) -> list[str]:
        return [v.strip() for v in value if v and v.strip()]


class PropertyOut(ORM):
    id: int
    title: str
    location: str
    city: str
    price: float
    bedrooms: int
    bathrooms: int
    property_type: str
    category: str
    description: str
    photos: list[str]
    amenities: list[str]
    furnished: bool
    parking: bool
    water_included: bool
    electricity_included: bool
    deposit: float
    available_from: str | None
    featured: bool
    status: str
    created_at: datetime
    landlord: UserPublic
    is_favorite: bool = False
    review_rating: float | None = None
    review_count: int = 0


class PropertyList(BaseModel):
    items: list[PropertyOut]
    total: int
    page: int
    page_size: int


class StayOut(ORM):
    id: int
    title: str
    stay_type: str
    location: str
    city: str
    price: float
    description: str
    photos: list[str]
    amenities: list[str]
    rating: float
    review_count: int
    guests: int
    bedrooms: int
    created_at: datetime


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=2, max_length=1000)
    property_id: int | None = None


class ReviewOut(ORM):
    id: int
    rating: int
    comment: str
    created_at: datetime
    author: UserPublic


class MessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class MessageOut(ORM):
    id: int
    body: str
    read_at: datetime | None
    created_at: datetime
    sender_id: int
    recipient_id: int


class ThreadOut(BaseModel):
    user: UserPublic
    last_message: str
    last_at: datetime
    unread: int


class ThreadDetail(BaseModel):
    user: UserPublic
    messages: list[MessageOut]


class BookingIn(BaseModel):
    stay_id: int
    checkin: str
    checkout: str
    guests: int = Field(ge=1, le=30)
    phone: str = Field(min_length=6, max_length=40)
    method: str = "MyZaka"


class BookingOut(ORM):
    id: int
    checkin: str
    checkout: str
    guests: int
    nights: int
    total: float
    phone: str
    method: str
    reference: str
    status: str
    created_at: datetime
    stay: StayOut


class ReportIn(BaseModel):
    category: str = Field(min_length=2, max_length=60)
    details: str = Field(min_length=5, max_length=2000)
    target_user_id: int | None = None
    property_id: int | None = None


class ReportOut(ORM):
    id: int
    category: str
    details: str
    status: str
    created_at: datetime
    reporter: UserPublic
    target: UserPublic | None
    property_id: int | None


class ReportStatusIn(BaseModel):
    status: Literal["open", "reviewing", "resolved", "dismissed"]


class DashboardOut(BaseModel):
    user: UserPrivate
    stats: dict
    listings: list[PropertyOut] = []
    favorites: list[PropertyOut] = []
    bookings: list[BookingOut] = []
    reviews: list[ReviewOut] = []
    unread_messages: int = 0
