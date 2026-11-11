from datetime import date, datetime
from sqlalchemy import String, Integer, Date, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    researchers = relationship("Researcher", back_populates="department")

class Researcher(Base):
    __tablename__ = "researchers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, nullable=False)
    designation: Mapped[str | None] = mapped_column(String(100))
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"))
    department = relationship("Department", back_populates="researchers")
    projects = relationship("ProjectResearcher", back_populates="researcher", cascade="all, delete-orphan")

class Guide(Base):
    __tablename__ = "guides"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, nullable=False)
    specialization: Mapped[str | None] = mapped_column(String(180))
    projects = relationship("Project", back_populates="guide")

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(220), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="Proposed")
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    guide_id: Mapped[int | None] = mapped_column(ForeignKey("guides.id", ondelete="SET NULL"))
    guide = relationship("Guide", back_populates="projects")
    researchers = relationship("ProjectResearcher", back_populates="project", cascade="all, delete-orphan")
    funding = relationship("Funding", back_populates="project", cascade="all, delete-orphan")
    publications = relationship("Publication", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")

class ProjectResearcher(Base):
    __tablename__ = "project_researchers"
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    researcher_id: Mapped[int] = mapped_column(ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True)
    role: Mapped[str | None] = mapped_column(String(80))
    project = relationship("Project", back_populates="researchers")
    researcher = relationship("Researcher", back_populates="projects")

class Funding(Base):
    __tablename__ = "funding"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    source: Mapped[str] = mapped_column(String(160), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    received_on: Mapped[date | None] = mapped_column(Date)
    project = relationship("Project", back_populates="funding")

class Publication(Base):
    __tablename__ = "publications"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(250), nullable=False)
    journal: Mapped[str | None] = mapped_column(String(180))
    doi: Mapped[str | None] = mapped_column(String(120), unique=True)
    published_on: Mapped[date | None] = mapped_column(Date)
    project = relationship("Project", back_populates="publications")

class Milestone(Base):
    __tablename__ = "milestones"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), default="Pending")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    project = relationship("Project", back_populates="milestones")
