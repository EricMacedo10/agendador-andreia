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

*Documento atualizado em: 28/04/2026*
