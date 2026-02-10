# 🤖 HealthBytes Developer Skills & Guidelines

This repository contains **AI-friendly development guidelines** for HealthBytes, organized as modular skills that work across multiple editors and AI assistants.

## 📍 Where to Find the Skills

All guidelines are stored in this **`.github/skills/`** directory:

| Skill | File | Purpose |
|-------|------|---------||
| 🏗️ **Backend Patterns** | [healthbytes-backend-patterns.md](healthbytes-backend-patterns.md) | FastAPI, services layer, database, async patterns, pytest testing, **pre-commit hooks** |
| 🎨 **Frontend Patterns** | [healthbytes-frontend-patterns.md](healthbytes-frontend-patterns.md) | React Native, Zustand, components, Jest testing |
| 📋 **Project Rules** | [healthbytes-project-rules.md](healthbytes-project-rules.md) | Folder structure, prohibitions, file placement, security checklist, **development workflow** |
| 🔒 **Security Practices** | [healthbytes-security-practices.md](healthbytes-security-practices.md) | Auth, RBAC, validation, password hashing, security testing |
| 🛠️ **Development Tools** | [INSTALL.md](INSTALL.md) | Editor setup, **VS Code workspace**, **pre-commit hooks**, skill installation |

---

## 🚀 Quick Start

### For GitHub Copilot Users (Recommended)
- ✅ **Automatic**: Copilot reads skills automatically from `.github/` and `.copilot/`
- 📌 Just reference them in chat or use `/explain` on code
- 💾 Skills also available locally in `~/.copilot/skills/`

### For Other Editors (Cursor, VS Code, etc)
1. Open [INSTALL.md](INSTALL.md)
2. Follow instructions for your editor
3. Copy skill content as needed

### For Claude/ChatGPT/Other AI
Paste the relevant skill file when asking questions:
```
Here's the HealthBytes backend patterns:
[Paste content from healthbytes-backend-patterns.md]

Now, help me build a new service...
```

---

## 🎯 Usage by Role

### Backend Developers
1. Read [healthbytes-project-rules.md](.github/skills/healthbytes-project-rules.md) - Understand folder structure
2. Reference [healthbytes-backend-patterns.md](.github/skills/healthbytes-backend-patterns.md) - For every feature
3. Check [healthbytes-security-practices.md](.github/skills/healthbytes-security-practices.md) - Before implementing auth

### Frontend Developers
1. Read [healthbytes-project-rules.md](.github/skills/healthbytes-project-rules.md) - Understand folder structure
2. Reference [healthbytes-frontend-patterns.md](.github/skills/healthbytes-frontend-patterns.md) - For every feature
3. Check [healthbytes-security-practices.md](.github/skills/healthbytes-security-practices.md) - For token handling

### Full-Stack Developers
1. Start with [healthbytes-project-rules.md](.github/skills/healthbytes-project-rules.md)
2. Keep all 4 skills bookmarked
3. Reference as needed during development

---

## 📚 What's Covered

✅ **Architecture Patterns**
- Layer separation (router → service → model)
- Component purity (UI only, no business logic)
- State management organization
- API client patterns

✅ **Testing Complete**
- Backend: pytest fixtures, MockAsyncSession, test organization
- Frontend: Jest, React Native Testing Library, component & store tests
- Security testing (auth boundaries, authorization)
- Coverage targets (70% backend, 60% frontend)

✅ **Security Throughout**
- Authentication (Clerk + JWT)
- Authorization (RBAC, ownership validation)
- Input validation (Pydantic, frontend validators)
- Password hashing (bcrypt)
- Error handling
- Sensitive data protection

✅ **File Organization**
- Exact folder structure for new files
- Naming conventions
- What goes where (api/, services/, components/, stores/, etc)

✅ **Development Tools** 🆕
- VS Code multi-root workspace setup (debugger, tasks, per-folder settings)
- Pre-commit hooks (Black, Flake8, isort, Bandit)
- Code quality automation workflow
- IDE integration guides

---

## 🔄 Example: Building a Feature

**Scenario**: Add a product discount system

### Step 0: Setup Development Environment 🆕
→ Reference [INSTALL.md](.github/skills/INSTALL.md)
```bash
# Open workspace for optimized workflow
code HealthBytes.code-workspace

# Install pre-commit hooks (one-time)
cd backend
.\setup-hooks.ps1  # Windows
# or ./setup-hooks.sh  # Linux/Mac

# Benefits:
# - Debugger ready (F5)
# - Auto-formatting on commit (Black, isort)
# - Code quality checks (Flake8, Bandit)
```

### Step 1: Check Rules
→ Open [healthbytes-project-rules.md](.github/skills/healthbytes-project-rules.md)
- Confirm where discount logic goes (services/)
- Verify folder structure for new files

### Step 2: Backend Implementation
→ Reference [healthbytes-backend-patterns.md](.github/skills/healthbytes-backend-patterns.md)
```
1. Create discount_service.py in services/
2. Create endpoints in api/v1/discounts.py
3. Create DiscountCreate schema
4. Add tests in test_services/ and test_api/
```

### Step 3: Frontend Implementation
→ Reference [healthbytes-frontend-patterns.md](.github/skills/healthbytes-frontend-patterns.md)
```
1. Create api/discounts.ts for API calls
2. Create store/discountStore.ts for state (if needed)
3. Create components/DiscountCard.tsx
4. Add Jest tests in __tests__/
```

### Step 4: Security Review
→ Check [healthbytes-security-practices.md](.github/skills/healthbytes-security-practices.md)
```
- Admin-only discount creation? → RBAC check
- Input validation on price? → Pydantic validators
- Frontend tests for auth? → Yes, include in Jest
```

### Step 5: Commit Changes 🆕
→ Pre-commit hooks run automatically
```bash
git add .
git commit -m "feat: add discount system"

# Hooks will:
# ✅ Format code (Black, isort)
# ✅ Check lint errors (Flake8)
# ✅ Scan security (Bandit)
# ⚠️ If hooks fail → fix issues → commit again
```

---

## 💻 Working with AI Assistants

### When Using GitHub Copilot
```
You: "I need to create a product filter service"

Copilot: [Loads healthbytes-backend-patterns skill]
         Suggests: Services → Routers pattern
         Provides: Testing example with fixtures
```

### When Using Cursor
Click **Cursor Rules** → Paste relevant skill content

### When Using Claude/ChatGPT
```
You: [Paste healthbytes-backend-patterns.md header]
     "Help me implement a search service following these patterns"

AI: [Understands exact folder structure, testing requirements, etc]
    Provides context-specific code
```

### When Using Cline/Local LLMs
Add to system prompt:
```
Context for HealthBytes project:
[Include relevant skill content]
```

---

## 🔄 Keeping Skills Current

When project rules change:

1. **Update** the `.md` files in `.github/skills/`
2. **Sync** to `.copilot/skills/` if you use local Copilot
3. **Announce** changes in team chat
4. **Team** pulls latest and updates local setups (if needed)

---

## 🚫 What's NOT Here

- ❌ Coding tutorials (find those in docs/)
- ❌ API reference (check backend/README.md)
- ❌ Deployment steps (see docs/setup/)
- ❌ Git workflows (see docs/development/)

---

## 📖 Additional Resources

| Topic | Location |
|-------|----------|
| Backend Setup | [backend/README.md](backend/README.md) |
| Frontend Setup | [frontend/README.md](frontend/README.md) |
| Project Architecture | [docs/architecture/](docs/architecture/) |
| API Documentation | FastAPI `/docs` endpoint |
| Security Improvements | [docs/security/](docs/security/) |
| Development Guides | [docs/development/](docs/development/) |

---

## ❓ FAQ

**Q: Do I need to install these skills?**
A: No. Copilot loads them automatically. For other editors, follow [.github/skills/INSTALL.md](.github/skills/INSTALL.md).

**Q: Can I modify skills for my personal use?**
A: Yes locally. Don't commit changes—keep them aligned with team standards.

**Q: What if I'm using JetBrains instead of VS Code?**
A: Skills work universally. Reference the `.md` files or copy to your editor's rules.

**Q: How often are skills updated?**
A: When major project decisions change. Check git history for changes.

**Q: Which skill should I read first?**
A: **healthbytes-project-rules.md** - gives you the big picture.

---

## 🆘 Need Help?

- **Quick question?** → Check relevant skill first
- **Found an outdated rule?** → Open an issue
- **Want to improve a skill?** → PR welcome!
- **Team discussion?** → Ask in #healthbytes-dev

---

**Last Updated**: Feb 5, 2026
**Skills Version**: 2.0 (with Testing)
