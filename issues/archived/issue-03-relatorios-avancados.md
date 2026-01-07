# Issue #3: Implementar Relatórios Avançados

## Descrição
Criar página de relatórios com análises detalhadas do negócio, incluindo: ganhos do ano anterior (2025), serviços mais realizados, serviços mais lucrativos e clientes VIP (top 10 clientes mais frequentes/gastadores).

## Contexto de Negócio
A Andreia precisa visualizar métricas importantes para tomar decisões estratégicas sobre o negócio, como:
- Entender quais serviços trazem mais lucro
- Identificar clientes fiéis para programas de fidelidade
- Analisar tendências mensais de faturamento
- Avaliar crescimento ano a ano

## Requisitos Funcionais

### RF01 - Seleção de Ano
- [ ] Exibir botões para selecionar ano:
  - Ano atual (2026)
  - Ano anterior (2025)
- [ ] Ano selecionado fica destacado visualmente
- [ ] Ao trocar ano, recarregar todos os dados

### RF02 - Resumo Financeiro
- [ ] Exibir card com:
  - Faturamento total do ano selecionado
  - Total de agendamentos realizados
  - Ticket médio (faturamento / agendamentos)
- [ ] Valores formatados em R$ com 2 casas decimais
- [ ] Ícones ilustrativos

### RF03 - Faturamento Mensal
- [ ] Tabela listando todos os 12 meses
- [ ] Para cada mês:
  - Nome do mês
  - Faturamento (R$)
  - Quantidade de agendamentos
- [ ] Linha de TOTAL ao final
- [ ] Meses sem dados mostram R$ 0,00 (0 agend.)

### RF04 - Formas de Pagamento
- [ ] Tabela com breakdown por método:
  - PIX
  - Dinheiro
  - Cartão de Crédito
  - Cartão de Débito
- [ ] Para cada método:
  - Quantidade de pagamentos
  - Valor total em R$
- [ ] Ordenar por valor total (decrescente)

### RF05 - Serviços Mais Realizados
- [ ] Toggle para alternar entre:
  - **Mais Realizados** (por quantidade)
  - **Mais Lucrativos** (por faturamento)
- [ ] Exibir TOP 5 serviços
- [ ] Para cada serviço:
  - Nome
  - Quantidade de vezes realizado
  - Faturamento total em R$
- [ ] Numeração (1º, 2º, 3º, 4º, 5º)

### RF06 - Top 10 Clientes VIP
- [ ] Lista dos 10 clientes que mais gastaram no ano
- [ ] Para cada cliente:
  - Nome
  - Total de visitas
  - Total gasto em R$
  - Data da última visita
  - Serviço preferido (mais frequente)
- [ ] Badges especiais:
  - 🏆 para 1º lugar
  - 🥈 para 2º lugar
  - 🥉 para 3º lugar
- [ ] Link opcional para página do cliente (futuro)

### RF07 - Tratamento de Dados Vazios
- [ ] Se ano não tem dados: mostrar mensagem "Nenhum agendamento realizado em [ano]"
- [ ] Não quebrar interface, manter estrutura com valores zerados

### RF08 - Responsividade Mobile
- [ ] Tabelas devem se adaptar para mobile (scroll horizontal se necessário)
- [ ] Cards empilhados verticalmente em telas pequenas
- [ ] Botões de seleção de ano responsivos

## Requisitos Técnicos

### RT01 - API: Anos Disponíveis
**Arquivo**: `web/src/app/api/reports/years/route.ts` (NOVO)

**GET `/api/reports/years`**

```typescript
export async function GET(request: Request) {
  const session = await auth();
  const userId = await getUserIdFromEmail(session.user.email);
  
  // Buscar todos appointments COMPLETED do usuário
  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
      status: 'COMPLETED'
    },
    select: {
      date: true,
      paidPrice: true
    }
  });
  
  // Agrupar por ano
  const yearMap = new Map();
  
  appointments.forEach(appt => {
    const year = new Date(appt.date).getFullYear();
    if (!yearMap.has(year)) {
      yearMap.set(year, { count: 0, revenue: 0 });
    }
    const data = yearMap.get(year);
    data.count++;
    data.revenue += Number(appt.paidPrice || 0);
  });
  
  // Converter para array e ordenar
  const years = Array.from(yearMap.entries()).map(([year, data]) => ({
    year,
    appointmentCount: data.count,
    totalRevenue: data.revenue
  })).sort((a, b) => b.year - a.year); // Mais recente primeiro
  
  return NextResponse.json({ years });
}
```

### RT02 - API: Resumo do Ano
**Arquivo**: `web/src/app/api/reports/summary/route.ts` (MODIFICAR se já existe)

**GET `/api/reports/summary?year=2025`**

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  
  const session = await auth();
  const userId = await getUserIdFromEmail(session.user.email);
  
  // Buscar appointments do ano
  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31T23:59:59`)
      }
    },
    select: {
      date: true,
      paidPrice: true,
      paymentMethod: true
    }
  });
  
  // Cálculos
  const totalRevenue = appointments.reduce((sum, a) => sum + Number(a.paidPrice || 0), 0);
  const totalAppointments = appointments.length;
  const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
  
  // Breakdown mensal
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: getMonthName(i + 1),
    revenue: 0,
    appointments: 0
  }));
  
  appointments.forEach(appt => {
    const month = new Date(appt.date).getMonth(); // 0-indexed
    monthlyData[month].revenue += Number(appt.paidPrice || 0);
    monthlyData[month].appointments++;
  });
  
  // Breakdown por forma de pagamento
  const paymentMethodMap = new Map();
  appointments.forEach(appt => {
    if (!appt.paymentMethod) return;
    
    if (!paymentMethodMap.has(appt.paymentMethod)) {
      paymentMethodMap.set(appt.paymentMethod, { count: 0, total: 0 });
    }
    const data = paymentMethodMap.get(appt.paymentMethod);
    data.count++;
    data.total += Number(appt.paidPrice || 0);
  });
  
  const paymentMethodBreakdown = Array.from(paymentMethodMap.entries())
    .map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total
    }))
    .sort((a, b) => b.total - a.total);
  
  return NextResponse.json({
    year,
    totalRevenue,
    totalAppointments,
    averageTicket,
    monthlyBreakdown: monthlyData,
    paymentMethodBreakdown
  });
}

function getMonthName(month: number): string {
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return names[month - 1];
}
```

### RT03 - API: Top Serviços
**Arquivo**: `web/src/app/api/reports/top-services/route.ts` (MODIFICAR se já existe)

**GET `/api/reports/top-services?year=2025&metric=count`**

Query params:
- `year`: ano para filtrar
- `metric`: `count` ou `revenue`

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const metric = searchParams.get('metric') || 'count';
  
  const session = await auth();
  const userId = await getUserIdFromEmail(session.user.email);
  
  // IMPORTANTE: Com a mudança para múltiplos serviços (Issue #1),
  // precisamos buscar da tabela AppointmentService
  // Se Issue #1 não foi implementada ainda, usar lógica antiga
  
  const appointmentServices = await prisma.$queryRaw`
    SELECT 
      s.id,
      s.name,
      COUNT(*)::int as count,
      SUM(aps."priceSnapshot")::float as revenue
    FROM "AppointmentService" aps
    JOIN "Service" s ON aps."serviceId" = s.id
    JOIN "Appointment" a ON aps."appointmentId" = a.id
    WHERE 
      a."userId" = ${userId}
      AND a.status = 'COMPLETED'
      AND EXTRACT(YEAR FROM a.date) = ${year}
    GROUP BY s.id, s.name
    ORDER BY ${metric === 'revenue' ? 'revenue' : 'count'} DESC
    LIMIT 5
  `;
  
  return NextResponse.json({
    metric,
    services: appointmentServices
  });
}
```

> **NOTA**: Se a Issue #1 ainda não foi implementada, usar lógica alternativa:
```typescript
// Versão PRÉ Issue #1 (um serviço por agendamento):
const services = await prisma.appointment.groupBy({
  by: ['serviceId'],
  where: {
    userId,
    status: 'COMPLETED',
    date: {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31T23:59:59`)
    }
  },
  _count: { id: true },
  _sum: { paidPrice: true }
});
```

### RT04 - API: Top Clientes
**Arquivo**: `web/src/app/api/reports/top-clients/route.ts` (MODIFICAR se já existe)

**GET `/api/reports/top-clients?year=2025&limit=10`**

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const session = await auth();
  const userId = await getUserIdFromEmail(session.user.email);
  
  // Buscar agendamentos agrupados por cliente
  const clientData = await prisma.$queryRaw`
    SELECT 
      c.id,
      c.name,
      c.phone,
      COUNT(a.id)::int as "totalAppointments",
      SUM(a."paidPrice")::float as "totalSpent",
      MAX(a.date) as "lastVisit"
    FROM "Client" c
    JOIN "Appointment" a ON a."clientId" = c.id
    WHERE 
      a."userId" = ${userId}
      AND a.status = 'COMPLETED'
      AND EXTRACT(YEAR FROM a.date) = ${year}
    GROUP BY c.id, c.name, c.phone
    ORDER BY "totalSpent" DESC
    LIMIT ${limit}
  `;
  
  // Para cada cliente, buscar serviço favorito
  const clientsWithFavorite = await Promise.all(
    clientData.map(async (client: any) => {
      // Serviço mais frequente deste cliente no ano
      const favoriteService = await prisma.$queryRaw`
        SELECT s.name, COUNT(*)::int as count
        FROM "Appointment" a
        JOIN "AppointmentService" aps ON aps."appointmentId" = a.id
        JOIN "Service" s ON aps."serviceId" = s.id
        WHERE 
          a."clientId" = ${client.id}
          AND a.status = 'COMPLETED'
          AND EXTRACT(YEAR FROM a.date) = ${year}
        GROUP BY s.id, s.name
        ORDER BY count DESC
        LIMIT 1
      `;
      
      return {
        ...client,
        averageTicket: client.totalSpent / client.totalAppointments,
        favoriteService: favoriteService[0]?.name || 'N/A'
      };
    })
  );
  
  return NextResponse.json({ clients: clientsWithFavorite });
}
```

### RT05 - Frontend: Página de Relatórios
**Arquivo**: `web/src/app/dashboard/reports/page.tsx` (EXPANDIR se já existe)

**Estado do componente**:
```typescript
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [availableYears, setAvailableYears] = useState<number[]>([]);
const [summary, setSummary] = useState(null);
const [topServices, setTopServices] = useState([]);
const [servicesMetric, setServicesMetric] = useState<'count' | 'revenue'>('count');
const [topClients, setTopClients] = useState([]);
const [loading, setLoading] = useState(true);
```

**Buscar dados**:
```typescript
useEffect(() => {
  fetchAvailableYears();
}, []);

useEffect(() => {
  if (selectedYear) {
    fetchReports();
  }
}, [selectedYear, servicesMetric]);

const fetchAvailableYears = async () => {
  const res = await fetch('/api/reports/years');
  const data = await res.json();
  setAvailableYears(data.years.map(y => y.year));
};

const fetchReports = async () => {
  setLoading(true);
  
  const [summaryRes, servicesRes, clientsRes] = await Promise.all([
    fetch(`/api/reports/summary?year=${selectedYear}`),
    fetch(`/api/reports/top-services?year=${selectedYear}&metric=${servicesMetric}`),
    fetch(`/api/reports/top-clients?year=${selectedYear}&limit=10`)
  ]);
  
  setSummary(await summaryRes.json());
  setTopServices((await servicesRes.json()).services);
  setTopClients((await clientsRes.json()).clients);
  
  setLoading(false);
};
```

**Componentes de UI**:

```typescript
// Card de Resumo Financeiro
function FinancialSummaryCard({ data }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">💰 Resumo Financeiro - {data.year}</h3>
      <div className="text-4xl font-bold text-green-600 mb-2">
        {formatCurrency(data.totalRevenue)}
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-zinc-500">Total de Agendamentos</p>
          <p className="text-xl font-bold">{data.totalAppointments}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Ticket Médio</p>
          <p className="text-xl font-bold">{formatCurrency(data.averageTicket)}</p>
        </div>
      </div>
    </div>
  );
}

// Tabela Mensal
function MonthlyBreakdownTable({ months }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">📅 Faturamento Mensal</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Mês</th>
            <th className="text-right py-2">Faturamento</th>
            <th className="text-right py-2">Agendamentos</th>
          </tr>
        </thead>
        <tbody>
          {months.map(m => (
            <tr key={m.month} className="border-b">
              <td className="py-2">{m.monthName}</td>
              <td className="text-right">{formatCurrency(m.revenue)}</td>
              <td className="text-right">{m.appointments}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="py-2">TOTAL</td>
            <td className="text-right">
              {formatCurrency(months.reduce((s, m) => s + m.revenue, 0))}
            </td>
            <td className="text-right">
              {months.reduce((s, m) => s + m.appointments, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Lista de Clientes VIP
function TopClientsCard({ clients }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">👑 Top 10 Clientes VIP</h3>
      <div className="space-y-3">
        {clients.map((client, index) => (
          <div key={client.id} className="border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </span>
              <div className="flex-1">
                <p className="font-bold">{client.name}</p>
                <p className="text-sm text-zinc-600">
                  {client.totalAppointments} visitas | {formatCurrency(client.totalSpent)} | 
                  Últ: {format(new Date(client.lastVisit), 'dd/MM/yy')}
                </p>
                <p className="text-xs text-zinc-500">
                  Preferido: {client.favoriteService}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### RT06 - Utilitários
**Arquivo**: `web/src/lib/utils.ts` (ou criar)

```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
```

## Critérios de Aceitação

### CA01 - Visualizar resumo do ano atual
```
DADO que estou na página de relatórios
QUANDO a página carrega
ENTÃO vejo dados do ano atual (2026)
E o resumo financeiro mostra faturamento total, agendamentos e ticket médio
```

### CA02 - Alternar para ano anterior
```
DADO que estou visualizando dados de 2026
QUANDO clico no botão "2025"
ENTÃO todos os dados são atualizados para mostrar apenas 2025
E o botão 2025 fica destacado
```

### CA03 - Alternar métrica de serviços
```
DADO que estou na seção de serviços
E vendo "Mais Realizados" (ordenado por quantidade)
QUANDO clico em "Mais Lucrativos"
ENTÃO a lista é reordenada por faturamento total
E os mesmos serviços aparecem em ordem diferente
```

### CA04 - Top 10 clientes com dados corretos
```
DADO que Maria Silva teve 45 visitas em 2025 totalizando R$ 2.250
QUANDO visualizo relatório de 2025
ENTÃO Maria aparece na lista de clientes VIP
E os dados estão corretos: 45 visitas, R$ 2.250
E seu serviço preferido está listado
```

### CA05 - Ano sem dados
```
DADO que não há agendamentos em 2024
QUANDO seleciono 2024
ENTÃO vejo mensagem "Nenhum agendamento realizado em 2024"
E valores aparecem como R$ 0,00
```

## Testes Necessários

### Testes de API
- [ ] `/api/reports/years` retorna lista correta de anos
- [ ] `/api/reports/summary?year=2025` calcula valores corretos
- [ ] Breakdown mensal: todos os 12 meses aparecem
- [ ] Breakdown por pagamento: valores corretos
- [ ] Top serviços por quantidade
- [ ] Top serviços por faturamento
- [ ] Top 10 clientes ordenados corretamente
- [ ] Serviço favorito calculado corretamente

### Testes de Interface
- [ ] Seleção de ano funciona
- [ ] Dados recarregam ao trocar ano
- [ ] Toggle de métrica de serviços funciona
- [ ] Formatação de moeda (R$ 1.234,56)
- [ ] Formatação de data (dd/MM/yy)
- [ ] Cards responsivos em mobile
- [ ] Tabelas com scroll horizontal em mobile se necessário

### Testes de Integração
- [ ] Com dados reais: valores batem com agendamentos
- [ ] Ticket médio = faturamento / agendamentos
- [ ] Soma dos meses = faturamento total
- [ ] Apenas agendamentos COMPLETED são contados
- [ ] Apenas agendamentos com paidPrice são somados

## Estimativa
**Complexidade**: Média
**Tempo estimado**: 2 dias
**Prioridade**: Média (após Issue #1 e #2)

## Dependências
- **Opcional**: Issue #1 (múltiplos serviços) afeta cálculo de top serviços
  - Se Issue #1 não foi implementada: usar lógica antiga (1 serviço por appointment)
  - Se Issue #1 foi implementada: usar tabela AppointmentService

## Notas Técnicas
- Usar `$queryRaw` para queries complexas de agregação
- Otimizar performance: adicionar índices em `appointment.date`, `appointment.status`
- Cache de relatórios pode ser implementado no futuro (Redis)
- Por enquanto, apenas valores. **Gráficos serão adicionados em versão futura**
- Apenas ano atual e anterior por enquanto. **Expandir para todos os anos no futuro**
