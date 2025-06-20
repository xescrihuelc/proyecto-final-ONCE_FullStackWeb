import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading, role } = useAuth();

    if (loading) return <p>Cargando...</p>;

    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole && role !== requiredRole)
        return <Navigate to="/" replace />;

    return children;
};

export default ProtectedRoute;
