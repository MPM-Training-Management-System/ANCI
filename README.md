# ANCI Training Management System (TMS)

A modern Training Management System built using a **Monorepo Architecture** with **Turborepo**, **Next.js**, and **.NET Web API**.

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Turborepo
- PNPM

## Backend

- ASP.NET Core Web API (.NET)
- Entity Framework Core
- SQL Server

---

# Project Structure

```text
CAPSTONE-FINAL/
├── apps/
│   ├── web
│   └── admin
│
├── packages/
│   ├── ui
│   ├── tokens
│   ├── shared
│   └── types
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json

server/
└── ANCI.Api
```

---

# Requirements

Install the following before running the project.

- Node.js 22+
- PNPM
- .NET SDK 8+
- SQL Server
- Git

---

# Installation

## Clone Repository

```bash
git clone https://github.com/MPM-Training-Management-System/ANCI
```

---

# Frontend Setup



Install dependencies.

```bash
pnpm install
```

---

# Run Frontend

## Run Web Application

```bash
pnpm --filter web dev
```

Open

```
http://localhost:3000
```

---





---

# Build Frontend

```bash
pnpm --filter web build
```

---

# Backend Setup

Navigate to the server project.

```bash
cd server
```

Restore packages.

```bash
dotnet restore
```

---

# Configure Environment

Update your database connection inside

```
appsettings.json
```

Example

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=ANCI_DB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

---

# Apply Database Migration

```bash
dotnet ef database update
```

---

# Run Backend

```bash
dotnet run
```

or

```bash
dotnet watch run
```

Backend API

```
https://localhost:5001
```

or

```
http://localhost:5000
```

---


## Run Lint

```bash
pnpm lint
```

---

## Check Types

```bash
pnpm check-types
```

---

## Build All Packages

```bash
pnpm build
```

---

# Environment Variables

## Frontend

Create

```
apps/web/.env.local
```

Example

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Backend

Configure

```
appsettings.json
```

or

```
appsettings.Development.json
```

---

# Development Workflow

1. Pull latest changes

```bash
git pull
```

2. Install dependencies

```bash
pnpm install
```

3. Run backend

```bash
cd server
dotnet watch run
```

4. Run frontend

```bash

pnpm --filter web dev
```

---

# Git Workflow

Create a new branch.

```bash
git checkout -b feature/your-feature
```

Commit changes.

```bash
git add .
git commit -m "feat: description"
```

Push branch.

```bash
git push origin feature/your-feature
```

Create a Pull Request.

---

# Contributors

- ANCI Development Team

---

# License

This project is intended for educational and organizational use.