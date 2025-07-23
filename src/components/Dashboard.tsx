import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  DollarSign,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useAgendamentos, useTransacoes } from '../hooks/useFirestore';
import { 
  calculateDashboardStats, 
  formatCurrency, 
  getMonthlyData, 
  getCategoryData,
  getTopClientes
} from '../utils/calculations';

const Dashboard: React.FC = () => {
  const { agendamentos, loading: loadingAgendamentos } = useAgendamentos();
  const { transacoes, loading: loadingTransacoes } = useTransacoes();

  if (loadingAgendamentos || loadingTransacoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = calculateDashboardStats(agendamentos, transacoes);
  const monthlyData = getMonthlyData(transacoes);
  const categoryData = getCategoryData(transacoes);
  const topClientes = getTopClientes(agendamentos);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {typeof value === 'number' && title.includes('R$') ? formatCurrency(value) : value}
          </p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receitas do Mês"
          value={stats.totalReceitas}
          icon={TrendingUp}
          color="text-green-600"
          change={stats.crescimentoMensal}
        />
        <StatCard
          title="Despesas do Mês"
          value={stats.totalDespesas}
          icon={TrendingDown}
          color="text-red-600"
        />
        <StatCard
          title="Saldo Mensal"
          value={stats.saldoMensal}
          icon={DollarSign}
          color={stats.saldoMensal >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          title="Agendamentos Hoje"
          value={stats.agendamentosHoje}
          icon={Calendar}
          color="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Agendamentos Semana"
          value={stats.agendamentosSemana}
          icon={Clock}
          color="text-purple-600"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.clientesAtivos}
          icon={Users}
          color="text-indigo-600"
        />
        <StatCard
          title="Receita Média"
          value={stats.receitaMedia}
          icon={TrendingUp}
          color="text-green-600"
        />
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status Geral</p>
              <p className={`text-lg font-bold ${stats.saldoMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.saldoMensal >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stats.saldoMensal >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {stats.saldoMensal >= 0 ? 
                <TrendingUp size={24} className="text-green-600" /> : 
                <TrendingDown size={24} className="text-red-600" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Categorias */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData.filter((cat: any) => cat.receitas > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nome, receitas }) => `${nome}: ${formatCurrency(receitas)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="receitas"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linha do tempo de saldo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Saldo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Saldo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Clientes */}
      {topClientes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clientes do Mês</h3>
          <div className="space-y-4">
            {topClientes.map((cliente: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cliente.nome}</p>
                  <p className="text-sm text-gray-600">{cliente.totalAgendamentos} agendamentos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(cliente.totalGasto)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;