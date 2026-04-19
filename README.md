# Task Manager (Software-Base de Disciplina de Testes)

Bem-vindo ao repositório do **Task Manager**, um software construído como estudo de caso prático para a aplicação de técnicas de teste de software (Unidade, Integração, Sistema e Aceitação) com ênfase no padrão **AAA (Arrange, Act, Assert)**.

## 🚀 Tecnologias e Stack

A arquitetura do projeto foi pensada de maneira simplificada (Monorepo) para que qualquer membro da equipe consiga executá-lo com apenas 1 comando e sem instalar bancos de dados na máquina (Zero-Config Database).

- **Frontend (Interface):** [React.js](https://react.dev/) com [Vite](https://vitejs.dev/) e CSS Vanilla Moderno (Glassmorphism).
- **Backend (API):** [Node.js](https://nodejs.org/en) com [Express](https://expressjs.com/).
- **Banco de Dados:** [SQLite](https://sqlite.org/) (In-file db salvo na própria pasta do projeto).
- **Testes Base (Futuro):** Vitest + React Testing Library (Front) | Jest + Supertest (Back).

## 🛠️ Requisitos de Software Suportados

Este projeto atende ao fluxo **Core** do Algoritmo propostos na disciplina:
1. Tela de Login com validações de Acesso.
2. Painel Principal (Kanban-style) listando todas as tarefas dinamicamente de acordo com o status (Pendente, Em andamento, Concluída).
3. Formulário Integrado de Tarefas com validação rigorosa de formato de data e regras como obrigatoriedade de inputs e "apenas datas futuras".
4. Relatório em Tela de todas as tarefas acompanhado de um recurso de exportação para "CSV".

## 📦 Como Instalar e Rodar na sua Máquina

Certifique-se de ter o **Node.js** (versão 18+) instalado na máquina.
Por termos um arquivo orquestrador \`package.json\` na raiz, você não precisa ficar navegando entre pastas no terminal.

**1. Clone e entre na pasta do projeto:**
\`\`\`bash
git clone https://github.com/Pacheco-15/Bes-22-Web.git
cd Web
\`\`\`

**2. Instale TODAS as dependências (Front e Back) com um atalho:**
\`\`\`bash
npm run install:all
\`\`\`

**3. Execute toda a aplicação:**
\`\`\`bash
npm run dev
\`\`\`
*(O frontend estará acessível em `http://localhost:5173` e a API rodando nos bastidores em `http://localhost:3001`)*

## 🔐 Credenciais Padrão (Ambiente de Testes)

O Banco de Dados é automaticamente construído e populado ("semeado") na primeira vez que a aplicação do Backend liga. Use essa conta oficial para testes rápidos do professor/alunos:

- **E-mail:** `admin@email.com`
- **Senha:** `123456`

## 🧪 Roteiro de Testes (Próximos Passos)

Em breve, esta aplicação receberá a suíte completa de engenharia de testes focados onde você verá a anatomia **AAA**:
- **Arrange (Preparar):** Vamos instanciar os objetos e o servidor.
- **Act (Agir):** Vamos chamar as rotas de API via Supertest e simular \`clicks\` na UI.
- **Assert (Afirmar):** Confirmações com \`expect()\` focando nos resultados corretos gerados.
