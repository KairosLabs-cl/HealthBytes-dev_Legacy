# HealthBytes Skills Installation Guide

This directory contains AI-friendly development guidelines for the HealthBytes project. These skills work across multiple editors and AI assistants.

## 📚 Available Skills

1. **healthbytes-backend-patterns.md** - Backend FastAPI patterns, services layer, database, testing
2. **healthbytes-frontend-patterns.md** - React Native components, state management, testing
3. **healthbytes-project-rules.md** - Project-wide rules, folder structure, security requirements
4. **healthbytes-security-practices.md** - Authentication, authorization, secure coding, testing

## 🚀 Installation by Editor

### GitHub Copilot (in VS Code / JetBrains)

**Automatic (Recommended)**:
- Copilot automatically reads `.github/copilot-instructions.md`
- Skills in `.copilot/skills/` are loaded by Copilot Chat

**Manual Skills Setup**:
1. Copy all `.md` files from this directory
2. Paste them into `~/.copilot/skills/healthbytes-*/SKILL.md`

📝 **Locate your `.copilot` folder**:
- **Windows**: `C:\Users\<YourUsername>\.copilot`
- **Mac**: `~/.copilot`
- **Linux**: `~/.copilot`

### Cursor Extensions

1. Go to **Cursor Settings** → **Features** 
2. Add rules in **Rules** tab pointing to this folder
3. Or copy files to `~/.cursor/rules/`

### Claude (claude.ai)

Paste content from these files in conversation context when:
- Building new features
- Designing architecture
- Reviewing code
- Writing tests

### Cline / Other MCP Tools

Add to your tool configuration:
```json
{
  "name": "healthbytes-rules",
  "file": "/path/to/.github/skills"
}
```

---

## 📖 How to Use These Skills

### When Working on Backend

Reference **healthbytes-backend-patterns.md** when:
- Creating new services or endpoints
- Writing database queries
- Setting up tests with pytest
- Organizing code into layers (router → service → model)

### When Working on Frontend

Reference **healthbytes-frontend-patterns.md** when:
- Building React Native components
- Setting up Zustand stores
- Creating API clients
- Writing Jest tests

### When Working Across Project

Reference **healthbytes-project-rules.md** when:
- Setting up new features
- Deciding where to place files
- Evaluating dependencies
- Ensuring consistency

### When Implementing Security

Reference **healthbytes-security-practices.md** when:
- Adding authentication/authorization
- Validating user input
- Handling sensitive data
- Writing security tests

---

## 🔄 Workflow Example

**Scenario**: Building a new product filter feature

1. **Check rules**: Open `healthbytes-project-rules.md`
   - Confirm folder structure for new files
   
2. **Backend implementation**:
   - Reference `healthbytes-backend-patterns.md`
   - Create service layer in `backend/app/services/`
   - Create router in `backend/app/api/v1/`
   - Write tests using patterns from skill
   
3. **Frontend implementation**:
   - Reference `healthbytes-frontend-patterns.md`
   - Create API client in `frontend/api/`
   - Create Zustand store in `frontend/store/`
   - Build components in `frontend/components/`
   - Write Jest tests
   
4. **Security review**:
   - Reference `healthbytes-security-practices.md`
   - Ensure input validation
   - Check authorization logic
   - Verify no hardcoded secrets

---

## 💡 Tips for Team Members

### Using with Copilot

```
You: "I need to create a new product filter endpoint. Can you help?"

Copilot: [Automatically loads healthbytes-backend-patterns skill]
         [Suggests service → router pattern]
         [Recommends testing approach]
```

### Using with Cursor

Click the **Cursor Rules** button → Paste rules as needed

### Using with Claude/ChatGPT

Copy the relevant skill file and paste before asking:

```
Here are the HealthBytes backend patterns:
[Paste content from healthbytes-backend-patterns.md]

Now, help me create a new order service...
```

### Using with Local LLMs

Include skill files in system prompt:

```
System: You are an expert in the HealthBytes project. 
Follow these patterns:
[Include skill content]

User: How should I structure the payment service?
```

---

## 🔄 Keeping Skills Updated

When project rules change:

1. Update the `.md` files in this directory
2. Update `.copilot` skills (if you use local Copilot)
3. Update `copilot-instructions.md` for reference
4. Notify team in `#dev-guidelines` channel

---

## ❓ FAQ

**Q: Do I need to install these skills?**
A: No! They're in the repo. Reference them directly. Or install locally for your editor if you prefer.

**Q: Will updating the repo update my local skills?**
A: No. Run `git pull` to get updated files, then re-add to your editor if needed.

**Q: Can I modify these skills for my use case?**
A: Locally yes. But don't commit personal modifications—keep them aligned with team standards.

**Q: What if I'm using a different editor?**
A: Copy the `.md` files and paste them in your editor's rules/guidelines section.

---

## 📞 Support

**Questions about project patterns?**
- Check the relevant skill file first
- Ask in #healthbytes-dev channel
- Reference CLI command examples in skills

**Found an outdated rule?**
- Create an issue or comment in #dev-guidelines
- PR updates to skill files welcome

