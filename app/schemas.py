from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class DepartmentIn(BaseModel):
    name: str
    description: Optional[str] = None
class DepartmentOut(DepartmentIn, ORM):
    id: int

class ResearcherIn(BaseModel):
    name: str
    email: str
    designation: Optional[str] = None
    department_id: Optional[int] = None
class ResearcherOut(ResearcherIn, ORM):
    id: int

class GuideIn(BaseModel):
    name: str
    email: str
    specialization: Optional[str] = None
class GuideOut(GuideIn, ORM):
    id: int

class ProjectIn(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "Proposed"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    guide_id: Optional[int] = None
class ProjectOut(ProjectIn, ORM):
    id: int

class TeamIn(BaseModel):
    researcher_id: int
    role: Optional[str] = None

class FundingIn(BaseModel):
    source: str
    amount: float
    received_on: Optional[date] = None
class FundingOut(FundingIn, ORM):
    id: int
    project_id: int

class PublicationIn(BaseModel):
    title: str
    journal: Optional[str] = None
    doi: Optional[str] = None
    published_on: Optional[date] = None
class PublicationOut(PublicationIn, ORM):
    id: int
    project_id: int

class MilestoneIn(BaseModel):
    title: str
    due_date: Optional[date] = None
    status: str = "Pending"
    completed_at: Optional[datetime] = None
class MilestoneOut(MilestoneIn, ORM):
    id: int
    project_id: int
