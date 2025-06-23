import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/supabase';

type MortgageCalculation = Database['public']['Tables']['mortgage_calculation']['Row'];

interface CalculationContextType {
  calculations: MortgageCalculation[];
  saveCalculation: (calculation: Omit<MortgageCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  deleteCalculation: (id: string) => Promise<void>;
  getCalculation: (id: string) => MortgageCalculation | null;
  getCalculationAsync: (id: string) => Promise<MortgageCalculation | null>;
  updateCalculationNotes: (id: string, section: string, notes: string) => Promise<void>;
  updateCalculationComments: (id: string, comments: string) => Promise<void>;
  isLoading: boolean;
  saveToLocalStorage: (calculation: any) => void;
  getFromLocalStorage: () => any | null;
  hasLocalCalculation: boolean;
}

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export const useCalculations = () => {
  const context = useContext(CalculationContext);
  if (context === undefined) {
    throw new Error('useCalculations must be used within a CalculationProvider');
  }
  return context;
};

const LOCAL_STORAGE_KEY = 'mortgage_calculation';

export const CalculationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<MortgageCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocalCalculation, setHasLocalCalculation] = useState(false);

  useEffect(() => {
    const localCalc = localStorage.getItem(LOCAL_STORAGE_KEY);
    setHasLocalCalculation(!!localCalc);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCalculations();
    } else {
      setCalculations([]);
    }
  }, [user]);

  const fetchCalculations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mortgage_calculation')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      setCalculations(data || []);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCalculation = async (calculation: Omit<MortgageCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('Please create an account to save calculations.');
    }

    try {
      const insertData = {
        ...calculation,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('mortgage_calculation')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to save calculation: ' + error.message);
      }

      if (data) {
        setCalculations(prev => [data, ...prev]);
        return data.id;
      }

      throw new Error('Failed to save calculation - no data returned');
    } catch (error) {
      throw error;
    }
  };

  const deleteCalculation = async (id: string) => {
    if (!user) throw new Error('Must be logged in to delete calculations');

    try {
      const { error } = await supabase
        .from('mortgage_calculation')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setCalculations(prev => prev.filter(calc => calc.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const getCalculation = (id: string): MortgageCalculation | null => {
    const found = calculations.find(calc => calc.id === id);
    return found || null;
  };

  const getCalculationAsync = async (id: string): Promise<MortgageCalculation | null> => {
    // First check if we have it in our local state
    const existingCalc = calculations.find(calc => calc.id === id);
    if (existingCalc) {
      return existingCalc;
    }

    // If not found locally, query the database directly
    try {
      console.log('Querying database for calculation:', id);
      const { data, error } = await supabase
        .from('mortgage_calculation')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database query error:', error);
        return null;
      }

      console.log('Found calculation in database:', data);
      return data;
    } catch (error) {
      console.error('Error in getCalculationAsync:', error);
      return null;
    }
  };

  const updateCalculationNotes = async (id: string, section: string, notes: string) => {
    if (!user) throw new Error('Must be logged in to update notes');
    if (user.tier !== 'premium') throw new Error('Premium subscription required for notes');

    try {
      const currentCalc = calculations.find(calc => calc.id === id);
      const currentNotes = currentCalc?.notes || {};
      
      const updatedNotes = {
        ...currentNotes,
        [section]: notes
      };

      const { data, error } = await supabase
        .from('mortgage_calculation')
        .update({
          notes: updatedNotes
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setCalculations(prev => 
          prev.map(calc => calc.id === id ? data : calc)
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const updateCalculationComments = async (id: string, comments: string) => {
    if (!user) throw new Error('Must be logged in to update comments');
    if (user.tier !== 'premium') throw new Error('Premium subscription required for comments');

    try {
      const { data, error } = await supabase
        .from('mortgage_calculation')
        .update({ comments })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setCalculations(prev => 
          prev.map(calc => calc.id === id ? data : calc)
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const saveToLocalStorage = (calculation: any) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(calculation));
      setHasLocalCalculation(true);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const getFromLocalStorage = (): any | null => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  return (
    <CalculationContext.Provider value={{
      calculations,
      saveCalculation,
      deleteCalculation,
      getCalculation,
      getCalculationAsync,
      updateCalculationNotes,
      updateCalculationComments,
      isLoading,
      saveToLocalStorage,
      getFromLocalStorage,
      hasLocalCalculation
    }}>
      {children}
    </CalculationContext.Provider>
  );
};