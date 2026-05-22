"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Save, Copy, Check, FileText, AlertCircle, Terminal, RefreshCw, Plus } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  content: string;
}

export default function JulesClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const [cliStatus, setCliStatus] = useState<string>('Cargando estatus de Jules CLI...');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetch('/api/jules')
      .then(res => res.json())
      .then(data => {
        if (data.agents) {
          setAgents(data.agents);
          if (data.agents.length > 0) {
            handleSelectAgent(data.agents[0]);
          }
        }
      });
      
    fetchCliStatus();
  }, []);

  const fetchCliStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/jules/status');
      const data = await res.json();
      setCliStatus(data.output || 'No se obtuvo respuesta.');
    } catch (err) {
      setCliStatus('Error al conectar con la API de Jules CLI.');
    }
    setIsRefreshing(false);
  };

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
      const res = await fetch(`/api/jules/${selectedAgentId}`, {
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
    const id = prompt('Ingresa el ID del nuevo prompt de Jules (ej. code-reviewer):');
    if (!id) return;
    
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      alert('El ID solo puede contener letras, números y guiones.');
      return;
    }

    try {
      const res = await fetch('/api/jules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      
      if (res.ok && data.agent) {
        setAgents([...agents, data.agent]);
        handleSelectAgent(data.agent);
      } else {
        alert(data.error || 'Error al crear el prompt');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      {/* Upper Area: Prompts & Editor */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Prompts List */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => handleSelectAgent(agent)}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all text-left ${
                selectedAgentId === agent.id 
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedAgentId === agent.id ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-semibold ${selectedAgentId === agent.id ? 'text-amber-300' : 'text-gray-200'}`}>{agent.name}</h3>
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
            <Plus className="w-4 h-4" /> Nuevo Prompt
          </button>
          {agents.length === 0 && (
            <div className="p-4 border border-white/5 rounded-2xl bg-white/5 text-gray-400 text-sm">
              No se encontraron prompts en .ai/agents/jules/
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          {selectedAgent ? (
            <>
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-400" />
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all text-sm font-medium shadow-lg shadow-amber-500/20 cursor-pointer"
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
                  className="w-full h-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  spellCheck={false}
                />
                {content !== selectedAgent.content && !saveSuccess && (
                  <div className="absolute bottom-10 right-10 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs flex items-center gap-2 font-medium backdrop-blur-md">
                    <AlertCircle className="w-4 h-4" /> Hay cambios sin guardar
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <Sparkles className="w-16 h-16 mb-4 opacity-20" />
              <p>Selecciona un prompt de Jules para editar o copiar</p>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Status Area */}
      <div className="h-64 flex-shrink-0 flex flex-col bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative group">
        <div className="px-4 py-2 border-b border-gray-800 bg-[#161b22] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Jules Cloud Status</h3>
            <span className="text-[10px] text-gray-500 ml-2 font-mono">jules remote list --session</span>
          </div>
          <button 
            onClick={fetchCliStatus}
            disabled={isRefreshing}
            className={`p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refrescar estatus"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs sm:text-sm text-green-400/90 whitespace-pre-wrap leading-relaxed">
          {cliStatus}
        </div>
      </div>
    </div>
  );
}
