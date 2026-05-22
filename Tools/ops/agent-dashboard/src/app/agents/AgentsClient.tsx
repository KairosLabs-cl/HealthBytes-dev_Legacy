"use client";

import { useState, useEffect } from 'react';
import { Bot, Save, Copy, Check, FileText, AlertCircle, Plus } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  content: string;
}

export default function AgentsClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (data.agents) {
          setAgents(data.agents);
          if (data.agents.length > 0) {
            handleSelectAgent(data.agents[0]);
          }
        }
      });
  }, []);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setContent(agent.content);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedAgentId) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/agents/${selectedAgentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setAgents(agents.map(a => a.id === selectedAgentId ? { ...a, content } : a));
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Save failed', error);
    }
    setIsSaving(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAgent = async () => {
    const id = prompt('Ingresa el ID del nuevo especialista (ej. qa-tester, frontend-dev):');
    if (!id) return;
    
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      alert('El ID solo puede contener letras, números y guiones.');
      return;
    }

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      
      if (res.ok && data.agent) {
        setAgents([...agents, data.agent]);
        handleSelectAgent(data.agent);
      } else {
        alert(data.error || 'Error al crear el agente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Agent List */}
      <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => handleSelectAgent(agent)}
            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all text-left ${
              selectedAgentId === agent.id 
                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
            }`}
          >
            <div className={`p-2 rounded-lg ${selectedAgentId === agent.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-gray-400'}`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold ${selectedAgentId === agent.id ? 'text-indigo-300' : 'text-gray-200'}`}>{agent.name}</h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> {agent.id}.md
              </p>
            </div>
          </button>
        ))}
        <button
          onClick={handleCreateAgent}
          className="flex items-center justify-center gap-2 p-3 mt-2 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Especialista
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {selectedAgent ? (
          <>
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedAgent.name}</h2>
                  <p className="text-xs text-gray-400">{selectedAgent.id}.md</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors text-sm font-medium border border-white/5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || content === selectedAgent.content}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all text-sm font-medium shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                spellCheck={false}
              />
              {content !== selectedAgent.content && !saveSuccess && (
                <div className="absolute bottom-10 right-10 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs flex items-center gap-2 font-medium backdrop-blur-md">
                  <AlertCircle className="w-4 h-4" /> Hay cambios sin guardar
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Bot className="w-16 h-16 mb-4 opacity-20" />
            <p>Selecciona un agente para editar su prompt</p>
          </div>
        )}
      </div>
    </div>
  );
}
