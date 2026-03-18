-- Workflow: Expense Approval
INSERT INTO workflows (id, name, version, is_active, input_schema, start_step_id) VALUES
('e577cf0b-1af7-4e60-890e-5a52322875e2', 'Expense Approval', 1, true, '{}', '96d26ec5-ebe8-4c7d-9d29-6cd628a806ab');

INSERT INTO steps (id, workflow_id, name, step_type, step_order, metadata) VALUES
('96d26ec5-ebe8-4c7d-9d29-6cd628a806ab', 'e577cf0b-1af7-4e60-890e-5a52322875e2', 'Manager Approval', 'approval', 1, null),
('0e4ed39e-ab20-4b9d-926b-5d004430ef42', 'e577cf0b-1af7-4e60-890e-5a52322875e2', 'Finance Notification', 'notification', 2, null),
('c92c8562-fc52-4af8-b4bf-8530b75631bf', 'e577cf0b-1af7-4e60-890e-5a52322875e2', 'CEO Approval', 'approval', 3, null);

INSERT INTO rules (id, step_id, rule_condition, next_step_id, priority) VALUES
('02ece156-6427-4302-b0a4-6fa4b521c17f', '96d26ec5-ebe8-4c7d-9d29-6cd628a806ab', 'amount > 100 && country == ''US'' && priority == ''High''', '0e4ed39e-ab20-4b9d-926b-5d004430ef42', 1),
('13fdf267-7538-5413-c1b5-70b5c632d28g', '96d26ec5-ebe8-4c7d-9d29-6cd628a806ab', 'amount <= 100', 'c92c8562-fc52-4af8-b4bf-8530b75631bf', 2),
('e006a832-db9a-4bbf-9963-5927f06e7a12', '96d26ec5-ebe8-4c7d-9d29-6cd628a806ab', 'DEFAULT', 'c92c8562-fc52-4af8-b4bf-8530b75631bf', 3);

-- Workflow: Employee Onboarding
INSERT INTO workflows (id, name, version, is_active, input_schema, start_step_id) VALUES
('a111cf0b-2bf7-4e60-890e-5a52322875b1', 'Employee Onboarding', 1, true, '{}', 'b2226ec5-ebe8-4c7d-9d29-6cd628a806c2');

INSERT INTO steps (id, workflow_id, name, step_type, step_order, metadata) VALUES
('b2226ec5-ebe8-4c7d-9d29-6cd628a806c2', 'a111cf0b-2bf7-4e60-890e-5a52322875b1', 'IT Setup', 'task', 1, null),
('c333ed39-ab20-4b9d-926b-5d004430efd3', 'a111cf0b-2bf7-4e60-890e-5a52322875b1', 'System Access', 'task', 2, null),
('d444c856-fc52-4af8-b4bf-8530b75631e4', 'a111cf0b-2bf7-4e60-890e-5a52322875b1', 'HR Orientation', 'notification', 3, null);

INSERT INTO rules (id, step_id, rule_condition, next_step_id, priority) VALUES
('e555ce15-6427-4302-b0a4-6fa4b521c1f5', 'b2226ec5-ebe8-4c7d-9d29-6cd628a806c2', 'role == ''Developer''', 'c333ed39-ab20-4b9d-926b-5d004430efd3', 1),
('f6666a83-db9a-4bbf-9963-5927f06e7a16', 'b2226ec5-ebe8-4c7d-9d29-6cd628a806c2', 'DEFAULT', 'd444c856-fc52-4af8-b4bf-8530b75631e4', 2),
('1777b944-ecbc-5ccf-0074-6038e17f8b27', 'c333ed39-ab20-4b9d-926b-5d004430efd3', 'DEFAULT', 'd444c856-fc52-4af8-b4bf-8530b75631e4', 1);
