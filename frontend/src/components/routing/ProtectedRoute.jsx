import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, roles } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !roles.includes(requiredRole))
    return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
