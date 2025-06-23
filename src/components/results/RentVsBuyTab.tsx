import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Building, TrendingUp, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RentVsBuyData, RentVsBuyResults } from '../../types/premium';
import { calculateRentVsBuy } from '../../utils/rentVsBuyCalculations';
import CurrencyInput from '../shared/CurrencyInput';
import NotesSection from '../shared/NotesSection';

interface RentVsBuyTabProps {
  homePrice: number;
  downPayment: number;
  monthlyPayment: number;
  totalInterest: number;
  calculationId?: string;
  currentNotes?: Record<string, string>;
  readonly?: boolean;
}

const RentVsBuyTab: React.FC<RentVsBuyTabProps> = ({
  homePrice,
  downPayment,
  monthlyPayment,
  totalInterest,
  calculationId,
  currentNotes = {},
  readonly = false
}) => {
  const { user } = useAuth();
  const [rentData, setRentData] = useState<RentVsBuyData>({
    monthlyRent: 2500,
    annualRentIncrease: 3,
    comparisonYears: 10
  });
  
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const results = calculateRentVsBuy(rentData, homePrice, downPayment, monthlyPayment, totalInterest);

  const handleRentDataChange = (field: keyof RentVsBuyData, value: number) => {
    setRentData(prev => ({ ...prev, [field]: value }));
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the lead data to your CRM or database
    console.log('Lead submitted:', leadData);
    setShowLeadForm(false);
    // Reset form
    setLeadData({ name: '', email: '', phone: '' });
  };

  const chartData = results.yearlyComparison.map(item => ({
    year: `Year ${item.year}`,
    rent: item.cumulativeRent,
    ownership: item.cumulativeOwnership,
    savings: item.cumulativeRent - item.cumulativeOwnership
  }));

  return (
    <div className="space-y-8">
      {/* Input Section */}
      {!readonly && (
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Rent vs Buy Comparison Settings</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Monthly Rent
              </label>
              <CurrencyInput
                value={rentData.monthlyRent}
                onChange={(value) => handleRentDataChange('monthlyRent', value)}
                prefix="$"
                placeholder="2,500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Annual Rent Increase
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={rentData.annualRentIncrease}
                  onChange={(e) => handleRentDataChange('annualRentIncrease', Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
                  placeholder="3"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Comparison Period
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rentData.comparisonYears}
                  onChange={(e) => handleRentDataChange('comparisonYears', Number(e.target.value))}
                  className="w-full pr-16 pl-3 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
                  placeholder="10"
                  min="1"
                  max="30"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500">years</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-red-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              ${results.totalRentPaid.toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Total Rent Paid</div>
            <div className="text-xs text-red-600 mt-1">Over {rentData.comparisonYears} years</div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${results.totalOwnershipCost.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Total Ownership Cost</div>
            <div className="text-xs text-blue-600 mt-1">Down payment + payments</div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${results.netBenefit > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${results.netBenefit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(results.netBenefit).toLocaleString()}
            </div>
            <div className={`text-sm ${results.netBenefit > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {results.netBenefit > 0 ? 'Savings from Buying' : 'Cost of Buying vs Rent'}
            </div>
            <div className={`text-xs mt-1 ${results.netBenefit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.netBenefit > 0 ? 'You save money by buying' : 'Renting costs less'}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Notes Section */}
      {!readonly && (
        <NotesSection
          calculationId={calculationId || 'temp'}
          section="rentVsBuy"
          sectionTitle="Rent vs Buy"
          currentNotes={currentNotes.rentVsBuy}
        />
      )}

      {/* Readonly Notes Section for shared pages */}
      {readonly && currentNotes.rentVsBuy && (
        <NotesSection
          calculationId={calculationId || ''}
          section="rentVsBuy"
          sectionTitle="Rent vs Buy"
          currentNotes={currentNotes.rentVsBuy}
          readonly={true}
        />
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Rent vs Buy Comparison Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value, name) => [
              `$${Number(value).toLocaleString()}`, 
              name === 'rent' ? 'Total Rent Paid' : 
              name === 'ownership' ? 'Total Ownership Cost' : 'Savings from Buying'
            ]} />
            <Legend />
            <Bar dataKey="rent" fill="#EF4444" name="Rent" />
            <Bar dataKey="ownership" fill="#3B82F6" name="Ownership" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Premium User Branding */}
      {user?.tier === 'premium' && user.marketing_image && user.marketing_copy && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={user.marketing_image}
              alt="Professional"
              className="w-16 h-16 object-cover rounded-full"
            />
            <div>
              <h4 className="text-lg font-semibold text-amber-900">{user.name}</h4>
              <p className="text-amber-700">Real Estate Professional</p>
            </div>
          </div>
          
          <p className="text-amber-800 mb-4">{user.marketing_copy}</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowLeadForm(true)}
              className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Get Expert Advice
            </button>
            <a
              href={`mailto:${user.email}`}
              className="flex items-center justify-center bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Contact Me
            </a>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Get Expert Real Estate Advice</h3>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={leadData.name}
                  onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={leadData.email}
                  onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={leadData.phone}
                  onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeadForm(false)}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-medium text-slate-900 mb-3">Analysis Summary</h4>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            • Over {rentData.comparisonYears} years, you would pay <strong>${results.totalRentPaid.toLocaleString()}</strong> in rent
          </p>
          <p>
            • Buying this home would cost <strong>${results.totalOwnershipCost.toLocaleString()}</strong> in payments and down payment
          </p>
          <p>
            • {results.netBenefit > 0 
              ? `You would save approximately $${Math.abs(results.netBenefit).toLocaleString()} by buying instead of renting`
              : `Renting would cost approximately $${Math.abs(results.netBenefit).toLocaleString()} less than buying`
            }
          </p>
          <p className="text-xs text-slate-500 mt-3">
            * This analysis assumes rent increases at {rentData.annualRentIncrease}% annually and doesn't include property appreciation, maintenance costs, or tax benefits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RentVsBuyTab;