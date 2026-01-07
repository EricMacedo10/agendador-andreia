# Issue #1: Implementar Múltiplos Serviços por Agendamento

## Descrição
Permitir que a Andreia possa adicionar múltiplos serviços em um único agendamento. Isso deve funcionar tanto no momento da criação do agendamento quanto depois do serviço já estar finalizado/realizado.

## Contexto de Negócio
Clientes às vezes decidem fazer mais de um serviço no mesmo horário. Atualmente, seria necessário criar múltiplos agendamentos separados, o que não reflete a realidade e dificulta a visualização.

## Requisitos Funcionais

### RF01 - Seleção Múltipla na Criação
- [ ] Ao criar um novo agendamento, permitir seleção de múltiplos serviços (checkboxes ao invés de radio buttons)
- [ ] Exibir lista de serviços selecionados com botão para remover
- [ ] Mostrar resumo: duração total e valor total
- [ ] Validar que pelo menos 1 serviço está selecionado

### RF02 - Adicionar Serviços a Agendamento Existente
- [ ] Ao editar agendamento existente, permitir adicionar novos serviços
- [ ] Funcionar mesmo para agendamentos com status COMPLETED
- [ ] Recalcular duração total automaticamente
- [ ] Validar conflitos com a nova duração

### RF03 - Remover Serviços
- [ ] Permitir remover serviços de um agendamento
- [ ] Garantir que sempre reste pelo menos 1 serviço (não pode ficar vazio)
- [ ] Recalcular duração total

### RF04 - Visualização na Agenda
- [ ] Mostrar todos os serviços na visualização do agendamento
- [ ] Formato sugerido: "Cliente - Serviço1, Serviço2, Serviço3"
- [ ] Tooltip com detalhes completos ao passar mouse

### RF05 - Página Pública de Agendamento Online
- [ ] Adaptar interface para permitir seleção múltipla
- [ ] Calcular horários disponíveis considerando duração total
- [ ] Mostrar resumo dos serviços na etapa de revisão

## Requisitos Técnicos

### RT01 - Banco de Dados
**Arquivo**: `web/prisma/schema.prisma`

Criar nova tabela `AppointmentService`:
```prisma
model AppointmentService {
  id            String      @id @default(cuid())
  appointmentId String
  serviceId     String
  priceSnapshot Decimal     @db.Decimal(10, 2)
  order         Int         @default(1)
  
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  service       Service     @relation(fields: [serviceId], references: [id], onDelete: Restrict)
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@unique([appointmentId, serviceId])
}
```

Modificar `Appointment`:
- Remover: `serviceId`, `service`, `durationMinutes`
- Adicionar: `totalDurationMinutes Int?`, `services AppointmentService[]`

Modificar `Service`:
- Alterar `appointments Appointment[]` para `appointmentServices AppointmentService[]`

### RT02 - Migration Segura
**Arquivo**: Criar nova migration

**CRÍTICO**: A migration deve preservar dados existentes:
1. Criar tabela `AppointmentService`
2. Para cada `Appointment` existente:
   - Criar um `AppointmentService` com o serviço atual
   - Copiar `durationMinutes` para `totalDurationMinutes`
   - Copiar preço do serviço para `priceSnapshot`
3. Somente após migração bem-sucedida, remover colunas antigas

**Script SQL sugerido** (será gerado após prisma migrate):
```sql
-- Inserir registros na nova tabela para agendamentos existentes
INSERT INTO "AppointmentService" (id, "appointmentId", "serviceId", "priceSnapshot", "order")
SELECT 
  gen_random_uuid(), 
  a.id, 
  a."serviceId", 
  s.price, 
  1
FROM "Appointment" a
JOIN "Service" s ON a."serviceId" = s.id;

-- Copiar durationMinutes para totalDurationMinutes
UPDATE "Appointment" 
SET "totalDurationMinutes" = COALESCE("durationMinutes", (
  SELECT duration FROM "Service" WHERE id = "Appointment"."serviceId"
));
```

### RT03 - API: Criar Agendamento
**Arquivo**: `web/src/app/api/appointments/route.ts`

**POST `/api/appointments`**

**Antes**:
```typescript
{ clientId, serviceId, date }
```

**Depois**:
```typescript
{ 
  clientId: string, 
  serviceIds: string[],  // ARRAY de IDs
  date: string 
}
```

**Lógica**:
1. Validar que `serviceIds.length > 0`
2. Para cada `serviceId`, buscar o serviço e somar duração
3. Criar `Appointment` com `totalDurationMinutes` calculado
4. Para cada serviço, criar `AppointmentService` com `priceSnapshot`
5. Verificar conflitos usando `totalDurationMinutes`

### RT04 - API: Adicionar/Remover Serviços
**Arquivo**: `web/src/app/api/appointments/[id]/services/route.ts` (NOVO)

**POST `/api/appointments/[id]/services`**
```typescript
Body: { serviceId: string }

1. Verificar se appointment existe
2. Verificar se serviço já não está no agendamento (unique constraint)
3. Buscar preço atual do serviço
4. Criar AppointmentService com priceSnapshot
5. Recalcular totalDurationMinutes
6. Validar se nova duração não causa conflito com outros agendamentos
7. Retornar agendamento atualizado
```

**DELETE `/api/appointments/[id]/services/[serviceId]`**
```typescript
1. Contar quantos serviços o agendamento tem
2. Se count <= 1: retornar erro "Agendamento deve ter pelo menos 1 serviço"
3. Deletar AppointmentService
4. Recalcular totalDurationMinutes
5. Retornar agendamento atualizado
```

### RT05 - API: Listar Agendamentos
**Arquivo**: `web/src/app/api/appointments/route.ts`

**GET `/api/appointments`**

Modificar include do Prisma:
```typescript
const appointments = await prisma.appointment.findMany({
  include: {
    client: true,
    services: {  // NOVO: incluir múltiplos serviços
      include: {
        service: true  // Dados completos do serviço
      },
      orderBy: {
        order: 'asc'  // Respeitar ordem definida
      }
    }
  }
})
```

### RT06 - Frontend: Modal de Novo Agendamento
**Arquivo**: `web/src/components/new-appointment-modal.tsx`

**Mudanças na UI**:
1. Mudar seleção de serviços de `<input type="radio">` para `<input type="checkbox">`
2. Adicionar seção "Serviços Selecionados" com lista de cards
3. Cada card mostra: nome, preço, duração, botão [X] para remover
4. Adicionar resumo: "Total: R$ XX,XX | XX minutos"
5. Campo oculto para armazenar ordem dos serviços

**Estado do componente**:
```typescript
const [selectedServices, setSelectedServices] = useState<Service[]>([]);
```

**Cálculos**:
```typescript
const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
```

**Validação**:
```typescript
const isValid = selectedServices.length >= 1 && /* outras validações */;
```

### RT07 - Frontend: Visualização na Agenda
**Arquivo**: `web/src/app/dashboard/schedule/page.tsx`

**Linha do tempo (Day View)**:
```typescript
// Antes:
<span>{appt.service.name}</span>

// Depois:
<span>
  {appt.services.map(s => s.service.name).join(', ')}
</span>

// Tooltip detalhado:
<Tooltip>
  {appt.services.map(s => (
    <div key={s.id}>
      {s.service.name} - R$ {s.priceSnapshot} - {s.service.duration}min
    </div>
  ))}
  <div>Total: R$ {calcTotal()} - {appt.totalDurationMinutes}min</div>
</Tooltip>
```

**Visualização Mês**:
- Mesmo formato, mostrar serviços separados por vírgula
- Truncar se muito longo

### RT08 - Frontend: Página de Agendamento Online
**Arquivo**: `web/src/app/book/page.tsx`

**Step "services"**:
- Permitir múltipla seleção (checkboxes)
- Mostrar serviços selecionados abaixo
- Calcular total

**Step "datetime"**:
- Ao buscar slots, enviar duração total: `/api/slots?date=X&duration=${totalDuration}`

**Step "review"**:
- Listar todos os serviços selecionados
- Mostrar valor total

## Critérios de Aceitação

### CA01 - Criar agendamento com múltiplos serviços
```
DADO que estou na tela de novo agendamento
QUANDO seleciono "Manicure" e "Pedicure"
E escolho data e hora
E confirmo
ENTÃO o agendamento é criado com 2 serviços
E a duração total é a soma das durações (90 min)
E o valor total é a soma dos preços (R$ 75,00)
```

### CA02 - Adicionar serviço a agendamento existente
```
DADO que existe um agendamento com apenas "Manicure"
QUANDO clico para editar
E adiciono "Pedicure"
ENTÃO o agendamento agora tem 2 serviços
E a duração total é recalculada
```

### CA03 - Não permitir agendamento vazio
```
DADO que tenho um agendamento com 2 serviços
QUANDO tento remover ambos os serviços
ENTÃO ao tentar remover o segundo, recebo erro
E o agendamento mantém pelo menos 1 serviço
```

### CA04 - Detecção de conflitos com duração total
```
DADO que existe agendamento às 14:00 com duração de 90 min (até 15:30)
QUANDO tento criar novo agendamento às 15:00
E a duração total é 60 min (até 16:00)
ENTÃO recebo erro de conflito de horário
```

### CA05 - Migração preserva dados
```
DADO que existem 100 agendamentos no sistema antigo
QUANDO executo a migration
ENTÃO todos os 100 agendamentos continuam existindo
E cada um tem exatamente 1 serviço na nova tabela
E as durações estão corretas
```

## Testes Necessários

### Testes Unitários
- [ ] Cálculo de duração total
- [ ] Cálculo de preço total
- [ ] Validação de array vazio de serviços
- [ ] Função de detecção de conflitos

### Testes de Integração
- [ ] API: Criar agendamento com 1 serviço
- [ ] API: Criar agendamento com 3 serviços
- [ ] API: Adicionar serviço a agendamento existente
- [ ] API: Remover serviço (deve manter mínimo 1)
- [ ] API: Tentar remover último serviço (deve falhar)

### Testes End-to-End
- [ ] Fluxo completo: criar agendamento com 2 serviços
- [ ] Editar agendamento e adicionar mais 1 serviço
- [ ] Visualização correta na agenda (dia e mês)
- [ ] Funcionalidade em mobile

### Teste de Migration
- [ ] Em ambiente de teste, popular banco com dados antigos
- [ ] Executar migration
- [ ] Verificar que todos os dados foram preservados
- [ ] Executar rollback e verificar funcionamento

## Estimativa
**Complexidade**: Alta
**Tempo estimado**: 2-3 dias
**Prioridade**: Alta (feature mais solicitada)

## Dependências
- Nenhuma

## Notas Técnicas
- **IMPORTANTE**: Fazer backup do banco antes da migration
- Testar migration em ambiente de desenvolvimento primeiro
- Deploy em horário de baixo movimento (madrugada)
- Monitorar erros por 24h após deploy
