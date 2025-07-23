import { Agendamento, Transacao, DashboardStats } from '../types';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isToday, 
  isThisWeek, 
  isThisMonth,
  subMonths,
  format
} from 'date-fns';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'dd/MM/yyyy HH:mm');
};

export const calculateDashboardStats = (
  agendamentos: Agendamento[],
  transacoes: Transacao[]
): DashboardStats => {
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  const inicioSemana = startOfWeek(hoje);
  const fimSemana = endOfWeek(hoje);
  const mesAnterior = subMonths(hoje, 1);
  const inicioMesAnterior = startOfMonth(mesAnterior);
  const fimMesAnterior = endOfMonth(mesAnterior);

  // Transações do mês atual
  const transacoesMesAtual = transacoes.filter(t => 
    isThisMonth(t.data)
  );

  // Transações do mês anterior
  const transacoesMesAnterior = transacoes.filter(t => 
    t.data >= inicioMesAnterior && t.data <= fimMesAnterior
  );

  // Receitas e despesas do mês atual
  const receitasMesAtual = transacoesMesAtual
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const despesasMesAtual = transacoesMesAtual
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  // Receitas do mês anterior para calcular crescimento
  const receitasMesAnterior = transacoesMesAnterior
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  // Agendamentos
  const agendamentosHoje = agendamentos.filter(a => isToday(a.data)).length;
  const agendamentosSemana = agendamentos.filter(a => isThisWeek(a.data)).length;

  // Clientes únicos (baseado nos agendamentos)
  const clientesUnicos = new Set(
    agendamentos
      .filter(a => isThisMonth(a.data))
      .map(a => a.clienteId)
  ).size;

  // Receita média por agendamento concluído
  const agendamentosConcluidos = agendamentos.filter(a => 
    a.status === 'concluido' && isThisMonth(a.data)
  );
  const receitaMedia = agendamentosConcluidos.length > 0 
    ? receitasMesAtual / agendamentosConcluidos.length 
    : 0;

  // Crescimento mensal
  const crescimentoMensal = receitasMesAnterior > 0 
    ? ((receitasMesAtual - receitasMesAnterior) / receitasMesAnterior) * 100
    : 0;

  return {
    totalReceitas: receitasMesAtual,
    totalDespesas: despesasMesAtual,
    saldoMensal: receitasMesAtual - despesasMesAtual,
    agendamentosHoje,
    agendamentosSemana,
    clientesAtivos: clientesUnicos,
    receitaMedia,
    crescimentoMensal
  };
};

export const getMonthlyData = (transacoes: Transacao[], months: number = 6) => {
  const data = [];
  const hoje = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const mes = subMonths(hoje, i);
    const inicioMes = startOfMonth(mes);
    const fimMes = endOfMonth(mes);

    const transacoesMes = transacoes.filter(t => 
      t.data >= inicioMes && t.data <= fimMes
    );

    const receitas = transacoesMes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);

    const despesas = transacoesMes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);

    data.push({
      mes: format(mes, 'MMM/yy'),
      receitas,
      despesas,
      saldo: receitas - despesas
    });
  }

  return data;
};

export const getCategoryData = (transacoes: Transacao[]) => {
  const categorias = transacoes.reduce((acc, transacao) => {
    const categoria = transacao.categoria;
    if (!acc[categoria]) {
      acc[categoria] = {
        nome: categoria,
        receitas: 0,
        despesas: 0,
        total: 0
      };
    }

    if (transacao.tipo === 'receita') {
      acc[categoria].receitas += transacao.valor;
    } else {
      acc[categoria].despesas += transacao.valor;
    }

    acc[categoria].total = acc[categoria].receitas - acc[categoria].despesas;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(categorias);
};

export const getTopClientes = (agendamentos: Agendamento[]) => {
  const clientes = agendamentos
    .filter(a => a.status === 'concluido' && isThisMonth(a.data))
    .reduce((acc, agendamento) => {
      const clienteId = agendamento.clienteId;
      if (!acc[clienteId]) {
        acc[clienteId] = {
          nome: agendamento.clienteNome,
          totalGasto: 0,
          totalAgendamentos: 0
        };
      }
      acc[clienteId].totalGasto += agendamento.valor;
      acc[clienteId].totalAgendamentos += 1;
      return acc;
    }, {} as Record<string, any>);

  return Object.values(clientes)
    .sort((a: any, b: any) => b.totalGasto - a.totalGasto)
    .slice(0, 5);
};