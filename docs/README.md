# Agendador da Andreia 💇‍♀️

Sistema de gestão para salão de beleza focado em uso mobile (PWA).

## 🚀 Como Rodar o Projeto

1.  **Pré-requisitos:** Node.js instalado.
2.  **Configuração Inicial:**
    *   Certifique-se de ter o arquivo `.env` na pasta `web` com as credenciais do Supabase (NUNCA commite este arquivo).
3.  **Instalar Dependências:**
    ```bash
    cd web
    npm install
    ```
4.  **Rodar o Banco de Dados (Migrações):**
    ```bash
    npx prisma migrate dev
    ```
5.  **Iniciar o Servidor:**
    ```bash
    npm run dev
    ```
    Acesse: [http://localhost:3000](http://localhost:3000) (ou a porta indicada no terminal).

## 📱 Funcionalidades Atuais
*   **Dashboard Mobile:** Resumo do dia, botões de ação rápida.
*   **Gestão de Clientes:** Cadastro e listagem de clientes integrados ao Banco de Dados.

## 🛠️ Tecnologias
*   Next.js 15 (App Router)
*   Tailwind CSS
*   Prisma ORM
*   Supabase (PostgreSQL)

---
*Documentação detalhada em `/docs` e `/issues`.*
