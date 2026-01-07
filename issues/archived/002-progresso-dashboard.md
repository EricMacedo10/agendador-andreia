# Progresso - Dashboard e Clientes

**Data:** 10/12/2025
**Status:** Em Desenvolvimento 🚧

## ✅ Concluído Hoje

1.  **Conexão com Banco de Dados (Supabase)**
    *   Resolvido problema de conexão IPv4 usando o *Session Pooler* (porta 6543/5432).
    *   Migração inicial (`init`) rodada com sucesso.
    *   Tabelas Criadas: `User`, `Client`, `Service`, `Appointment`.

2.  **Dashboard (PWA / Mobile First)**
    *   Criada estrutura de layout (`/src/app/dashboard/layout.tsx`).
    *   **Navegação Mobile:** Barra inferior fixa estilo aplicativo.
    *   **Sidebar:** Menu lateral para visualização em Desktop.
    *   **Tela Inicial:** Cards de resumo (Ganhos, Agendamentos) e atalhos rápidos.

3.  **Funcionalidade de Clientes**
    *   Server Actions criadas em `src/app/actions/clients.ts`.
    *   Página de Listagem (`/dashboard/clients`): Mostra todos os clientes.
    *   Página de Cadastro (`/dashboard/clients/new`): Formulário funcional conectado ao banco.

4.  **Correções Técnicas**
    *   Resolvido erro `PrismaClientInitializationError` implementando padrão Singleton em `src/lib/prisma.ts`.

## ⚠️ Pontos de Atenção / Próximos Passos

1.  **Botão Editar:** A listagem de clientes tem um botão "Ver" que ainda não faz nada. Precisa implementar a edição.
2.  **Validação:** O formulário de clientes aceita qualquer coisa por enquanto. Adicionar validação de telefone.
3.  **Deploy:** Futuramente configurar Vercel + Supabase (Variáveis de Ambiente).

## Como Rodar

```bash
cd web
npm run dev
# Acessar: http://localhost:3000/dashboard (ou porta 3001 se avisado)
```
