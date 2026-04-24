import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, DownloadCloud, FileBarChart, Filter } from 'lucide-react';
import API_BASE_URL from '../api';

const Report = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStr, setFilterStr] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks`);
        setTasks(response.data);
      } catch (err) {
        console.error('Erro buscar', err);
      }
    };
    fetchTasks();
  }, []);

  const handleExportCSV = () => {
    // Mock exportação simples local usando o json local
    const csvRows = [];
    const headers = ['ID', 'Titulo', 'Responsavel', 'Prioridade', 'Status', 'Prazo'];
    csvRows.push(headers.join(','));

    tasks.forEach(t => {
      const values = [t.id, t.title, t.assigned_to, t.priority, t.status, t.deadline];
      csvRows.push(values.join(','));
    });

    const csvData = csvRows.join('\\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'relatorio_tarefas.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(filterStr.toLowerCase()) || t.assigned_to.toLowerCase().includes(filterStr.toLowerCase()));

  return (
    <>
      <nav className="navbar glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <FileBarChart color="var(--primary-color)" /> Task Manager: Relatórios
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Voltar ao Painel</Link>
        </div>
      </nav>

      <main className="main-content animate-fade-in">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Relatório Geral de Tarefas</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Visualize dados sobre todas as tarefas</p>
          </div>
          <button onClick={handleExportCSV} className="btn" style={{ width: 'auto' }}>
            <DownloadCloud size={20} /> Exportar CSV
          </button>
        </div>

        <div className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Filter size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Filtrar por título ou responsável..." 
            value={filterStr}
            onChange={(e) => setFilterStr(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'white' }}
          />
        </div>

        <div className="glass" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Título</th>
                <th style={{ padding: '1rem' }}>Responsável</th>
                <th style={{ padding: '1rem' }}>Prioridade</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>#{t.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.title}</td>
                  <td style={{ padding: '1rem' }}>{t.assigned_to}</td>
                  <td style={{ padding: '1rem' }}>{t.priority}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '1rem' }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{t.deadline}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhuma tarefa encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};
export default Report;
