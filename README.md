# Agendador Andreia 💅

Sistema de gestão completo para profissionais de beleza, focado em facilidade de uso, design mobile-first e instalação como aplicativo (PWA).

![Status](https://img.shields.io/badge/Status-Finalizado-success)
![Tech](https://img.shields.io/badge/Tech-Next.js_15-black)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)

## 🚀 Funcionalidades

### 📅 Agenda Inteligente
- Visualização diária de compromissos.
- Agendamento rápido com cálculo automático de duração.
- Status visuais: Pendente, Confirmado, Concluído (Pago).

### 👥 Gestão de Clientes e Usuários
- **Cadastro de Clientes**: Histórico e contatos.
- **Controle de Acesso**: Níveis de permissão `ADMIN` (Controle Total) e `USER`.
- **Página de Configuração**: Gestão de usuários do sistema.

### 💰 Financeiro Simplificado
- Registro de pagamentos (Diário, Semanal, Mensal).
- Resumo de ganhos e despesas.

### 📱 Mobile (PWA)
- Instalável no celular (Android/iOS).
- Ícone personalizado e tela de abertura (Splash Screen).
- Funciona como aplicativo nativo.

## 🛠️ Tecnologias

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/).
- **Backend**: API Routes (Next.js), [Prisma ORM](https://www.prisma.io/).
- **Banco de Dados**: PostgreSQL (Supabase).
- **Autenticação**: NextAuth.js v5.

## 📦 Como Rodar Localmente (Desenvolvimento)

Para rodar este projeto no seu computador:

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/EricMacedo10/agendador-andreia.git
   cd agendador-andreia/web
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**:
   - Duplique o arquivo `.env.example` (se existir) ou crie um novo `.env`.
   - **IMPORTANTE**: Nunca compartilhe este arquivo.
   - Variáveis necessárias:
     ```env
     DATABASE_URL="sua_url_de_conexao_do_supabase"
     DIRECT_URL="sua_url_direta_do_supabase"
     NEXTAUTH_SECRET="sua_chave_secreta_gerada"
     ```

4. **Inicie o Servidor**:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## 🔒 Segurança

- **Credenciais**: Nunca suba o arquivo `.env` para o GitHub. Ele já está listado no `.gitignore`.
- **Vercel**: Configure as variáveis de ambiente diretamente no painel da Vercel em "Project Settings" > "Environment Variables".

---
Desenvolvido com ❤️ para Andreia.
