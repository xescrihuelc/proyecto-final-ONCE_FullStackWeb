import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, role } = useAuth();

  // Si aún está cargando (ej. role aún es null), no renderices nada todavía
  if (!token || role === undefined || role === null) {
    return null; // o un spinner si quieres
  }

  // Si hay rol requerido y no coincide, redirige a home
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
