import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getTasksFile = () => path.join(process.cwd(), '../../../.agents/agents/tasks.json');

export async function GET() {
  try {
    const filePath = getTasksFile();
    let content;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      // If file doesn't exist, return default empty board
      const defaultTasks = {
        columns: {
          'todo': { id: 'todo', title: 'To Do', taskIds: [] },
          'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
          'done': { id: 'done', title: 'Done', taskIds: [] }
        },
        tasks: {},
        columnOrder: ['todo', 'in-progress', 'done']
      };
      return NextResponse.json(defaultTasks);
    }
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error reading tasks:', error);
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const filePath = getTasksFile();
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 });
  }
}
