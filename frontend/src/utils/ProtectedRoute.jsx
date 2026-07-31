import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE}/api/auth/me`, {
            withCredentials: true
        })
        .then(() => {
            setIsAuth(true);
        })
        .catch(() => {
            setIsAuth(false);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Checking auth...</div>;
    return isAuth ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;