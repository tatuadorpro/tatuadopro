import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { subscribeToTransactions } from '../services/firestore';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTransactions((newTransactions) => {
      setTransactions(newTransactions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { transactions, loading, error };
};