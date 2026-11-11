# Research Project Management System (FastAPI + MySQL)

## Features
- Departments, researchers and guides
- Projects with status and dates
- Assign multiple researchers to a project
- Funding records, publications and milestones
- Dashboard counts and project status summary
- Interactive Swagger API documentation

## 1. Create the MySQL database
```sql
CREATE DATABASE research_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Configure and run
```bash
cd research_project_management_system
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `.env` with your MySQL username and password, then:
```bash
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs

Tables are created automatically on first run. For a production deployment, replace `create_all` with Alembic migrations and restrict CORS.

## Main API routes
| Method | Route | Purpose |
|---|---|---|
| GET/POST | `/api/departments` | List/create departments |
| GET/POST | `/api/researchers` | List/create researchers |
| GET/POST | `/api/guides` | List/create guides |
| GET/POST/PATCH/DELETE | `/api/projects` | Project CRUD |
| POST/GET | `/api/projects/{id}/researchers` | Assign/list project team |
| POST/GET | `/api/projects/{id}/funding` | Add/list funding |
| POST/GET | `/api/projects/{id}/publications` | Add/list publications |
| POST/GET | `/api/projects/{id}/milestones` | Add/list milestones |
| PATCH | `/api/milestones/{id}` | Update milestone |
| GET | `/api/dashboard` | Dashboard summary |

## Example request bodies
Department:
```json
{"name":"Computer Science","description":"CSE research department"}
```
Researcher:
```json
{"name":"Aisha Khan","email":"aisha@example.com","designation":"Research Scholar","department_id":1}
```
Guide:
```json
{"name":"Dr. Rao","email":"rao@example.com","specialization":"AI"}
```
Project:
```json
{"title":"Graph-based Path Planning","description":"Research on intelligent routing","status":"Ongoing","start_date":"2026-11-01","end_date":"2027-05-31","guide_id":1}
```
Funding:
```json
{"source":"Institute Research Grant","amount":50000,"received_on":"2026-11-01"}
```
Milestone:
```json
{"title":"Literature review","due_date":"2026-12-01","status":"Pending"}
```

## 4. Run the React frontend

Open a second terminal:
```bash
cd research_project_management_system/frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally http://localhost:5173).
The frontend expects the API at `http://127.0.0.1:8000/api`. Override it by copying
`frontend/.env.example` to `frontend/.env` and changing `VITE_API_URL` if needed.

The UI includes an overview dashboard, searchable management tables, create forms,
project detail view, researcher assignment, and forms for funding, publications and milestones.


## 5. DBMS features: views, triggers and aggregate functions

The project now includes a SQL-based analytics layer in addition to its CRUD operations.

### Install the SQL objects (MySQL)

Start the FastAPI backend once so SQLAlchemy creates the application tables. Then, from the project root, run:

```bash
mysql -u root -p research_management < database/01_views.sql
mysql -u root -p research_management < database/02_triggers.sql
```

The SQL scripts are intentionally separate from `Base.metadata.create_all()`: MySQL views and triggers are database-level objects and are installed explicitly. Re-run `01_views.sql` to refresh the view definitions. `02_triggers.sql` drops and recreates the project's triggers safely.

### Included views

- `vw_project_overview`: project, guide, researcher count, funding total, publication count and milestone count.
- `vw_department_statistics`: researcher count for each department.
- `vw_project_funding_summary`: funding record count, SUM, AVG, MIN and MAX for each project.

### Included triggers

- `trg_funding_before_insert`: rejects funding amounts less than or equal to zero.
- `trg_funding_before_update`: applies the same validation to funding updates.
- `trg_milestone_before_update`: sets `completed_at` when a milestone changes to `Completed`, and clears it if moved out of that status.
- `trg_project_status_after_update`: records project status changes in `project_status_history`.

### Aggregate-function examples

`database/03_aggregate_queries.sql` demonstrates `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP_CONCAT`, `GROUP BY` and `HAVING`.

### New API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/analytics/project-overview` | Reads `vw_project_overview` |
| GET | `/api/analytics/departments` | Reads `vw_department_statistics` |
| GET | `/api/analytics/funding` | Reads `vw_project_funding_summary` |
| GET | `/api/analytics/aggregates` | Returns aggregate metrics and grouped reports |
| GET | `/api/projects/{id}/status-history` | Reads trigger-generated status history |

The React sidebar includes an **Analytics** page that displays the view and aggregate results. Open `/docs` to test the endpoints.

### Important

Install the two SQL scripts after the application's tables exist and before opening Analytics. If Analytics reports that a view or `project_status_history` does not exist, run the corresponding SQL installation script. The milestone timestamp trigger runs on UPDATE; creating a milestone already marked `Completed` does not backfill its timestamp.
