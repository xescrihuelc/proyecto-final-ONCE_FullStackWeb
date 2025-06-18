import './Login.css';
import logo from '../../assets/LOGO_Ajuntament_VIC_NEGRO.png';
import { useState } from 'react';
import { login } from '../../services/authService'; // importa la función de login simulada

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ user: '', password: '' });
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
      const token = await login(credentials.user, credentials.password); // login simulado
      onLogin(token); // actualiza el estado token en App.jsx
    } catch (err) {
      setError('Usuario o contraseña inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="login-page"> {/* Aplica el fondo a toda la página */}
    <div className="login-container">
      <img src={logo} alt="Logo VIC" className="login-logo" />
      <h2>Inicia sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="user"
          placeholder="Usuario"
          value={credentials.user}
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
         <button type="submit"
           disabled={loading || !credentials.user.trim() || !credentials.password.trim()}
          >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {error && <p className="login-error">{error}</p>}
    </div>
  </div>
);
};

export default Login;
