# Workflow Automation Engine - Demo Video Script (3-5 Minutes)

## Introduction (0:00 - 0:30)
**Action:** Open the application to the **Workflows Dashboard** (`http://localhost:5173/`).
**Script:**
> "Hi everyone, welcome to my final presentation of the Workflow Automation Engine. Our goal was to build a system that replaces hardcoded scripts with a dynamic, visual rule engine for business processes like Expense Approvals. I'm going to demonstrate how a user can create a workflow, attach intelligent rules, and execute it live using our custom SpEL-based backend engine."

## Workflow & Step Creation (0:30 - 1:30)
**Action:** Click **Create Workflow**, add "Employee Onboarding". Then click **Manage Steps**. Add two steps: "IT Setup" (task) and "HR Orientation" (notification).
**Script:**
> "Here on the dashboard, we can create custom workflows on the fly. Let's create an 'Employee Onboarding' flow. Workflows are composed of Steps. I'll add an 'IT Setup' task step and an 'HR Orientation' notification step. Notice how the UI seamlessly maps everything to our Spring Boot backend in real time using Axios."

## Rule Engine Configuration (1:30 - 2:30)
**Action:** Click the **Rules** button for the "IT Setup" step. Add a rule: condition `role == 'Developer'`, next step `HR Orientation`, priority `1`. Add a second rule: condition `DEFAULT`, next step `System Access`, priority `2`.
**Script:**
> "Now, the real power lies in the Rule Engine. For 'IT Setup', we don't want a linear path. We want branching logic. I'm assigning a rule that says if the incoming JSON payload specifies the role as 'Developer', it routes to HR Orientation. Otherwise, we fallback to a DEFAULT rule that routes elsewhere. Our backend evaluates these statements securely using the Spring Expression Language (SpEL)."

## Live Execution (2:30 - 3:30)
**Action:** Go back to the Workflow List. Click the **Run** (Play) button for the 'Expense Approval' seeded workflow. Enter `{"amount": 250, "country": "US", "priority": "High"}`. Click **Start Execution**.
**Script:**
> "Let's see the engine in action. I'll run our pre-seeded 'Expense Approval' workflow. I'm passing in a live JSON payload where the expense amount is 250. Watch what happens when I hit start."
*(Wait for the Timeline UI to show the transition).*
> "The Execution Engine parsed the JSON, passed it to the SpEL evaluator, matched the condition `amount > 100`, and successfully transitioned the workflow from Manager Approval to Finance Notification! It then paused execution because it hit an 'approval' required step."

## Audit Log Dashboard (3:30 - 4:30)
**Action:** Click **Executions** in the top navigation bar. Filter by "Pending", then click **View Details** on the execution you just ran.
**Script:**
> "Finally, let's look at the Executions Dashboard—our Audit Log. This paginated table pulls directly from our MySQL database using Spring Data Pageables. If I click 'View Details' on the run we just did, you can see the exact JSON payload. Below that, we mapped the exact SpEL condition rules the engine considered, what step it selected, and how long it took in milliseconds. Thank you for watching!"
