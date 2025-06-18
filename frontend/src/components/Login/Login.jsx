import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === '1234') {
      alert('Login correcto');
      // TODO: Redirigir con useNavigate
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
