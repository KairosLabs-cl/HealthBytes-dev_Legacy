import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Path to the jules directory
const getJulesDir = () => path.join(process.cwd(), '../../../.ai/agents/jules');

export async function GET() {
  try {
    const julesDir = getJulesDir();
    
    // Check if directory exists
    try {
      await fs.access(julesDir);
    } catch {
      return NextResponse.json({ agents: [] }); // Dir doesn't exist yet
    }

    const files = await fs.readdir(julesDir);
    
    const agents = [];
    for (const file of files) {
      if (file.endsWith('.md')) {
        const id = file.replace('.md', '');
        const content = await fs.readFile(path.join(julesDir, file), 'utf-8');
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
    console.error('Error reading jules prompts:', error);
    return NextResponse.json({ error: 'Failed to read jules prompts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const julesDir = getJulesDir();
    const filePath = path.join(julesDir, `${id}.md`);
    
    // Create dir if not exists
    try {
      await fs.access(julesDir);
    } catch {
      await fs.mkdir(julesDir, { recursive: true });
    }

    try {
      await fs.access(filePath);
      return NextResponse.json({ error: 'Prompt already exists' }, { status: 400 });
    } catch {
      // Doesn't exist, proceed
    }

    const initialContent = `---
name: ${id}
description: Prompt dinámico de Jules
---
# ${id}

Instrucciones para Jules aquí.

## Kanban Dashboard Rule (CRITICAL)
If a task is NOT explicitly listed in the \`.ai/agents/tasks.json\` file (which acts as our Kanban dashboard system), do NOT execute it. Instead:
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
    console.error('Error creating jules prompt:', error);
    return NextResponse.json({ error: 'Failed to create jules prompt' }, { status: 500 });
  }
}
