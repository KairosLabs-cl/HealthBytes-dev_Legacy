"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Bot, Trash2, CheckCircle, Trash, Pencil } from 'lucide-react';

// Types
interface Task {
  id: string;
  content: string;
  agent?: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const initialData: BoardData = {
  tasks: {},
  columns: {
    'periodic': { id: 'periodic', title: 'Periódicas', taskIds: [] },
    'todo': { id: 'todo', title: 'To Do', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] }
  },
  columnOrder: ['periodic', 'todo', 'in-progress', 'done']
};

export default function KanbanClient() {
  const [data, setData] = useState<BoardData>(initialData);
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [julesSessions, setJulesSessions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(res => res.json()),
      fetch('/api/agents').then(res => res.json()),
      fetch('/api/jules/status').then(res => res.json().catch(() => ({})))
    ]).then(([tasksData, agentsData, julesData]) => {
      if (tasksData && tasksData.columns) {
        setData(tasksData);
      }
      if (agentsData && agentsData.agents) {
        setAgents(agentsData.agents);
      }
      if (julesData && julesData.sessions) {
        setJulesSessions(julesData.sessions);
      }
      setIsLoaded(true);
    });
  }, []);

  const saveToAPI = (newData: BoardData) => {
    fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, taskIds: newTaskIds };
      const newState = {
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn }
      };
      
      setData(newState);
      saveToAPI(newState);
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      }
    };
    
    setData(newState);
    saveToAPI(newState);
  };

  const addTask = (columnId: string) => {
    const content = prompt('Descripción de la tarea:');
    if (!content) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = { id: newTaskId, content, agent: '' };

    const column = data.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(newTaskId);

    const newState = {
      ...data,
      tasks: { ...data.tasks, [newTaskId]: newTask },
      columns: { ...data.columns, [column.id]: { ...column, taskIds: newTaskIds } }
    };

    setData(newState);
    saveToAPI(newState);
  };

  const deleteTask = (taskId: string, columnId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    
    const column = data.columns[columnId];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);
    
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    const newState = {
      ...data,
      tasks: newTasks,
      columns: { ...data.columns, [column.id]: { ...column, taskIds: newTaskIds } }
    };

    setData(newState);
    saveToAPI(newState);
  };

  const editTask = (taskId: string) => {
    const task = data.tasks[taskId];
    const newContent = prompt('Editar descripción de la tarea:', task.content);
    if (!newContent || newContent === task.content) return;

    const newState = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: { ...task, content: newContent }
      }
    };

    setData(newState);
    saveToAPI(newState);
  };

  const moveToDone = (taskId: string, currentColumnId: string) => {
    if (currentColumnId === 'done') return;
    
    const start = data.columns[currentColumnId];
    const finish = data.columns['done'];
    
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(startTaskIds.indexOf(taskId), 1);
    
    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.push(taskId); // move to bottom of done
    
    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [start.id]: { ...start, taskIds: startTaskIds },
        [finish.id]: { ...finish, taskIds: finishTaskIds }
      }
    };
    
    setData(newState);
    saveToAPI(newState);
  };

  const clearDoneTasks = () => {
    if (!confirm('¿Eliminar permanentemente todas las tareas completadas?')) return;
    
    const doneColumn = data.columns['done'];
    const tasksToDelete = doneColumn.taskIds;
    
    if (tasksToDelete.length === 0) return;
    
    const newTasks = { ...data.tasks };
    tasksToDelete.forEach(id => {
      delete newTasks[id];
    });
    
    const newState = {
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        'done': { ...doneColumn, taskIds: [] }
      }
    };
    
    setData(newState);
    saveToAPI(newState);
  };

  const assignAgent = (taskId: string, agentId: string) => {
    const newState = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: { ...data.tasks[taskId], agent: agentId }
      }
    };
    setData(newState);
    saveToAPI(newState);
  };

  const getTaskSessions = (taskContent: string) => {
    // Hacemos fuzzy match buscando palabras clave o los primeros 15 caracteres
    const taskWords = taskContent.toLowerCase().split(' ').filter(w => w.length > 4);
    const prefix = taskContent.substring(0, 15).toLowerCase();

    return julesSessions.filter(s => {
      const desc = s.description.toLowerCase();
      const matchCount = taskWords.filter(w => desc.includes(w)).length;
      return matchCount >= 2 || desc.includes(prefix);
    }).sort((a, b) => {
      // Poner "Awaiting" primero
      const aAwaiting = a.status.toLowerCase().includes('awaiting') ? -1 : 1;
      const bAwaiting = b.status.toLowerCase().includes('awaiting') ? -1 : 1;
      return aAwaiting - bAwaiting;
    });
  };

  if (!isLoaded) return <div className="flex h-64 items-center justify-center text-gray-500">Cargando tablero...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 flex-1 overflow-x-auto pb-4 custom-scrollbar">
        {data.columnOrder.map(columnId => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]).filter(Boolean);

          return (
            <div key={column.id} className="w-80 flex-shrink-0 flex flex-col bg-gray-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <span className="bg-white/10 text-xs px-2.5 py-1 rounded-full text-gray-300">{tasks.length}</span>
                </div>
                {column.id === 'done' && tasks.length > 0 && (
                  <button 
                    onClick={clearDoneTasks}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                    title="Limpiar tareas completadas"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 flex flex-col gap-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''}`}
                  >
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group p-4 rounded-xl border transition-all relative ${
                              snapshot.isDragging 
                                ? 'bg-gray-800 border-indigo-500 shadow-xl shadow-indigo-500/20 rotate-2' 
                                : 'bg-gray-800/80 border-white/5 hover:border-white/10 shadow-lg'
                            }`}
                          >
                            <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-all gap-1">
                              {column.id !== 'done' && (
                                <button 
                                  onClick={() => moveToDone(task.id, column.id)}
                                  className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-white/5 rounded-md transition-all"
                                  title="Completar tarea"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => editTask(task.id)}
                                className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-white/5 rounded-md transition-all"
                                title="Editar tarea"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteTask(task.id, column.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-md transition-all"
                                title="Eliminar tarea"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex gap-2 relative mt-2">
                              <div {...provided.dragHandleProps} className="mt-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-200">{task.content}</p>
                                
                                {/* Jules Sessions Mini Panel */}
                                {(() => {
                                  const matchedSessions = getTaskSessions(task.content);
                                  if (matchedSessions.length === 0) return null;
                                  
                                  return (
                                    <div className="mt-3 flex flex-col gap-2">
                                      {matchedSessions.map((session, idx) => {
                                        const isAwaiting = session.status.toLowerCase().includes('awaiting');
                                        return (
                                          <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-2 flex items-center justify-between">
                                            <div>
                                              <span className="text-[10px] text-gray-500 font-mono block">Jules ID: {session.id}</span>
                                              <span className={`text-xs font-semibold ${isAwaiting ? 'text-amber-400' : 'text-green-400'}`}>
                                                {session.status || 'Active'}
                                              </span>
                                            </div>
                                            {isAwaiting && (
                                              <a 
                                                href={`https://jules.google/session/${session.id}`}
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded hover:bg-amber-500/40 transition-colors"
                                              >
                                                Resolver
                                              </a>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}

                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Bot className={`w-4 h-4 ${task.agent ? 'text-indigo-400' : 'text-gray-600'}`} />
                                    <select 
                                      className="bg-transparent text-xs text-indigo-300 outline-none cursor-pointer w-[160px] truncate"
                                      value={task.agent || ''}
                                      onChange={(e) => assignAgent(task.id, e.target.value)}
                                    >
                                      <option value="" className="bg-gray-900 text-gray-400">Sin asignar</option>
                                      {agents.map(a => (
                                        <option key={a.id} value={a.id} className="bg-gray-900">{a.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    <button 
                      onClick={() => addTask(column.id)}
                      className="mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Añadir tarea
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
