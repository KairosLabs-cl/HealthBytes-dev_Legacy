import Link from 'next/link';
import { LayoutDashboard, Bot, Sparkles } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900/40 backdrop-blur-2xl border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col p-4 shadow-2xl z-50">
      <div className="flex items-center gap-3 mb-10 mt-2 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Jules<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hub</span></h1>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Agent Orchestration</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
          <LayoutDashboard className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
          <span className="font-medium">Kanban Board</span>
        </Link>
        <Link href="/agents" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
          <Bot className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
          <span className="font-medium">Especialistas</span>
        </Link>
      </nav>
      
      <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong>Modo local:</strong> Modificando <code className="text-indigo-300">.ai/agents/*.md</code> directamente en el repositorio.
        </p>
      </div>
    </div>
  );
}
