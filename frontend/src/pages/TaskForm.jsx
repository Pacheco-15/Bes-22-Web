import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Save, ArrowLeft } from 'lucide-react';
import { parseISO, isFuture, format, isValid } from 'date-fns';
import API_BASE_URL from '../api';

const TaskForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'Normal',
    assigned_to: ''
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    // 4. Verifica campos obrigatórios
    if (!formData.title) newErrors.title = 'Título é obrigatório';
    if (!formData.deadline) newErrors.deadline = 'Prazo é obrigatório';
    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';
    if (!formData.assigned_to) newErrors.assigned_to = 'Responsável é obrigatório';

    // 5. Valida o formato e data futura do prazo
    if (formData.deadline) {
      // Input date já garante o formato ISO nas entrelinhas (YYYY-MM-DD), o que é válido pra checar data
      // Vamos converter para ver se é futura
      const dateObj = parseISO(formData.deadline);
      if (!isValid(dateObj)) {
        newErrors.deadline = 'Formato de data inválido. Use DD/MM/AAAA.';
      } else if (!isFuture(dateObj)) {
        newErrors.deadline = 'A data de prazo deve ser uma data no futuro.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');

    // Algoritmo 6: Se inválido exibe erro e retorna
    if (!validateForm()) {
      return;
    }

    try {
      // Algoritmo 7: Persiste a tarefa
      await axios.post(`${API_BASE_URL}/api/tasks`, formData);
      setSuccessMsg('Tarefa criada com sucesso!');
      
      // Algoritmo 8: Retorna pro painel que vai se atualizar (usamos delay visual)
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      setErrors({ form: 'Erro ao conectar ou salvar a tarefa no banco.' });
    }
  };

  return (
    <>
      <nav className="navbar glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <LayoutDashboard color="var(--primary-color)" /> Task Manager
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Painel Principal</Link>
        </div>
      </nav>

      <main className="main-content animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="auth-card glass" style={{ maxWidth: '600px', width: '100%', marginTop: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={20} /></Link>
            <h2>Criar Nova Tarefa</h2>
          </div>

          {successMsg && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
              {successMsg} — Redirecionando...
            </div>
          )}

          {errors.form && (
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Título da Tarefa *</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className={errors.title ? 'error-border' : ''}
              />
              {errors.title && <span className="error-feedback">{errors.title}</span>}
            </div>

            <div className="input-group">
              <label>Descrição</label>
              <textarea 
                name="description" 
                rows="3" 
                value={formData.description} 
                onChange={handleChange} 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Prazo (Data Estimada) *</label>
                <input 
                  type="date" 
                  name="deadline" 
                  value={formData.deadline} 
                  onChange={handleChange} 
                  className={errors.deadline ? 'error-border' : ''}
                />
                {errors.deadline && <span className="error-feedback">{errors.deadline}</span>}
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label>Prioridade *</label>
                <select 
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleChange}
                  className={errors.priority ? 'error-border' : ''}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                </select>
                {errors.priority && <span className="error-feedback">{errors.priority}</span>}
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Responsável *</label>
              <input 
                name="assigned_to" 
                value={formData.assigned_to} 
                onChange={handleChange} 
                placeholder="Nome do integrante..."
                className={errors.assigned_to ? 'error-border' : ''}
              />
              {errors.assigned_to && <span className="error-feedback">{errors.assigned_to}</span>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Link to="/dashboard" className="btn btn-secondary" style={{ width: 'auto', textDecoration: 'none' }}>Cancelar</Link>
              <button type="submit" className="btn" style={{ width: 'auto' }}>
                <Save size={18} /> Salvar Tarefa
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default TaskForm;
