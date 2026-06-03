import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Path to the agents directory
const getAgentsDir = () => path.join(process.cwd(), '../../../.agents/agents');

export async function GET() {
  try {
    const agentsDir = getAgentsDir();
    const files = await fs.readdir(agentsDir);
    
    const agents = [];
    for (const file of files) {
      if (file.endsWith('.md')) {
        const id = file.replace('.md', '');
        const content = await fs.readFile(path.join(agentsDir, file), 'utf-8');
        // Extract a simple name
        agents.push({
          id,
          name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          content
        });
      }
    }
    
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error reading agents:', error);
    return NextResponse.json({ error: 'Failed to read agents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const agentsDir = getAgentsDir();
    const filePath = path.join(agentsDir, `${id}.md`);
    
    try {
      await fs.access(filePath);
      return NextResponse.json({ error: 'Agent already exists' }, { status: 400 });
    } catch {
      // Doesn't exist, proceed
    }

    const initialContent = `---
name: ${id}
description: Escribe una descripción aquí
---
# ${id}

Escribe las instrucciones base aquí.

## Kanban Dashboard Rule (CRITICAL)
If a task is NOT explicitly listed in the \`.agents/agents/tasks.json\` file (which acts as our Kanban dashboard system), do NOT execute it. Instead:
- Suggest: "Hey, we can do this, what do you think?"
- Send an exclamation stating: "Hey, we are missing this/that."
`;

    await fs.writeFile(filePath, initialContent, 'utf-8');

    return NextResponse.json({ 
      agent: {
        id,
        name: id.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase()),
        content: initialContent
      }
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
