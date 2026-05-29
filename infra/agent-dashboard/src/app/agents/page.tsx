import AgentsClient from './AgentsClient';

export default function AgentsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Especialistas</h1>
        <p className="text-gray-400">Gestiona y personaliza los prompts de los agentes autónomos del sistema.</p>
      </div>
      <AgentsClient />
    </div>
  );
}
