# Alterar Horário da Agenda Dia e Corrigir Bug de Visualização

## Descrição
Atualmente a visualização "Dia" da agenda não cobre todo o período necessário para os agendamentos. Além disso, existe um bug onde agendamentos feitos no início da manhã não estão aparecendo nesta visualização.

## Requisitos
- [ ] **Alterar Range de Horários**: A visualização "Dia" (Day View) deve exibir horários das **05:00 às 23:50** todos os dias.
    - Isso deve refletir tanto na criação de agendamentos quanto na visualização da grade horária.

## Bugs Relacionados
- [ ] **Bug de Visualização (07:30)**:
    - **Cenário**: Um cliente foi agendado para o dia 10/01 às 07:30.
    - **Sintoma**: O agendamento aparece corretamente na visão "Mês", mas **não aparece** na visão "Dia".
    - **Provável Causa**: O range atual da visão Dia começa após às 07:30 ou há algum filtro de horário ocultando o slot.

## Critérios de Aceitação
- Agendamentos às 05:00 e às 23:50 devem ser possíveis e visíveis.
- O agendamento de teste (10/01 às 07:30) deve aparecer na coluna do dia correto.
