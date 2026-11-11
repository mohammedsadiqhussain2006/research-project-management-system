-- Research Project Management System: SQL views
-- Run this file after the application tables have been created.
USE research_management;

CREATE OR REPLACE VIEW vw_project_overview AS
SELECT
    p.id AS project_id,
    p.title,
    p.status,
    p.start_date,
    p.end_date,
    g.name AS guide_name,
    COUNT(DISTINCT pr.researcher_id) AS researcher_count,
    COALESCE(f.total_funding, 0) AS total_funding,
    COUNT(DISTINCT pub.id) AS publication_count,
    COUNT(DISTINCT m.id) AS milestone_count
FROM projects p
LEFT JOIN guides g ON g.id = p.guide_id
LEFT JOIN project_researchers pr ON pr.project_id = p.id
LEFT JOIN publications pub ON pub.project_id = p.id
LEFT JOIN milestones m ON m.project_id = p.id
LEFT JOIN (
    SELECT project_id, SUM(amount) AS total_funding
    FROM funding
    GROUP BY project_id
) f ON f.project_id = p.id
GROUP BY p.id, p.title, p.status, p.start_date, p.end_date, g.name, f.total_funding;

CREATE OR REPLACE VIEW vw_department_statistics AS
SELECT
    d.id AS department_id,
    d.name AS department_name,
    COUNT(r.id) AS researcher_count
FROM departments d
LEFT JOIN researchers r ON r.department_id = d.id
GROUP BY d.id, d.name;

CREATE OR REPLACE VIEW vw_project_funding_summary AS
SELECT
    p.id AS project_id,
    p.title,
    COUNT(f.id) AS funding_records,
    COALESCE(SUM(f.amount), 0) AS total_funding,
    COALESCE(AVG(f.amount), 0) AS average_funding,
    COALESCE(MIN(f.amount), 0) AS minimum_funding,
    COALESCE(MAX(f.amount), 0) AS maximum_funding
FROM projects p
LEFT JOIN funding f ON f.project_id = p.id
GROUP BY p.id, p.title;
