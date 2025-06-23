import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Save, X } from 'lucide-react';
import { ClosingCostPreset } from '../../types/premium';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CurrencyInput from '../shared/CurrencyInput';

interface ClosingCostPresetsProps {
  onPresetSelected?: (preset: ClosingCostPreset) => void;
  showSelector?: boolean;
}

const ClosingCostPresets: React.FC<ClosingCostPresetsProps> = ({
  onPresetSelected,
  showSelector = false
}) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<ClosingCostPreset[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    landTransferTax: 8475,
    additionalTax: 0,
    legalFees: 2000,
    titleInsurance: 400,
    homeInspection: 500,
    appraisal: 400,
    surveyFee: 1000,
    firstTimeBuyerRebate: 0
  });

  useEffect(() => {
    if (user?.tier === 'premium') {
      fetchPresets();
    }
  }, [user]);

  const fetchPresets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('closing_cost_preset')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error fetching presets:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.name.trim()) return;

    try {
      if (editingId) {
        // Update existing preset
        const { error } = await supabase
          .from('closing_cost_preset')
          .update(formData)
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new preset
        const { error } = await supabase
          .from('closing_cost_preset')
          .insert({
            ...formData,
            user_id: user.id
          });

        if (error) throw error;
      }

      await fetchPresets();
      setIsCreating(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this preset?')) return;

    try {
      const { error } = await supabase
        .from('closing_cost_preset')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
    }
  };

  const handleEdit = (preset: ClosingCostPreset) => {
    setFormData({
      name: preset.name,
      tag: preset.tag,
      landTransferTax: preset.landTransferTax,
      additionalTax: preset.additionalTax,
      legalFees: preset.legalFees,
      titleInsurance: preset.titleInsurance,
      homeInspection: preset.homeInspection,
      appraisal: preset.appraisal,
      surveyFee: preset.surveyFee,
      firstTimeBuyerRebate: preset.firstTimeBuyerRebate
    });
    setEditingId(preset.id);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tag: '',
      landTransferTax: 8475,
      additionalTax: 0,
      legalFees: 2000,
      titleInsurance: 400,
      homeInspection: 500,
      appraisal: 400,
      surveyFee: 1000,
      firstTimeBuyerRebate: 0
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  if (user?.tier !== 'premium') {
    return null;
  }

  if (showSelector) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
          Apply Closing Cost Preset
        </label>
        <select
          onChange={(e) => {
            if (e.target.value && onPresetSelected) {
              const preset = presets.find(p => p.id === e.target.value);
              if (preset) onPresetSelected(preset);
            }
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
        >
          <option value="">Select a preset...</option>
          {presets.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.name} {preset.tag && `(${preset.tag})`}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Closing Cost Presets</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Preset</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Preset' : 'Create New Preset'}
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preset Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Toronto Condo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Condo, Freehold"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Land Transfer Tax
              </label>
              <CurrencyInput
                value={formData.landTransferTax}
                onChange={(value) => setFormData(prev => ({ ...prev, landTransferTax: value }))}
                prefix="$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Tax
              </label>
              <CurrencyInput
                value={formData.additionalTax}
                onChange={(value) => setFormData(prev => ({ ...prev, additionalTax: value }))}
                prefix="$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Fees
              </label>
              <CurrencyInput
                value={formData.legalFees}
                onChange={(value) => setFormData(prev => ({ ...prev, legalFees: value }))}
                prefix="$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Insurance
              </label>
              <CurrencyInput
                value={formData.titleInsurance}
                onChange={(value) => setFormData(prev => ({ ...prev, titleInsurance: value }))}
                prefix="$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Inspection
              </label>
              <CurrencyInput
                value={formData.homeInspection}
                onChange={(value) => setFormData(prev => ({ ...prev, homeInspection: value }))}
                prefix="$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appraisal
              </label>
              <CurrencyInput
                value={formData.appraisal}
                onChange={(value) => setFormData(prev => ({ ...prev, appraisal: value }))}
                prefix="$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Fee
              </label>
              <CurrencyInput
                value={formData.surveyFee}
                onChange={(value) => setFormData(prev => ({ ...prev, surveyFee: value }))}
                prefix="$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First-Time Buyer Rebate
              </label>
              <CurrencyInput
                value={formData.firstTimeBuyerRebate}
                onChange={(value) => setFormData(prev => ({ ...prev, firstTimeBuyerRebate: value }))}
                prefix="$"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Save Preset</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {presets.map(preset => (
          <div key={preset.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{preset.name}</h4>
                  {preset.tag && (
                    <div className="flex items-center mt-1">
                      <Tag className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{preset.tag}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(preset)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              Total: ${(
                preset.landTransferTax + 
                preset.additionalTax + 
                preset.legalFees + 
                preset.titleInsurance + 
                preset.homeInspection + 
                preset.appraisal + 
                preset.surveyFee - 
                preset.firstTimeBuyerRebate
              ).toLocaleString()}
            </div>
          </div>
        ))}
        
        {presets.length === 0 && !isCreating && (
          <div className="text-center py-8 text-gray-500">
            No presets created yet. Click "New Preset" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClosingCostPresets;