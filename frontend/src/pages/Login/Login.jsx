import "./Login.css";
import logo from "../../assets/LOGO_Ajuntament_VIC_NEGRO.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(credentials.email, credentials.password);
            navigate("/panel-imputacion", { replace: true });
        } catch (err) {
            if (err?.code === "INVALID_CREDENTIALS" || err?.message === "INVALID_CREDENTIALS") {
                setError("Credenciales incorrectas");
            } else {
                setError("Error al iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <img src={logo} alt="Logo VIC" className="login-logo" />
                <h2>Inicia sesión</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !credentials.email.trim() ||
                            !credentials.password.trim()
                        }
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
                {error && <p className="login-error">{error}</p>}
            </div>
        </div>
    );
};

export default Login;
