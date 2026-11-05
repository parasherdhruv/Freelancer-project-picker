# Autonomous Job Hunter & Freelancer Autonomous Agent

A production monorepo foundation for discovering, evaluating, and tracking both full-time software engineering vacancies and freelance / contract opportunities.

Target Branch: `feature/freelancer-agent-foundation`

---

## Architecture Overview

```
├── apps/
│   ├── api/          # NestJS 10 REST API backend (Jobs + Freelancer + Gigs + Proposals)
│   │   ├── prisma/   # Additive Prisma schema (CandidateProfile, Job, FreelancerProfile, Gig, Proposal)
│   │   └── src/      # Controllers, services, scoring engine, discovery providers, proposal drafter
│   └── web/          # Next.js 15 (App Router) Freelancer Dashboard & Discovery Matcher
├── docker-compose.yml# Local PostgreSQL 16
├── package.json      # NPM workspace root orchestrator
└── .env.example
```

---

## Freelancer Autonomous Agent Foundation

### 1. Verified User Profile
- **Candidate:** Dhruv Parasher
- **Experience:** 4 years verified MERN Stack engineering
- **Core Technologies:** React, Next.js, Node.js, NestJS, TypeScript, MongoDB, PostgreSQL, GraphQL
- **Rate & Target:** $45/hr USD (~₹3,500/hr INR), $500 minimum project budget
- **Availability:** Immediate (40 hrs/week) for India-based and remote international freelance projects
- **Strict Guardrail:** The proposal generator never hallucinates past clients, false qualifications, or fake metrics.

### 2. Explainable 5-Dimension Winnability Scoring Engine
Every discovered project or vacancy is evaluated across 5 weighted dimensions (0–100 points):
1. **Technical Skills Overlap (35 pts):** Strict vs optional matching against the candidate's verified stack.
2. **Budget & Rate Feasibility (25 pts):** Compares project rate/budget against minimum rate thresholds.
3. **Client Trust & Quality (20 pts):** Verified payment method, 4.8+ star rating, and historical spend.
4. **Scope & Duration Feasibility (10 pts):** Remote compatibility and capacity alignment.
5. **Role Winnability (10 pts):** Direct keyword match and high conversion probability.

### 3. Safety & Human-in-the-Loop Protocol
- **Zero Automatic Submissions:** Proposals are generated in `READY_FOR_REVIEW` or `DRAFT` status.
- **Explicit Human Approval:** Bids cannot be submitted without user inspection, text refinement, and explicit approval in the dashboard.
- **Provider Abstraction:** Default deterministic provider runs 100% free with zero API costs. Optional Gemini provider supports server-side LLM drafting with strict factual guardrails.

---

## API Routes

### Freelancer & Gigs Endpoints
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/freelancer/profile` | Read verified freelancer profile |
| `PUT` | `/api/freelancer/profile` | Update profile preferences and rates |
| `GET` | `/api/gigs` | List all discovered projects with filters |
| `POST` | `/api/gigs` | Ingest project manually or via custom URL |
| `GET` | `/api/gigs/matches` | Score gigs with explainable winnability breakdown |
| `POST` | `/api/gigs/discover` | Trigger discovery sync across permitted feeds |
| `GET` | `/api/gigs/proposals` | List all drafted and approved proposals |
| `POST` | `/api/gigs/:id/proposals/generate` | Draft tailored proposal (Human-in-the-loop) |
| `PATCH` | `/api/gigs/proposals/:id/status` | Approve, reject, or update proposal cover letter |

### Employment Jobs (Phase 1 Preserved)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/candidate/profile` | Read candidate employment profile |
| `PUT` | `/api/candidate/profile` | Update candidate employment profile |
| `POST` | `/api/jobs` | Add employment job |
| `GET` | `/api/jobs` | List employment jobs |
| `GET` | `/api/jobs/matches` | Score full-time employment jobs |
| `PATCH` | `/api/jobs/:id/status` | Update employment application status |

---

## Running Locally

```bash
# 1. Environment setup
cp .env.example .env

# 2. Database setup (Optional if running Docker)
docker compose up -d
npm run db:generate
npm run db:migrate

# 3. Start development server
npm run dev
```

- Web Dashboard: `http://localhost:3000`
- API Base: `http://localhost:4000/api`
