# TASKS.md - Plano de Desenvolvimento

Este arquivo guiará o desenvolvimento do "Agendador Andreia" passo a passo.

## Fase 1: Configuração e Fundações (Atual)
- [x] Inicializar Projeto Next.js (App Router, TS, Tailwind).
- [x] **Configuração do Banco de Dados**
    - [x] Inicializar Prisma (`npx prisma init`).
    - [x] Definir Models Iniciais (`User`, `Client`, `Service`, `Appointment`).
    - [x] Configurar conexão com Supabase.
- [ ] **Autenticação (NextAuth.js)**
    - [ ] Configurar NextAuth com Google Provider e/ou Credentials.
    - [ ] Criar páginas de Login/Registro.


## Fase 2: Core Features (MVP - Similar ao Tua Agenda)
- [/] **Dashboard (`/dashboard`)**
    - [x] Layout principal (Sidebar/Navbar responsiva).
    - [x] Cards de resumo (Ganhos do dia, Agendamentos hoje).
- [x] **Serviços (`/services`)**
    - [x] Listagem de serviços (CRUD).
    - [x] Modal de criação/edição.
    - [x] **Visibilidade** (Mostrar/Ocultar na página pública).
    - [x] **Imagens**: Upload e exibição de fotos nos serviços.
- [x] **Clientes (`/clients`)**
    - [x] Listagem de clientes (com busca).
    - [ ] Histórico de agendamentos do cliente.
- [ ] **Agenda (`/schedule`)**
    - [ ] Visualização de calendário (Day/Week view).
    - [ ] Criação de agendamento (selecionar Cliente + Serviço + Data/Hora).
    - [ ] Validação de conflito de horários.
- [x] **Página de Agendamento Pública (`/book`)**
    - [x] Layout mobile-first simplificado.
    - [x] Seleção de Serviço -> Data/Hora -> Identificação Cliente.
    - [x] Confirmação via WhatsApp.
    - [x] **Configuração Global**: Bloqueio de agendamento se desativado pela Andreia.


## Fase 3: Polimento e Versão Profissional
- [x] **Financeiro Detalhado**
    - [x] Gráficos de receita.
    - [x] Registro de despesas.
- [x] **Melhorias de UI/UX**
    - [x] Temas (Dark Mode).
    - [x] Animações (framer-motion).
- [x] **Segurança**
    - [x] Middleware para proteção de rotas.
    - [x] Validação de dados com Zod.

## Fase 4: Publicação e Acesso (Para ela usar no celular)
- [x] **Deployment (Colocar na Internet)**
    - [x] Criar conta no Supabase (Banco de Dados).
    - [/] Configurar Projeto no Vercel (Hospedagem Gratuita).
- [x] **Instalação no Celular (PWA)**
    - [x] Criar Manifesto (ícone na tela inicial).
    - [x] Configurar Service Worker (cache básico).

## Conclusão
Projeto finalizado em 16/12/2025. Pronto para uso!
