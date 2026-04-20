# Funcionalidades do Sistema - Agendador Andreia

**Última atualização**: 2026-01-07  
**Versão**: 2.0 (Produção)

---

## 📅 Gestão de Agenda

### Visualização de Agendamentos
- **Modo Dia**: Visualização detalhada de todos os agendamentos do dia
- **Modo Mês**: Calendário mensal com visão geral
- **Timeline**: Linha do tempo visual com horários
- **Indicadores de Status**:
  - 🟠 Pendente (aguardando confirmação)
  - 💰 Pago (confirmado e pago)
  - ⚠️ Atrasado (passou do horário sem confirmação)
  - ✅ Concluído

### Criação de Agendamentos
- Seleção de cliente (busca rápida)
- **Múltiplos serviços** em um único agendamento
- Cálculo automático de duração total
- Cálculo automático de preço total
- Detecção de conflitos de horário
- Validação de horário de trabalho
- Verificação de dias bloqueados

### Edição de Agendamentos
- Alterar data e horário
- Adicionar ou remover serviços
- Mudar status
- Registrar pagamento
- Cancelar agendamento

---

## 👥 Gestão de Clientes

### Cadastro
- Nome completo
- Telefone (único)
- Observações personalizadas
- Data de cadastro automática

### Visualização
- Lista completa de clientes
- Busca por nome ou telefone
- Ordenação alfabética
- Histórico de agendamentos por cliente

### Análise
- Total de visitas
- Total gasto
- Última visita
- Serviço preferido
- Ticket médio

---

## 💼 Gestão de Serviços

### Cadastro
- Nome do serviço
- Descrição detalhada
- Preço (R$)
- Duração (minutos)
- Imagem personalizada (upload Base64)
- Controle de visibilidade

### Funcionalidades
- Mostrar/ocultar na página pública
- Edição de preços e durações
- Histórico de preços (snapshot)
- Imagens otimizadas

---

## 🔄 Múltiplos Serviços

### Agendamento
- Selecionar vários serviços simultaneamente
- Visualização de todos os serviços selecionados
- Cálculo automático de duração total
- Cálculo automático de preço total
- Ordem de execução dos serviços

### Histórico
- Snapshot de preço no momento do agendamento
- Preservação de valores mesmo após mudança de preços
- Visualização clara de todos os serviços realizados

---

## 🚫 Bloqueio de Dias

### Tipos de Bloqueio
- **Dia Inteiro**: Bloqueia todo o dia (férias, feriados)
- **Período Parcial**: Bloqueia apenas parte do dia (ex: manhã)

### Funcionalidades
- Bloquear período (ex: 01/02 a 10/02)
- Motivo do bloqueio (opcional)
- Horário de início e fim (bloqueios parciais)
- Aviso de conflitos com agendamentos existentes

### Integração
- Dias bloqueados não aparecem na agenda online
- Bloqueios parciais filtram horários disponíveis
- Visualização destacada na agenda (🚫 dia inteiro, ⏰ parcial)
- Validação automática ao criar agendamentos

---

## 💰 Financeiro

### Resumo
- Ganhos diários
- Ganhos mensais
- Filtros por período
- Total de agendamentos pagos

### Métodos de Pagamento
- PIX
- Dinheiro
- Cartão de Crédito
- Cartão de Débito

### Registro
- Confirmação de pagamento
- Valor pago (snapshot)
- Método utilizado
- Data e hora do pagamento

---

## 📊 Relatórios Avançados

### Seleção de Período
- Ano atual (2026)
- Ano anterior (2025)
- Troca rápida entre anos

### Resumo Financeiro
- Faturamento total do ano
- Total de agendamentos realizados
- Ticket médio
- Breakdown mensal (12 meses)

### Análise de Serviços
- Top 5 serviços mais realizados
- Top 5 serviços mais lucrativos
- Toggle entre quantidade e faturamento
- Dados de quantidade e valor

### Top 10 Clientes VIP
- Clientes que mais gastaram
- Total de visitas
- Total gasto
- Última visita
- Serviço preferido
- Badges especiais (🏆 🥈 🥉)

### Formas de Pagamento
- Breakdown por método
- Quantidade de transações
- Valor total por método
- Ordenação por valor

### Controle de Inadimplência (Devedores)
- Tracking em tempo real de clientes com carteira/saldo negativo.
- Dados de contato direto (WhatsApp/Telefone) e data da última visita.
- Sincronização automática assim que a dívida é quitada no checkout ou no recebimento avulso.

---

## 💾 Backup e Restauração

### Exportação
- Download de todos os dados em JSON
- Inclui: usuários, clientes, serviços, agendamentos, configurações
- Formato legível e estruturado
- Nome do arquivo com data

### Restauração
- Upload de arquivo de backup
- Validação de formato
- Confirmação antes de restaurar
- Substituição completa de dados

### Backup Automático
- Execução diária à meia-noite
- Via cron-job.org
- Sem intervenção manual

---

## 🔔 Notificações Push

### Lembretes Automáticos
- Notificação 10 minutos antes do agendamento
- Informações do cliente e serviço
- Horário do agendamento

### Tecnologia
- Firebase Cloud Messaging (FCM)
- Suporte para Android e iOS
- Service Worker para notificações

### Gerenciamento
- Ativar/desativar notificações
- Teste de notificação
- Auto-sync de tokens
- Recuperação automática de erros

### Status Conhecido
- ⚠️ Instabilidade ocasional
- Desincronização entre navegador e service worker
- Sistema de recuperação implementado

---

## 📱 Progressive Web App (PWA)

### Instalação
- Instalável no Android
- Instalável no iOS
- Funciona como app nativo
- Ícone personalizado na tela inicial

### Recursos
- Splash screen branded
- Modo standalone (sem barra do navegador)
- Manifest.json configurado
- Ícones em múltiplos tamanhos

### Futuro
- Suporte offline
- Sincronização em background
- Cache de dados

---

## 🌐 Agendamento Online

### Página Pública
- URL: `/book`
- Sem necessidade de login
- Interface simplificada
- Mobile-first

### Fluxo
1. Seleção de serviços (múltiplos)
2. Escolha de data
3. Escolha de horário disponível
4. Informações do cliente
5. Revisão e confirmação

### Validações
- Apenas serviços visíveis aparecem
- Apenas horários disponíveis
- Respeita horário de trabalho
- Respeita dias bloqueados
- Detecta conflitos

---

## 🔒 Segurança

### Autenticação
- NextAuth v5
- Senhas com hash bcrypt
- Sessões seguras
- Proteção de rotas via middleware

### Autorização
- Sistema de roles (ADMIN/USER)
- Controle de acesso por função
- Validação em todas as APIs

### Proteção
- Headers de segurança HTTP
- Proteção contra XSS
- CORS configurado
- Rate limiting básico
- Validação de entrada de dados

---

## ⚙️ Configurações

### Horário de Trabalho
- Configuração por dia da semana
- Horário de início e fim
- Dias de folga
- Salvamento automático

### Agendamento Online
- Ativar/desativar página pública
- Controle master switch
- Configuração de horários disponíveis

---

## 🎨 Interface

### Design
- Mobile-first
- Responsivo
- Tailwind CSS
- Ícones Lucide React

### Navegação
- Sidebar desktop
- Bottom navigation mobile
- Menu hambúrguer
- Breadcrumbs

### Feedback
- Toasts de sucesso/erro
- Loading states
- Confirmações de ações destrutivas
- Mensagens claras

---

## 🔧 Administração

### Gerenciamento de Usuários
- Criação de usuários
- Atribuição de roles
- Edição de perfis
- Controle de acesso

### Manutenção
- Backup manual
- Restauração de dados
- Visualização de logs (futuro)
- Monitoramento (futuro)

---

## 📈 Métricas e Analytics

### Dashboard
- Resumo de hoje
- Próximos agendamentos
- Agendamentos pendentes
- Estatísticas rápidas

### Insights
- Clientes mais frequentes
- Serviços mais populares
- Tendências de faturamento
- Análise de crescimento

---

## 🚀 Deployment

### Plataforma
- Vercel (produção)
- Deploy automático via GitHub
- Preview deployments
- Rollback fácil

### Database
- Supabase PostgreSQL
- Connection pooling
- Backups automáticos
- Alta disponibilidade

---

## 📝 Observações

### Limitações Conhecidas
- Notificações push com instabilidade ocasional
- Suporte offline ainda não implementado
- Gráficos visuais em desenvolvimento

### Roadmap Futuro
- Gráficos e dashboards visuais
- Integração com WhatsApp
- Programa de fidelidade
- Cupons e descontos
- Relatórios em PDF
- Integração com calendário Google
