# Final Project Cleanup Checklist

## 1. Code Cleanup
- [ ] Remove all unused imports across React components (`App.jsx`, `WorkflowList.jsx`, `WorkflowExecution.jsx`, etc.).
- [ ] Remove all unused standard CSS classes or dummy code.
- [ ] Ensure all API routes rely on `api.js` Axios instances and avoid hardcoded `fetch` calls.
- [ ] Confirm no API secrets or `.env` files with production passwords are in version control.
- [ ] Ensure `pom.xml` and `package.json` only include necessary dependencies.

## 2. GitHub Readiness
- [ ] Add `target/` and `.env` to the `.gitignore` files for backend/frontend respectively.
- [ ] Include the seeded `database_seed.sql` in the repository root for evaluators.
- [ ] Ensure the generated `README.md` is placed perfectly at the repository root.
- [ ] Ensure the repo clearly delineates the `/backend` and `/frontend` monorepo structure.

## 3. Environment Setup Check
- [ ] Verify `Node.js` (v18+) and `Java JDK` (v17+) compatibility.
- [ ] Confirm `mvn clean compile` works without external plugins crashing.
- [ ] Confirm the frontend starts flawlessly via `npm run dev` out of the box.

## 4. Database Setup Check
- [ ] Ensure `application.properties` uses generic `root` localhost configs, but explicitly document them in the README.
- [ ] Validate `spring.jpa.hibernate.ddl-auto=update` is active so the reviewer's MySQL auto-creates tables on run.
- [ ] Test that `database_seed.sql` inserts `workflows`, `steps`, and `rules` successfully without foreign key violations.

## 5. Startup Sequence & Polish
- [ ] Start MySQL instance.
- [ ] Run backend `mvn spring-boot:run`. Wait for "Tomcat started on port 8080".
- [ ] Run frontend `npm run dev`. Wait for "Local: http://localhost:5173/".
- [ ] Walk through the entire execution suite without any 500 errors.
- [ ] Verify UX Polish—Loading spinners, success alerts, error messages, and disabled submit buttons during flight state.
