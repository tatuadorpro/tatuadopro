import { useState, useEffect } from 'react';
import { Category } from '../types';
import { subscribeToCategories } from '../services/firestore';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCategories((newCategories) => {
      setCategories(newCategories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { categories, loading };
};