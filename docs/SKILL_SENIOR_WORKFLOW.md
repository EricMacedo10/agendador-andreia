# O Padrão Sênior (SKILL_SENIOR_WORKFLOW.md)

Este documento centraliza as práticas, filosofias e padrões adotados no desenvolvimento e manutenção do **Agendador Andreia**. Ele serve como um guia "Opinionated" (opinativo) de alto nível para garantir que o código permaneça limpo, as escolhas arquiteturais sejam perenes e que a experiência da usuária final seja impecável.

---

## 🏗️ 1. Princípios Arquiteturais e de Design

### 1.1 Simplicidade e Custo Zero (Zero-Cost Infrastructure)
- O projeto foi arquitetado para aproveitar ao máximo o *free tier* de serviços modernos (Vercel, Supabase, Cron-job.org).
- **Decisão Chave:** Armazenamos imagens (ex: fotos de serviços) em padrão **Base64** diretamente no banco de dados. Isso elimina a necessidade (e custo) de buckets AWS S3/Cloud Storage, mantendo a arquitetura ultra-simples para o volume atual.
- **Mantendo o Princípio:** Qualquer nova funcionalidade não deve adicionar custo fixo mensal à proprietária do salão.

### 1.2 "Mobile-First" Extremo
- A Andreia e seus clientes acessam o sistema 95% do tempo no celular. O código UI/UX reflete isso:
  - Áreas de toque maiores (botões com min-height de 44px).
  - Componentes PWA "app-like" (Ex: Splash screens e navegação inferior).
  - Ausência de modais complexos no mobile (preferência por drawers ou navegação de página inteira).

### 1.3 State Management Simplificado (Sem Redux/Zustand)
- Como usamos Next.js App Router, grande parte do "estado" vive na URL (searchParams) ou é gerenciado pelo próprio Server/Prisma.
- O estado do lado do cliente (`useState`, `useEffect`) é reservado **apenas** para interatividade local em "Client Components" (ex: abrir modals, selecionar itens antes do submit).

---

## 🔒 2. A Esteira "Safe Deploy" e Segurança

Como lidamos com a agenda real do salão, a regra de ouro é: **A operação não pode parar.**

### 2.1 A Regra do "Friday/Business Hours Deploy"
- Em produção, deploys nunca ocorrem no meio do expediente de maior movimento da semana (Sexta-feira à tarde e Sábado de manhã).
- Alterações não-críticas devem ser subidas à noite ou nas Segundas/Terças-feiras.

### 2.2 Política "Fail Fast, Fail Local"
- Nenhuma feature é testada diretamente em produção (Vercel).
- Todo novo fluxo passa pelos seguintes passos locais obrigatórios:
  1. Compilação de tipagem sem falhas (`npx tsc --noEmit`).
  2. Build produtivo local simulado (`npm run build`). Se a Vercel for quebrar as rotas estáticas ou de Edge, devemos descobrir isso durante esse passo.
  3. Varredura por vazamentos de "secrets". `.env` e senhas fixas (hardcoded) *jamais* devem subir pro GitHub.

### 2.3 Rolling Migration e Hash de Senhas
- Se mudarmos a lógica de banco, devemos buscar *Backward Compatibility* (compatibilidade com as linhas antigas).
- Exemplo prático já aplicado: Senhas em texto puro foram criptografadas para `bcrypt` usando o padrão "migração sob demanda" (compara texto -> hasheia no login -> salva) garantindo *Zero-Downtime*.

---

## 💡 3. Sugestões de Melhorias Contínuas (Roadmap de Ouro)

O sistema atual está de parabéns! Se formos encostar em algo para o próximo salto evolutivo (v3.0), as recomendações de liderança técnica são:

### 3.1 Rate Limiting Refinado (Upstash Redis)
- **Por quê?** Atualmente, a rota pública (`/book`) e a API de login são os maiores vetores de ataque.
- **Como:** Utilizar o *Upstash Redis* (que tem uma cota *Serverless FREE* gigantesca) para injetar via Middleware um `RateLimiter` protegendo contra *DDoS* leve ou tentativas de *Brute Force* na página de agendamento online.

### 3.2 Error e Log Aggregation (Sentry ou Vercel Analytics)
- **Por quê?** Descobrir que o sistema quebrou antes da cliente/Andreia reclamar no WhatsApp.
- **Como:** Instalar o pacote `@sentry/nextjs` na sua camada gratuita para que erros no código captem exatamente a linha onde o JavaScript falhou na máquina do usuário. E/Ou habilitar as Speed Insights da Vercel.

### 3.3 Separação Server Actions x API Routes
- **Por quê?** O código intercala rotas `/api/*` com requisições do frontend feitas por fetch. Isso está correto para SPAs, mas o Next 15 brilha com **Server Actions**.
- **Como:** Migrar progressivamente as chamadas do painel administrativo (como criar serviço/atualizar cliente) para funções puras do lado do servidor chamadas via `action={updateClientAction}` (reduz o boilerplate de `fetch/JSON.parse`).

---

**Com estas premissas adotadas, você garante um ciclo de software longo, indestrutível, gratuito e que continua gerando receita para o negócio final sem dores de cabeça.**
