# Histórico de Evolução - Agendador Andreia 💅

Este documento registra a jornada do sistema, desde sua concepção como uma página estática até a plataforma PWA moderna atual.

## 📜 1. O Legado (Versão 1.0)
Localização: `docs/history/legacy-site/`

A versão original foi concebida como uma interface de login focada em estética e simplicidade. 

### Características Originais:
- **Design System**: Baseado em tons de `Zinc` (950) com destaques em `Rose` (600).
- **Tipografia**: Uso das fontes Geist Sans e Geist Mono para um visual técnico e limpo.
- **Identidade Visual**: Uso do ícone `Sparkles` para representar a qualidade e o setor de beleza.
- **Mobile-First**: Desde o início, o foco foi a usabilidade em dispositivos móveis.

---

## 🚀 2. A Transformação (Versão 2.0 - Atual)
Localização: `/web`

A aplicação foi migrada para **Next.js 15 (App Router)** para suportar funcionalidades complexas de backend.

### O que foi preservado:
- ✅ **Paleta de Cores**: Mantivemos o Rose 600 como cor primária e o fundo Zinc 950.
- ✅ **UX de Login**: A tela inicial atual é uma réplica fiel e funcional da interface legada.
- ✅ **Simplicidade**: A filosofia de "poucos cliques" para tarefas complexas.

### O que foi acrescentado:
- **Backend Robusto**: Integração com Prisma ORM e Supabase.
- **PWA Real**: Instalação nativa em Android e iOS.
- **Sistema de Carteira**: Controle financeiro que não existia na fase de design.
- **Segurança Avançada**: Migração para senhas hasheadas e variáveis de ambiente protegidas.

---

## 🎨 Notas de Design (Arquivadas)
O arquivo `prod.css` legado continha definições críticas de:
- Efeitos de blur em gradientes de fundo (`bg-rose-900/20 rounded-full blur-[100px]`).
- Sombras suaves em cards e botões.
- Transições de hover para feedback visual imediato.

---

## 🛡️ 3. A Fase de Segurança e "Blindagem Nuclear" (Abril/2026)
Após estabelecer a plataforma, focamos em um projeto massivo de Hardening para proteger a infraestrutura e os dados comerciais da Andreia.

### Medidas de Segurança Implementadas:
- **Git Hooks e Prevenção de Vazamentos**: Implementamos o `Husky` e o `Gitleaks` locais para impedir que qualquer senha ou credencial sensível fosse acidentalmente comitada no repositório GitHub.
- **Proteção de Segredos**: Migramos as chaves estáticas do Firebase e do banco de dados para variáveis de ambiente "Hidden/Sensitive" exclusivamente dentro do painel da **Vercel**.
- **Senhas Criptografadas**: Todos os usuários do banco (Prisma/Supabase) agora possuem senhas hasheadas via `bcryptjs`. As senhas reais são ilegíveis até para o banco.
- **Workflow de Deploy Seguro**: Estabelecemos o `safe-deploy.md`, garantindo que os deploys de produção ocorram apenas após o build local (`npx vercel --prod`) não apresentar falhas.

### Reestruturação de Permissões (Visibilidade Global):
Originalmente, a arquitetura de banco de dados vinculava cada agendamento ao usuário que o criou, o que "escondia" os dados quando outros administradores tentavam acessar. 
- Refatoramos a lógica de autorização (`user-helper.ts` e rotas de API).
- Implementamos o **"Poder de Administrador Dinâmico"**: Qualquer usuário com a `role === 'ADMIN'` (como o `admin@eric.com` e `admin@deia.com`) agora possui visão panorâmica de todo o sistema.
- A API de relatórios (`/api/reports/...`), o fluxo de agenda (`/api/appointments`), os bloqueios (`/api/blocks`) e as estatísticas do Dashboard passaram a ignorar filtros restritivos para os administradores, permitindo a gestão em conjunto sem perda de histórico.

*Documento atualizado e auditado em: 28/04/2026*
