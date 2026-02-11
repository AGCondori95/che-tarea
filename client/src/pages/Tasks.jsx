import {useMemo, useState} from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {Plus} from "lucide-react";
import {useTask} from "../context/TaskContext";
import Column from "../components/kanban/Column";
import TaskCard from "../components/kanban/TaskCard";
import QuickAddModal from "../components/kanban/QuickAddModal";
import TaskDetailModal from "../components/kanban/TaskDetailModal";

const COLUMNS = [
  {id: "por_hacer", title: "Por Hacer"},
  {id: "en_progreso", title: "En Progreso"},
  {id: "pendiente_revision", title: "Pendiente de Revisión"},
  {id: "finalizada", title: "Finalizadas"},
];

const Tasks = () => {
  const {tasks, loading, updateTask} = useTask();
  const [activeTask, setActiveTask] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null); // Guardar solo el ID
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  // Obtener la tarea seleccionada del array actualizado
  const selectedTask = useMemo(
    () => (selectedTaskId ? tasks.find((t) => t._id === selectedTaskId) : null),
    [selectedTaskId, tasks],
  );

  const handleDragStart = (event) => {
    const {active} = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const {active, over} = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id;
    let newStatus = over.id;

    // --- ARREGLO AQUÍ ---
    // Si over.id NO es uno de los IDs de columnas definidos en COLUMNS,
    // significa que soltamos la tarea sobre OTRA tarea.
    const isColumn = COLUMNS.some((col) => col.id === newStatus);

    if (!isColumn) {
      // Buscamos la tarea sobre la cual soltamos para robarle su status
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        setActiveTask(null);
        return;
      }
    }
    // ----------------------

    // Si se soltó sobre la misma columna o el mismo status, no hacer nada
    const currentTask = tasks.find((t) => t._id === taskId);
    if (currentTask.status === newStatus) {
      setActiveTask(null);
      return;
    }

    try {
      // Actualizar el estado de la tarea en el servidor
      await updateTask(taskId, {status: newStatus});
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    } finally {
      setActiveTask(null);
    }
  };
  const handleTaskClick = (task) => {
    setSelectedTaskId(task._id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTaskId(null);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Tablero Kanban</h1>
          <p className='text-gray-600 mt-1'>Organiza y gestiona tus tareas</p>
        </div>
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition'>
          <Plus size={20} />
          Quick Add
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 overflow-auto pb-6'>
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={getTasksByStatus(column.id)}
              onTaskClick={handleTaskClick}
              isFinalized={column.id === "finalizada"}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default Tasks;
