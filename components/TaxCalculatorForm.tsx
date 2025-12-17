
import React from 'react';
import { SalaryInputs } from '../types';
// Fixed missing ShieldCheck icon import
import { Heart, Landmark, Hash, BadgePercent, GraduationCap, PiggyBank, Briefcase, ShieldCheck } from 'lucide-react';

interface Props {
  inputs: SalaryInputs;
  setInputs: (inputs: SalaryInputs) => void;
}

const TaxCalculatorForm: React.FC<Props> = ({ inputs, setInputs }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInputs({
      ...inputs,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const toggleAutoEnrolment = () => {
    setInputs({ ...inputs, useAutoEnrolment: !inputs.useAutoEnrolment });
  };

  const toggleScottish = () => {
    setInputs({ ...inputs, isScottish: !inputs.isScottish });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Tax Year</label>
          <select
            name="taxYear"
            value={inputs.taxYear}
            onChange={handleChange}
            className="w-full px-4 py-3.5 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-bold text-gray-700 shadow-sm appearance-none"
          >
            <option value="2024/25">2024/2025</option>
            <option value="2023/24">2023/2024</option>
            <option value="2025/26">2025/2026</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Tax Code</label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-4 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="taxCode"
              placeholder="e.g. 1257L"
              value={inputs.taxCode}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-black text-gray-800 shadow-sm uppercase placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Annual Gross Salary (£)</label>
        <div className="relative">
          <span className="absolute left-4 top-4 text-gray-400 font-bold text-lg">£</span>
          <input
            type="number"
            name="grossSalary"
            value={inputs.grossSalary || ''}
            onChange={handleChange}
            className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all text-2xl font-black text-gray-800 shadow-sm"
          />
        </div>
      </div>

      {/* Pension Selection */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Pension Configuration</label>
        <button
          onClick={toggleAutoEnrolment}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
            inputs.useAutoEnrolment 
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
              : 'bg-slate-50 border-gray-100 text-gray-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-5 h-5 ${inputs.useAutoEnrolment ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className="text-left">
              <span className="text-sm font-bold block">Auto-enrolment</span>
              <span className="text-[10px] opacity-70">Std 5% Emp / 3% Er on qualifying pay</span>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${inputs.useAutoEnrolment ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${inputs.useAutoEnrolment ? 'left-5.5' : 'left-0.5'}`} />
          </div>
        </button>

        {!inputs.useAutoEnrolment && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Employee (%)</label>
              <div className="relative">
                <BadgePercent className="absolute right-4 top-3.5 w-4 h-4 text-gray-300" />
                <input
                  type="number"
                  name="pensionContribution"
                  min="0"
                  max="100"
                  value={inputs.pensionContribution}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-black text-gray-800 shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Employer (%)</label>
              <div className="relative">
                <BadgePercent className="absolute right-4 top-3.5 w-4 h-4 text-gray-300" />
                <input
                  type="number"
                  name="employerPensionContribution"
                  min="0"
                  max="100"
                  value={inputs.employerPensionContribution}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-black text-gray-800 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Reliefs & Deductions</label>
        <div className="space-y-3.5">
          {/* ISA Contribution Input */}
          <div className="relative group">
            <PiggyBank className="absolute left-3.5 top-4 w-4 h-4 text-emerald-500" />
            <input
              type="number"
              name="isaContribution"
              placeholder="ISA Contribution (£)"
              value={inputs.isaContribution || ''}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-semibold text-gray-700 shadow-sm text-sm"
            />
            <div className="absolute right-4 top-4 text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">TAX FREE</div>
          </div>

          <div className="relative">
            <Heart className="absolute left-3.5 top-4 w-4 h-4 text-pink-400" />
            <input
              type="number"
              name="giftAid"
              placeholder="Gift Aid Donations (£)"
              value={inputs.giftAid || ''}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-semibold text-gray-700 shadow-sm text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Landmark className="absolute left-3.5 top-4 w-4 h-4 text-emerald-500" />
              <input
                type="number"
                name="eisRelief"
                placeholder="EIS (£)"
                value={inputs.eisRelief || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-semibold text-gray-700 shadow-sm text-sm"
              />
            </div>
            <div className="relative">
              <Landmark className="absolute left-3.5 top-4 w-4 h-4 text-indigo-500" />
              <input
                type="number"
                name="seisRelief"
                placeholder="SEIS (£)"
                value={inputs.seisRelief || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-semibold text-gray-700 shadow-sm text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Student Loan</label>
          <div className="relative">
            <GraduationCap className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
            <select
              name="studentLoanPlan"
              value={inputs.studentLoanPlan}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all font-bold text-gray-700 shadow-sm appearance-none"
            >
              <option value="none">No Loan</option>
              <option value="plan1">Plan 1</option>
              <option value="plan2">Plan 2</option>
              <option value="plan4">Plan 4 (Scottish)</option>
              <option value="plan5">Plan 5</option>
              <option value="postgrad">Postgrad</option>
            </select>
          </div>
        </div>

        <button
          onClick={toggleScottish}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
            inputs.isScottish 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
              : 'bg-slate-50 border-gray-100 text-gray-600'
          }`}
        >
          <span className="text-sm font-bold">Scottish Taxpayer</span>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${inputs.isScottish ? 'bg-white/30' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${inputs.isScottish ? 'left-5.5' : 'left-0.5'}`} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default TaxCalculatorForm;
