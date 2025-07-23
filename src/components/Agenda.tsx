import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Clock, User, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useAgendamentos, useClientes, useServicos } from '../hooks/useFirestore';
import { Agendamento } from '../types';
import { formatCurrency } from '../utils/calculations';
import 'react-calendar/dist/Calendar.css';

const Agenda: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  
  const { agendamentos, criarAgendamento, atualizarAgendamento, deletarAgendamento } = useAgendamentos();
  const { clientes } = useClientes();
  const { servicos } = useServicos();

  const [formData, setFormData] = useState({
    clienteId: '',
    data: new Date(),
    horario: '',
    servico: '',
    valor: 0,
    status: 'agendado' as const,
    observacoes: ''
  });

  const agendamentosDodia = agendamentos.filter(agendamento =>
    isSameDay(agendamento.data, selectedDate)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cliente = clientes.find(c => c.id === formData.clienteId);
    if (!cliente) return;

    const agendamentoData = {
      ...formData,
      clienteNome: cliente.nome,
      data: new Date(selectedDate.toDateString() + ' ' + formData.horario)
    };

    try {
      if (editingAgendamento) {
        await atualizarAgendamento(editingAgendamento.id, agendamentoData);
      } else {
        await criarAgendamento(agendamentoData);
      }
      
      setShowModal(false);
      setEditingAgendamento(null);
      setFormData({
        clienteId: '',
        data: new Date(),
        horario: '',
        servico: '',
        valor: 0,
        status: 'agendado',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const handleEdit = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setFormData({
      clienteId: agendamento.clienteId,
      data: agendamento.data,
      horario: format(agendamento.data, 'HH:mm'),
      servico: agendamento.servico,
      valor: agendamento.valor,
      status: agendamento.status,
      observacoes: agendamento.observacoes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await deletarAgendamento(id);
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-purple-100 text-purple-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  // Função para destacar dias com agendamentos no calendário
  const tileContent = ({ date, view }: any) => {
    if (view === 'month') {
      const hasAgendamento = agendamentos.some(agendamento =>
        isSameDay(agendamento.data, date)
      );
      
      if (hasAgendamento) {
        return <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto mt-1"></div>;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie seus agendamentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="pt-BR"
              tileContent={tileContent}
              className="w-full border-none"
            />
          </div>
        </div>

        {/* Lista de agendamentos do dia */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Agendamentos - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
            </div>
            
            <div className="p-6">
              {agendamentosDodia.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agendamento</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Não há agendamentos para este dia.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agendamentosDodia
                    .sort((a, b) => a.data.getTime() - b.data.getTime())
                    .map((agendamento) => (
                    <div key={agendamento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                              {getStatusLabel(agendamento.status)}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock size={14} />
                              {format(agendamento.data, 'HH:mm')}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User size={16} />
                            {agendamento.clienteNome}
                          </h3>
                          
                          <p className="text-gray-600 mt-1">{agendamento.servico}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <DollarSign size={16} className="text-green-600" />
                            <span className="font-medium text-green-600">
                              {formatCurrency(agendamento.valor)}
                            </span>
                          </div>
                          
                          {agendamento.observacoes && (
                            <p className="text-sm text-gray-500 mt-2">{agendamento.observacoes}</p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(agendamento)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(agendamento.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Agendamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviço
                </label>
                <select
                  value={formData.servico}
                  onChange={(e) => {
                    const servicoSelecionado = servicos.find(s => s.nome === e.target.value);
                    setFormData({ 
                      ...formData, 
                      servico: e.target.value,
                      valor: servicoSelecionado?.preco || 0
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicos.filter(s => s.ativo).map((servico) => (
                    <option key={servico.id} value={servico.nome}>
                      {servico.nome} - {formatCurrency(servico.preco)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  {editingAgendamento ? 'Atualizar' : 'Criar'} Agendamento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAgendamento(null);
                    setFormData({
                      clienteId: '',
                      data: new Date(),
                      horario: '',
                      servico: '',
                      valor: 0,
                      status: 'agendado',
                      observacoes: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;