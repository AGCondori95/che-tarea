import {useCallback, useMemo} from "react";
import {useAuth} from "../context/AuthContext";
import {useTask} from "../context/TaskContext";
import {useNavigate} from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

const Dashboard = () => {
  const {user} = useAuth();
  const {tasks, loading} = useTask();
  const navigate = useNavigate();

  const recentActivity = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  }, [tasks]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      enProgreso: tasks.filter((t) => t.status === "en_progreso").length,
      completadas: tasks.filter((t) => t.status === "finalizada").length,
      urgentes: tasks.filter(
        (t) => t.priority === "alta" && t.status !== "finalizada",
      ).length,
      pendientesRevision: tasks.filter((t) => t.status === "pendiente_revision")
        .length,
      porHacer: tasks.filter((t) => t.status === "por_hacer").length,
    };
  }, [tasks]);

  const statsCards = useMemo(
    () => [
      {
        title: "Tareas Totales",
        value: stats.total,
        icon: BarChart3,
        color: "bg-blue-500",
        textColor: "text-blue-500",
        bgLight: "bg-blue-50",
      },
      {
        title: "En Progreso",
        value: stats.enProgreso,
        icon: Clock,
        color: "bg-amber-500",
        textColor: "text-amber-500",
        bgLight: "bg-amber-50",
      },
      {
        title: "Completadas",
        value: stats.completadas,
        icon: CheckCircle2,
        color: "bg-green-500",
        textColor: "text-green-500",
        bgLight: "bg-green-50",
      },
      {
        title: "Urgentes",
        value: stats.urgentes,
        icon: AlertCircle,
        color: "bg-red-500",
        textColor: "text-red-500",
        bgLight: "bg-red-50",
      },
    ],
    [stats],
  );

  const progressPercentage = useMemo(() => {
    return stats.total > 0
      ? Math.round((stats.completadas / stats.total) * 100)
      : 0;
  }, [stats]);

  const completedToday = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== "finalizada" || !t.completedAt) return false;
      const today = new Date().setHours(0, 0, 0, 0);
      const completed = new Date(t.completedAt).setHours(0, 0, 0, 0);
      return completed === today;
    }).length;
  }, [tasks]);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      por_hacer: "Por Hacer",
      en_progreso: "En Progreso",
      pendiente_revision: "Pendiente de Revisión",
      finalizada: "Completada",
    };
    return labels[status] || status;
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      por_hacer: "bg-gray-100 text-gray-700",
      en_progreso: "bg-blue-100 text-blue-700",
      pendiente_revision: "bg-amber-100 text-amber-700",
      finalizada: "bg-green-100 text-green-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      alta: "text-red-500",
      media: "text-amber-500",
      baja: "text-green-500",
    };
    return colors[priority] || "text-gray-500";
  }, []);

  const getTimeAgo = useCallback((date) => {
    const now = new Date();
    const updated = new Date(date);
    const diffInMinutes = Math.floor((now - updated) / (1000 * 60));

    if (diffInMinutes < 1) return "Hace un momento";
    if (diffInMinutes < 60)
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;

    return updated.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  }, []);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Bienvenida */}
      <div className='bg-gradient-to-r from-primary to-blue-700 rounded-lg shadow p-6 text-white'>
        <h1 className='text-3xl font-bold mb-2'>¡Hola, {user?.name}! 👋</h1>
        <p className='text-blue-100 text-lg'>{currentDate}</p>
        <div className='mt-4 flex items-center gap-2'>
          <div className='flex-1 bg-white/20 rounded-full h-2'>
            <div
              className='bg-white h-2 rounded-full transition-all duration-500'
              style={{width: `${progressPercentage}%`}}
            />
          </div>
          <span className='text-sm font-semibold'>{progressPercentage}%</span>
        </div>
        <p className='text-sm text-blue-100 mt-1'>
          {stats.completadas} de {stats.total} tareas completadas
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className='bg-white rounded-lg shadow hover:shadow-md transition p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>{stat.title}</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className='text-white' size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen por estado */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Por Hacer */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>Por Hacer</h3>
            <span className='text-2xl font-bold text-gray-900'>
              {stats.porHacer}
            </span>
          </div>
          <p className='text-sm text-gray-600'>Tareas pendientes de iniciar</p>
          <button
            onClick={() => navigate("/tasks")}
            className='mt-4 w-full text-sm text-primary hover:text-blue-700 font-medium'>
            Ver Todas →
          </button>
        </div>

        {/* Pendiente de revisión */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Pendiente de Revisión
            </h3>
            <span className='text-2xl font-bold text-amber-600'>
              {stats.pendientesRevision}
            </span>
          </div>
          <p className='text-sm text-gray-600'>
            {user?.role === "admin"
              ? "Tareas esperando tu aprobación"
              : "Tareas esperando aprobación"}
          </p>
          {stats.pendientesRevision > 0 && (
            <button
              onClick={() => navigate("/tasks")}
              className='mt-4 w-full text-sm text-amber-600 hover:text-amber-700 font-medium'>
              Revisar ahora →
            </button>
          )}
        </div>

        {/* Progreso del equipo */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>Progreso</h3>
            <TrendingUp className='text-green-500' size={24} />
          </div>
          <div className='space-y-3'>
            <div>
              <div className='flex justify-between text-sm mb-1'>
                <span className='text-gray-600'>Completadas</span>
                <span className='font-semibold text-gray-900'>
                  {progressPercentage}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full transition-all duration-500'
                  style={{width: `${progressPercentage}%`}}
                />
              </div>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              ¡Buen trabajo! Sigue así 💪
            </p>
          </div>
        </div>
      </div>

      {/* Tareas Urgentes */}
      {stats.urgentes > 0 && (
        <div className='bg-red-50 border-l-4 border-red-500 rounded-lg p-6'>
          <div className='flex items-start gap-3'>
            <AlertCircle
              className='text-red-500 flex-shrink-0 mt-0.5'
              size={24}
            />
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-red-900 mb-1'>
                Atención: {stats.urgentes} tarea{stats.urgentes > 1 ? "s" : ""}{" "}
                urgente{stats.urgentes > 1 ? "s" : ""}
              </h3>
              <p className='text-sm text-red-700'>
                Tienes tareas de alta prioridad que requieren tu atención
                inmediata.
              </p>
              <button
                onClick={() => navigate("/tasks")}
                className='mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium'>
                Ver tareas urgentes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actividad Reciente */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Actividad Reciente
          </h3>
          <button
            onClick={() => navigate("/tasks")}
            className='text-sm text-primary hover:text-blue-700 font-medium'>
            Ver todas
          </button>
        </div>
        <div className='p-6'>
          {recentActivity.length > 0 ? (
            <div className='space-y-4'>
              {recentActivity.map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate("/tasks")}
                  className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer'>
                  <div
                    className={`w-10 h-10 rounded-full ${
                      task.status === "finalizada"
                        ? "bg-green-100"
                        : task.status === "en_progreso"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                    } flex items-center justify-center flex-shrink-0`}>
                    {task.status === "finalizada" ? (
                      <CheckCircle2 className='text-green-500' size={20} />
                    ) : task.status === "en_progreso" ? (
                      <Clock className='text-blue-500' size={20} />
                    ) : (
                      <AlertCircle
                        className={getPriorityColor(task.priority)}
                        size={20}
                      />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-gray-900 truncate'>
                      {task.title}
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      {getTimeAgo(task.updatedAt)}
                      {task.assignedTo && (
                        <span className='ml-2'>
                          • Asignado a {task.assignedTo.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 ${getStatusColor(
                      task.status,
                    )} text-xs font-medium rounded-full flex-shrink-0`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <Calendar className='mx-auto text-gray-300 mb-4' size={48} />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No hay actividad reciente
              </h3>
              <p className='text-gray-600 mb-6'>
                Comienza creando tu primera tarea
              </p>
              <button
                onClick={() => navigate("/tasks")}
                className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition'>
                Ir al Tablero Kanban
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional para admins */}
      {user?.role === "admin" && (
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <Users className='text-primary' size={24} />
            <h3 className='text-lg font-semibold text-gray-900'>
              Panel de Administrador
            </h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <p className='text-sm text-blue-600 mb-1'>Tareas del equipo</p>
              <p className='text-2xl font-bold text-blue-900'>{stats.total}</p>
            </div>
            <div className='p-4 bg-amber-50 rounded-lg'>
              <p className='text-sm text-amber-600 mb-1'>
                Pendientes de revisión
              </p>
              <p className='text-2xl font-bold text-amber-900'>
                {stats.pendientesRevision}
              </p>
            </div>
            <div className='p-4 bg-green-50 rounded-lg'>
              <p className='text-sm text-green-600 mb-1'>Completadas hoy</p>
              <p className='text-2xl font-bold text-green-900'>
                {completedToday}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/team")}
            className='mt-4 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition'>
            Ir a Gestión de Equipo
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
