# System Architecture Diagrams

This document presents visual architecture representations of the AI Powered Job Prep platform using **Mermaid** (GitHub native rendering). It mirrors the boxed style of the provided reference image (User → Frontend → Backend → Data/Storage → AI Layer + External Services) while remaining text-based and versionable.

---

## 1. High-Level System Landscape

```mermaid
flowchart LR
  subgraph U["User"]
    EndUser(["Browser User"])
  end

  subgraph FE["Frontend (Next.js / React)"]
    RSC["React Server Components"]
    UIComp["UI Components<br/>Tailwind + Radix"]
    AuthWidget["Clerk Frontend"]
  end

  subgraph BE["Backend (Next.js Server)"]
    SA["Server Actions"]
    API["Route Handlers /api/*"]
    Features["Feature Modules<br/>(interviews, jobInfos, questions)"]
    Perm["Permissions / AuthZ"]
  end

  subgraph DB["Database & Storage"]
    PG["PostgreSQL via Drizzle"]
    Cache["In-Memory Cache"]
  end

  subgraph AI["AI Layer"]
    QGen["Question Generation Service"]
    Resume["Resume Analysis Service"]
    InterviewAI["Interview Feedback (future)"]
    Prompt["Prompt Builders & Templates"]
  end

  subgraph EXT["External Providers"]
    ClerkP["Clerk"]
    GeminiP["Gemini Models"]
    HumeP["Hume API"]
    ArcjetP["Arcjet"]
  end

  EndUser -->|HTTP / RSC| FE
  FE -->|Actions & Fetch| BE
  BE -->|SQL Queries| PG
  BE -->|Ephemeral| Cache
  BE -->|Auth Verify| ClerkP
  BE -->|LLM Calls| GeminiP
  BE -->|Voice + Affect| HumeP
  BE -->|Risk / Rate| ArcjetP
  BE -->|AI Orchestration| AI
  AI -->|Model Invocation| GeminiP
  AI -->|Affect Signals| HumeP

```

---

## 2. Deployment / Runtime Topology

```mermaid
flowchart TB
  Browser["User Browser<br/>(React + ClerkJS)"] --> Vercel["Vercel Edge / Node Runtimes"]
  Vercel --> Postgres["Managed Postgres"]
  Vercel --> Gemini["Gemini API"]
  Vercel --> Hume["Hume API"]
  Vercel --> Clerk["Clerk API"]
  Vercel --> Arcjet["Arcjet Risk Engine"]

```

---

## 3. Data Model (Current Core)

```mermaid
erDiagram
  USERS ||--o{ JOB_INFO : owns
  JOB_INFO ||--o{ QUESTIONS : generates
  JOB_INFO ||--o{ INTERVIEWS : produces

  USERS {
    varchar id PK
    varchar email
  }
  JOB_INFO {
    uuid id PK
    varchar title
    enum experienceLevel
  }
  QUESTIONS {
    uuid id PK
    uuid jobInfoId FK
    enum difficulty
  }
  INTERVIEWS {
    uuid id PK
    uuid jobInfoId FK
    varchar humeChatId
  }
```

---

## 4. AI Question Generation Flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend Form
  participant SA as Server Action
  participant DB as DB (Drizzle)
  participant PB as Prompt Builder
  participant LLM as Gemini

  U->>FE: Submit Job Info
  FE->>SA: Create jobInfo()
  SA->>DB: INSERT job_info
  DB-->>SA: JobInfo(id,...)
  SA->>PB: Build prompt
  PB-->>SA: Prompt artifact
  SA->>LLM: Invoke (stream)
  LLM-->>SA: Generated questions
  SA->>DB: INSERT questions[]
  SA-->>FE: jobInfo + questions[]
```

---

## 5. Resume Analysis Flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Client
  participant API as /api/ai/resumes/analyze
  participant DB as DB
  participant PB as Prompt Builder
  participant LLM as Gemini

  U->>FE: Provide resume + select job
  FE->>API: POST resume + jobInfoId
  API->>DB: SELECT job_info
  DB-->>API: jobInfo
  API->>PB: Build comparative prompt
  PB-->>API: Prompt artifact
  API->>LLM: Invoke model
  LLM-->>API: Draft analysis
  API-->>FE: strengths/gaps/recommendations
```

---

## 6. Interview Session & Affective Feedback (Planned Extension)

```mermaid
flowchart LR
  Start[Start Interview] --> Create[Create Interview Record]
  Create --> Voice[Hume Voice Session]
  Voice --> Affect[Emotional Metrics Stream]
  Affect --> Transcript[(Transcript Tokens)]
  Transcript --> Fusion[Future: Signal + Text Fusion]
  Fusion --> PromptFB[Feedback Prompt]
  PromptFB --> LLM[Gemini / Fallback]
  LLM --> Feedback[Structured Coaching]
  Feedback --> Persist[(Store Feedback)]
```

---

## 7. AI Processing Pipeline (Standard Pattern)

```mermaid
flowchart LR
  Raw[Domain Input] --> Normalize[Validate + Sanitize]
  Normalize --> Template[Template Rendering]
  Template --> Invoke[Model Invocation]
  Invoke --> Parse[Parse / Validate Output]
  Parse --> Enhance[Enrichment (difficulty, dedupe)]
  Enhance --> Persist[Persist / Cache]
  Persist --> Return[Return / Stream]
  Invoke -. Fallback .-> Alt[Secondary Provider (future)]
  Parse -. Error .-> Recovery[Retry / Safe Output]
```

---

## 8. Planned Observability (Conceptual)

```mermaid
flowchart TB
  Calls[AI Calls] --> Trace[Tracing Layer (OTel)]
  Trace --> Metrics[Metrics (Latency, Tokens)]
  Trace --> Logs[Structured Logs]
  Logs --> Sink[(Log Drain)]
  Metrics --> Dashboard[Dashboards]
  Calls --> Audit[Prompt/Response Audit Store]
```

---

## 9. Legend / Conventions

- Rectangles: Logical components
- Rounded: External actors or ephemeral processes
- Cylinders: Persistent storage
- Dashed arrows: Planned / future pathways
- "Fallback" edges indicate resilience strategies

---

## 10. Exporting Diagrams as Images

If you need static images:

1. Use VS Code Mermaid preview extension or mermaid.live
2. Paste code → Export PNG/SVG
3. Store under `public/diagrams/` if you want to embed in docs or marketing pages.

Optional CLI (Node):

```
npm install -D @mermaid-js/mermaid-cli
mmdc -i docs/DIAGRAMS.md -o public/diagrams/architecture.png
```

(For large mixed files, copy individual code blocks into temporary `.mmd` files.)

---

## 11. Future Additions

- Add `ai_audit_log` & `resume_analysis` ER extensions
- Add sequence for multi-model fallback
- Add cost governance diagram (budgets → enforcement → analytics)

---

## 12. Change Log

- 2025-09-16: Initial diagram compendium added.
  ``
