"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Bot, Trash2 } from 'lucide-react';

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
    'todo': { id: 'todo', title: 'To Do', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] }
  },
  columnOrder: ['todo', 'in-progress', 'done']
};

export default function KanbanClient() {
  const [data, setData] = useState<BoardData>(initialData);
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(res => res.json()),
      fetch('/api/agents').then(res => res.json())
    ]).then(([tasksData, agentsData]) => {
      if (tasksData && tasksData.columns) {
        setData(tasksData);
      }
      if (agentsData && agentsData.agents) {
        setAgents(agentsData.agents);
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
                <h3 className="font-semibold text-white">{column.title}</h3>
                <span className="bg-white/10 text-xs px-2.5 py-1 rounded-full text-gray-300">{tasks.length}</span>
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
                            className={`group p-4 rounded-xl border transition-all ${
                              snapshot.isDragging 
                                ? 'bg-gray-800 border-indigo-500 shadow-xl shadow-indigo-500/20 rotate-2' 
                                : 'bg-gray-800/80 border-white/5 hover:border-white/10 shadow-lg'
                            }`}
                          >
                            <div className="flex gap-2 relative">
                              <div {...provided.dragHandleProps} className="mt-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-200">{task.content}</p>
                                
                                <button 
                                  onClick={() => deleteTask(task.id, column.id)}
                                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                  title="Eliminar tarea"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                
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
