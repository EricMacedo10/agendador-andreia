# Guia de Deployment - Agendador Andreia

**Última atualização**: 2026-01-07

---

## 📋 Pré-requisitos

### Contas Necessárias
- [ ] Conta GitHub (repositório do código)
- [ ] Conta Vercel (hospedagem)
- [ ] Conta Supabase (banco de dados PostgreSQL)
- [ ] Conta Firebase (notificações push - opcional)
- [ ] Conta cron-job.org (backups automáticos - opcional)

### Ferramentas Locais
- Node.js 18+ instalado
- Git configurado
- Vercel CLI (opcional): `npm i -g vercel`

---

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Preencha:
   - **Name**: agendador-andreia
   - **Database Password**: Gere uma senha forte
   - **Region**: South America (São Paulo)
4. Aguarde criação do projeto (~2 minutos)

### 2. Obter Strings de Conexão

No painel do Supabase:
1. Vá em **Settings** → **Database**
2. Copie as connection strings:

**Connection Pooling** (para Vercel):
```
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Direct Connection** (para migrations):
```
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### 3. Executar Migrations

No seu ambiente local:

```bash
cd web

# Configurar .env.local com as URLs acima
echo 'DATABASE_URL="sua-connection-pooling-url"' > .env.local
echo 'DIRECT_URL="sua-direct-connection-url"' >> .env.local

# Executar migrations
npx prisma migrate deploy

# (Opcional) Popular com dados iniciais
npx prisma db seed
```

---

## 🚀 Deploy na Vercel

### Método 1: Via Interface Web (Recomendado)

#### 1. Conectar Repositório

1. Acesse https://vercel.com
2. Clique em "Add New..." → "Project"
3. Importe o repositório GitHub: `EricMacedo10/agendador-andreia`
4. Clique em "Import"

#### 2. Configurar Projeto

**Framework Preset**: Next.js  
**Root Directory**: `web`  
**Build Command**: `npm run build` (padrão)  
**Output Directory**: `.next` (padrão)

#### 3. Configurar Variáveis de Ambiente

Clique em "Environment Variables" e adicione:

```bash
# Database
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_SECRET=sua-chave-secreta-aleatoria-aqui
NEXTAUTH_URL=https://agendador-andreia.vercel.app

# Firebase (Opcional - Notificações)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=agendador-andreia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=agendador-andreia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=agendador-andreia.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNxxx...

FIREBASE_ADMIN_PROJECT_ID=agendador-andreia
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@agendador-andreia.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE..."
```

> **⚠️ IMPORTANTE**: 
> - Gere `NEXTAUTH_SECRET` com: `openssl rand -base64 32`
> - Todas as variáveis devem estar em **Production**, **Preview** e **Development**

#### 4. Deploy

1. Clique em "Deploy"
2. Aguarde build (~2-3 minutos)
3. Acesse a URL gerada (ex: `agendador-andreia.vercel.app`)

---

### Método 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (primeira vez)
cd web
vercel

# Deploy para produção
vercel --prod
```

---

## ⚙️ Configuração Pós-Deploy

### 1. Criar Usuário Admin

Execute o script de setup:

```bash
# Local (para testar)
cd web
npx ts-node scripts/setup-admin.ts

# Ou via API em produção
curl -X POST https://agendador-andreia.vercel.app/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha-forte-aqui"}'
```

### 2. Configurar Horário de Trabalho

1. Faça login como admin
2. Vá em **Configurações**
3. Configure horários de trabalho para cada dia da semana
4. Ative o agendamento online se desejar

### 3. Configurar Backup Automático (Opcional)

1. Acesse https://cron-job.org
2. Crie novo job:
   - **URL**: `https://agendador-andreia.vercel.app/api/cron/backup`
   - **Schedule**: Diariamente às 00:00
   - **Timezone**: America/Sao_Paulo

---

## 🔄 Workflow de Deploy

### Deploy Automático (Recomendado)

Configurado por padrão na Vercel:

```bash
# Qualquer push para main dispara deploy automático
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Vercel detecta push e inicia build automaticamente
```

### Deploy Manual

```bash
# Via CLI
vercel --prod

# Ou via interface Vercel: Deployments → Redeploy
```

### Preview Deployments

Branches e PRs geram preview automático:

```bash
git checkout -b feature/nova-funcionalidade
git push origin feature/nova-funcionalidade

# Vercel cria URL de preview: agendador-andreia-git-feature-nova-funcionalidade.vercel.app
```

---

## 🔙 Rollback

### Método 1: Via Interface Vercel

1. Vá em **Deployments**
2. Encontre deployment anterior funcional
3. Clique nos 3 pontos → **Promote to Production**

### Método 2: Via Git

```bash
# Reverter último commit
git revert HEAD
git push origin main

# Ou voltar para commit específico
git reset --hard abc123
git push --force origin main
```

---

## 📊 Monitoramento

### Logs da Vercel

```bash
# Via CLI
vercel logs

# Ou via interface: Deployments → [deployment] → Logs
```

### Métricas

Acesse **Analytics** no painel Vercel para ver:
- Tempo de resposta
- Taxa de erro
- Uso de bandwidth
- Visitantes únicos

### Alertas

Configure em **Settings** → **Notifications**:
- Build failures
- Deployment errors
- Performance issues

---

## 🐛 Troubleshooting

### Build Error: "Prisma Client not found"

**Solução**: Adicione ao `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Error: "NEXTAUTH_URL is not defined"

**Solução**: Adicione `NEXTAUTH_URL` nas variáveis de ambiente da Vercel

### Database Connection Timeout

**Solução**: Use connection pooling URL (`?pgbouncer=true`)

### Firebase Notifications não funcionam

**Solução**: 
1. Verifique todas as variáveis `NEXT_PUBLIC_FIREBASE_*`
2. Confirme que service worker está registrado
3. Teste em HTTPS (localhost não funciona)

---

## 🔐 Segurança

### Checklist Pré-Deploy

- [ ] Todas as senhas são fortes (mínimo 16 caracteres)
- [ ] `NEXTAUTH_SECRET` é único e aleatório
- [ ] Variáveis sensíveis NÃO estão no código
- [ ] `.env.local` está no `.gitignore`
- [ ] Firebase private key está protegida
- [ ] Database URL não está exposta

### Rotação de Secrets

Recomendado a cada 90 dias:

1. Gere novo `NEXTAUTH_SECRET`
2. Atualize na Vercel
3. Force redeploy
4. Todos os usuários precisarão fazer login novamente

---

## 📝 Checklist de Deploy

### Antes do Deploy
- [ ] Código testado localmente (`npm run build`)
- [ ] Migrations executadas no banco de teste
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco de dados criado

### Durante o Deploy
- [ ] Monitorar build logs
- [ ] Verificar se build passou (status: Ready)
- [ ] Testar URL de produção

### Após o Deploy
- [ ] Fazer login no sistema
- [ ] Testar funcionalidades críticas:
  - [ ] Criar agendamento
  - [ ] Confirmar pagamento
  - [ ] Visualizar relatórios
  - [ ] Fazer backup
- [ ] Verificar notificações (se configuradas)
- [ ] Confirmar com usuário final (Andreia)

---

## 🚨 Plano de Emergência

### Sistema Fora do Ar

1. **Verificar status da Vercel**: https://vercel-status.com
2. **Verificar logs**: `vercel logs --prod`
3. **Rollback imediato**: Promover deployment anterior
4. **Comunicar usuário**: Informar Andreia sobre o problema

### Perda de Dados

1. **Restaurar do backup mais recente**
2. **Verificar integridade dos dados**
3. **Comunicar perda (se houver)**
4. **Investigar causa raiz**

---

## 📞 Suporte

### Recursos Oficiais
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

### Contato
- **Desenvolvedor**: Eric Macedo
- **GitHub**: https://github.com/EricMacedo10/agendador-andreia
- **Issues**: Abrir issue no repositório

---

**Última revisão**: 2026-01-07  
**Versão do documento**: 1.0
