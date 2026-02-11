import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {useNavigate} from "react-router-dom";
import axios from "../api/axios";
import {toast} from "react-toastify";

const AuthContext = createContext();

const STORAGE_KEYS = {TOKEN: "token", USER: "user"};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    toast.info("Sesión cerrada");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          const {data} = await axios.get("/auth/me");
          setUser(data.data);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
        } catch (error) {
          console.error("Error al cargar usuario:", error);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const {data} = await axios.post("/auth/register", userData);

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
      setUser(data.data);

      toast.success("¡Cuenta creada exitosamente!");
      setTimeout(() => navigate("/dashboard"), 0);

      return {success: true};
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al crear la cuenta";
      toast.error(message);
      return {success: false, message};
    }
  };

  const login = async (credentials) => {
    try {
      const {data} = await axios.post("/auth/login", credentials);

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
      setUser(data.data);

      toast.success(`¡Bienvenido, ${data.data.name}!`);
      setTimeout(() => navigate("/dashboard"), 0);

      return {success: true};
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      toast.error(message);
      return {success: false, message};
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const {data} = await axios.put("/auth/profile", profileData);

      setUser(data.data);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));

      toast.success("Perfil actualizado exitosamente");
      return {success: true};
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al actualizar perfil";
      toast.error(message);
      return {success: false, message};
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
