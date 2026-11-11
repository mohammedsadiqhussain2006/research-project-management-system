-- Research Project Management System: MySQL triggers
-- Run this file after the application tables have been created.
USE research_management;

CREATE TABLE IF NOT EXISTS project_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_history_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_funding_before_insert;
DROP TRIGGER IF EXISTS trg_funding_before_update;
DROP TRIGGER IF EXISTS trg_milestone_before_update;
DROP TRIGGER IF EXISTS trg_project_status_after_update;

DELIMITER //

CREATE TRIGGER trg_funding_before_insert
BEFORE INSERT ON funding
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Funding amount must be greater than zero';
    END IF;
END //

CREATE TRIGGER trg_funding_before_update
BEFORE UPDATE ON funding
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Funding amount must be greater than zero';
    END IF;
END //

CREATE TRIGGER trg_milestone_before_update
BEFORE UPDATE ON milestones
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status <> 'Completed' THEN
        SET NEW.completed_at = CURRENT_TIMESTAMP;
    ELSEIF NEW.status <> 'Completed' THEN
        SET NEW.completed_at = NULL;
    END IF;
END //

CREATE TRIGGER trg_project_status_after_update
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    IF NOT (OLD.status <=> NEW.status) THEN
        INSERT INTO project_status_history
            (project_id, old_status, new_status)
        VALUES
            (OLD.id, OLD.status, NEW.status);
    END IF;
END //

DELIMITER ;
