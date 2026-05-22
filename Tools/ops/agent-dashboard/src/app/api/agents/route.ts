import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Path to the agents directory
const getAgentsDir = () => path.join(process.cwd(), '../../../.ai/agents');

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
