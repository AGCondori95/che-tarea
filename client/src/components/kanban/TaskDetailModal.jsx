import {useCallback, useEffect, useMemo, useState} from "react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import {useTask} from "../../context/TaskContext";
import {useAuth} from "../../context/AuthContext";

const PRIORITY_COLORS = {alta: "bg-urgent", media: "bg-medium", baja: "bg-low"};

const STATUS_LABELS = {
  por_hacer: "Por Hacer",
  en_progreso: "En Progreso",
  pendiente_revision: "Pendiente de Revisión",
  finalizada: "Finalizada",
};

const ACTION_LABELS = {
  created: "creó la tarea",
  status_changed: "cambió el estado",
  priority_changed: "cambió la prioridad",
  assigned: "asignó la tarea",
  commented: "comentó",
  completed: "completó la tarea",
};

const SubtaskItem = ({subtask, onToggle}) => (
  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
    <button
      onClick={() => onToggle(subtask._id, subtask.completed)}
      className=''>
      {subtask.completed ? (
        <CheckCircle2 size={20} className='text-green-500' />
      ) : (
        <Circle size={20} className='text-gray-400' />
      )}
    </button>
    <span
      className={`flex-1 ${subtask.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
      {subtask.title}
    </span>
  </div>
);

const CommentItem = ({comment, formatDate}) => (
  <div className='flex gap-3 p-3 bg-amber-50 rounded-lg'>
    <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0'>
      {comment.user?.name?.charAt(0).toUpperCase()}
    </div>
    <div className='flex-1'>
      <div className='flex items-baseline gap-2 mb-1'>
        <span className='font-medium text-gray-900 text-sm'>
          {comment.user?.name}
        </span>
        <span className='text-xs text-gray-500'>
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className='text-gray-700 text-sm'>{comment.text}</p>
    </div>
  </div>
);

const HistoryItem = ({entry, getActionLabel, formatDate}) => (
  <div className='flex gap-3 text-sm'>
    <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0'>
      {entry.user?.name?.charAt(0).toUpperCase() || "?"}
    </div>
    <div className='flex-1'>
      <p className='text-gray-700'>
        <span className='font-medium'>{entry.user?.name}</span>{" "}
        {getActionLabel(entry.action)}{" "}
        {entry.previousValue && entry.newValue && (
          <span>
            de <span className='font-medium'>{entry.previousValue}</span> a{" "}
            <span className='font-medium'>{entry.newValue}</span>
          </span>
        )}
      </p>
      <p className='text-xs text-gray-500 mt-0.5'>
        {formatDate(entry.timestamp)}
      </p>
    </div>
  </div>
);

const TaskDetailModal = ({task, isOpen, onClose}) => {
  const {updateTask, deleteTask, addSubtask, updateSubtask, addComment} =
    useTask();
  const {user} = useAuth();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const canApprove = useMemo(
    () => user?.role === "admin" && task?.status === "pendiente_revision",
    [user?.role, task?.status],
  );

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getActionLabel = useCallback((action) => {
    return ACTION_LABELS[action] || action;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleUpdate = async (updates) => {
    await updateTask(task._id, updates);
  };

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      const result = await deleteTask(task._id);
      if (result.success) {
        onClose();
      }
    }
  };

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim()) {
      await addSubtask(task._id, newSubtaskTitle);
      setNewSubtaskTitle("");
    }
  };

  const handleToggleSubtask = async (subtaskId, completed) => {
    await updateSubtask(task._id, subtaskId, {completed: !completed});
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await addComment(task._id, newComment);
      setNewComment("");
    }
  };

  const handleStartEditingTitle = () => {
    setEditingTitle(task.title);
    setIsEditingTitle(true);
  };

  const handleStartEditingDescription = () => {
    setEditingDescription(task.description || "");
    setIsEditingDescription(true);
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (editingTitle !== task.title && editingTitle.trim()) {
      handleUpdate({title: editingTitle});
    }
  };

  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    if (editingDescription !== task.description) {
      handleUpdate({description: editingDescription});
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={onClose}>
      <div
        className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col'
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='flex items-start justify-between p-6 border-b border-gray-200'>
          <div className='flex-1 mr-4'>
            {isEditingTitle ? (
              <input
                type='text'
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveTitle();
                  } else if (e.key === "Escape") {
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className='text-2xl font-bold text-gray-900 w-full border-b-2 border-primary focus:outline-none'
              />
            ) : (
              <h2
                onClick={handleStartEditingTitle}
                className='text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary transition'>
                {task.title}
              </h2>
            )}

            {/* Badges */}
            <div className='flex items-center gap-2 mt-3'>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority === "alta"
                  ? "Alta"
                  : task.priority === "media"
                    ? "Media"
                    : "Baja"}
              </span>
              <span className='px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium'>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto flex-1'>
          {/* Columna principal */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Descripción */}
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-2'>
                Descripción
              </h3>
              {isEditingDescription ? (
                <textarea
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsEditingDescription(false);
                    }
                    // Ctrl/Cmd + Enter para guardar
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      handleSaveDescription();
                    }
                  }}
                  rows={4}
                  autoFocus
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
                />
              ) : (
                <div
                  onClick={handleStartEditingDescription}
                  className='text-gray-600 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition min-h-[100px]'>
                  {task.description ||
                    "Haz click para agregar una descripción..."}
                </div>
              )}
            </div>

            {/* Subtareas */}
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Subtareas (
                {task.subtasks?.filter((st) => st.completed).length || 0}/
                {task.subtasks?.length || 0})
              </h3>

              <div className='space-y-2 mb-3'>
                {task.subtasks?.map((subtask) => (
                  <SubtaskItem
                    key={subtask._id}
                    subtask={subtask}
                    onToggle={handleToggleSubtask}
                  />
                ))}
              </div>

              {/* Agregar subtarea */}
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSubtask();
                    }
                  }}
                  placeholder='Agregar subtarea...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
                />
                <button
                  onClick={handleAddSubtask}
                  className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition'>
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Comentarios (solo visible en Pendiente de Revisión) */}
            {task.status === "pendiente_revision" && (
              <div>
                <h3 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
                  <MessageSquare size={16} />
                  Comentarios ({task.comments?.length || 0})
                </h3>

                {/* Lista de comentarios */}
                <div className='space-y-3 mb-4 max-h-64 overflow-y-auto'>
                  {task.comments?.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      formatDate={formatDate}
                    />
                  ))}
                </div>

                {/* Agregar comentario */}
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment();
                      }
                    }}
                    placeholder='Agregar un comentario...'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
                  />
                  <button
                    onClick={handleAddComment}
                    className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition'>
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Historial */}
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
                <Clock size={16} />
                Historial
              </h3>
              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {task.history?.map((entry, index) => (
                  <HistoryItem
                    key={index}
                    entry={entry}
                    getActionLabel={getActionLabel}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar derecho */}
          <div className='space-y-6'>
            {/* Acciones rápidas */}
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Acciones
              </h3>
              <div className='space-y-2'>
                {/* Cambiar estado */}
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    Estado
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdate({status: e.target.value})}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm'>
                    <option value='por_hacer'>Por Hacer</option>
                    <option value='en_progreso'>En Progreso</option>
                    <option value='pendiente_revision'>
                      Pendiente de Revisión
                    </option>
                    <option value='finalizada'>Finalizada</option>
                  </select>
                </div>

                {/* Cambiar prioridad */}
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    Prioridad
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) => handleUpdate({priority: e.target.value})}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm'>
                    <option value='alta'>Alta</option>
                    <option value='media'>Media</option>
                    <option value='baja'>Baja</option>
                  </select>
                </div>

                {/* Aprobar y Cerrar (solo para admin en pendiente_revision) */}
                {canApprove && (
                  <button
                    onClick={() => handleUpdate({status: "finalizada"})}
                    className='w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium'>
                    Aprobar y Cerrar
                  </button>
                )}
              </div>
            </div>

            {/* Información */}
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Información
              </h3>
              <div className='soace-y-3'>
                {/* Creador */}
                <div className='flex items-center gap-2 text-sm'>
                  <User size={16} className='text-gray-400' />
                  <div>
                    <p className='text-xs text-gray-500'>Creado por</p>
                    <p className='text-gray-700 font-medium'>
                      {task.createdBy?.name}
                    </p>
                  </div>
                </div>

                {/* Asignado */}
                {task.assignedTo && (
                  <div className='flex items-center gap-2 text-sm'>
                    <User size={16} className='text-gray-400' />
                    <div>
                      <p className='text-xs text-gray-500'>Asignado a</p>
                      <p className='text-gray-700 font-medium'>
                        {task.assignedTo?.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fecha de creación */}
                <div className='flex items-center gap-2 text-sm'>
                  <Calendar size={16} className='text-gray-400' />
                  <div>
                    <p className='text-xs text-gray-500'>Creado</p>
                    <p className='text-gray-700'>
                      {formatDate(task.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Auto-delete (si está finalizada) */}
                {task.status === "finalizada" && task.autoDeleteAt && (
                  <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                    <p className='text-xs text-amber-800'>
                      ⏰ Se eliminará automáticamente el{" "}
                      {new Date(task.autoDeleteAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Etiquetas */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <Tag size={16} />
                  Etiquetas
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {task.tags.map((tag) => (
                    <span
                      key={tag._id}
                      className='px-3 py-1 rounded-full text-sm font-medium'
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Eliminar tarea */}
            <button
              onClick={handleDelete}
              className='w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-medium'>
              <Trash2 size={16} />
              Eliminar Tarea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
