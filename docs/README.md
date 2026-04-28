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
- **Controle de Inadimplência**: Painel exclusivo para monitoramento de clientes com saldo devedor e atrasos.
- **Relatórios Avançados**: Ganhos cruzados (agendamentos + pagamentos manuais), top clientes e ticket médio em tempo real.

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

**Destaques Recentes (2026):**
- **Sistema de Carteira Digital**: Implementado tracking de dívidas e créditos em dinheiro por cliente.
- **Painel de Inadimplência**: Automação de relatórios para cobrança ativa de dívidas.
- **Dashboard de Faturamento**: Algoritmo reescrito para incluir quitações manuais e pagamentos retroativos no balanço mensal/anual.
- **Correção de Timezone**: Bloqueio de dias sincronizado rigorosamente (Brasil UTC-3).
- **Audit Logs Financeiros**: Histórico transacional detalhado e irreversível no perfil de cada cliente.

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

---

## 📜 Histórico e Legado
O projeto nasceu de uma interface estética minimalista que evoluiu para este sistema completo.  
Consulte o [Histórico de Evolução](docs/HISTORY.md) para detalhes sobre a transição do site legado.

**Stack moderna • Layout Premium • Controle Total**
