import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function parseJulesTable(output: string) {
  const lines = output.split('\n');
  const sessions = [];
  
  for (const line of lines) {
    // Buscar líneas de la tabla que tengan el caracter │ pero omitir los encabezados
    if (line.includes('│') && !line.includes('ID') && !line.includes('Description')) {
      const parts = line.split('│').map(p => p.trim());
      // parts será algo como: [ "", "1622…", "---# Juanito...", "nojustbenja...", "3 days ago", "Completed", "" ]
      if (parts.length >= 6) {
        sessions.push({
          id: parts[1].replace('…', ''), // Limpiar los puntos suspensivos si existen
          description: parts[2],
          repo: parts[3],
          lastActive: parts[4],
          status: parts[5]
        });
      }
    }
  }
  return sessions;
}

export async function GET() {
  try {
    const { stdout, stderr } = await execAsync('jules remote list --session', {
      cwd: process.cwd()
    });
    
    const output = stdout || stderr || 'No active sessions.';
    const sessions = parseJulesTable(output);

    return NextResponse.json({ 
      output,
      sessions,
      error: stderr && !stdout ? stderr : null
    });
  } catch (error: any) {
    const output = error.stdout || error.stderr || error.message;
    const sessions = parseJulesTable(output); // Intentar parsear incluso si hubo error (a veces salen advertencias)
    
    return NextResponse.json({ 
      output: output,
      sessions,
      error: error.message 
    }, { status: 500 });
  }
}
