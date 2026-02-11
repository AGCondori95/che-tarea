import {useEffect, useMemo, useState} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {Archive, Home, ListTodo, Menu, Settings, Users, X} from "lucide-react";

const Sidebar = () => {
  const {user} = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        name: "Inicio",
        path: "/dashboard",
        icon: Home,
        roles: ["user", "admin"],
      },
      {
        name: "Tareas",
        path: "/tasks",
        icon: ListTodo,
        roles: ["user", "admin"],
      },
      {name: "Equipo", path: "/team", icon: Users, roles: ["admin"]},
      {
        name: "Archivo",
        path: "/archive",
        icon: Archive,
        roles: ["user", "admin"],
      },
      {
        name: "Configuración",
        path: "/profile",
        icon: Settings,
        roles: ["user", "admin"],
      },
    ],
    [],
  );

  const filteredMenuItems = useMemo(
    () => menuItems.filter((item) => item.roles.includes(user?.role)),
    [menuItems, user?.role],
  );

  // Prevenir scroll del body cuando sidebar está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "undet";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobileOpen]);

  const NavItem = ({item}) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}>
        <Icon size={20} />
        <span className='font-medium'>{item.name}</span>
      </NavLink>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className='lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg'
        aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isMobileOpen}>
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/50 z-40'
          onClick={() => setIsMobileOpen(false)}
          role='button'
          tabIndex={0}
          aria-label='Cerrar menú'
          onKeyDown={(e) => e.key === "Escape" && setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label='Navegación principal'>
        <div className='flex flex-col h-full'>
          <div className='flex items-center gap-3 px-6 py-6 lg:py-6 pt-20 border-b border-gray-700 relative'>
            <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0'>
              <span className='text-white font-bold text-lg'>CT</span>
            </div>
            <div className='overflow-hidden'>
              <h1 className='text-white font-bold text-lg truncate'>
                Che Tarea
              </h1>
              <p className='text-gray-400 text-xs truncate'>Gestor de Tareas</p>
            </div>
          </div>

          <nav className='flex-1 px-4 py-6 space-y-2 overflow-y-auto'>
            {filteredMenuItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          <div className='px-4 py-4 border-t border-gray-700'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold'>
                {user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-white font-medium text-sm truncate'>
                  {user?.name}
                </p>
                <p className='text-gray-400 text-xs truncate'>{user?.email}</p>
              </div>
            </div>
            {user?.role === "admin" && (
              <div className='mt-2'>
                <span className='inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded'>
                  Administrador
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
