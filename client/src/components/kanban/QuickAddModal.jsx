import {useEffect, useState} from "react";
import {X} from "lucide-react";
import {useTask} from "../../context/TaskContext";

const PRIORITY_OPTIONS = [
  {value: "alta", label: "Alta", color: "bg-urgent"},
  {value: "media", label: "Media", color: "bg-medium"},
  {value: "baja", label: "Baja", color: "bg-low"},
];

const QuickAddModal = ({isOpen, onClose}) => {
  const {createTask, tags} = useTask();
  const [formData, setFormData] = useState({
    title: "",
    priority: "media",
    tags: [],
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      const handleEscape = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createTask(formData);

    if (result.success) {
      onClose();
    }

    setIsLoading(false);
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'>
      <div
        className='bg-white rounded-lg shadow-xl max-w-md w-full'
        onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 id='modal-title' className='text-xl font-semibold text-gray-900'>
            Crear Tarea Rápida
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition'
            aria-label='Cerrar modal'>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Título *
            </label>
            <input
              type='text'
              required
              autoFocus
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({...prev, title: e.target.value}))
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
              placeholder='¿Qué necesitas hacer?'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Prioridad
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {PRIORITY_OPTIONS.map((priority) => (
                <button
                  key={priority.value}
                  type='button'
                  onClick={() =>
                    setFormData((prev) => ({...prev, priority: priority.value}))
                  }
                  className={`px-4 py-2 rounded-lg font-medium text-white transition ${
                    formData.priority === priority.value
                      ? `${priority.color} ring-2 ring-offset-2 ring-${priority.color}`
                      : `${priority.color} opacity-50 hover:opacity-75`
                  }`}>
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Etiquetas
              </label>
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type='button'
                    onClick={() => handleTagToggle(tag._id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      formData.tags.includes(tag._id)
                        ? "ring-2 ring-offset-1"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({...prev, description: e.target.value}))
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none'
              rows={3}
              placeholder='Agrega más detalles...'
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition'>
              Cancelar
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50'>
              {isLoading ? "Creando..." : "Crear Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
