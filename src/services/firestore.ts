import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Cliente, Agendamento, Transacao, Servico } from '../types';

// Utilitário para converter Timestamp do Firestore para Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// CLIENTES
export const clientesService = {
  async criar(cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...cliente,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    return docRef.id;
  },

  async atualizar(id: string, cliente: Partial<Cliente>) {
    const docRef = doc(db, 'clientes', id);
    await updateDoc(docRef, {
      ...cliente,
      updatedAt: Timestamp.fromDate(new Date())
    });
  },

  async deletar(id: string) {
    await deleteDoc(doc(db, 'clientes', id));
  },

  async buscarTodos(): Promise<Cliente[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'clientes'), orderBy('nome'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Cliente[];
  },

  async buscarPorId(id: string): Promise<Cliente | null> {
    const docSnap = await getDoc(doc(db, 'clientes', id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Cliente;
    }
    return null;
  },

  onSnapshot(callback: (clientes: Cliente[]) => void) {
    return onSnapshot(
      query(collection(db, 'clientes'), orderBy('nome')),
      (snapshot) => {
        const clientes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as Cliente[];
        callback(clientes);
      }
    );
  }
};

// AGENDAMENTOS
export const agendamentosService = {
  async criar(agendamento: Omit<Agendamento, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const docRef = await addDoc(collection(db, 'agendamentos'), {
      ...agendamento,
      data: Timestamp.fromDate(agendamento.data),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });

    // Criar transação automática se o agendamento for concluído
    if (agendamento.status === 'concluido') {
      await transacoesService.criar({
        tipo: 'receita',
        categoria: 'Serviços',
        descricao: `${agendamento.servico} - ${agendamento.clienteNome}`,
        valor: agendamento.valor,
        data: agendamento.data,
        agendamentoId: docRef.id,
        metodoPagamento: 'Dinheiro'
      });
    }

    return docRef.id;
  },

  async atualizar(id: string, agendamento: Partial<Agendamento>) {
    const docRef = doc(db, 'agendamentos', id);
    const updateData: any = {
      ...agendamento,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (agendamento.data) {
      updateData.data = Timestamp.fromDate(agendamento.data);
    }

    await updateDoc(docRef, updateData);

    // Se o status mudou para concluído, criar transação
    if (agendamento.status === 'concluido') {
      const agendamentoDoc = await getDoc(docRef);
      if (agendamentoDoc.exists()) {
        const data = agendamentoDoc.data();
        await transacoesService.criar({
          tipo: 'receita',
          categoria: 'Serviços',
          descricao: `${data.servico} - ${data.clienteNome}`,
          valor: data.valor,
          data: convertTimestamp(data.data),
          agendamentoId: id,
          metodoPagamento: 'Dinheiro'
        });
      }
    }
  },

  async deletar(id: string) {
    const batch = writeBatch(db);
    
    // Deletar agendamento
    batch.delete(doc(db, 'agendamentos', id));
    
    // Deletar transações relacionadas
    const transacoesQuery = query(
      collection(db, 'transacoes'),
      where('agendamentoId', '==', id)
    );
    const transacoesSnapshot = await getDocs(transacoesQuery);
    transacoesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  },

  async buscarTodos(): Promise<Agendamento[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'agendamentos'), orderBy('data', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: convertTimestamp(doc.data().data),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Agendamento[];
  },

  async buscarPorPeriodo(inicio: Date, fim: Date): Promise<Agendamento[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'agendamentos'),
        where('data', '>=', Timestamp.fromDate(inicio)),
        where('data', '<=', Timestamp.fromDate(fim)),
        orderBy('data')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: convertTimestamp(doc.data().data),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Agendamento[];
  },

  onSnapshot(callback: (agendamentos: Agendamento[]) => void) {
    return onSnapshot(
      query(collection(db, 'agendamentos'), orderBy('data', 'desc')),
      (snapshot) => {
        const agendamentos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          data: convertTimestamp(doc.data().data),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as Agendamento[];
        callback(agendamentos);
      }
    );
  }
};

// TRANSAÇÕES
export const transacoesService = {
  async criar(transacao: Omit<Transacao, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const docRef = await addDoc(collection(db, 'transacoes'), {
      ...transacao,
      data: Timestamp.fromDate(transacao.data),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    return docRef.id;
  },

  async atualizar(id: string, transacao: Partial<Transacao>) {
    const docRef = doc(db, 'transacoes', id);
    const updateData: any = {
      ...transacao,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (transacao.data) {
      updateData.data = Timestamp.fromDate(transacao.data);
    }

    await updateDoc(docRef, updateData);
  },

  async deletar(id: string) {
    await deleteDoc(doc(db, 'transacoes', id));
  },

  async buscarTodas(): Promise<Transacao[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'transacoes'), orderBy('data', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: convertTimestamp(doc.data().data),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Transacao[];
  },

  async buscarPorPeriodo(inicio: Date, fim: Date): Promise<Transacao[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'transacoes'),
        where('data', '>=', Timestamp.fromDate(inicio)),
        where('data', '<=', Timestamp.fromDate(fim)),
        orderBy('data', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: convertTimestamp(doc.data().data),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Transacao[];
  },

  onSnapshot(callback: (transacoes: Transacao[]) => void) {
    return onSnapshot(
      query(collection(db, 'transacoes'), orderBy('data', 'desc')),
      (snapshot) => {
        const transacoes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          data: convertTimestamp(doc.data().data),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as Transacao[];
        callback(transacoes);
      }
    );
  }
};

// SERVIÇOS
export const servicosService = {
  async criar(servico: Omit<Servico, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const docRef = await addDoc(collection(db, 'servicos'), {
      ...servico,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    return docRef.id;
  },

  async atualizar(id: string, servico: Partial<Servico>) {
    const docRef = doc(db, 'servicos', id);
    await updateDoc(docRef, {
      ...servico,
      updatedAt: Timestamp.fromDate(new Date())
    });
  },

  async deletar(id: string) {
    await deleteDoc(doc(db, 'servicos', id));
  },

  async buscarTodos(): Promise<Servico[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'servicos'), orderBy('nome'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Servico[];
  },

  onSnapshot(callback: (servicos: Servico[]) => void) {
    return onSnapshot(
      query(collection(db, 'servicos'), orderBy('nome')),
      (snapshot) => {
        const servicos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as Servico[];
        callback(servicos);
      }
    );
  }
};