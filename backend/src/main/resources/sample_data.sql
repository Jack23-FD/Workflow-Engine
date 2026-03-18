-- Sample Data for Expense Approval Workflow (Updated with requested rules)

-- Workflow: Expense Approval
SET @workflow_id = UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000');

INSERT INTO workflows (id, name, version, is_active, input_schema, start_step_id) VALUES 
(@workflow_id, 'Expense Approval', 1, 1, '{"amount": "number", "country": "string", "priority": "string"}', NULL);

-- Steps
SET @step_manager = UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440001');
SET @step_finance = UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440002');
SET @step_ceo = UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440003');
SET @step_rejection = UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440004');

INSERT INTO steps (id, workflow_id, name, step_type, step_order, metadata) VALUES 
(@step_manager, @workflow_id, 'Manager Approval', 'approval', 1, '{}'),
(@step_finance, @workflow_id, 'Finance Notification', 'notification', 2, '{}'),
(@step_ceo, @workflow_id, 'CEO Approval', 'approval', 3, '{}'),
(@step_rejection, @workflow_id, 'Task Rejection', 'task', 4, '{}');

-- Update start step
UPDATE workflows SET start_step_id = @step_manager WHERE id = @workflow_id;

-- Rules (Using SpEL syntax as required by the RuleEngine)
-- Rule 1: amount > 100 && country == 'US' && priority == 'High' -> Finance Notification
INSERT INTO rules (id, step_id, next_step_id, `condition`, priority) VALUES 
(UUID_TO_BIN(UUID()), @step_manager, @step_finance, '#amount > 100 && #country == ''US'' && #priority == ''High''', 1);

-- Rule 2: amount <= 100 -> CEO Approval
INSERT INTO rules (id, step_id, next_step_id, `condition`, priority) VALUES 
(UUID_TO_BIN(UUID()), @step_manager, @step_ceo, '#amount <= 100', 2);

-- Rule 3: priority == 'Low' && country != 'US' -> Task Rejection
INSERT INTO rules (id, step_id, next_step_id, `condition`, priority) VALUES 
(UUID_TO_BIN(UUID()), @step_manager, @step_rejection, '#priority == ''Low'' && #country != ''US''', 3);

-- Rule 4: DEFAULT -> Task Rejection (Condition is null)
INSERT INTO rules (id, step_id, next_step_id, `condition`, priority) VALUES 
(UUID_TO_BIN(UUID()), @step_manager, @step_rejection, NULL, 999);
