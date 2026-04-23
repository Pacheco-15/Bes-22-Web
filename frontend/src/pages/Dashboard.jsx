import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Plus, LayoutDashboard, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/tasks/${id}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Erro atualizar status', err);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const TaskCard = ({ task }) => (
    <div className="task-card">
      <div className="task-title">{task.title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {task.description?.substring(0, 50)}...
      </div>
      <div className="task-meta">
        <span className={`badge badge-${task.priority === 'Alta' ? 'high' : task.priority === 'Media' ? 'medium' : 'low'}`}>
          {task.priority || 'Normal'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} />
          {task.deadline}
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
         {task.status !== 'in_progress' && <button onClick={() => updateStatus(task.id, 'in_progress')} className="btn btn-secondary" style={{ padding: '0.25rem', fontSize: '0.75rem', flex: 1 }}>Fazer</button>}
         {task.status !== 'completed' && <button onClick={() => updateStatus(task.id, 'completed')} className="btn btn-secondary" style={{ padding: '0.25rem', fontSize: '0.75rem', flex: 1 }}>Concluir</button>}
      </div>
    </div>
  );

  return (
    <>
      <nav className="navbar glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <LayoutDashboard color="var(--primary-color)" /> Task Manager
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Painel</Link>
          <Link to="/report" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Relatório</Link>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="main-content animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Painel Principal</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Acompanhe o fluxo de tarefas da equipe</p>
          </div>
          <Link to="/create-task" className="btn" style={{ width: 'auto', textDecoration: 'none' }}>
            <Plus size={20} /> Nova Tarefa
          </Link>
        </div>

        <div className="kanban-board">
          {/* Coluna Pendentes */}
          <div className="kanban-column">
            <div className="kanban-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} color="var(--warning)" /> Pendentes
              </span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-color)' }}>{pendingTasks.length}</span>
            </div>
            {pendingTasks.map(t => <TaskCard key={t.id} task={t} />)}
            {pendingTasks.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Nenhuma tarefa pendente.</div>}
          </div>

          {/* Coluna Em Andamento */}
          <div className="kanban-column">
            <div className="kanban-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--primary-color)" /> Em Andamento
              </span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-color)' }}>{inProgressTasks.length}</span>
            </div>
            {inProgressTasks.map(t => <TaskCard key={t.id} task={t} />)}
            {inProgressTasks.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Nenhuma tarefa em andamento.</div>}
          </div>

          {/* Coluna Concluídas */}
          <div className="kanban-column">
            <div className="kanban-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="var(--success)" /> Concluídas
              </span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-color)' }}>{completedTasks.length}</span>
            </div>
            {completedTasks.map(t => <TaskCard key={t.id} task={t} />)}
            {completedTasks.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Nenhuma tarefa concluída.</div>}
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
