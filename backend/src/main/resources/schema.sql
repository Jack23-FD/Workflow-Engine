-- Workflow Engine Database Schema

CREATE DATABASE IF NOT EXISTS workflow_db;
USE workflow_db;

-- Table: workflows
CREATE TABLE workflows (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    input_schema JSON,
    start_step_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: steps
CREATE TABLE steps (
    id BINARY(16) PRIMARY KEY,
    workflow_id BINARY(16),
    name VARCHAR(255) NOT NULL,
    step_type ENUM('task', 'approval', 'notification') NOT NULL,
    step_order INT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Table: rules
CREATE TABLE rules (
    id BINARY(16) PRIMARY KEY,
    step_id BINARY(16),
    rule_condition TEXT,
    next_step_id BINARY(16),
    priority INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE
);

-- Table: executions
CREATE TABLE executions (
    id BINARY(16) PRIMARY KEY,
    workflow_id BINARY(16),
    workflow_version INT,
    status ENUM('pending', 'in_progress', 'completed', 'failed', 'canceled') DEFAULT 'pending',
    data JSON,
    current_step_id BINARY(16),
    retries INT DEFAULT 0,
    triggered_by VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Table: execution_logs
CREATE TABLE execution_logs (
    id BINARY(16) PRIMARY KEY,
    execution_id BINARY(16),
    step_name VARCHAR(255),
    step_type VARCHAR(50),
    evaluated_rules JSON,
    selected_next_step VARCHAR(255),
    status VARCHAR(50),
    approver_id VARCHAR(255),
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
);
