# Contributing Guidelines

Thank you for contributing to the **Integrated Service and Training Management System for ACE NextGen Consultancy Inc.**

To maintain code quality and project organization, please follow these guidelines.

---

## Branch Strategy

Never commit directly to the `main` branch.

### Branch Structure

```text
main
└── dev
    ├── feature/<feature-name>
    ├── bugfix/<issue-name>
    └── hotfix/<issue-name>
```

### Branch Naming Convention

#### Feature Branch

```text
feature/login-page
feature/training-management
feature/certificate-module
```

#### Bug Fix Branch

```text
bugfix/login-validation
bugfix/api-error
```

#### Hot Fix Branch

```text
hotfix/security-patch
```

---

## Development Workflow

### 1. Update Development Branch

```bash
git checkout dev
git pull origin dev
```

### 2. Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

Implement the assigned feature, fix, or improvement.

### 4. Commit Changes

Follow the commit message convention below.

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

Submit a Pull Request targeting the `dev` branch.

---

## Commit Message Convention

Use meaningful and consistent commit messages.

### Format

```text
type: short description
```

### Types

| Type     | Description              |
| -------- | ------------------------ |
| feat     | New feature              |
| fix      | Bug fix                  |
| docs     | Documentation            |
| style    | UI or formatting changes |
| refactor | Code improvement         |
| test     | Testing                  |
| chore    | Maintenance tasks        |

### Examples

```text
feat: add login page

fix: resolve authentication error

docs: update installation guide

refactor: improve dashboard layout
```

---

## Pull Request Guidelines

Before creating a Pull Request, ensure that:

* [ ] Code builds successfully
* [ ] No linting errors
* [ ] No console errors
* [ ] Changes tested locally
* [ ] Documentation updated if needed

### Pull Request Title Format

```text
[FEATURE] Login Page

[BUGFIX] Fix Authentication Error

[REFACTOR] Improve Dashboard Components

[DOCS] Update Documentation
```

---

## Coding Standards

### Frontend (Next.js)

#### Components

```text
LoginForm.tsx
DashboardLayout.tsx
UserCard.tsx
```

#### Folder Structure

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── store/
├── types/
└── utils/
```

### Backend (ASP.NET Core)

#### Folder Structure

```text
Controllers/
Services/
Repositories/
Models/
DTOs/
Middleware/
Data/
```

#### Naming Convention

```text
UserController
TrainingController

IUserService
UserService

CreateUserDto
UpdateUserDto
```

---

## Definition of Done (DoD)

A task is considered complete when:

* Requirements are fully implemented
* Code follows project standards
* No build or lint errors
* Functionality tested locally
* Documentation updated when necessary
* Pull Request approved
* Merged into `dev`

---

## Review Rules

* Do not merge directly into `main`
* All Pull Requests must be reviewed before merging
* Resolve review comments before approval
* Keep Pull Requests focused and manageable

---

## Communication

For questions, issues, or blockers:

* Create a GitHub Issue
* Comment on the related task
* Contact the Project Lead

Thank you for contributing to the project.