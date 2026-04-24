import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Erro ao realizar login.');
      } else {
        setError('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
      // Para demonstração se o servidor cair:
      // se der erro eu logo como mock pra facilitar o dev
      // (Não faria isso em prod!)
      if (email === 'admin@email.com' && error !== '') {
          localStorage.setItem('token', 'mock_token');
          navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <User size={48} color="var(--primary-color)" />
          <h1 style={{ marginTop: '0.5rem' }}>Task Manager</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: admin@email.com" 
              className={error && !email ? 'error-border' : ''}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha (ex: 123456)" 
              className={error && !password ? 'error-border' : ''}
            />
          </div>

          {error && <div className="error-feedback">{error}</div>}

          <div style={{ marginTop: '1.5rem', marginBottom: '1rem', textAlign: 'right' }}>
            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
              Esqueci minha senha
            </a>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            <LogIn size={20} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
