import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {Eye, EyeOff} from "lucide-react";

const Login = () => {
  const {login} = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await login({email: formData.email, password: formData.password});

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
              Bienvenido de nuevo
            </h1>
            <p className='text-gray-600'>Accede a tu cuenta</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className='space-y-6'>
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
                  placeholder='••••••'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me y Forgot password */}
            <div className='flex items-center justify-between'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='rememberMe'
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className='w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary'
                />
                <span className='ml-2 text-sm text-gray-600'>Recuérdame</span>
              </label>
              <Link
                to='/forgot-password'
                className='text-sm text-primary hover:underline'>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Link a registro */}
          <p className='mt-6 text-center text-sm text-gray-600'>
            ¿No tienes cuenta?{" "}
            <Link
              to='/register'
              className='text-primary font-medium hover:underline'>
              Regístrate
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
            {/* Ilustración minimalista de oficina */}
            <rect
              x='40'
              y='60'
              width='120'
              height='100'
              rx='8'
              fill='white'
              opacity='0.2'
            />
            <rect
              x='55'
              y='75'
              width='35'
              height='25'
              rx='4'
              fill='white'
              opacity='0.3'
            />
            <rect
              x='105'
              y='75'
              width='35'
              height='25'
              rx='4'
              fill='white'
              opacity='0.3'
            />
            <rect
              x='55'
              y='115'
              width='85'
              height='30'
              rx='4'
              fill='white'
              opacity='0.4'
            />
            <circle cx='100' cy='40' r='15' fill='white' opacity='0.3' />
            <path
              d='M85 180 L100 165 L115 180'
              stroke='white'
              strokeWidth='3'
              opacity='0.3'
            />
          </svg>

          <h2 className='text-3xl font-bold mb-4'>Che Tarea</h2>
          <p className='text-blue-100 text-lg'>
            Gestiona tus tareas de forma simple y efectiva. Organiza tu equipo y
            aumenta la productividad.
          </p>

          <div className='mt-12 flex items-center justify-center gap-8'>
            <div className='text-center'>
              <div className='text-4xl font-bold'>+100</div>
              <div className='text-blue-200 text-sm mt-1'>
                PyMEs confían en nosotros
              </div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold'>4.8</div>
              <div className='text-blue-200 text-sm mt-1'>
                Calificación promedio
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
