import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getJulesDir = () => path.join(process.cwd(), '../../../.ai/agents/jules');

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;
    
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Content must be a string' }, { status: 400 });
    }
    
    const filePath = path.join(getJulesDir(), `${id}.md`);
    await fs.writeFile(filePath, content, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating jules prompt:', error);
    return NextResponse.json({ error: 'Failed to update jules prompt' }, { status: 500 });
  }
}
