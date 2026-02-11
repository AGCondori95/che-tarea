import {useCallback, useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext";
import {useTask} from "../context/TaskContext";
import axios from "../api/axios";
import {Bell, Camera, Lock, Save, Tag} from "lucide-react";
import {toast} from "react-toastify";

const INITIAL_PASSWORD_DATA = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const Profile = () => {
  const {user, updateProfile} = useAuth();
  const {tags} = useTask();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
    defaultTag: "",
    emailNotifications: false,
    appNotifications: true,
  });

  const [passwordData, setPasswordData] = useState(INITIAL_PASSWORD_DATA);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        defaultTag: user.defaultTag?._id || "",
        emailNotifications: user.emailNotifications || false,
        appNotifications:
          user.appNotifications !== undefined ? user.appNotifications : true,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await updateProfile(profileData);

    setIsLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsChangingPassword(true);

    try {
      await axios.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Contraseña actualizada exitosamente");
      setPasswordData(INITIAL_PASSWORD_DATA);
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al cambiar contraseña";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = useCallback((name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Perfil de Usuario</h1>
        <p className='text-gray-600 mt-1'>
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Avatar y Nombre */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex items-center gap-6'>
          <div className='relative'>
            <div className='w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold'>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                getInitials(user?.name || "U")
              )}
            </div>
            <button
              className='absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-blue-700 transition shadow-lg'
              aria-label='Cambiar avatar'>
              <Camera size={16} />
            </button>
          </div>

          <div className='flex-1'>
            <h2 className='text-2xl font-bold text-gray-900'>{user?.name}</h2>
            <p className='text-gray-600'>{user?.email}</p>
            {user?.role === "admin" && (
              <span className='inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full'>
                Administrador
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Información de la Cuenta */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Información de la Cuenta
          </h3>
        </div>
        <form onSubmit={handleProfileUpdate} className='p-6 space-y-4'>
          {/* Nombre Completo */}
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Nombre Completo
            </label>
            <input
              id='name'
              type='text'
              value={profileData.name}
              onChange={(e) =>
                setProfileData({...profileData, name: e.target.value})
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Correo Electrónico
            </label>
            <input
              id='email'
              type='text'
              value={profileData.email}
              disabled
              className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed'
            />
            <p className='text-xs text-gray-500 mt-1'>
              El email no se puede cambiar
            </p>
          </div>

          {/* Etiqueta por Defecto */}
          <div>
            <label
              htmlFor='defaultTag'
              className='text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
              <Tag size={16} />
              Etiqueta por Defecto
            </label>
            <select
              id='defaultTag'
              value={profileData.defaultTag}
              onChange={(e) =>
                setProfileData({...profileData, defaultTag: e.target.value})
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'>
              <option value=''>Sin etiqueta por defecto</option>
              {tags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Guardar */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium'>
            <Save size={20} />
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>

      {/* Cambiar Contraseña */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <Lock size={20} />
            Cambiar Contraseña
          </h3>
        </div>
        <form onSubmit={handlePasswordChange} className='p-6 space-y-4'>
          {/* Contraseña Actual */}
          <div>
            <label
              htmlFor='currentPassword'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Contraseña Actual
            </label>
            <input
              id='currentPassword'
              type='password'
              autoComplete='current-password'
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
              required
            />
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label
              htmlFor='newPassword'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Nueva Contraseña
            </label>
            <input
              id='newPassword'
              type='password'
              autoComplete='new-password'
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
              minLength={6}
              required
            />
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Confirmar Nueva Contraseña
            </label>
            <input
              id='confirmPassword'
              type='password'
              autoComplete='new-password'
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none'
              minLength={6}
              required
            />
          </div>

          {/* Botón Cambiar */}
          <button
            type='submit'
            disabled={isChangingPassword}
            className='w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium'>
            {isChangingPassword ? "Cambiando..." : "Cambiar Contraseña"}
          </button>
        </form>
      </div>

      {/* Preferencias de Notificaciones */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <Bell size={20} />
            Preferencias de Notificaciones
          </h3>
        </div>
        <div className='p-6 space-y-4'>
          {/* Notificaciones por Email */}
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-900'>
                Notificaciones por Correo
              </p>
              <p className='text-sm text-gray-500'>
                Recibe actualizaciones por email
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={profileData.emailNotifications}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    emailNotifications: e.target.checked,
                  })
                }
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {/* Notificaciones en la App */}
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-900'>
                Notificaciones en la Aplicación
              </p>
              <p className='text-sm text-gray-500'>
                Recibe notificaciones mientras usas la app
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={profileData.appNotifications}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    appNotifications: e.target.checked,
                  })
                }
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {/* Bootón Guardar Preferenciias */}
          <button
            onClick={handleProfileUpdate}
            disabled={isLoading}
            className='w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium'>
            {isLoading ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
