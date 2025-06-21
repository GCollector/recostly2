import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/supabase';

type MortgageCalculation = Database['public']['Tables']['mortgage_calculations']['Row'];
type InvestmentCalculation = Database['public']['Tables']['investment_calculations']['Row'];

interface CalculationContextType {
  calculations: MortgageCalculation[];
  investmentCalculations: InvestmentCalculation[];
  saveCalculation: (calculation: Omit<MortgageCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  saveInvestmentCalculation: (calculation: Omit<InvestmentCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  deleteCalculation: (id: string) => Promise<void>;
  getCalculation: (id: string) => Promise<MortgageCalculation | null>;
  updateCalculationNotes: (id: string, section: string, notes: string) => Promise<void>;
  updateCalculationComments: (id: string, comments: string) => Promise<void>;
  isLoading: boolean;
}

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export const useCalculations = () => {
  const context = useContext(CalculationContext);
  if (context === undefined) {
    throw new Error('useCalculations must be used within a CalculationProvider');
  }
  return context;
};

export const CalculationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<MortgageCalculation[]>([]);
  const [investmentCalculations, setInvestmentCalculations] = useState<InvestmentCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCalculations();
      fetchInvestmentCalculations();
    } else {
      setCalculations([]);
      setInvestmentCalculations([]);
    }
  }, [user]);

  const fetchCalculations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mortgage_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalculations(data || []);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestmentCalculations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investment_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestmentCalculations(data || []);
    } catch (error) {
      console.error('Error fetching investment calculations:', error);
    }
  };

  const saveCalculation = async (calculation: Omit<MortgageCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      // For non-authenticated users, save to localStorage temporarily
      const tempId = 'temp-' + Date.now();
      const tempCalculation = {
        ...calculation,
        id: tempId,
        user_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const existing = JSON.parse(localStorage.getItem('tempCalculations') || '[]');
      existing.push(tempCalculation);
      localStorage.setItem('tempCalculations', JSON.stringify(existing));
      
      return tempId;
    }

    const { data, error } = await supabase
      .from('mortgage_calculations')
      .insert({
        ...calculation,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setCalculations(prev => [data, ...prev]);
      return data.id;
    }

    throw new Error('Failed to save calculation');
  };

  const saveInvestmentCalculation = async (calculation: Omit<InvestmentCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Must be logged in to save investment calculations');

    const { data, error } = await supabase
      .from('investment_calculations')
      .insert({
        ...calculation,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setInvestmentCalculations(prev => [data, ...prev]);
      return data.id;
    }

    throw new Error('Failed to save investment calculation');
  };

  const deleteCalculation = async (id: string) => {
    if (!user) throw new Error('Must be logged in to delete calculations');

    const { error } = await supabase
      .from('mortgage_calculations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setCalculations(prev => prev.filter(calc => calc.id !== id));
  };

  const getCalculation = async (id: string): Promise<MortgageCalculation | null> => {
    // First check if it's a temp calculation
    if (id.startsWith('temp-')) {
      const tempCalculations = JSON.parse(localStorage.getItem('tempCalculations') || '[]');
      return tempCalculations.find((calc: MortgageCalculation) => calc.id === id) || null;
    }

    const { data, error } = await supabase
      .from('mortgage_calculations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching calculation:', error);
      return null;
    }

    return data;
  };

  const updateCalculationNotes = async (id: string, section: string, notes: string) => {
    if (!user) throw new Error('Must be logged in to update notes');

    const { data, error } = await supabase
      .from('mortgage_calculations')
      .update({
        notes: { [section]: notes }
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setCalculations(prev => 
        prev.map(calc => calc.id === id ? data : calc)
      );
    }
  };

  const updateCalculationComments = async (id: string, comments: string) => {
    if (!user) throw new Error('Must be logged in to update comments');

    const { data, error } = await supabase
      .from('mortgage_calculations')
      .update({ comments })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setCalculations(prev => 
        prev.map(calc => calc.id === id ? data : calc)
      );
    }
  };

  return (
    <CalculationContext.Provider value={{
      calculations,
      investmentCalculations,
      saveCalculation,
      saveInvestmentCalculation,
      deleteCalculation,
      getCalculation,
      updateCalculationNotes,
      updateCalculationComments,
      isLoading
    }}>
      {children}
    </CalculationContext.Provider>
  );
};