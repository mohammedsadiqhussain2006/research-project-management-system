from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from ..database import get_db
from .. import models as m, schemas as s

router = APIRouter()

def create_list_routes(model, schema_in, schema_out, path):
    # CRUD routes are declared explicitly below to keep OpenAPI clear.
    pass

@router.post("/departments", response_model=s.DepartmentOut, status_code=201)
def create_department(data: s.DepartmentIn, db: Session = Depends(get_db)):
    obj=m.Department(**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
@router.get("/departments", response_model=list[s.DepartmentOut])
def list_departments(db: Session=Depends(get_db)): return db.scalars(select(m.Department)).all()
@router.delete("/departments/{item_id}", status_code=204)
def delete_department(item_id:int, db:Session=Depends(get_db)):
    obj=db.get(m.Department,item_id)
    if not obj: raise HTTPException(404,"Department not found")
    db.delete(obj); db.commit()

@router.post("/researchers", response_model=s.ResearcherOut, status_code=201)
def create_researcher(data:s.ResearcherIn, db:Session=Depends(get_db)):
    obj=m.Researcher(**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
@router.get("/researchers", response_model=list[s.ResearcherOut])
def list_researchers(db:Session=Depends(get_db)): return db.scalars(select(m.Researcher)).all()
@router.delete("/researchers/{item_id}", status_code=204)
def delete_researcher(item_id:int, db:Session=Depends(get_db)):
    obj=db.get(m.Researcher,item_id)
    if not obj: raise HTTPException(404,"Researcher not found")
    db.delete(obj); db.commit()

@router.post("/guides", response_model=s.GuideOut, status_code=201)
def create_guide(data:s.GuideIn, db:Session=Depends(get_db)):
    obj=m.Guide(**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
@router.get("/guides", response_model=list[s.GuideOut])
def list_guides(db:Session=Depends(get_db)): return db.scalars(select(m.Guide)).all()
@router.delete("/guides/{item_id}", status_code=204)
def delete_guide(item_id:int, db:Session=Depends(get_db)):
    obj=db.get(m.Guide,item_id)
    if not obj: raise HTTPException(404,"Guide not found")
    db.delete(obj); db.commit()

@router.post("/projects", response_model=s.ProjectOut, status_code=201)
def create_project(data:s.ProjectIn, db:Session=Depends(get_db)):
    if data.end_date and data.start_date and data.end_date < data.start_date:
        raise HTTPException(400,"end_date cannot be before start_date")
    obj=m.Project(**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
@router.get("/projects", response_model=list[s.ProjectOut])
def list_projects(status_filter:str|None=None, db:Session=Depends(get_db)):
    q=select(m.Project)
    if status_filter: q=q.where(m.Project.status==status_filter)
    return db.scalars(q).all()
@router.get("/projects/{item_id}", response_model=s.ProjectOut)
def get_project(item_id:int, db:Session=Depends(get_db)):
    obj=db.get(m.Project,item_id)
    if not obj: raise HTTPException(404,"Project not found")
    return obj
@router.patch("/projects/{item_id}", response_model=s.ProjectOut)
def update_project(item_id:int, data:s.ProjectIn, db:Session=Depends(get_db)):
    obj=db.get(m.Project,item_id)
    if not obj: raise HTTPException(404,"Project not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(obj,k,v)
    db.commit(); db.refresh(obj); return obj
@router.delete("/projects/{item_id}", status_code=204)
def delete_project(item_id:int, db:Session=Depends(get_db)):
    obj=db.get(m.Project,item_id)
    if not obj: raise HTTPException(404,"Project not found")
    db.delete(obj); db.commit()

@router.post("/projects/{project_id}/researchers", status_code=201)
def add_researcher(project_id:int, data:s.TeamIn, db:Session=Depends(get_db)):
    if not db.get(m.Project,project_id): raise HTTPException(404,"Project not found")
    if not db.get(m.Researcher,data.researcher_id): raise HTTPException(404,"Researcher not found")
    obj=m.ProjectResearcher(project_id=project_id, **data.model_dump()); db.add(obj); db.commit()
    return {"message":"Researcher assigned to project"}
@router.get("/projects/{project_id}/researchers")
def project_team(project_id:int, db:Session=Depends(get_db)):
    if not db.get(m.Project,project_id): raise HTTPException(404,"Project not found")
    rows=db.scalars(select(m.ProjectResearcher).where(m.ProjectResearcher.project_id==project_id)).all()
    return [{"researcher_id":r.researcher_id,"name":r.researcher.name,"role":r.role} for r in rows]

@router.post("/projects/{project_id}/funding", response_model=s.FundingOut, status_code=201)
def add_funding(project_id:int,data:s.FundingIn,db:Session=Depends(get_db)):
    if not db.get(m.Project,project_id): raise HTTPException(404,"Project not found")
    obj=m.Funding(project_id=project_id,**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
@router.get("/projects/{project_id}/funding", response_model=list[s.FundingOut])
def list_funding(project_id:int,db:Session=Depends(get_db)):
    return db.scalars(select(m.Funding).where(m.Funding.project_id==project_id)).all()

@router.post("/projects/{project_id}/publications", response_model=s.PublicationOut, status_code=201)
def add_publication(project_id:int,data:s.PublicationIn,db:Session=Depends(get_db)):
    if not db.get(m.Project,project_id): raise HTTPException(404,"Project not found")
    obj=m.Publication(project_id=project_id,**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
@router.get("/projects/{project_id}/publications", response_model=list[s.PublicationOut])
def list_publications(project_id:int,db:Session=Depends(get_db)):
    return db.scalars(select(m.Publication).where(m.Publication.project_id==project_id)).all()

@router.post("/projects/{project_id}/milestones", response_model=s.MilestoneOut, status_code=201)
def add_milestone(project_id:int,data:s.MilestoneIn,db:Session=Depends(get_db)):
    if not db.get(m.Project,project_id): raise HTTPException(404,"Project not found")
    obj=m.Milestone(project_id=project_id,**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
@router.get("/projects/{project_id}/milestones", response_model=list[s.MilestoneOut])
def list_milestones(project_id:int,db:Session=Depends(get_db)):
    return db.scalars(select(m.Milestone).where(m.Milestone.project_id==project_id)).all()
@router.patch("/milestones/{milestone_id}", response_model=s.MilestoneOut)
def update_milestone(milestone_id:int,data:s.MilestoneIn,db:Session=Depends(get_db)):
    obj=db.get(m.Milestone,milestone_id)
    if not obj: raise HTTPException(404,"Milestone not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(obj,k,v)
    db.commit(); db.refresh(obj); return obj

@router.get("/dashboard")
def dashboard(db:Session=Depends(get_db)):
    projects=db.scalars(select(m.Project)).all()
    return {
        "researchers":db.query(m.Researcher).count(),
        "departments":db.query(m.Department).count(),
        "guides":db.query(m.Guide).count(),
        "projects_total":len(projects),
        "projects_by_status":{st:sum(1 for p in projects if p.status==st) for st in {p.status for p in projects}},
        "funding_total":float(db.query(m.Funding).with_entities(__import__('sqlalchemy').func.coalesce(__import__('sqlalchemy').func.sum(m.Funding.amount),0)).scalar()),
        "publications":db.query(m.Publication).count(),
        "milestones":db.query(m.Milestone).count()
    }


# ---------------------------------------------------------------------------
# DBMS concepts: SQL views, aggregate functions and trigger audit history.
# Install database/01_views.sql and database/02_triggers.sql before using these.
# ---------------------------------------------------------------------------

@router.get("/analytics/project-overview")
def project_overview_view(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM vw_project_overview ORDER BY project_id DESC")).mappings().all()
    return [dict(row) for row in rows]


@router.get("/analytics/departments")
def department_statistics_view(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM vw_department_statistics ORDER BY department_name")).mappings().all()
    return [dict(row) for row in rows]


@router.get("/analytics/funding")
def project_funding_view(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM vw_project_funding_summary ORDER BY total_funding DESC")).mappings().all()
    return [dict(row) for row in rows]


@router.get("/analytics/aggregates")
def aggregate_analytics(db: Session = Depends(get_db)):
    totals = db.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM researchers) AS researchers,
            (SELECT COUNT(*) FROM projects) AS projects,
            (SELECT COUNT(*) FROM departments) AS departments,
            (SELECT COUNT(*) FROM guides) AS guides,
            (SELECT COUNT(*) FROM publications) AS publications,
            (SELECT COUNT(*) FROM milestones) AS milestones,
            (SELECT COALESCE(SUM(amount), 0) FROM funding) AS total_funding,
            (SELECT COALESCE(AVG(amount), 0) FROM funding) AS average_funding,
            (SELECT COALESCE(MIN(amount), 0) FROM funding) AS minimum_funding,
            (SELECT COALESCE(MAX(amount), 0) FROM funding) AS maximum_funding
    """)).mappings().one()

    by_status = db.execute(text("""
        SELECT status, COUNT(*) AS project_count
        FROM projects GROUP BY status ORDER BY status
    """)).mappings().all()

    by_department = db.execute(text("""
        SELECT d.name AS department, COUNT(r.id) AS researcher_count
        FROM departments d
        LEFT JOIN researchers r ON r.department_id = d.id
        GROUP BY d.id, d.name ORDER BY d.name
    """)).mappings().all()

    return {
        "totals": dict(totals),
        "projects_by_status": [dict(row) for row in by_status],
        "researchers_by_department": [dict(row) for row in by_department],
    }


@router.get("/projects/{project_id}/status-history")
def project_status_history(project_id: int, db: Session = Depends(get_db)):
    if not db.get(m.Project, project_id):
        raise HTTPException(404, "Project not found")
    rows = db.execute(text("""
        SELECT id, project_id, old_status, new_status, changed_at
        FROM project_status_history
        WHERE project_id = :project_id
        ORDER BY changed_at DESC, id DESC
    """), {"project_id": project_id}).mappings().all()
    return [dict(row) for row in rows]
