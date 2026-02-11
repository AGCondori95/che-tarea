import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

const LoadingSpinner = () => {
  <div className='min-h-screen flex items-center justify-center bg-gray-50'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto' />
      <p className='mt-4 text-gray-600 text-sm'>Cargando...</p>
    </div>
  </div>;
};

const ProtectedRoute = ({children, adminOnly = false}) => {
  const {user, loading} = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to='/login' replace state={{from: location}} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
};

export default ProtectedRoute;
