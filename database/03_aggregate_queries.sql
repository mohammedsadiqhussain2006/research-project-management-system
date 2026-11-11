-- Research Project Management System: aggregate-function examples
USE research_management;

-- COUNT: number of researchers, projects and publications
SELECT COUNT(*) AS total_researchers FROM researchers;
SELECT COUNT(*) AS total_projects FROM projects;
SELECT COUNT(*) AS total_publications FROM publications;

-- SUM, AVG, MIN and MAX: funding statistics
SELECT
    COUNT(*) AS funding_records,
    COALESCE(SUM(amount), 0) AS total_funding,
    COALESCE(AVG(amount), 0) AS average_funding,
    MIN(amount) AS minimum_funding,
    MAX(amount) AS maximum_funding
FROM funding;

-- GROUP BY: number of researchers in each department
SELECT d.name AS department, COUNT(r.id) AS researcher_count
FROM departments d
LEFT JOIN researchers r ON r.department_id = d.id
GROUP BY d.id, d.name;

-- HAVING: departments with at least two researchers
SELECT d.name AS department, COUNT(r.id) AS researcher_count
FROM departments d
JOIN researchers r ON r.department_id = d.id
GROUP BY d.id, d.name
HAVING COUNT(r.id) >= 2;

-- GROUP BY: project count for each status
SELECT status, COUNT(*) AS project_count
FROM projects
GROUP BY status;

-- GROUP_CONCAT: researcher names assigned to each project
SELECT p.title,
       GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ') AS researchers
FROM projects p
JOIN project_researchers pr ON pr.project_id = p.id
JOIN researchers r ON r.id = pr.researcher_id
GROUP BY p.id, p.title;

-- Read the views
SELECT * FROM vw_project_overview;
SELECT * FROM vw_department_statistics;
SELECT * FROM vw_project_funding_summary;

-- Read the trigger-maintained audit history
SELECT * FROM project_status_history ORDER BY changed_at DESC;
