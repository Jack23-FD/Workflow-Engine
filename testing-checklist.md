# Testing Checklist: Workflow Automation Engine

## 1. Workflow Creation Test
- [ ] Navigate to the Workflows dashboard.
- [ ] Click "Create Workflow".
- [ ] Enter a valid name, version, and `{}` as input schema.
- [ ] Click Save and verify the success notification appears.
- [ ] Verify the workflow appears in the table immediately.
- [ ] Attempt to save without a name and verify validation catches the error.

## 2. Step Creation Test
- [ ] Click "Manage Steps" on a workflow.
- [ ] Add 3 Steps: A (`task`), B (`approval`), C (`notification`).
- [ ] Verify the step order updates automatically based on insertion.
- [ ] Try creating a step with a blank name and verify validation messages. 

## 3. Rule Creation Test
- [ ] Click the "Rules" button for Step A.
- [ ] Add Rule 1: Priority `1`, Condition `amount > 500`, Next Step `Step B`.
- [ ] Add Rule 2: Priority `2`, Condition `DEFAULT`, Next Step `Step C`.
- [ ] Verify rules save correctly and reflect instantly in the table.
- [ ] Delete Rule 1 and verify the UI updates correctly without a refresh.

## 4. Execution Engine Test
- [ ] Set `Step A` as the workflow's Start Step ID via the generic payload body `{"startStepId": "..."}` or ensuring `schema.sql` seed does it. 
- [ ] Click "Run Workflow".
- [ ] Input data: `{"amount": 1000}`.
- [ ] Click "Start Execution".
- [ ] Verify the execution instantly jumps from Step A to Step B (`amount > 500` matches).
- [ ] Verify the workflow state halts at `PENDING` because Step B is an `approval`.

## 5. Execution History Page Test
- [ ] Navigate to the "Executions" page from the global header.
- [ ] View the table list. The topmost entry should be the test we just ran.
- [ ] Filter by Status: "Completed" -> verify only completed tasks show.
- [ ] Filter by Status: "Pending" -> verify your paused execution displays.
- [ ] Click "View Details" on the test execution.
- [ ] Verify the exact JSON string `{"amount": 1000}` displays untouched.
- [ ] Verify the Log Table renders Step A evaluation: `Evaluated Rules` mapped perfectly, highlighting the `nextStepId` to Step B.

## 6. Failure Case Test
- [ ] Run a test workflow that has NO rules and NO default step.
- [ ] Ensure the execution marks itself as `FAILED`.
- [ ] Verify the logs dashboard highlights the failure in red text, displaying "null pointer" or "unmapped execution index" within the Error Message area.
