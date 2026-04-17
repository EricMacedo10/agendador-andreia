# Agendador Andreia 💅

Sistema de gestão completo para profissionais de beleza, focado em facilidade de uso, design mobile-first e instalação como aplicativo (PWA).

![Status](https://img.shields.io/badge/Status-Produção-success)
![Tech](https://img.shields.io/badge/Tech-Next.js_15-black)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

**🌐 Site**: https://agendador-andreia.vercel.app

---

## 🚀 Funcionalidades

### 📅 Agenda Inteligente
- Visualização diária de compromissos
- Agendamento rápido com cálculo automático de duração
- Status visuais: Pendente (🟠), Pago (💰), Atrasado (⚠️)
- Edição rápida de agendamentos
- Confirmação de pagamento com registro de método

### 👥 Gestão de Clientes
- Cadastro completo (nome, telefone, observações)
- Histórico de agendamentos
- Edição e exclusão de clientes
- Busca e filtros

### 💼 Serviços Personalizados
- Cadastro de procedimentos com preço e duração
- Imagens personalizadas para cada serviço
- Controle de visibilidade (mostrar/ocultar na página de agendamento)
- Upload de fotos em Base64 (sem custos de storage)

### 💰 Financeiro Simplificado
- Resumo de ganhos (Diário, Mensal)
- Filtros por data
- Registro de métodos de pagamento (PIX, Dinheiro, Cartão)

### 🔒 Controle de Acesso
- Autenticação obrigatória com NextAuth v5
- Sistema de roles (ADMIN/USER)
- Middleware de proteção de rotas
- Sessões seguras

### 📱 Progressive Web App (PWA)
- **Instalável** no Android e iOS
- Funciona como app nativo
- Ícone personalizado na tela inicial
- Splash screen branded
- Suporte offline (futuro)

### 🔄 Múltiplos Serviços
- Adicionar vários serviços em um único agendamento
- Cálculo automático de duração e preço total
- Visualização clara na agenda com todos os serviços
- Suporte completo na página de agendamento online
- Histórico de preços (snapshot no momento do agendamento)

### 🚫 Bloqueio de Dias
- Bloquear dias inteiros (férias, feriados)
- Bloqueios parciais (apenas manhã ou tarde)
- Integração automática com agenda online
- Avisos de conflito com agendamentos existentes
- Visualização destacada na agenda

### 📊 Relatórios Avançados
- Análise financeira por ano (atual e anterior)
- Top 10 clientes VIP com histórico completo
- Serviços mais realizados e mais lucrativos
- Breakdown mensal detalhado
- Análise por forma de pagamento

### 💾 Backup e Restauração
- Exportação completa de dados em JSON
- Restauração de backups anteriores
- Backup automático diário via cron-job.org
- Download manual a qualquer momento

### 🔔 Notificações Push
- Lembretes automáticos 10 minutos antes
- Notificações via Firebase Cloud Messaging
- Suporte para Android e iOS
- Sistema de auto-sync de tokens

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **React**: Latest
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **API**: Next.js API Routes
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js v5](https://authjs.dev/)

### Database
- **Provider**: [Supabase](https://supabase.com/)
- **Type**: PostgreSQL

### Deploy
- **Hosting**: [Vercel](https://vercel.com/)
- **CI/CD**: Automatic deployments from GitHub

---

## 📦 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (banco de dados)
- Git configurado

### 1. Clone o Repositório
```bash
git clone https://github.com/EricMacedo10/agendador-andreia.git
cd agendador-andreia/web
```

### 2. Instale Dependências
```bash
npm install
```

### 3. Configure Variáveis de Ambiente

Crie um arquivo `.env` na pasta `web` com:

```env
# Database (Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aleatoria"
NEXTAUTH_URL="http://localhost:3000"
```

**⚠️ IMPORTANTE**: Nunca commite o arquivo `.env`! Ele já está no `.gitignore`.

### 4. Execute Migrations
```bash
npx prisma migrate dev
```

### 5. (Opcional) Seed do Banco
```bash
npx prisma db seed
```

### 6. Inicie o Servidor
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🗂️ Estrutura do Projeto

```
agendador-andreia/
├── web/                          # Aplicação Next.js
│   ├── prisma/
│   │   └── schema.prisma         # Schema do banco de dados
│   ├── public/
│   │   ├── icons/                # Ícones PWA
│   │   └── manifest.json         # PWA manifest
|   ├── src/
│   │   ├── app/                  # App Router (Next.js 15)
│   │   │   ├── api/              # API Routes
│   │   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── book/             # Página de agendamento público
│   │   │   └── page.tsx          # Home/Login
│   │   ├── components/           # Componentes React
│   │   ├── lib/                  # Utilidades
│   │   ├── auth.ts               # Configuração NextAuth
│   │   └── middleware.ts         # Proteção de rotas
│   └── package.json
├── docs/                         # Documentação Técnica
│   ├── README.md                 # Este guia mestre
│   ├── FEATURES.md               # Lista detalhada de funcionalidades
│   ├── PACKAGE_SYSTEM.md         # Guia do sistema de pacotes/créditos
│   ├── DEPLOYMENT.md             # Instruções de implantação
│   ├── SKILL_SENIOR_WORKFLOW.md  # Filosofia de desenvolvimento
│   └── history/                  # Histórico de desenvolvimento
│       └── legacy-site/          # Arquivos do protótipo antigo
├── package.json
└── README.md                     # Redirecionamento para docs/README.md
```

---

## 🔧 Pendências e Roadmap

> ✅ **Backlog limpo!** Todos os issues registrados foram implementados e estão em produção.

**Últimas implementações concluídas (Abril/2026):**
- Sistema de Carteira Digital por cliente (créditos e dívidas financeiras)
- Dashboard com valor real cobrado (`paidPrice`) em vez do preço de tabela
- Edição de serviços em agendamentos existentes sem erros
- Logout corrigido (sem loop de redirecionamento)
- Cálculo proporcional de receita por serviço (distribuição por peso no checkout)

---

## 📅 Histórico de Evolução

- **[Lista de Funcionalidades](file:///c:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/docs/FEATURES.md)**: Explore o que o sistema é capaz de fazer hoje em 100% de produção.
- **[Arquivo Histórico](file:///c:/Users/ericm/OneDrive/%C3%81rea%20de%20Trabalho/PESSOAL/Agendador%20Andreia/docs/history/)**: Acesse a documentação de issues antigas, migrações de banco e o protótipo inicial (`legacy-site`).


---

## 🚀 Deploy

### Vercel (Produção)

O projeto está configurado para deploy automático:

1. **Push para GitHub** → Deploy automático na Vercel
2. **Deploy Manual**:
   ```bash
   npx vercel deploy --prod
   ```

### Configuração na Vercel

1. **Root Directory**: `web`
2. **Build Command**: `npm run build`
3. **Environment Variables**: Configure as mesmas do `.env`

---

## 🔐 Segurança

### Implementações de Segurança
- ✅ Senhas com hash bcrypt
- ✅ Autenticação obrigatória via NextAuth v5
- ✅ Middleware de proteção de rotas
- ✅ Sistema de roles (ADMIN/USER)
- ✅ Variáveis sensíveis em `.env` (não commitado)
- ✅ CORS configurado adequadamente
- ✅ Validação de dados no backend
- ✅ Headers de segurança HTTP
- ✅ Proteção contra XSS
- ✅ Rate limiting básico

### Melhorias Futuras
- [ ] Rate limiting avançado (Redis)
- [ ] Audit logs detalhados
- [ ] 2FA para administradores
- [ ] Backup automático criptografado

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev (localhost:3000)

# Build
npm run build            # Build para produção
npm start                # Inicia servidor de produção

# Prisma
npx prisma studio        # Interface visual do banco
npx prisma migrate dev   # Criar/aplicar migrations
npx prisma generate      # Gerar cliente Prisma
```

---

## 📅 Changelog

### v1.1.0 - 2026-01-23
- **[FIX]** Correção no cálculo de "Top 5 Serviços" e relatórios financeiros:
    - Implementada lógica de "Price Snapshot" nos serviços de um agendamento.
    - Alterações no valor total do agendamento agora são distribuídas proporcionalmente entre os serviços.
    - Garante precisão nos relatórios de "Serviços Mais Lucrativos" mesmo após descontos/acréscimos manuais.
- **[SECURITY]** Auditoria de segurança e limpeza de logs/scripts de teste.

---

## ⚠️ Problemas Conhecidos (Known Issues)

### Notificações Push (Firebase)
- **Status:** Implementado, mas instável.
- **Sintoma:** Usuário vê "Ativadas" mas não recebe notificações, ou recebe erro "No FCM token found" mesmo com permissão.
- **Causa:** Desincronização entre navegador e service worker, ou limitações de entrega do plano gratuito do Firebase/Vercel.
- **Workaround:** Sistema de auto-sync implementado para tentar recuperar o token ao recarregar a página.
- **Solução Definitiva:** Necessária investigação aprofundada futura para robustez total ou troca de provedor.

## 🐛 Troubleshooting


### Erro de Deploy no Vercel
```
```
Error: The provided path ".../web/web" does not exist
```
→ **Solução**: Execute `npx vercel deploy --prod` da **pasta raiz**, não de `/web`

### Build Error: Prisma não encontrado
→ **Solução**: Execute `npx prisma generate` antes do build

### Login não funciona
→ **Verifique**: `NEXTAUTH_SECRET` e `NEXTAUTH_URL` estão configurados

---

## 📄 Licença

Este projeto é privado e desenvolvido especificamente para uso pessoal.

---

## 👏 Créditos

Desenvolvido com ❤️ para **Andreia**  
Arquitetura e desenvolvimento: **Eric Macedo**

**Stack moderna • Zero custos • 100% funcional**
# Trigger deploy
