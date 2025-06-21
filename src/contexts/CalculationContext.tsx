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
  getCalculation: (id: string) => MortgageCalculation | null;
  getCalculationAsync: (id: string) => Promise<MortgageCalculation | null>;
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
      console.log('📊 Fetching calculations for user:', user.email);
      const { data, error } = await supabase
        .from('mortgage_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching calculations:', error);
        throw error;
      }
      
      console.log('✅ Fetched calculations:', data?.length || 0);
      setCalculations(data || []);
    } catch (error) {
      console.error('💥 Error fetching calculations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestmentCalculations = async () => {
    if (!user) return;

    try {
      console.log('📈 Fetching investment calculations for user:', user.email);
      const { data, error } = await supabase
        .from('investment_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching investment calculations:', error);
        throw error;
      }
      
      console.log('✅ Fetched investment calculations:', data?.length || 0);
      setInvestmentCalculations(data || []);
    } catch (error) {
      console.error('💥 Error fetching investment calculations:', error);
    }
  };

  const saveCalculation = async (calculation: Omit<MortgageCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    console.log('💾 Saving calculation...', { user: user?.email, calculation });

    if (!user) {
      // For non-authenticated users, save to localStorage temporarily and create a shareable version
      console.log('👤 No user - creating temporary shareable calculation');
      
      try {
        const { data, error } = await supabase
          .from('mortgage_calculations')
          .insert({
            ...calculation,
            user_id: null, // Allow null for public sharing
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating shareable calculation:', error);
          throw new Error('Failed to create shareable calculation: ' + error.message);
        }

        if (data) {
          console.log('✅ Shareable calculation created:', data.id);
          return data.id;
        }

        throw new Error('Failed to create shareable calculation');
      } catch (error) {
        console.error('💥 Error in saveCalculation for non-user:', error);
        throw error;
      }
    }

    // For authenticated users, save normally
    try {
      console.log('👤 Authenticated user - saving to database');
      const { data, error } = await supabase
        .from('mortgage_calculations')
        .insert({
          ...calculation,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving calculation:', error);
        throw new Error('Failed to save calculation: ' + error.message);
      }

      if (data) {
        console.log('✅ Calculation saved successfully:', data.id);
        setCalculations(prev => [data, ...prev]);
        return data.id;
      }

      throw new Error('Failed to save calculation - no data returned');
    } catch (error) {
      console.error('💥 Error in saveCalculation:', error);
      throw error;
    }
  };

  const saveInvestmentCalculation = async (calculation: Omit<InvestmentCalculation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Must be logged in to save investment calculations');

    console.log('📈 Saving investment calculation for user:', user.email);

    try {
      const { data, error } = await supabase
        .from('investment_calculations')
        .insert({
          ...calculation,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving investment calculation:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Investment calculation saved:', data.id);
        setInvestmentCalculations(prev => [data, ...prev]);
        return data.id;
      }

      throw new Error('Failed to save investment calculation');
    } catch (error) {
      console.error('💥 Error saving investment calculation:', error);
      throw error;
    }
  };

  const deleteCalculation = async (id: string) => {
    if (!user) throw new Error('Must be logged in to delete calculations');

    console.log('🗑️ Deleting calculation:', id);

    try {
      const { error } = await supabase
        .from('mortgage_calculations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error deleting calculation:', error);
        throw error;
      }

      console.log('✅ Calculation deleted successfully');
      setCalculations(prev => prev.filter(calc => calc.id !== id));
    } catch (error) {
      console.error('💥 Error deleting calculation:', error);
      throw error;
    }
  };

  // Synchronous version for components that have the calculation in state
  const getCalculation = (id: string): MortgageCalculation | null => {
    // Check in current calculations
    const found = calculations.find(calc => calc.id === id);
    console.log('🔍 Getting calculation (sync):', id, found ? 'found' : 'not found');
    return found || null;
  };

  // Async version for fetching from database
  const getCalculationAsync = async (id: string): Promise<MortgageCalculation | null> => {
    console.log('🔍 Getting calculation (async):', id);

    // Check in current calculations first
    const existingCalc = calculations.find(calc => calc.id === id);
    if (existingCalc) {
      console.log('✅ Found calculation in cache');
      return existingCalc;
    }

    // If not found, fetch from database
    try {
      console.log('🌐 Fetching calculation from database');
      const { data, error } = await supabase
        .from('mortgage_calculations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching calculation:', error);
        return null;
      }

      console.log('✅ Fetched calculation from database');
      return data;
    } catch (error) {
      console.error('💥 Error fetching calculation:', error);
      return null;
    }
  };

  const updateCalculationNotes = async (id: string, section: string, notes: string) => {
    if (!user) throw new Error('Must be logged in to update notes');

    console.log('📝 Updating calculation notes:', id, section);

    try {
      const { data, error } = await supabase
        .from('mortgage_calculations')
        .update({
          notes: { [section]: notes }
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating notes:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Notes updated successfully');
        setCalculations(prev => 
          prev.map(calc => calc.id === id ? data : calc)
        );
      }
    } catch (error) {
      console.error('💥 Error updating notes:', error);
      throw error;
    }
  };

  const updateCalculationComments = async (id: string, comments: string) => {
    if (!user) throw new Error('Must be logged in to update comments');

    console.log('💬 Updating calculation comments:', id);

    try {
      const { data, error } = await supabase
        .from('mortgage_calculations')
        .update({ comments })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating comments:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Comments updated successfully');
        setCalculations(prev => 
          prev.map(calc => calc.id === id ? data : calc)
        );
      }
    } catch (error) {
      console.error('💥 Error updating comments:', error);
      throw error;
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
      getCalculationAsync,
      updateCalculationNotes,
      updateCalculationComments,
      isLoading
    }}>
      {children}
    </CalculationContext.Provider>
  );
};