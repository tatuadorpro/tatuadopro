import React, { useState } from 'react';
import { Plus, Edit, Trash2, TrendingDown, Calendar, Tag } from 'lucide-react';
import { useTransacoes } from '../hooks/useFirestore';
import { formatCurrency, formatDate } from '../utils/calculations';
import { Transacao } from '../types';

const Despesas: React.FC = () => {
  const { transacoes, criarTransacao, atualizarTransacao, deletarTransacao } = useTransacoes();
  const [showModal, setShowModal] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  
  const [formData, setFormData] = useState({
    categoria: '',
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    metodoPagamento: '',
    observacoes: ''
  });

  const despesas = transacoes.filter(t => t.tipo === 'despesa');

  const categorias = [
    'Material',
    'Equipamentos',
    'Aluguel',
    'Marketing',
    'Transporte',
    'Alimentação',
    'Outros'
  ];

  const metodosPagamento = [
    'Dinheiro',
    'PIX',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Transferência'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transacaoData = {
      tipo: 'despesa' as const,
      ...formData,
      data: new Date(formData.data)
    };

    try {
      if (editingTransacao) {
        await atualizarTransacao(editingTransacao.id, transacaoData);
      } else {
        await criarTransacao(transacaoData);
      }
      
      setShowModal(false);
      setEditingTransacao(null);
      setFormData({
        categoria: '',
        descricao: '',
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        metodoPagamento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    }
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setFormData({
      categoria: transacao.categoria,
      descricao: transacao.descricao,
      valor: transacao.valor,
      data: transacao.data.toISOString().split('T')[0],
      metodoPagamento: transacao.metodoPagamento || '',
      observacoes: transacao.observacoes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deletarTransacao(id);
      } catch (error) {
        console.error('Erro ao deletar despesa:', error);
      }
    }
  };

  const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600">Gerencie suas despesas e gastos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Despesa
        </button>
      </div>

      {/* Card de resumo */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100">Total de Despesas</p>
            <p className="text-3xl font-bold">{formatCurrency(totalDespesas)}</p>
            <p className="text-red-100">{despesas.length} transações</p>
          </div>
          <TrendingDown size={48} className="text-red-200" />
        </div>
      </div>

      {/* Lista de despesas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Despesas</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {despesas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <TrendingDown className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma despesa</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comece adicionando sua primeira despesa.
                    </p>
                  </td>
                </tr>
              ) : (
                despesas.map((despesa) => (
                  <tr key={despesa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        {formatDate(despesa.data)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{despesa.descricao}</div>
                        {despesa.observacoes && (
                          <div className="text-gray-500 text-xs">{despesa.observacoes}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Tag size={12} className="mr-1" />
                        {despesa.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {formatCurrency(despesa.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {despesa.metodoPagamento || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(despesa)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(despesa.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Despesa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingTransacao ? 'Editar Despesa' : 'Nova Despesa'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={formData.metodoPagamento}
                  onChange={(e) => setFormData({ ...formData, metodoPagamento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Selecione o método</option>
                  {metodosPagamento.map((metodo) => (
                    <option key={metodo} value={metodo}>
                      {metodo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  {editingTransacao ? 'Atualizar' : 'Criar'} Despesa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransacao(null);
                    setFormData({
                      categoria: '',
                      descricao: '',
                      valor: 0,
                      data: new Date().toISOString().split('T')[0],
                      metodoPagamento: '',
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

export default Despesas;