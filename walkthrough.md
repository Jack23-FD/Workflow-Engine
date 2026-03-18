# Workflow Automation Engine - Core Modules Walkthrough

## How Workflow Creation Works
The **Workflow Editor** is the foundational building block of the application.
1. Click **Create Workflow**.
2. Define a **Name**, a **Version** (e.g., 1), and define the **Input Schema** as JSON properties. This JSON structure guides what parameters rules can evaluate against.
3. Mark it **Active** and Save. The backend immediately synchronizes the new workflow record into the MySQL database.

## How Steps and Rules Work
Steps represent the functional flow markers—what needs to happen. Rules are the intelligent links that decide *where to go next based on data*.
1. Inside a workflow, click **Add Step**. You can define diverse types such as `task` (general action), `approval` (requires manual resume), or `notification` (informational).
2. Once a step is created, click **Manage Rules**. 
3. Rules execute sequentially via an assigned **Priority** (1 runs first, 2, 3...). 
4. The SpEL condition can test strings and numbers dynamically. Example: `amount > 100` and `country == 'US'`.
5. You must define a `DEFAULT` condition for standard fallback logic so the engine never enters an infinite unhandled loop.

## How Execution Engine Works
The Execution Engine is a standalone synchronous service powered by the `WorkflowExecutionService`.
1. From the Workflow List, click **Run** and supply the JSON body matching the schema.
2. The Engine pulls the workflow's configured **Start Step ID**.
3. It parses the JSON, reads the rules for the first step, and delegates evaluation to the `RuleEngine`.
4. If a condition returns `true`, it logs the output and updates `current_step_id` to the designated `next_step_id`.
5. If a step type is `approval`, the engine dynamically suspends execution placing it into a **PENDING** state, allowing a human to approve/resume later via the Dashboard.

## How Logs are Stored
Auditing is vital. During execution, every evaluated step triggers a new `ExecutionLog` persist event.
*   **Time Tracking**: We measure `started_at`, `ended_at`, and calculate durations.
*   **Evaluation Path**: The engine converts the evaluated SpEL priority conditions into JSON blocks, so that developers can always see *why* an engine chose its path.
*   Everything is securely captured within the `execution_logs` MySQL table linked to the `executions` parent record.

## How Execution History Works
The **Executions Dashboard** completes the lifecycle, ensuring full transparency.
1. Utilizing Spring Data JPA's `Pageable` APIs, the table renders 10 executions at a time natively without overloading the browser.
2. **Filters**: Users can query executions instantly by filtering specific UUIDs or mapping dropdowns to `status` (e.g., FAILED, COMPLETED).
3. Clicking **View Details** pops open the details module, dumping the original raw JSON string and presenting a clean table map of the exact step-by-step logs parsed in real-time.
