# Agendador Andreia 💅

Sistema de gestão completo para profissionais de beleza, focado em facilidade de uso, design mobile-first e instalação como aplicativo (PWA).

![Status](https://img.shields.io/badge/Status-Produção-success)
![Tech](https://img.shields.io/badge/Tech-Next.js_15-black)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

**🌐 Site**: https://agendador-andreia.vercel.app

---

## 🚀 Funcionalidades Principais

### 📅 Agenda & Financeiro
- **Agenda Inteligente**: Visualização diária de compromissos com status visuais (Pendente, Pago, Atrasado).
- **Carteira Digital (Wallet)**: Controle automático de créditos e dívidas por cliente.
- **Checkout Dinâmico**: Registro de pagamentos parciais, descontos, ou pagamentos a mais (crédito futuro).
- **Recebimento Avulso**: Registro de pagamentos de dívidas diretamente no perfil da cliente sem agendamento.
- **Relatórios avançados**: Ganhos por dia, mês e ano, top clientes e serviços mais lucrativos.

### 👥 Gestão de Clientes & Serviços
- **Histórico Completo**: Acesso rápido a visitas anteriores e saldo financeiro de cada cliente.
- **Múltiplos Serviços**: Adição de vários procedimentos no mesmo horário com cálculo automático.
- **Gestão de Pacotes**: Controle de sessões compradas e consumidas.
- **Notificações Push**: Lembretes automáticos 10 minutos antes de cada atendimento.

### 📱 Instalação & Uso
- **PWA (App)**: Instalável no Android e iOS como um aplicativo nativo.
- **Mobile-First**: Design otimizado para uso rápido no celular durante o dia de trabalho.
- **Bloqueio de Dias**: Gestão de folgas e feriados com prevenção de conflitos de horário.

---

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide React.
- **Backend/DB**: Prisma ORM, Supabase (PostgreSQL).
- **Segurança**: NextAuth v5 (Auth.js) com Roles (ADMIN/USER).
- **Notificações**: Firebase Cloud Messaging (FCM).

---

## 📅 Histórico de Evolução (Roadmap Concluído)

> ✅ **Backlog 100% limpo!** Todos os issues registrados foram implementados.

**Destaques de Abril/2026:**
- **Sistema de Carteira Digital**: Implementado tracking de dívidas e créditos em dinheiro por cliente.
- **Dashboard de Produção**: Relatórios financeiros agora usam o valor real recebido após descontos/acréscimos.
- **Correção de Timezone**: Bloqueio de dias sincronizado corretamente (Brasil UTC-3).
- **Audit Logs**: Histórico financeiro detalhado no perfil de cada cliente.

---

## 🔐 Segurança & Boas Práticas
- ✅ Senhas com hash bcrypt.
- ✅ Middleware de proteção de rotas privadas.
- ✅ Todas as chaves e tokens protegidos em variáveis de ambiente (Vercel Secrets).
- ✅ Backup automático diário via cron-job de dados em JSON.

---

## 👏 Créditos

Desenvolvido com ❤️ para **Andreia**  
Arquitetura e desenvolvimento: **Eric Macedo**

**Stack moderna • Layout Premium • Controle Total**
