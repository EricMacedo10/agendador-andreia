# Situação Atual - Configuração Inicial

**Status:** Parcialmente Concluído
**Data:** 09/12/2025

## O que foi feito
1.  **Stack Definida:** Next.js, Tailwind, Prisma, Supabase, NextAuth.
2.  **Projeto Inicializado:** Pasta `web` criada com Next.js App Router.
3.  **Banco de Dados:** Prisma inicializado e Schema (User, Client, Service, Appointment) validado.
4.  **Dependências:** Instaladas (Lucide, Tailwind, etc).

## Bloqueios / Pendências
- [ ] **Configuração do Supabase:** Precisamos da `DATABASE_URL` para conectar o Prisma ao banco real.
- [ ] **Middleware de Autenticação:** Não configurado ainda.

## Próximos Passos (Retomada)
1.  Configurar variáveis de ambiente (`.env`) com dados do Supabase.
2.  Rodar a primeira migração: `npx prisma migrate dev`.
3.  Iniciar desenvolvimento do **Dashboard** e **Cadastro de Clientes**.

## Observações
- O projeto segue estrutura Monorepo (pasta `web` contém o frontend/backend).
- Foco em Mobile First para uso no celular.
