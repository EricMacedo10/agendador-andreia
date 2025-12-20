# Guia de Acesso - Agendador Andreia

Este documento contém instruções para acessar e gerenciar o sistema.

**⚠️ ATENÇÃO**: Este arquivo não contém credenciais. Mantenha suas senhas em local seguro e privado.

---

## 🌐 Sistema em Produção

**URL**: https://agendador-andreia.vercel.app

**Funcionalidades**:
- ✅ Login com autenticação
- ✅ Dashboard administrativo
- ✅ Gestão de agenda, clientes e serviços
- ✅ PWA instalável (funciona como app no celular)

---

## 📱 Instalação como App no Celular

### iPhone (iOS)
1. Abra o Safari
2. Acesse: https://agendador-andreia.vercel.app
3. Toque no botão **Compartilhar** (📤) na barra inferior
4. Role para baixo e toque em **"Adicionar à Tela de Início"**
5. Confirme tocando em **"Adicionar"**
6. ✅ O ícone aparecerá na tela inicial!

### Android
1. Abra o Chrome
2. Acesse: https://agendador-andreia.vercel.app
3. Toque no menu (⋮) no canto superior direito
4. Toque em **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**
5. Confirme
6. ✅ O ícone aparecerá na tela inicial!

---

## 🔐 Acesso ao Sistema

### Login
O sistema possui autenticação obrigatória. Apenas usuários cadastrados podem acessar.

**Página de Login**: https://agendador-andreia.vercel.app

Credenciais são privadas e devem ser mantidas em segurança.

---

## 🛠️ Ferramentas de Desenvolvimento

### 1. Vercel (Hospedagem)
- **Painel**: https://vercel.com/dashboard
- **Login**: Use "Continue with Email" (link mágico no email)
- **Deployments**: Visualize status e logs em tempo real

### 2. GitHub (Código Fonte)
- **Repositório**: https://github.com/EricMacedo10/agendador-andreia
- **Login**: Use suas credenciais do GitHub

### 3. Supabase (Banco de Dados)
- **Painel**: https://supabase.com/dashboard
- **Banco**: PostgreSQL gerenciado
- **Acesso**: Via credenciais do projeto

---

## 🚀 Deploy Manual

Para fazer deploy das mudanças, execute da **pasta raiz** do projeto:

```bash
# Navegue para a pasta raiz
cd "C:/Users/ericm/OneDrive/Área de Trabalho/PESSOAL/Agendador Andreia"

# Execute o deploy
npx vercel deploy --prod
```

**⚠️ IMPORTANTE**: Execute sempre da pasta raiz, **NÃO** da pasta `/web`!
- O Vercel já está configurado com "Root Directory = web"
- Executar de dentro de `/web` causaria erro de caminho duplicado

---

## 📝 Desenvolvimento Local

Para rodar o projeto localmente:

```bash
# 1. Entre na pasta web
cd web

# 2. Instale dependências (primeira vez)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse http://localhost:3000
```

---

## 🔒 Segurança

### Arquivos Sensíveis (NUNCA COMMITAR)
- `.env` → Contém credenciais do banco e secrets
- `CREDENCIAIS_ACESSO.md` → Documento local com senhas

### Variáveis de Ambiente
Configure no painel da Vercel:
1. Acesse **Project Settings** → **Environment Variables**
2. Adicione as variáveis necessárias:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`

---

## 📚 Links Úteis

| Serviço | URL |
|---------|-----|
| **Site** | https://agendador-andreia.vercel.app |
| **Painel Vercel** | https://vercel.com/dashboard |
| **GitHub** | https://github.com/EricMacedo10/agendador-andreia |
| **Supabase** | https://supabase.com/dashboard |

---

## 🆘 Problemas Comuns

### Deploy não aparece no site
- Aguarde 1-2 minutos após o deploy
- Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
- Verifique se o deploy foi marcado como "Production" no Vercel

### Erro ao fazer build
- Verifique se todas as variáveis de ambiente estão configuradas na Vercel
- Veja os logs de build no painel da Vercel

### Login não funciona
- Confirme que o usuário está cadastrado no banco
- Verifique as credenciais (email e senha corretos)

---

Desenvolvido com ❤️ para Andreia
