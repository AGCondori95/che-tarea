import {useEffect, useMemo, useRef, useState} from "react";
import {useAuth} from "../../context/AuthContext";
import {Bell, ChevronDown, LogOut, User} from "lucide-react";
import {useNavigate} from "react-router-dom";

const formatDate = (locale = "es-AR") => {
  return new Date().toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Navbar = () => {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const firstName = useMemo(
    () => user?.name?.split(" ")[0] || "",
    [user?.name],
  );
  const userInitial = useMemo(
    () => user?.name?.charAt(0).toUpperCase() || "?",
    [user?.name],
  );
  const currentDate = useMemo(() => formatDate(), []);
  const userRoleLabel = useMemo(
    () => (user?.role === "admin" ? "Administrador" : "Usuario"),
    [user?.role],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-30'>
      <div className='flex items-center justify-between px-6 py-4'>
        <div>
          <h2 className='text-xl font-semibold text-gray-800'>
            Bienvenido, {firstName}
          </h2>
          <p className='text-sm text-gray-500'>{currentDate}</p>
        </div>

        <div className='flex items-center gap-4'>
          <button className='relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition'>
            <Bell size={20} />
            <span
              className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'
              aria-label='Tienes notificaciones sin leer'
            />
          </button>

          {/* Dropdown de usuario */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition'
              aria-expanded={isDropdownOpen}
              aria-haspopup='true'>
              <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm'>
                {userInitial}
              </div>
              <div className='hidden md:block text-left'>
                <p className='text-sm font-medium text-gray-700'>
                  {user?.name}
                </p>
                <p className='text-xs text-gray-500'>{userRoleLabel}</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div
                className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2'
                role='menu'>
                <div className='px-4 py-3 border-b border-gray-100'>
                  <p className='text-sm font-medium text-gray-900'>
                    {user?.name}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>{user?.email}</p>
                </div>

                <button
                  onClick={handleProfileClick}
                  className='w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition'
                  role='menuitem'>
                  <User size={16} />
                  Mi Perfil
                </button>

                <div className='border-t border-gray-100 my-2' />

                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition'
                  role='menuitem'>
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
