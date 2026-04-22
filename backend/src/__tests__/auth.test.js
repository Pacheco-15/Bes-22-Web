const request = require('supertest');
const app = require('../index');
const db = require('../db');
const bcrypt = require('bcryptjs');

describe('Fluxo de Autenticação - Login', () => {
  
  // Arrange Inicial: Garantir que o ambiente está limpo ou com o usuário necessário
  beforeAll((done) => {
    const hashedPassword = bcrypt.hashSync("123456", 8);
    // Inserimos o usuário de teste caso ele não exista
    db.run('INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)', 
      ['admin@email.com', hashedPassword], 
      () => done()
    );
  });

  test('Deve realizar login com sucesso seguindo o padrão AAA', async () => {
    // Arrange (Preparar): Definir as credenciais válidas que foram configuradas no beforeAll
    const credentials = {
      email: 'admin@email.com',
      password: '123456'
    };

    // Act (Agir): Chamar a rota de login da API via Supertest
    const response = await request(app)
      .post('/api/login')
      .send(credentials);

    // Assert (Afirmar): Verificar se o status é 200 e se os dados retornados estão corretos
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.message).toBe('Login bem sucedido');
    expect(response.body.user.email).toBe('admin@email.com');
  });

  test('Deve retornar erro para senha inválida seguindo o padrão AAA', async () => {
    // Arrange (Preparar): Definir credenciais com uma senha propositalmente incorreta
    const credentials = {
      email: 'admin@email.com',
      password: 'senha_errada'
    };

    // Act (Agir): Chamar a rota de login
    const response = await request(app)
      .post('/api/login')
      .send(credentials);

    // Assert (Afirmar): Verificar se o status é 401 (Unauthorized) e a mensagem de erro específica
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Senha inválida');
  });

  test('Deve retornar erro para usuário não encontrado seguindo o padrão AAA', async () => {
    // Arrange (Preparar): Definir um email que não existe no banco de dados
    const credentials = {
      email: 'naoexiste@email.com',
      password: '123456'
    };

    // Act (Agir): Chamar a rota de login
    const response = await request(app)
      .post('/api/login')
      .send(credentials);

    // Assert (Afirmar): Verificar se o status é 401 e se a mensagem indica usuário inexistente
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Usuário não encontrado');
  });
});
