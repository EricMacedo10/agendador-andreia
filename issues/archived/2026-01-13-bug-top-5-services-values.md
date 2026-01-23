# Bug: Relatório Top 5 Serviços com valores incorretos

## Descrição
No relatório "Top 5 Serviços", os valores apresentados não estão sendo atualizados para refletir o valor final cobrado pelo serviço. O sistema continua exibindo o valor original do agendamento, mesmo que o valor tenha sido alterado no momento da finalização.

## Exemplo
- **Serviço**: Pintura Orgânica
- **Valor Agendado**: R$ 400,00
- **Valor Cobrado (Finalização)**: R$ 200,00
- **Comportamento Atual**: O relatório exibe R$ 400,00.
- **Comportamento Esperado**: O relatório deve exibir o valor efetivamente cobrado (R$ 200,00).

## Evidências
Verificar imagem anexada (uploaded_image_1768347509615.png) onde o serviço aparece com o valor original.

## Impacto
Distorção nos relatórios de faturamento e análise de serviços "Mais Lucrativos".

## Status
- **Resolvido em**: 23/01/2026
- **Solução**: Implementada lógica de distribuição proporcional do valor cobrado (paidPrice) entre os serviços do agendamento (priceSnapshot).
- **Verificação**: Script de teste validou a distribuição correta de descontos.
