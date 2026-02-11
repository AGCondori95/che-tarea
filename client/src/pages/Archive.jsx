import {useCallback, useEffect, useMemo, useState} from "react";
import {AlertTriangle, Clock, Filter, RotateCcw, Trash2} from "lucide-react";
import {useTask} from "../context/TaskContext";
import {useAuth} from "../context/AuthContext";
import axios from "../api/axios";
import {toast} from "react-toastify";

const PRIORITY_COLORS = {alta: "bg-urgent", media: "bg-medium", baja: "bg-low"};

const PRIORITY_LABELS = {alta: "Alta", media: "Media", baja: "Baja"};

const FILTER_OPTIONS = [
  {value: "recent", label: "Más Recientes"},
  {value: "oldest", label: "Más Antiguas"},
  {value: "urgent", label: "Más Urgentes"},
];

const Archive = () => {
  const {deleteTask} = useTask();
  const {user} = useAuth();
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("recent");
  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    try {
      setLoading(true);
      const {data} = await axios.get("/tasks?status=finalizada");
      setArchivedTasks(data.data);
    } catch (error) {
      toast.error("Error al cargar tareas archivadas");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      await axios.put(`/tasks/${taskId}/restore`);
      toast.success("Tarea recuperada exitosamente");
      fetchArchivedTasks();
    } catch (error) {
      toast.error("Error al recuperar tarea");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar permanentemente esta tarea?",
      )
    ) {
      const result = await deleteTask(taskId);
      if (result.success) {
        fetchArchivedTasks();
      }
    }
  };

  const getDaysUntilDeletion = useCallback((autoDeleteAt) => {
    if (!autoDeleteAt) return null;
    const now = new Date();
    const deleteDate = new Date(autoDeleteAt);
    const diffTime = deleteDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const sortedTasks = useMemo(() => {
    let sorted = [...archivedTasks];

    switch (filter) {
      case "recent":
        sorted.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) => new Date(a.completedAt) - new Date(b.completedAt),
        );
        break;
      case "urgent":
        sorted.sort((a, b) => {
          const priorityOrder = {alta: 0, media: 1, baja: 2};
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        break;
      default:
        break;
    }

    return sorted;
  }, [archivedTasks, filter]);

  const statistics = useMemo(() => {
    return {
      total: sortedTasks.length,
      urgentDeletion: sortedTasks.filter((t) => {
        const days = getDaysUntilDeletion(t.autoDeleteAt);
        return days !== null && days <= 3;
      }).length,
      highPriority: sortedTasks.filter((t) => t.priority === "alta").length,
    };
  }, [sortedTasks, getDaysUntilDeletion]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Tareas Archivadas y Próximas a Eliminar
        </h1>
        <p className='text-gray-600 mt-1'>
          Las tareas finalizadas se eliminan automáticamente después de 10 días
        </p>
      </div>

      {/* Alerta de Auto-borrado */}
      <div className='bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg'>
        <div className='flex items-start'>
          <AlertTriangle
            className='text-amber-600 mt-0.5 flex-shrink-0'
            size={20}
          />
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-amber-800'>
              ¡Atención! Estas tareas se eliminarán permanentemente desoués de
              10 días desde su finalización
            </h3>
            <p className='mt-2 text-sm text-amber-700'>
              Puedes recuperar cualquier tarea antes de que se elimine
              automáticamente.
              {user?.role === "admin" &&
                " Como administrador, también puedes eliminarlar manualmente."}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className='bg-white rounded-lg shadow p-4'>
        <div className='flex items-center gap-2'>
          <Filter size={20} className='text-gray-500' />
          <span className='text-sm font-medium text-gray-700 mr-2'>
            Filtrar:
          </span>
          <div className='flex gap-2'>
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === option.value ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Tareas Archivadas */}
      {sortedTasks.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
            <Clock className='text-gray-400' size={32} />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No hay tareas archivadas
          </h3>
          <p className='text-gray-600'>
            Las tareas finalizadas aparecerán aquí durante 10 días antes de ser
            eliminadas
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4'>
          {sortedTasks.map((task) => {
            const daysLeft = getDaysUntilDeletion(task.autoDeleteAt);
            const isUrgentDeletion = daysLeft !== null && daysLeft <= 3;

            return (
              <div
                key={task._id}
                className='bg-white rounded-lg shadow hover:shadow-md transition p-6 opacity-90'>
                <div className='flex items-start justify-between gap-4'>
                  {/* Contenido de la tarea */}
                  <div className='flex-1'>
                    {/* Header con prioridad y título */}
                    <div className='flex items-start gap-3 mb-3'>
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                          PRIORITY_COLORS[task.priority]
                        }`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <h3 className='text-lg font-semibold text-gray-900 flex-1'>
                        {task.title}
                      </h3>
                    </div>

                    {/* Descripción */}
                    {task.description && (
                      <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className='flex flex-wrap gap-2 mb-3'>
                        {task.tags.map((tag) => (
                          <span
                            key={tag._id}
                            className='px-2 py-1 rounded-full text-xs font-medium'
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Info adicional */}
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      {task.assignedTo && (
                        <div className='flex items-center gap-2'>
                          <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold'>
                            {task.assignedTo.name?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <span>{task.assignedTo.name}</span>
                        </div>
                      )}
                      <span>•</span>
                      <span>
                        Finalizada:{" "}
                        {new Date(task.completedAt).toLocaleDateString(
                          "es-AR",
                          {day: "2-digit", month: "short", year: "numeric"},
                        )}
                      </span>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {task.subtasks.filter((st) => st.completed).length}/
                            {task.subtasks.length} subtareas
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sidebar con countdown y acciones */}
                  <div className='flex flex-col items-end gap-3'>
                    {/* Countdown */}
                    {daysLeft !== null && (
                      <div
                        className={`text-center px-4 py-2 rounded-lg ${
                          isUrgentDeletion
                            ? "bg-red-100 border border-red-300"
                            : "bg-amber-100 border border-amber-300"
                        }`}>
                        <div
                          className={`text-2xl font-bold ${
                            isUrgentDeletion ? "text-red-700" : "text-amber-700"
                          }`}>
                          {daysLeft}
                        </div>
                        <div
                          className={`text-xs ${
                            isUrgentDeletion ? "text-red-600" : "text-amber-600"
                          }`}>
                          {daysLeft === 1 ? "día restante" : "días restantes"}
                        </div>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className='flex flex-col gap-2 w-full'>
                      <button
                        onClick={() => handleRestoreTask(task._id)}
                        className='flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium'>
                        <RotateCcw size={16} />
                        Recuperar Tarea
                      </button>

                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className='flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition text-sm font-medium'>
                          <Trash2 size={16} />
                          Eliminar Ahora
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advertencia urgente */}
                {isUrgentDeletion && (
                  <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
                    <AlertTriangle
                      className='text-red-600 flex-shrink-0 mt-0.5'
                      size={16}
                    />
                    <p className='text-xs text-red-700'>
                      <strong>¡Advertencia!</strong> Esta tarea será eliminada
                      permanentemente en {daysLeft}{" "}
                      {daysLeft === 1 ? "día" : "días"}. Recupérala ahora si aún
                      la necesitas.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Estadísticas al final */}
      {sortedTasks.length > 0 && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Estadísticas de Archivo
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 mb-4'>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-3xl font-bold text-gray-900'>
                {statistics.total}
              </div>
              <div className='text-sm text-gray-600 mt-1'>
                Total de tareas archivadas
              </div>
            </div>
            <div className='text-center p-4 bg-amber-50 rounded-lg'>
              <div className='text-3xl font-bold text-amber-700'>
                {statistics.urgentDeletion}
              </div>
              <div className='text-sm text-amber-700 mt-1'>
                Se eliminan en 3 días o menos
              </div>
            </div>
            <div className='text-center p-4 bg-red-50 rounded-lg'>
              <div className='text-3xl font-bold text-red-700'>
                {statistics.highPriority}
              </div>
              <div className='text-sm text-red-700 mt-1'>
                Tareas de alta prioridad
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
