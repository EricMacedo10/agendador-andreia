# Issue #2: Implementar Bloqueio de Dias Específicos

## Descrição
Permitir que a Andreia bloqueie dias ou períodos específicos onde ela não trabalhará (férias, feriados, compromissos pessoais). Estes bloqueios devem impedir agendamentos tanto na interface interna do dashboard quanto na página pública de agendamento online.

## Contexto de Negócio
A Andreia precisa gerenciar férias, feriados e dias onde não poderá atender. Atualmente, não há forma de impedir que agendamentos sejam criados nestes dias, o que pode causar conflitos e frustração para clientes.

## Requisitos Funcionais

### RF01 - Criar Bloqueio de Dia Inteiro
- [ ] Permitir bloquear um dia completo
- [ ] Permitir bloquear período (ex: 01/02 a 10/02 - férias de 10 dias)
- [ ] Campo opcional para motivo do bloqueio
- [ ] Validar que data inicial <= data final

### RF02 - Criar Bloqueio Parcial (Período do Dia)
- [ ] Permitir bloquear apenas parte do dia (ex: manhã bloqueada, tarde disponível)
- [ ] Campos de horário início e fim (ex: 09:00 às 12:00)
- [ ] Validar que horário inicial < horário final
- [ ] Permitir múltiplos bloqueios parciais no mesmo dia

### RF03 - Listar Bloqueios
- [ ] Visualizar bloqueios futuros e ativos
- [ ] Ordenar por data (mais próximos primeiro)
- [ ] Separar bloqueios passados em seção expansível
- [ ] Indicar tipo: dia inteiro ou parcial

### RF04 - Remover Bloqueio
- [ ] Botão para excluir bloqueio
- [ ] Confirmação antes de deletar
- [ ] Não reativa agendamentos automaticamente (apenas libera datas futuras)

### RF05 - Aviso de Conflito com Agendamentos
- [ ] Ao criar bloqueio, verificar se há agendamentos confirmados nessas datas
- [ ] Mostrar lista de agendamentos conflitantes
- [ ] Permitir que Andreia decida:
  - Cancelar criação do bloqueio
  - Bloquear mesmo assim (ela cancelará os agendamentos manualmente depois)

### RF06 - Integração com Agenda Online
- [ ] Dias bloqueados não devem aparecer como disponíveis na página `/book`
- [ ] Bloqueios parciais: apenas horários não bloqueados aparecem
- [ ] Mensagem clara se cliente tentar selecionar dia bloqueado

### RF07 - Visualização na Agenda Interna
- [ ] Dias bloqueados aparecem destacados com cor diferente (ex: vermelho claro)
- [ ] Ícone 🚫 em dias com bloqueio total
- [ ] Ícone ⏰ em dias com bloqueio parcial
- [ ] Ao clicar, mostrar detalhes do bloqueio (tipo, horário, motivo)

### RF08 - Impedir Criação de Agendamentos em Dias Bloqueados
- [ ] Validação ao tentar criar agendamento em dia bloqueado
- [ ] Mensagem de erro clara: "Data bloqueada: [motivo]"
- [ ] Para bloqueios parciais: validar se horário cai dentro do bloqueio

## Requisitos Técnicos

### RT01 - Banco de Dados
**Arquivo**: `web/prisma/schema.prisma`

Criar novo modelo `DayBlock`:
```prisma
model DayBlock {
  id          String    @id @default(cuid())
  startDate   DateTime  @db.Date
  endDate     DateTime  @db.Date
  reason      String?
  blockType   BlockType @default(FULL_DAY)
  
  // Para bloqueios parciais:
  startTime   String?   // Ex: "09:00" (obrigatório se PARTIAL)
  endTime     String?   // Ex: "12:00" (obrigatório se PARTIAL)
  
  createdBy   String
  user        User      @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([startDate, endDate])
}

enum BlockType {
  FULL_DAY    // Dia inteiro bloqueado
  PARTIAL     // Apenas um período
}

// Adicionar ao User:
model User {
  // ... campos existentes
  dayBlocks   DayBlock[]
}
```

### RT02 - API: Listar Bloqueios
**Arquivo**: `web/src/app/api/blocks/route.ts` (NOVO)

**GET `/api/blocks`**

Query params opcionais:
- `start`: data início (formato: YYYY-MM-DD)
- `end`: data fim

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  
  const session = await auth();
  const userId = await getUserIdFromEmail(session.user.email);
  
  const where: any = {
    createdBy: userId
  };
  
  if (start) {
    where.startDate = { gte: new Date(start) };
  }
  
  if (end) {
    where.endDate = { lte: new Date(end) };
  }
  
  const blocks = await prisma.dayBlock.findMany({
    where,
    orderBy: { startDate: 'asc' }
  });
  
  return NextResponse.json(blocks);
}
```

### RT03 - API: Criar Bloqueio
**Arquivo**: `web/src/app/api/blocks/route.ts`

**POST `/api/blocks`**

```typescript
Body: {
  startDate: string,      // YYYY-MM-DD
  endDate: string,        // YYYY-MM-DD
  blockType: 'FULL_DAY' | 'PARTIAL',
  startTime?: string,     // HH:mm (obrigatório se PARTIAL)
  endTime?: string,       // HH:mm (obrigatório se PARTIAL)
  reason?: string
}

Validações:
1. startDate <= endDate
2. Datas não podem estar no passado
3. Se blockType = PARTIAL:
   - startTime e endTime são obrigatórios
   - startTime < endTime
4. Verificar agendamentos conflitantes:
   - Buscar appointments entre startDate e endDate
   - Se FULL_DAY: qualquer agendamento nessas datas
   - Se PARTIAL: apenas agendamentos que caem no período bloqueado

Resposta se houver conflitos:
{
  warning: true,
  conflicts: [
    { date: '2026-02-05', time: '09:30', clientName: 'Maria Silva' },
    { date: '2026-02-07', time: '10:00', clientName: 'João Costa' }
  ]
}

Se não houver conflitos ou cliente confirmar, criar o bloqueio.
```

### RT04 - API: Deletar Bloqueio
**Arquivo**: `web/src/app/api/blocks/[id]/route.ts` (NOVO)

**DELETE `/api/blocks/[id]`**

```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = await getUserIdFromEmail(session.user.email);
  
  // Verificar que o bloqueio pertence ao usuário
  const block = await prisma.dayBlock.findUnique({
    where: { id: params.id }
  });
  
  if (!block || block.createdBy !== userId) {
    return NextResponse.json(
      { error: 'Bloqueio não encontrado' },
      { status: 404 }
    );
  }
  
  await prisma.dayBlock.delete({
    where: { id: params.id }
  });
  
  return NextResponse.json({ success: true });
}
```

### RT05 - API: Modificar Cálculo de Slots
**Arquivo**: `web/src/app/api/slots/route.ts`

Adicionar validação de bloqueios:

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date'); // YYYY-MM-DD
  
  // ... código existente para buscar horário de trabalho
  
  // NOVO: Verificar bloqueios
  const blocks = await prisma.dayBlock.findMany({
    where: {
      AND: [
        { startDate: { lte: new Date(date) } },
        { endDate: { gte: new Date(date) } }
      ]
    }
  });
  
  // Se há bloqueio FULL_DAY, retornar vazio
  const hasFullDayBlock = blocks.some(b => b.blockType === 'FULL_DAY');
  if (hasFullDayBlock) {
    return NextResponse.json([]);
  }
  
  // ... gerar slots normalmente
  
  // Filtrar slots que caem em bloqueios PARTIAL
  const availableSlots = slots.filter(slot => {
    return !blocks.some(block => {
      if (block.blockType !== 'PARTIAL') return false;
      
      // Converter slot "14:00" para minutos: 14*60 = 840
      const slotMinutes = timeToMinutes(slot);
      const blockStart = timeToMinutes(block.startTime!);
      const blockEnd = timeToMinutes(block.endTime!);
      
      return slotMinutes >= blockStart && slotMinutes < blockEnd;
    });
  });
  
  return NextResponse.json(availableSlots);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
```

### RT06 - API: Validar Criação de Agendamento
**Arquivo**: `web/src/app/api/appointments/route.ts`

Adicionar validação antes de criar:

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const appointmentDate = new Date(body.date);
  
  // NOVO: Verificar bloqueios
  const dateOnly = format(appointmentDate, 'yyyy-MM-dd');
  const timeOnly = format(appointmentDate, 'HH:mm');
  
  const blocks = await prisma.dayBlock.findMany({
    where: {
      AND: [
        { startDate: { lte: new Date(dateOnly) } },
        { endDate: { gte: new Date(dateOnly) } }
      ]
    }
  });
  
  for (const block of blocks) {
    if (block.blockType === 'FULL_DAY') {
      return NextResponse.json(
        { error: `Data bloqueada${block.reason ? ': ' + block.reason : ''}` },
        { status: 400 }
      );
    }
    
    if (block.blockType === 'PARTIAL') {
      const apptMinutes = timeToMinutes(timeOnly);
      const blockStart = timeToMinutes(block.startTime!);
      const blockEnd = timeToMinutes(block.endTime!);
      
      if (apptMinutes >= blockStart && apptMinutes < blockEnd) {
        return NextResponse.json(
          { error: `Horário bloqueado${block.reason ? ': ' + block.reason : ''}` },
          { status: 400 }
        );
      }
    }
  }
  
  // ... continuar com criação normal
}
```

### RT07 - Frontend: Página de Gerenciamento de Bloqueios
**Arquivo**: `web/src/app/dashboard/blocks/page.tsx` (NOVO)

**Estrutura**:
```typescript
'use client';

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<DayBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    fetchBlocks();
  }, []);
  
  const fetchBlocks = async () => {
    const res = await fetch('/api/blocks');
    const data = await res.json();
    setBlocks(data);
  };
  
  return (
    <div>
      <h1>Bloqueio de Dias</h1>
      <button onClick={() => setIsModalOpen(true)}>
        + Novo Bloqueio
      </button>
      
      <div>
        <h2>Bloqueios Ativos e Futuros</h2>
        {blocks.filter(b => new Date(b.endDate) >= new Date()).map(block => (
          <BlockCard 
            key={block.id} 
            block={block} 
            onDelete={() => deleteBlock(block.id)} 
          />
        ))}
      </div>
      
      <NewBlockModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBlocks}
      />
    </div>
  );
}
```

### RT08 - Frontend: Modal de Novo Bloqueio
**Arquivo**: `web/src/app/dashboard/blocks/page.tsx` (componente interno)

**Estado**:
```typescript
const [formData, setFormData] = useState({
  startDate: '',
  endDate: '',
  blockType: 'FULL_DAY',
  startTime: '09:00',
  endTime: '18:00',
  reason: ''
});

const [conflicts, setConflicts] = useState([]);
const [showConflictWarning, setShowConflictWarning] = useState(false);
```

**Lógica de submissão**:
```typescript
const handleSubmit = async () => {
  const res = await fetch('/api/blocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const data = await res.json();
  
  if (data.warning && data.conflicts) {
    // Mostrar aviso de conflitos
    setConflicts(data.conflicts);
    setShowConflictWarning(true);
  } else {
    // Sucesso!
    onSuccess();
    onClose();
  }
};

const confirmBlock = async () => {
  // Usuário decidiu bloquear mesmo com conflitos
  await fetch('/api/blocks?force=true', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  onSuccess();
  onClose();
};
```

### RT09 - Frontend: Visualização na Agenda
**Arquivo**: `web/src/app/dashboard/schedule/page.tsx`

**Buscar bloqueios do mês**:
```typescript
useEffect(() => {
  if (viewMode === 'month') {
    fetchMonthBlocks();
  }
}, [currentMonth, viewMode]);

const fetchMonthBlocks = async () => {
  const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  
  const res = await fetch(`/api/blocks?start=${start}&end=${end}`);
  const data = await res.json();
  setMonthBlocks(data);
};
```

**Marcar dias bloqueados**:
```typescript
const getDayBlockStatus = (day: Date) => {
  const dayStr = format(day, 'yyyy-MM-dd');
  
  const dayBlocks = monthBlocks.filter(b => {
    const start = format(new Date(b.startDate), 'yyyy-MM-dd');
    const end = format(new Date(b.endDate), 'yyyy-MM-dd');
    return dayStr >= start && dayStr <= end;
  });
  
  if (dayBlocks.length === 0) return null;
  
  const hasFullDay = dayBlocks.some(b => b.blockType === 'FULL_DAY');
  if (hasFullDay) return 'FULL_DAY';
  
  return 'PARTIAL';
};
```

**Renderizar dia com bloqueio**:
```typescript
<div
  className={`
    ${blockStatus === 'FULL_DAY' && 'bg-red-50 border-red-200'}
    ${blockStatus === 'PARTIAL' && 'bg-yellow-50 border-yellow-200'}
  `}
  onClick={(e) => {
    if (blockStatus) {
      e.stopPropagation();
      showBlockDetails(day);
    } else {
      // navegação normal
    }
  }}
>
  {blockStatus === 'FULL_DAY' && <span>🚫</span>}
  {blockStatus === 'PARTIAL' && <span>⏰</span>}
  {/* ... conteúdo do dia */}
</div>
```

### RT10 - Frontend: Adicionar Link no Menu
**Arquivo**: `web/src/app/dashboard/layout.tsx`

```typescript
import { CalendarX } from 'lucide-react';

const menuItems = [
  // ... itens existentes
  {
    label: 'Bloqueio de Dias',
    href: '/dashboard/blocks',
    icon: CalendarX
  }
];
```

## Critérios de Aceitação

### CA01 - Criar bloqueio de dia inteiro
```
DADO que estou na página de bloqueios
QUANDO clico em "Novo Bloqueio"
E seleciono 25/12/2026 a 25/12/2026
E escolho "Dia Inteiro"
E informo motivo "Natal"
ENTÃO o bloqueio é criado
E nenhum horário está disponível para agendamento neste dia
```

### CA02 - Criar bloqueio parcial
```
DADO que estou criando um novo bloqueio
QUANDO seleciono "Período Específico"
E defino horário das 09:00 às 12:00
E confirmo
ENTÃO apenas horários entre 09:00 e 12:00 ficam bloqueados
E horários após 12:00 continuam disponíveis
```

### CA03 - Aviso de conflito
```
DADO que existe agendamento em 05/02 às 09:30
QUANDO tento bloquear 01/02 a 10/02
ENTÃO recebo aviso listando o agendamento conflitante
E posso escolher cancelar ou continuar
```

### CA04 - Agenda online não mostra dias bloqueados
```
DADO que 25/12 está bloqueado (Natal)
QUANDO cliente acessa a página de agendamento
E tenta selecionar 25/12
ENTÃO não aparecem horários disponíveis
E mensagem informa "Data indisponível"
```

### CA05 - Visualização na agenda
```
DADO que existem bloqueios no mês atual
QUANDO visualizo a agenda em modo mês
ENTÃO dias com bloqueio total aparecem em vermelho com 🚫
E dias com bloqueio parcial aparecem em amarelo com ⏰
```

## Testes Necessários

### Testes de API
- [ ] Criar bloqueio FULL_DAY
- [ ] Criar bloqueio PARTIAL com horários
- [ ] Listar bloqueios com filtro de período
- [ ] Deletar bloqueio
- [ ] Validação: startDate > endDate (deve falhar)
- [ ] Validação: startTime > endTime (deve falhar)
- [ ] Validação: PARTIAL sem horários (deve falhar)
- [ ] Slots: dia com bloqueio FULL_DAY retorna []
- [ ] Slots: dia com bloqueio PARTIAL filtra horários
- [ ] Criar appointment em dia bloqueado (deve falhar)

### Testes de Interface
- [ ] Criar bloqueio via interface
- [ ] Visualizar lista de bloqueios
- [ ] Deletar bloqueio
- [ ] Alternar entre FULL_DAY e PARTIAL (campos horário aparecem/somem)
- [ ] Aviso de conflito mostra dados corretos
- [ ] Agenda mostra dias bloqueados com cor diferenciada
- [ ] Agenda online: dia bloqueado não aceita agendamentos

### Testes Mobile
- [ ] Interface de bloqueios responsiva
- [ ] Modal de novo bloqueio funciona em mobile
- [ ] Visualização de bloqueios na agenda mobile

## Estimativa
**Complexidade**: Média
**Tempo estimado**: 1-2 dias
**Prioridade**: Alta

## Dependências
- Nenhuma (pode ser implementado independentemente da Issue #1)

## Notas Técnicas
- Criar índice em `[startDate, endDate]` para performance
- Considerar timezone ao comparar datas
- Bloqueios parciais podem se sobrepor (ex: 09:00-12:00 e 10:00-14:00)
