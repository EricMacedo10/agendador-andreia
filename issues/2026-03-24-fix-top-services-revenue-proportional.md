# Corrigir Cálculo de Receita no Top 5 Serviços (Distribuição Proporcional)

## Contexto e Problema
A Andreia reportou que o ranking de **"Serviços Mais Lucrativos"** não reflete a realidade quando um agendamento possui múltiplos serviços e o valor total é alterado manualmente no momento do fechamento (check-out).

Atualmente, o sistema utiliza o `priceSnapshot` (valor do serviço no momento do cadastro) para somar ao faturamento do serviço, ignorando o `paidPrice` (valor real que o cliente pagou) caso este tenha sido editado (ex: aplicação de desconto no total).

**Exemplo do Bug:**
- Serviço A: R$ 50 (Snapshot)
- Serviço B: R$ 100 (Snapshot)
- Total Esperado: R$ 150
- **Valor Pago Real (`paidPrice`): R$ 120** (Desconto de R$ 30)
- O sistema hoje soma R$ 50 ao Serviço A e R$ 100 ao Serviço B no relatório, totalizando R$ 150 (faturamento inflado em R$ 30).

## A Solução (Opção 1)
Implementar a **Distribuição Proporcional** do valor real pago entre os serviços do agendamento. O cálculo deve usar o peso de cada `priceSnapshot` em relação ao total de snapshots do agendamento para fatiar o `paidPrice`.

**Fórmula:**
`Valor Atribuído = (priceSnapshot / Total de Snapshots do Agendamento) * paidPrice`

**Exemplo com a Solução:**
- Total Snapshots: R$ 150
- Proporção Serviço A: 50/150 = 33,33% -> `0.3333 * 120 = R$ 40,00`
- Proporção Serviço B: 100/150 = 66,66% -> `0.6666 * 120 = R$ 80,00`
- **Total Relatório: R$ 120,00** (Bate exatamente com o caixa real).

## Plano de Ação (Próximos Passos)
1. **API de Finanças (`/api/financial/route.ts`):**
   - Atualizar a lógica no loop que percorre `allCompleted`.
   - Calcular o `totalSnapshotsWeight` de cada agendamento antes de distribuir.
   
2. **API de Relatórios (`/api/reports/top-services/route.ts`):**
   - Aplicar a mesma lógica de distribuição proporcional no agrupamento de `serviceStats`.

3. **Validação:**
   - Testar com agendamentos de serviço único (deve manter 100% do valor).
   - Testar com múltiplos serviços e descontos/acréscimos no valor total.
