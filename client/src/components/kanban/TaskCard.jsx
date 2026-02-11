import {useMemo} from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Calendar, CheckCircle2, Circle, MessageSquare} from "lucide-react";

const PRIORITY_COLORS = {
  alta: "bg-urgent text-white",
  media: "bg-medium text-white",
  baja: "bg-low text-white",
};

const PRIORITY_LABELS = {alta: "Alta", media: "Media", baja: "Baja"};

const TaskCard = ({task, onClick}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id: task._id});

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }),
    [transform, transition, isDragging],
  );

  const subtaskProgress = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((st) => st.completed).length;
    const total = task.subtasks.length;
    return {completed, total};
  }, [task.subtasks]);

  const formattedDate = useMemo(() => {
    if (!task.dueDate) return null;
    return new Date(task.dueDate).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
  }, [task.dueDate]);

  const handleClick = () => {
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow ${
        task.status === "finalizada" ? "opacity-60" : ""
      }`}>
      {/* Badge de prioridad */}
      <div className='flex items-start justify-between mb-3'>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            PRIORITY_COLORS[task.priority]
          }`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {formattedDate && (
          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </div>
        )}

        {/* Título */}
        <h3 className='font-medium text-gray-900 mb-2 line-clamp-2'>
          {task.title}
        </h3>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-3'>
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag._id}
                className='px-2 py-1 rounded-full text-xs font-medium'
                style={{backgroundColor: `${tag.color}20`, color: tag.color}}>
                {tag.name}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: Subtareas, Comentarios y Avatar */}
        <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
          <div className='flex items-center gap-3 text-sm text-gray-500'>
            {/* Subtareas */}
            {subtaskProgress && (
              <div className='flex items-center gap-1'>
                {subtaskProgress.completed === subtaskProgress.total ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}
                <span className='text-xs'>
                  {subtaskProgress.completed}/{subtaskProgress.total}
                </span>
              </div>
            )}

            {task.comments && task.comments.length > 0 && (
              <div className='flex items-center gap-1'>
                <MessageSquare size={16} />
                <span className='text-xs'>{task.comments.length}</span>
              </div>
            )}
          </div>

          {task.assignedTo && (
            <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold'>
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
