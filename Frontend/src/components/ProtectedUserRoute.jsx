import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

/**
 * ProtectedUserRoute
 * Ensures only authenticated users (role: "user") can access the route.
 * Redirects admins to their own dashboard.
 */
export default function ProtectedUserRoute({ children }) {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}
