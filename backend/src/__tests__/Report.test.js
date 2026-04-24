/**
 * ============================================================
 *  SUÍTE DE TESTES — MÓDULO DE RELATÓRIO (Report)
 *  Stack: Jest + Supertest
 *  Padrão: AAA (Arrange · Act · Assert)
 *
 *  Cobertura:
 *   ── Testes Unitários  (mock do banco de dados)
 *       · taskController.getTasks   – sucesso e erro interno
 *       · taskController.createTask – sucesso, campo ausente e erro interno
 *       · taskController.updateTaskStatus – sucesso e erro interno
 *
 *   ── Testes de Integração  (banco SQLite in-memory real)
 *       · GET  /api/tasks              – lista vazia e lista populada
 *       · POST /api/tasks              – cria tarefa e valida campos obrigatórios
 *       · PATCH /api/tasks/:id/status  – atualiza status
 *       · Fluxo completo: criar → listar → atualizar → verificar no relatório
 * ============================================================
 */

const request = require('supertest');
const app     = require('../index');
const db      = require('../db');

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

/** Retorna um objeto de tarefa válido pronto para uso nos testes. */
const buildValidTask = (overrides = {}) => ({
  title:       'Implementar tela de login',
  description: 'Criar interface de autenticação com validação',
  deadline:    '2027-12-31',
  priority:    'alta',
  assigned_to: 'João Silva',
  ...overrides,
});

/** Limpa a tabela de tarefas antes/depois dos testes de integração. */
const clearTasks = () =>
  new Promise((resolve, reject) =>
    db.run('DELETE FROM tasks', [], (err) => (err ? reject(err) : resolve()))
  );

// ══════════════════════════════════════════════════════════════
//  BLOCO 1 — TESTES UNITÁRIOS (controlador isolado com mock do DB)
// ══════════════════════════════════════════════════════════════

describe('[UNITÁRIO] taskController — getTasks', () => {

  // Salvamos a referência original de db.all para restaurar após cada teste
  let originalDbAll;
  beforeEach(() => { originalDbAll = db.all; });
  afterEach(() => { db.all = originalDbAll; });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar lista de tarefas com status 200 (AAA)', async () => {
    // Arrange: mockar db.all para retornar duas tarefas fictícias
    db.all = jest.fn((_query, _params, callback) => {
      callback(null, [
        { id: 1, title: 'Tarefa A', status: 'pending',     priority: 'alta',  assigned_to: 'Ana',  deadline: '2027-01-01' },
        { id: 2, title: 'Tarefa B', status: 'in_progress', priority: 'média', assigned_to: 'Beto', deadline: '2027-06-15' },
      ]);
    });

    // Act: chamar a rota GET /api/tasks
    const response = await request(app).get('/api/tasks');

    // Assert: verificar status HTTP e estrutura do corpo
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('id', 1);
    expect(response.body[0]).toHaveProperty('title', 'Tarefa A');
    expect(response.body[1]).toHaveProperty('status', 'in_progress');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar status 500 quando o banco falha no GET (AAA)', async () => {
    // Arrange: mockar db.all para simular erro de banco
    db.all = jest.fn((_query, _params, callback) => {
      callback(new Error('Falha simulada no banco'), null);
    });

    // Act
    const response = await request(app).get('/api/tasks');

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao buscar tarefas.');
  });
});

// ──────────────────────────────────────────────────────────────
describe('[UNITÁRIO] taskController — createTask', () => {

  let originalDbRun;
  beforeEach(() => { originalDbRun = db.run; });
  afterEach(() => { db.run = originalDbRun; });

  // ──────────────────────────────────────────────────────────
  test('Deve criar tarefa e retornar status 201 com o id gerado (AAA)', async () => {
    // Arrange: mockar db.run para simular inserção bem-sucedida
    db.run = jest.fn(function (_query, _params, callback) {
      // Simula o contexto do SQLite onde `this.lastID` é definido
      callback.call({ lastID: 42 }, null);
    });
    const newTask = buildValidTask();

    // Act
    const response = await request(app).post('/api/tasks').send(newTask);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 42);
    expect(response.body).toHaveProperty('message', 'Tarefa criada com sucesso!');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar 400 quando campo obrigatório "title" está ausente (AAA)', async () => {
    // Arrange: omitir o campo title (obrigatório pela lógica do controller)
    const incompleteTask = buildValidTask({ title: undefined });

    // Act
    const response = await request(app).post('/api/tasks').send(incompleteTask);

    // Assert: a validação deve ocorrer ANTES de chamar o banco
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Campos obrigatórios ausentes.');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar 400 quando campo obrigatório "deadline" está ausente (AAA)', async () => {
    // Arrange
    const incompleteTask = buildValidTask({ deadline: undefined });

    // Act
    const response = await request(app).post('/api/tasks').send(incompleteTask);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campos obrigatórios ausentes.');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar 400 quando campo obrigatório "priority" está ausente (AAA)', async () => {
    // Arrange
    const incompleteTask = buildValidTask({ priority: undefined });

    // Act
    const response = await request(app).post('/api/tasks').send(incompleteTask);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campos obrigatórios ausentes.');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar 400 quando campo obrigatório "assigned_to" está ausente (AAA)', async () => {
    // Arrange
    const incompleteTask = buildValidTask({ assigned_to: undefined });

    // Act
    const response = await request(app).post('/api/tasks').send(incompleteTask);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campos obrigatórios ausentes.');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar 500 quando o banco falha no INSERT (AAA)', async () => {
    // Arrange: mockar db.run para simular erro de banco
    db.run = jest.fn(function (_query, _params, callback) {
      callback.call({}, new Error('Erro simulado de escrita no banco'));
    });
    const newTask = buildValidTask();

    // Act
    const response = await request(app).post('/api/tasks').send(newTask);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao criar a tarefa no banco.');
  });
});

// ──────────────────────────────────────────────────────────────
describe('[UNITÁRIO] taskController — updateTaskStatus', () => {

  let originalDbRun;
  beforeEach(() => { originalDbRun = db.run; });
  afterEach(() => { db.run = originalDbRun; });

  // ──────────────────────────────────────────────────────────
  test('Deve atualizar o status de uma tarefa e retornar 200 (AAA)', async () => {
    // Arrange: mockar db.run para simular update bem-sucedido
    db.run = jest.fn(function (_query, _params, callback) {
      callback.call({ changes: 1 }, null);
    });

    // Act
    const response = await request(app)
      .patch('/api/tasks/1/status')
      .send({ status: 'completed' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Status atualizado com sucesso.');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve retornar 500 quando o banco falha no UPDATE (AAA)', async () => {
    // Arrange: mockar db.run para lançar erro
    db.run = jest.fn(function (_query, _params, callback) {
      callback.call({}, new Error('Erro simulado de atualização'));
    });

    // Act
    const response = await request(app)
      .patch('/api/tasks/1/status')
      .send({ status: 'completed' });

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao atualizar tarefa.');
  });
});


// ══════════════════════════════════════════════════════════════
//  BLOCO 2 — TESTES DE INTEGRAÇÃO (banco SQLite real)
// ══════════════════════════════════════════════════════════════

describe('[INTEGRAÇÃO] GET /api/tasks — Listagem do Relatório', () => {

  // Arrange Global: limpar tarefas antes do grupo de testes
  beforeAll(() => clearTasks());
  afterAll(()  => clearTasks());

  // ──────────────────────────────────────────────────────────
  test('Deve retornar array vazio quando não há tarefas cadastradas (AAA)', async () => {
    // Arrange: tabela limpa (garantida pelo beforeAll)

    // Act
    const response = await request(app).get('/api/tasks');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────
  test('Deve listar as tarefas existentes com todos os campos esperados (AAA)', async () => {
    // Arrange: inserir uma tarefa diretamente no banco
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tasks (title, description, deadline, priority, assigned_to, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Revisar PR', 'Code review do módulo auth', '2027-03-01', 'média', 'Carla', 'pending'],
        (err) => (err ? reject(err) : resolve()),
      );
    });

    // Act
    const response = await request(app).get('/api/tasks');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const task = response.body.find((t) => t.title === 'Revisar PR');
    expect(task).toBeDefined();
    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('title',       'Revisar PR');
    expect(task).toHaveProperty('assigned_to', 'Carla');
    expect(task).toHaveProperty('priority',    'média');
    expect(task).toHaveProperty('status',      'pending');
    expect(task).toHaveProperty('deadline',    '2027-03-01');
  });
});

// ──────────────────────────────────────────────────────────────
describe('[INTEGRAÇÃO] POST /api/tasks — Criação de Tarefa', () => {

  beforeAll(() => clearTasks());
  afterAll(()  => clearTasks());

  // ──────────────────────────────────────────────────────────
  test('Deve criar uma nova tarefa com sucesso e retornar id gerado (AAA)', async () => {
    // Arrange: montar payload completo e válido
    const newTask = buildValidTask({
      title:       'Deploy em produção',
      assigned_to: 'DevOps Team',
    });

    // Act
    const response = await request(app).post('/api/tasks').send(newTask);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('number');
    expect(response.body).toHaveProperty('message', 'Tarefa criada com sucesso!');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve persistir a tarefa criada e torná-la visível no relatório (AAA)', async () => {
    // Arrange: criar tarefa via API
    const newTask = buildValidTask({
      title:       'Escrever documentação',
      assigned_to: 'Tech Writer',
      priority:    'baixa',
    });
    await request(app).post('/api/tasks').send(newTask);

    // Act: buscar todas as tarefas (simula a tela de relatório)
    const response = await request(app).get('/api/tasks');

    // Assert: a tarefa criada deve aparecer na listagem
    const found = response.body.find((t) => t.title === 'Escrever documentação');
    expect(found).toBeDefined();
    expect(found).toHaveProperty('assigned_to', 'Tech Writer');
    expect(found).toHaveProperty('priority',    'baixa');
    expect(found).toHaveProperty('status',      'pending'); // status padrão
  });

  // ──────────────────────────────────────────────────────────
  test('Deve rejeitar criação sem o campo "title" e não persistir nada (AAA)', async () => {
    // Arrange
    const invalidTask = buildValidTask({ title: '' }); // string vazia = falsy

    // Act
    const response = await request(app).post('/api/tasks').send(invalidTask);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Campos obrigatórios ausentes.');
  });
});

// ──────────────────────────────────────────────────────────────
describe('[INTEGRAÇÃO] PATCH /api/tasks/:id/status — Atualização de Status', () => {

  let createdTaskId;

  beforeAll(async () => {
    // Arrange Global: limpar tabela e criar tarefa base
    await clearTasks();
    const response = await request(app)
      .post('/api/tasks')
      .send(buildValidTask({ title: 'Tarefa para atualizar status' }));
    createdTaskId = response.body.id;
  });

  afterAll(() => clearTasks());

  // ──────────────────────────────────────────────────────────
  test('Deve atualizar status de "pending" para "in_progress" (AAA)', async () => {
    // Arrange: usar o id criado no beforeAll
    expect(createdTaskId).toBeDefined();

    // Act
    const response = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .send({ status: 'in_progress' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Status atualizado com sucesso.');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve refletir o novo status na listagem do relatório (AAA)', async () => {
    // Arrange: alterar para "completed"
    await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .send({ status: 'completed' });

    // Act: buscar a listagem (tela de relatório)
    const response = await request(app).get('/api/tasks');

    // Assert
    const updated = response.body.find((t) => t.id === createdTaskId);
    expect(updated).toBeDefined();
    expect(updated.status).toBe('completed');
  });
});

// ══════════════════════════════════════════════════════════════
//  BLOCO 3 — FLUXO COMPLETO (end-to-end do Relatório)
// ══════════════════════════════════════════════════════════════

describe('[INTEGRAÇÃO] Fluxo Completo — Ciclo de Vida de uma Tarefa no Relatório', () => {

  beforeAll(() => clearTasks());
  afterAll(()  => clearTasks());

  test('Deve criar, listar, atualizar e confirmar o relatório final (AAA)', async () => {
    /* ── ARRANGE ─────────────────────────────────────────── */
    // Definir a tarefa que vai percorrer o fluxo completo
    const taskPayload = buildValidTask({
      title:       'Feature: Exportação CSV',
      description: 'Implementar download de relatório em CSV',
      priority:    'alta',
      assigned_to: 'Maria Dev',
      deadline:    '2027-09-30',
    });

    /* ── ACT (etapa 1): Criar a tarefa ───────────────────── */
    const createResponse = await request(app)
      .post('/api/tasks')
      .send(taskPayload);

    // Assert intermediário: criação bem-sucedida
    expect(createResponse.status).toBe(201);
    const taskId = createResponse.body.id;
    expect(typeof taskId).toBe('number');

    /* ── ACT (etapa 2): Verificar no relatório ───────────── */
    const listAfterCreate = await request(app).get('/api/tasks');
    const taskInReport    = listAfterCreate.body.find((t) => t.id === taskId);

    // Assert: tarefa aparece na listagem com status inicial "pending"
    expect(taskInReport).toBeDefined();
    expect(taskInReport.title).toBe('Feature: Exportação CSV');
    expect(taskInReport.status).toBe('pending');
    expect(taskInReport.assigned_to).toBe('Maria Dev');

    /* ── ACT (etapa 3): Mover para "in_progress" ─────────── */
    const updateResponse = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'in_progress' });

    expect(updateResponse.status).toBe(200);

    /* ── ACT (etapa 4): Mover para "completed" ───────────── */
    await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'completed' });

    /* ── ACT (etapa 5): Confirmar estado final no relatório ─ */
    const listAfterComplete = await request(app).get('/api/tasks');
    const finalState        = listAfterComplete.body.find((t) => t.id === taskId);

    // Assert Final: o relatório deve refletir o status "completed"
    expect(finalState).toBeDefined();
    expect(finalState.status).toBe('completed');
    expect(finalState.title).toBe('Feature: Exportação CSV');
    expect(finalState.priority).toBe('alta');
  });

  // ──────────────────────────────────────────────────────────
  test('Deve exibir múltiplas tarefas de diferentes prioridades no relatório (AAA)', async () => {
    /* ── ARRANGE ─────────────────────────────────────────── */
    const tarefas = [
      buildValidTask({ title: 'Bug crítico no login',   priority: 'alta',  assigned_to: 'Rodrigo' }),
      buildValidTask({ title: 'Ajustar CSS do header',  priority: 'baixa', assigned_to: 'Lúcia'   }),
      buildValidTask({ title: 'Revisar banco de dados', priority: 'média', assigned_to: 'Carlos'  }),
    ];

    /* ── ACT: Criar todas as tarefas ─────────────────────── */
    for (const tarefa of tarefas) {
      const res = await request(app).post('/api/tasks').send(tarefa);
      expect(res.status).toBe(201);
    }

    /* ── ACT: Buscar o relatório ─────────────────────────── */
    const response = await request(app).get('/api/tasks');

    /* ── ASSERT ──────────────────────────────────────────── */
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);

    // Validar que cada tarefa criada aparece no relatório
    const titles = response.body.map((t) => t.title);
    expect(titles).toContain('Bug crítico no login');
    expect(titles).toContain('Ajustar CSS do header');
    expect(titles).toContain('Revisar banco de dados');
  });
});
