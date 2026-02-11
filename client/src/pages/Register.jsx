import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {Eye, EyeOff, Shield, UserCircle} from "lucide-react";

const Register = () => {
  const {register} = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));

    if (name === "password") {
      if (value.length > 0 && value.length < 6) {
        setPasswordError("La contraseña debe tener al menos 6 caracteres");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    await register(formData);
    setIsLoading(false);
  };

  return (
    <div className='min-h-screen flex'>
      {/* Panel izquierdo - Formulario */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8 bg-white'>
        <div className='w-full max-w-md'>
          {/* Logo y título */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-4'>
              <span className='text-2xl text-white font-bold'>CT</span>
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Crea tu Cuenta
            </h1>
            <p className='text-gray-600'>
              Únete a tu equipo y organiza tus tareas
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Nombre */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-2'>
                Nombre Completo
              </label>
              <input
                id='name'
                name='name'
                type='text'
                required
                value={formData.name}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition'
                placeholder='Juan Pérez'
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'>
                Correo Electrónico
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                value={formData.email}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition'
                placeholder='tu@email.com'
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'>
                Contraseña
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition'
                  placeholder='tu@email.com'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Rol Inicial */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                Rol Inicial
              </label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() =>
                    setFormData((prev) => ({...prev, role: "user"}))
                  }
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition ${
                    formData.role === "user"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <UserCircle
                    size={32}
                    className={
                      formData.role === "user"
                        ? "text-primary"
                        : "text-gray-400"
                    }
                  />
                  <span className='mt-2 font-medium text-sm'>
                    Usuario Estándar
                  </span>
                  <span className='text-xs text-gray-500 mt-1 text-center'>
                    Crear y gestionar tareas
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() =>
                    setFormData((prev) => ({...prev, role: "admin"}))
                  }
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition ${
                    formData.role === "admin"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <Shield
                    size={32}
                    className={
                      formData.role === "admin"
                        ? "text-primary"
                        : "text-gray-400"
                    }
                  />
                  <span className='mt-2 font-medium text-sm'>Admin</span>
                  <span className='text-xs text-gray-500 mt-1 text-center'>
                    Gestión completa del equipo
                  </span>
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type='submit'
              disabled={isLoading || !!passwordError}
              className='w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6'>
              {isLoading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          {/* Link a login */}
          <p className='mt-6 text-center text-sm text-gray-600'>
            ¿Ya tienes cuenta?{" "}
            <Link
              to='/login'
              className='text-primary font-medium hover:underline'>
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Panel derecho - Ilustración */}
      <div className='hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12'>
        <div className='max-w-lg text-center text-white'>
          <svg
            className='w-64 h-64 mx-auto mb-8'
            viewBox='0 0 200 200'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            {/* Ilustración de equipo colaborando */}
            <circle cx='70' cy='80' r='20' fill='white' opacity='0.3' />
            <circle cx='130' cy='80' r='20' fill='white' opacity='0.3' />
            <circle cx='100' cy='120' r='20' fill='white' opacity='0.3' />
            <line
              x1='80'
              y1='90'
              x2='95'
              y2='110'
              stroke='white'
              strokeWidth='3'
              opacity='0.3'
            />
            <line
              x1='120'
              y1='90'
              x2='105'
              y2='110'
              stroke='white'
              strokeWidth='3'
              opacity='0.3'
            />
            <rect
              x='40'
              y='150'
              width='120'
              height='8'
              rx='4'
              fill='white'
              opacity='0.4'
            />
            <rect
              x='60'
              y='165'
              width='80'
              height='6'
              rx='3'
              fill='white'
              opacity='0.3'
            />
          </svg>

          <h2 className='text-3xl font-bold mb-4'>Task Manager</h2>
          <p className='text-blue-100 text-lg mb-8'>
            Únete a equipos que ya están optimizando su trabajo con Che Tarea
          </p>

          <div className='space-y-4 text-left max-w-sm mx-auto'>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs'>✓</span>
              </div>
              <div>
                <p className='font-medium'>Gestión visual de tareas</p>
                <p className='text-sm text-blue-100'>
                  Tablero Kanban intuitivo
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs'>✓</span>
              </div>
              <div>
                <p className='font-medium'>Colaboración en equipo</p>
                <p className='text-sm text-blue-100'>
                  Asigna tareas y da seguimiento
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs'>✓</span>
              </div>
              <div>
                <p className='font-medium'>100% Gratis</p>
                <p className='text-sm text-blue-100'>Sin límites para PyMEs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
