import JulesClient from './JulesClient';

export default function JulesPage() {
  return (
    <div className="flex-1 p-8 h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Jules AI</h1>
        <p className="text-gray-400">Gestiona y copia los prompts dinámicos para el sistema orquestador.</p>
      </div>
      <JulesClient />
    </div>
  );
}
