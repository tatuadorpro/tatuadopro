export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: Date;
  horario: string;
  servico: string;
  valor: number;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: Date;
  agendamentoId?: string;
  metodoPagamento?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number; // em minutos
  descricao?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalReceitas: number;
  totalDespesas: number;
  saldoMensal: number;
  agendamentosHoje: number;
  agendamentosSemana: number;
  clientesAtivos: number;
  receitaMedia: number;
  crescimentoMensal: number;
}