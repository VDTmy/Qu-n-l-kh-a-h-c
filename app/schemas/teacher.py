from pydantic import BaseModel


class TeacherProfileCreate(BaseModel):
    phone: str | None = None
    expertise: str | None = None
    experience: str | None = None
    bio: str | None = None


class TeacherProfileResponse(BaseModel):
    id: int
    user_id: int
    phone: str | None
    expertise: str | None
    experience: str | None
    bio: str | None
    cv_file_url: str | None
    status: str
    rejection_reason: str | None

    class Config:
        from_attributes = True