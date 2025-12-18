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

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15+** (App Router)
- **TypeScript**
- **Prisma ORM** (PostgreSQL)
- **TailwindCSS** (Estilização Moderna)
- **Lucide React** (Ícones)
- **Recharts** (Gráficos Financeiros)
- **NextAuth.js** (Segurança e Login)

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

# URL da Aplicação (Para o NextAuth)
NEXTAUTH_URL="http://localhost:3000"
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

As rotas administrativas (`/dashboard`) são protegidas e exigem login. Apenas a rota `/book` é pública para os clientes.

---

## 📝 Licença

Este projeto é de uso privado.
