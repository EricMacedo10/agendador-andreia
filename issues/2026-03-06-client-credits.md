# Implementação do Sistema de Créditos/Pacotes (Carteira da Cliente)

## Contexto e Objetivo
A Andreia precisa gerenciar "Pacotes de Sobrancelha" (ex: a cliente paga R$ 60 por 2 sessões). Geralmente a cliente usa 1 sessão no ato do pagamento, ficando com **1 crédito** para o próximo agendamento.
O sistema deve suportar também o cenário onde a cliente *não* compra o pacote e paga as sessões avulsas (R$ 30 de cada vez).

## A Solução Acordada
Implementar um sistema de **"Carteira de Créditos"** manual, flexível e inteligente, sem automatizar rigidamente a venda de serviços para não engessar o salão.

O fluxo aprovado foi:
1. **Adição do Crédito (Manual na hora do Check-out):** Ao finalizar o agendamento de um pacote pago integralmente, a Andreia poderá, opcionalmente, clicar para "Adicionar + X créditos de Sobrancelha" na carteira daquela cliente específica.
2. **Consumo do Crédito (Automático/Sugerido):** Nas futuras visitas da cliente, ao encerrar o serviço, o sistema detecta o saldo e exibe um aviso: *"Esta cliente possui 1 crédito. Deseja usá-lo para zerar o valor desta sessão?"*. Ao aceitar, o sistema dá baixa em 1 crédito e zera o valor a ser cobrado.
3. **Sessões Avulsas:** Para clientes que pagam de forma "picada", a Andreia simplesmente não adiciona créditos, e o sistema fará a cobrança normal de cada sessão.

## Plano de Ação para Implementação (Próximos Passos)
1. **Banco de Dados:**
   - Modificar o `schema.prisma` criando um novo modelo `ClientCredit` (relacionado ao `Client` e possivelmente ao `Service`).
   - Gerar e aplicar a migração (`prisma migrate dev`).
2. **Backend (Ações Server-side):**
   - Criar funções para consultar, adicionar e consumir créditos de um cliente (`actions.ts`).
3. **Frontend (Dashboard):**
   - Adicionar interface no perfil da cliente ou no modal de "Concluir Agendamento" para inserir os créditos manualmente.
   - Modificar a tela de finalização de serviço para verificar o saldo e mostrar o botão "Usar Crédito".
