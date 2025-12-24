# 📅 Agendador Andreia

Sistema de gestão completo para profissionais de beleza, focado em agendamentos, gestão financeira e controle de clientes (CRM). Desenvolvido com foco em **Mobile First** e performance.

## 🚀 Funcionalidades

### 🗓️ Agenda Inteligente
- Visualização diária organizada.
- Criação e edição rápida de agendamentos.
- **Detecção de Conflitos**: Impede agendamentos duplicados.
- **Check-in Financeiro**: Finalize atendimentos indicando forma de pagamento (Pix, Dinheiro, Cartão) e valor.

### 💰 Gestão Financeira Completa
- **Dashboard Financeiro**: Gráficos de receita mensal, ticket médio e serviços mais rentáveis.
- **Alertas de Pagamento Pendente**: O sistema avisa quem foi atendido mas ainda não pagou.
- Controle de receita por método de pagamento (Pix vs Cartão vs Dinheiro).

### 👥 CRM (Gestão de Clientes)
- Perfil detalhado de cada cliente.
- Histórico completo de atendimentos.
- Cálculo automático do LTV (Lifetime Value) - quanto o cliente já gastou com você.

### 📱 Experiência do Cliente (PWA)
- Página pública de agendamento online (`/book`).
- Os clientes podem agendar horários sozinhos.
- **PWA Instalável**: O sistema pode ser instalado no celular como um aplicativo nativo.

### 🔔 Notificações Push (Firebase Cloud Messaging)
- **Alertas Automáticos**: 10 minutos antes de cada atendimento.
- **Funciona com App Fechado**: Service Worker + Firebase Messaging.
- **Mensagem Personalizada**: Inclui nome do cliente.
- **Totalmente Gratuito**: Firebase Cloud Messaging tier gratuito.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15+** (App Router)
- **TypeScript**
- **Prisma ORM** (PostgreSQL)
- **TailwindCSS** (Estilização Moderna)
- **Lucide React** (Ícones)
- **Recharts** (Gráficos Financeiros)
- **NextAuth.js** (Segurança e Login)
- **Firebase Cloud Messaging** (Notificações Push)
- **LRU Cache** (Rate Limiting)

---

## ⚙️ Configuração para Desenvolvimento

Para rodar este projeto na sua máquina, siga os passos abaixo:

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/agendador-andreia.git
cd agendador-andreia/web
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz da pasta `web` e preencha com suas chaves (não compartilhe este arquivo!):

```env
# Conexão com Banco de Dados (PostgreSQL - Ex: Supabase, NeonDB, Docker Local)
DATABASE_URL="postgresql://user:password@host:5432/db_name?schema=public"

# Segredo para Autenticação (Gere um hash aleatório)
AUTH_SECRET="seu_segredo_super_seguro_aqui"

# URL da Aplicação
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Firebase Cloud Messaging (Notificações Push)
NEXT_PUBLIC_FIREBASE_API_KEY="sua_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu_projeto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu_projeto_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu_projeto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456:web:abc123"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="sua_vapid_key"

# Firebase Admin SDK (Backend)
FIREBASE_ADMIN_PROJECT_ID="seu_projeto_id"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk@seu_projeto.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cron Job Secret
CRON_SECRET="secret_super_seguro_para_cron"
```

### 4. Configurar o Banco de Dados
```bash
# Cria as tabelas no banco de dados
npx prisma db push

# (Opcional) Popula com dados iniciais se houver seed
npx prisma db seed
```

### 5. Rodar o Servidor
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔒 Segurança

### Proteções Implementadas:
- ✅ **Autenticação**: NextAuth.js nas rotas administrativas
- ✅ **Rate Limiting**: Proteção contra spam e DDoS (LRU Cache)
- ✅ **HTTP Security Headers**: 8 headers de segurança (CSP, HSTS, X-Frame-Options, etc)
- ✅ **API Protection**: Auth + rate limiting em endpoints sensíveis
- ✅ **Cron Protection**: Secret + rate limiting no cron job

### Rotas:
- `/dashboard/*` - Protegido (requer login)
- `/book` - Público (para clientes)
- `/api/notifications/*` - Protegido (auth + rate limiting)
- `/api/cron/*` - Protegido (secret + rate limiting)

**Grade de Segurança Esperada:** A/A+ (verificar em [securityheaders.com](https://securityheaders.com))

---

## 📚 Documentação

Para mais informações sobre configuração e troubleshooting, veja a pasta `.gemini/antigravity/brain/` com guias detalhados.

---

## 📝 Licença

Este projeto é de uso privado.
