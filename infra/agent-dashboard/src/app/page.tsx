import KanbanClient from './KanbanClient';

export default function Home() {
  return (
    <div className="flex-1 p-8 h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Kanban Board</h1>
        <p className="text-gray-400">Asigna tareas y orquesta el trabajo de los agentes autónomos de JulesHub.</p>
      </div>
      <KanbanClient />
    </div>
  );
}
