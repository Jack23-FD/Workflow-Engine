<<<<<<< HEAD
# Workflow Automation Engine

Working video Link:
https://drive.google.com/drive/folders/1tOKbpmIgoqTGebIdQarynZVCfcab5IT-?usp=drive_link

## Intro & Problem Statement
The **Workflow Automation Engine** is a dynamic, rule-based system that allows teams to visually design, automate, and monitor complex business logic. In many organizations, processes like **Expense Approvals** or **Employee Onboarding** rely on disconnected scripts or manual checks. This project solves that problem by providing a central engine where users can define steps, assign priority-based rules using a SpEL (Spring Expression Language) execution engine, run workflows with dynamic JSON inputs, and trace exact evaluation paths through an Audit Log Dashboard.

## Features
*   **Workflow Management**: Create and manage workflows dynamically.
*   **Dynamic Steps**: Add customized steps of varying types (`task`, `approval`, `notification`).
*   **Intelligent Rule Engine**: Use SpEL (Spring Expression Language) to create branching logic based on runtime JSON inputs. Rules execute in ascending priority order.
*   **Execution Engine**: Run workflows with live JSON data. The engine evaluates conditions, triggers events, and manages the execution state (e.g., pausing on approvals).
*   **Audit Dashboard**: A fully paginated execution history view with deep-dive modals showing execution logs, raw JSON inputs, and decision rules evaluated at every step.

## Tech Stack
*   **Frontend**: React (Vite), React Router Dom, Plain CSS for styling (Zero utility classes), Lucide React (Icons).
*   **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Expression Language (SpEL), Lombok.
*   **Database**: MySQL (Hibernate ORM).

## Architecture Overview
1.  **Client Layer**: React-based UI communicating via a dedicated Axios `api.js` service.
2.  **Controller Layer**: Spring Boot REST Controllers (`WorkflowController`, `StepController`, `RuleController`, `ExecutionController`) handle and validate requests mapping them onto DTOs.
3.  **Service & Engine Layer**: Core business logic sits here. The `WorkflowExecutionService` loops over steps securely, while the `RuleEngine` evaluates SpEL conditions dynamically against injected JSON parameters. 
4.  **Data Layer**: Spring Data JPA Repositories store and retrieve state instantly from MySQL.

## Database Schema Summary
*   **`workflows`**: `id`, `name`, `version`, `is_active`, `input_schema`, `start_step_id`
*   **`steps`**: `id`, `workflow_id`, `name`, `step_type`, `step_order`, `metadata`
*   **`rules`**: `id`, `step_id`, `rule_condition`, `next_step_id`, `priority`
*   **`executions`**: `id`, `workflow_id`, `status`, `data` (JSON), `current_step_id`, `started_at`
*   **`execution_logs`**: `id`, `execution_id`, `step_name`, `evaluated_rules` (JSON), `status`

## API Endpoints
*   `GET /api/workflows` - Fetch all workflows
*   `POST /api/workflows` - Create a new workflow
*   `POST /api/workflows/{id}/steps` - Add a step to a workflow
*   `POST /api/steps/{id}/rules` - Add a rule to a step
*   `POST /api/workflows/{id}/execute` - Trigger a workflow with `{ "data": { ... } }`
*   `GET /api/executions` - Fetch paginated audit logs (filters: `status`, `workflowId`)

## Setup Instructions

### Database Setup
1. Create a MySQL database named `workflow_db`.
2. Ensure credentials in `backend/src/main/resources/application.properties` (username: `root`, password: `Password@123`) match your local setup.
3. Automatically load sample data by running `mysql -u root -p workflow_db < database_seed.sql` inside the root directory.

### How to Run Backend
1. Navigate to the `backend` directory.
2. Ensure you have Maven and Java JDK 17+ installed.
3. Run `mvn spring-boot:run`. The backend will start on `http://localhost:8080`.

### How to Run Frontend
1. Navigate to the `frontend` directory.
2. Ensure you have Node.js installed.
3. Run `npm install` to load dependencies.
4. Run `npm run dev`. The frontend will start on your local Vite port (usually `http://localhost:5173`).

## Sample Workflow Explanation
**Expense Approval**
1. Data passed: `{"amount": 250, "country": "US", "priority": "High"}`
2. **Step 1 (Manager Approval)**: Evaluates rule `amount > 100 && country == 'US'`.
3. Rule passes -> Transitions to **Step 2 (Finance Notification)**.
4. Action logged and recorded in the database. 

## Future Improvements
*   Implement JWT-based authentication to track execution triggers to distinct users.
*   Containerize the application with Docker and Docker Compose.
*   Interactive drag-and-drop canvas for the Workflow Editor mapping SpEL variables visually.
*   Webhook integrations for `notification` step types.
=======
# Workflow-Engine
for Halleyx Project
>>>>>>> cb2e0d133c84cc9e0d17712886deeed47ea4f405
