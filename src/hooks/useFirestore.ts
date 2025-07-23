import { useState, useEffect } from 'react';
import { 
  clientesService, 
  agendamentosService, 
  transacoesService, 
  servicosService 
} from '../services/firestore';
import { Cliente, Agendamento, Transacao, Servico } from '../types';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = clientesService.onSnapshot(
      (data) => {
        setClientes(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const criarCliente = async (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await clientesService.criar(cliente);
    } catch (err) {
      setError('Erro ao criar cliente');
      throw err;
    }
  };

  const atualizarCliente = async (id: string, cliente: Partial<Cliente>) => {
    try {
      await clientesService.atualizar(id, cliente);
    } catch (err) {
      setError('Erro ao atualizar cliente');
      throw err;
    }
  };

  const deletarCliente = async (id: string) => {
    try {
      await clientesService.deletar(id);
    } catch (err) {
      setError('Erro ao deletar cliente');
      throw err;
    }
  };

  return {
    clientes,
    loading,
    error,
    criarCliente,
    atualizarCliente,
    deletarCliente
  };
};

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = agendamentosService.onSnapshot(
      (data) => {
        setAgendamentos(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const criarAgendamento = async (agendamento: Omit<Agendamento, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await agendamentosService.criar(agendamento);
    } catch (err) {
      setError('Erro ao criar agendamento');
      throw err;
    }
  };

  const atualizarAgendamento = async (id: string, agendamento: Partial<Agendamento>) => {
    try {
      await agendamentosService.atualizar(id, agendamento);
    } catch (err) {
      setError('Erro ao atualizar agendamento');
      throw err;
    }
  };

  const deletarAgendamento = async (id: string) => {
    try {
      await agendamentosService.deletar(id);
    } catch (err) {
      setError('Erro ao deletar agendamento');
      throw err;
    }
  };

  return {
    agendamentos,
    loading,
    error,
    criarAgendamento,
    atualizarAgendamento,
    deletarAgendamento
  };
};

export const useTransacoes = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = transacoesService.onSnapshot(
      (data) => {
        setTransacoes(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const criarTransacao = async (transacao: Omit<Transacao, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await transacoesService.criar(transacao);
    } catch (err) {
      setError('Erro ao criar transação');
      throw err;
    }
  };

  const atualizarTransacao = async (id: string, transacao: Partial<Transacao>) => {
    try {
      await transacoesService.atualizar(id, transacao);
    } catch (err) {
      setError('Erro ao atualizar transação');
      throw err;
    }
  };

  const deletarTransacao = async (id: string) => {
    try {
      await transacoesService.deletar(id);
    } catch (err) {
      setError('Erro ao deletar transação');
      throw err;
    }
  };

  return {
    transacoes,
    loading,
    error,
    criarTransacao,
    atualizarTransacao,
    deletarTransacao
  };
};

export const useServicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = servicosService.onSnapshot(
      (data) => {
        setServicos(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const criarServico = async (servico: Omit<Servico, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await servicosService.criar(servico);
    } catch (err) {
      setError('Erro ao criar serviço');
      throw err;
    }
  };

  const atualizarServico = async (id: string, servico: Partial<Servico>) => {
    try {
      await servicosService.atualizar(id, servico);
    } catch (err) {
      setError('Erro ao atualizar serviço');
      throw err;
    }
  };

  const deletarServico = async (id: string) => {
    try {
      await servicosService.deletar(id);
    } catch (err) {
      setError('Erro ao deletar serviço');
      throw err;
    }
  };

  return {
    servicos,
    loading,
    error,
    criarServico,
    atualizarServico,
    deletarServico
  };
};