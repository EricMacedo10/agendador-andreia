# Agendador Andreia 💅

Sistema de gestão completo para profissionais de beleza, focado em facilidade de uso, design mobile-first e instalação como aplicativo (PWA).

![Status](https://img.shields.io/badge/Status-Finalizado-success)
![Tech](https://img.shields.io/badge/Tech-Next.js%20%7C%20Prisma%20%7C%20Tailwind-blue)

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
- Registro de pagamentos (PIX, Dinheiro, Cartão).
- Resumo diário de ganhos.

### 📱 Mobile (PWA)
- Instalável no celular (Android/iOS).
- Ícone personalizado.
- Funciona como um aplicativo nativo.

## 🛠️ Tecnologias

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/).
- **Backend**: API Routes (Next.js), [Prisma ORM](https://www.prisma.io/).
- **Banco de Dados**: PostgreSQL (Supabase).
- **Autenticação**: NextAuth.js v5.

## 📦 Como Rodar Localmente

1. **Clone o repositório** (ou baixe o código):
   ```bash
   git clone https://github.com/SEU_USUARIO/agendador-andreia.git
   cd agendador-andreia/web
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o Banco de Dados**:
   - Crie um arquivo `.env` na pasta `web`.
   - Adicione sua `DATABASE_URL` e `NEXTAUTH_SECRET`.
   - Rode as migrações:
     ```bash
     npx prisma db push
     ```

4. **Inicie o Servidor**:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## 🚀 Deployment

Este projeto está configurado para deploy na **Vercel**.
Veja o arquivo `DEPLOY_GUIDE.md` para instruções detalhadas.

---
Desenvolvido com ❤️ para Andreia.
