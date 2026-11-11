from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers.api import router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Research Project Management System", version="1.0.0",
              description="Manage researchers, departments, guides, projects, funding, publications and milestones.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message":"Research Project Management System API","docs":"/docs"}
