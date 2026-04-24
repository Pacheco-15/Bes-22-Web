const request = require('supertest');
const app = require('../index'); // Ajuste o caminho se necessário dependendo de onde a pasta de teste fica
const db = require('../db');

describe('Fluxo do Dashboard - Tarefas', () => {
  let taskId; // Variável para guardar o ID da tarefa criada para usar nos testes

  // Arrange Inicial: Limpar a tabela de tarefas e criar uma tarefa padrão
  beforeAll((done) => {
    db.serialize(() => {
      // 1. Limpamos as tarefas para garantir que o teste rode num ambiente isolado
      db.run('DELETE FROM tasks', () => {
        // 2. Inserimos uma tarefa "pending" (pendente) no banco simulando uma criação real
        db.run(
          `INSERT INTO tasks (title, description, deadline, priority, assigned_to, status) 
           VALUES (?, ?, ?, ?, ?, 'pending')`,
          ['Criar tela de login', 'Programar o front-end', '2023-12-01', 'Alta', 'dev@email.com'],
          function (err) {
            if (!err) {
              taskId = this.lastID; // Salvamos o ID gerado pelo banco
            }
            done();
          }
        );
      });
    });
  });

  test('Deve buscar todas as tarefas para alimentar as colunas do Dashboard', async () => {
    // Arrange (Preparar): Nenhuma preparação extra necessária além do banco já preenchido no beforeAll.

    // Act (Agir): Simula o Dashboard fazendo uma chamada GET para buscar as tarefas
    const response = await request(app).get('/api/tasks');

    // Assert (Afirmar): Verifica se a API retornou sucesso (200) e se a tarefa está na lista
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); // O retorno deve ser um array (lista)
    expect(response.body.length).toBeGreaterThanOrEqual(1); // Deve ter pelo menos a tarefa que criamos
    expect(response.body[0].title).toBe('Criar tela de login');
    expect(response.body[0].status).toBe('pending');
  });

  test('Deve atualizar o status da tarefa ao clicar no botão "Fazer" ou "Concluir"', async () => {
    // Arrange (Preparar): Simula os dados que o Dashboard envia quando clicamos em "Fazer"
    const updateData = { status: 'in_progress' };

    // Act (Agir): Simula a requisição PATCH para atualizar o status no banco
    const response = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send(updateData);

    // Assert (Afirmar) 1: Verifica a resposta da API
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Status atualizado com sucesso.');

    // Assert (Afirmar) 2: Vai direto no banco de dados garantir que o status realmente mudou
    return new Promise((resolve) => {
      db.get('SELECT status FROM tasks WHERE id = ?', [taskId], (err, row) => {
        expect(row.status).toBe('in_progress');
        resolve();
      });
    });
  });
});