
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TaxBreakdown } from '../types';
import { 
  Wallet, 
  Receipt, 
  CreditCard, 
  PiggyBank, 
  Briefcase, 
  ShieldCheck, 
  Building2, 
  Layers, 
  ArrowDownCircle, 
  Zap,
  TrendingDown,
  Gift,
  Coins
} from 'lucide-react';

interface Props {
  breakdown: TaxBreakdown;
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#6366f1', '#10b981', '#14b8a6'];

const ResultDashboard: React.FC<Props> = ({ breakdown }) => {
  const data = [
    { name: 'Take Home', value: breakdown.netPay },
    { name: 'Income Tax', value: breakdown.taxPaid },
    { name: 'National Insurance', value: breakdown.niPaid },
    { name: 'Pension (Emp)', value: breakdown.pension },
    { name: 'Student Loan', value: breakdown.studentLoanPaid },
    { name: 'ISA Savings', value: breakdown.isaContribution },
  ].filter(d => d.value > 0);

  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });

  const income = breakdown.taxableIncome;
  const pa = breakdown.appliedPersonalAllowance;
  const basicLimit = breakdown.basicBandLimit;
  const higherLimit = breakdown.higherBandLimit;

  const hasReliefs = breakdown.giftAidExtension > 0 || breakdown.investmentCredit > 0 || breakdown.isaContribution > 0;

  const bands = [
    { name: 'Allowance', limit: pa, color: 'bg-emerald-100', text: '0%', darkColor: 'bg-emerald-500' },
    { name: 'Basic', limit: basicLimit, color: 'bg-blue-100', text: '20%', darkColor: 'bg-blue-500' },
    { name: 'Higher', limit: higherLimit, color: 'bg-amber-100', text: '40%', darkColor: 'bg-amber-500' },
    { name: 'Additional', limit: 1000000, color: 'bg-red-100', text: '45%', darkColor: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Visual Tax Bands Progress */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Tax Band Utilization
        </h3>
        <div className="relative h-14 w-full flex rounded-2xl overflow-hidden bg-slate-50 border border-gray-100">
           {bands.map((band, idx) => {
             const prevLimit = idx === 0 ? 0 : bands[idx-1].limit;
             const range = Math.max(0, band.limit - prevLimit);
             const widthPercent = (range / 160000) * 100;
             
             return (
               <div 
                 key={idx} 
                 className={`${band.color} flex flex-col justify-center items-center relative group min-w-[40px] border-r border-white/40`}
                 style={{ width: `${Math.min(widthPercent, 100)}%` }}
               >
                 <span className="text-[10px] font-black text-gray-500/60 uppercase">{band.text}</span>
                 {income > prevLimit && income <= band.limit && (
                   <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-gray-900 z-10">
                     <div className="absolute -top-6 right-[-8px] bg-gray-900 text-white px-2 py-0.5 rounded shadow-xl text-[10px] font-black whitespace-nowrap">
                       LEVEL: {formatter.format(income)}
                     </div>
                   </div>
                 )}
               </div>
             )
           })}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          <span>£0</span>
          <span>PA: {formatter.format(pa)}</span>
          <span className={breakdown.giftAidExtension > 0 ? 'text-pink-500' : ''}>
            Basic Max: {formatter.format(basicLimit)}
          </span>
          <span className={breakdown.giftAidExtension > 0 ? 'text-pink-500' : ''}>
            Higher Max: {formatter.format(higherLimit)}
          </span>
        </div>
      </div>

      {/* Applied Reliefs Section with Quantified Benefit */}
      {hasReliefs && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
            <Zap className="w-48 h-48 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800">
                <Zap className="w-5 h-5" />
                Applied Tax Reliefs & Impact
              </h3>
              <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2 shadow-sm">
                <TrendingDown className="w-4 h-4" /> Total Savings: {formatter.format(breakdown.totalTaxSavings)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {breakdown.isaContribution > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-emerald-100/50 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-teal-100 p-2.5 rounded-xl">
                      <Coins className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ISA Strategy</p>
                      <p className="text-sm font-bold text-gray-800">{formatter.format(breakdown.isaContribution)} Excluded</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Tax-Free Nature</span>
                    <span className="text-teal-600 font-black text-sm">ACTIVE</span>
                  </div>
                </div>
              )}
              {breakdown.giftAidExtension > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-emerald-100/50 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-pink-100 p-2.5 rounded-xl">
                      <Gift className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Gift Aid Benefit</p>
                      <p className="text-sm font-bold text-gray-800">Bands shifted: {formatter.format(breakdown.giftAidExtension)}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Tax Reclaimed</span>
                    <span className="text-pink-600 font-black text-sm">{formatter.format(breakdown.totalTaxSavings - breakdown.investmentCredit)}</span>
                  </div>
                </div>
              )}
              {breakdown.investmentCredit > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-emerald-100/50 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-emerald-100 p-2.5 rounded-xl">
                      <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">EIS/SEIS Relief</p>
                      <p className="text-sm font-bold text-emerald-600">Direct Deduction</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Investment Credits</span>
                    <span className="text-emerald-600 font-black text-sm">-{formatter.format(breakdown.investmentCredit)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
            <Wallet className="w-40 h-40 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Take Home</p>
            <h2 className="text-6xl font-black text-blue-600 tracking-tighter">{formatter.format(breakdown.takeHomeMonthly)}</h2>
          </div>
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" /> 
                {breakdown.isAutoEnrolment ? "Auto-Enrolment Cost" : "Employer Total Cost"}
              </span>
              <span className="text-gray-900 font-bold">{formatter.format(breakdown.totalCostToEmployer)}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${(breakdown.netPay / breakdown.gross) * 100}%` }} 
              />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">
              Retention: {((breakdown.netPay / breakdown.gross) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">Earnings Disbursement</p>
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => formatter.format(value)}
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 30px -10px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {data.map((d, i) => (
               <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black text-gray-500 uppercase">{d.name}</span>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Tax Statement */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-gray-800">
          <Receipt className="w-6 h-6 text-blue-600" />
          Full Annual Statement
        </h3>
        <div className="space-y-6">
          <BreakdownRow label="Annual Gross Salary" value={breakdown.gross} icon={<Briefcase className="w-4 h-4" />} />
          
          <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
             <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pensions & Savings</span>
               {breakdown.isAutoEnrolment && <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">AUTO-ENROLMENT ACTIVE</span>}
             </div>
             <BreakdownRow label="Pension Sacrifice" value={breakdown.pension} icon={<PiggyBank className="w-4 h-4" />} color="text-indigo-600" isNegative />
             <BreakdownRow label="Employer Contrib." value={breakdown.employerPension} icon={<Building2 className="w-4 h-4" />} color="text-emerald-600" />
             {breakdown.isaContribution > 0 && (
               <BreakdownRow label="ISA Contribution" value={breakdown.isaContribution} icon={<Coins className="w-4 h-4" />} color="text-teal-600" isNegative />
             )}
          </div>

          <div className="border-t border-slate-100 pt-4" />
          <BreakdownRow label="Taxable Pay After Deductions" value={breakdown.taxableIncome} isBold />
          
          <div className="space-y-4 px-2 mt-6 border-l-4 border-slate-50 ml-5 pl-8">
            <BreakdownRow label="Income Tax" value={breakdown.taxPaid} icon={<CreditCard className="w-4 h-4" />} color="text-red-500" isNegative />
            <BreakdownRow label="National Insurance" value={breakdown.niPaid} icon={<ShieldCheck className="w-4 h-4" />} color="text-amber-500" isNegative />
            
            {breakdown.totalTaxSavings > 0 && (
              <div className="flex justify-between items-center text-emerald-600 text-sm font-bold bg-emerald-50 p-3 rounded-2xl border border-emerald-100 border-dashed">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Total Applied Relief Impact</span>
                <span>+{formatter.format(breakdown.totalTaxSavings)} Saved</span>
              </div>
            )}

            {breakdown.studentLoanPaid > 0 && (
              <BreakdownRow label="Student Loan" value={breakdown.studentLoanPaid} color="text-blue-500" isNegative />
            )}
          </div>
          
          <div className="border-t-4 border-blue-600 pt-8 mt-10">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black text-gray-900 uppercase">Net Annual Take Home</span>
              <span className="text-4xl font-black text-blue-600">{formatter.format(breakdown.netPay)}</span>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <span>After Taxes & Deductions</span>
              <span>Effective Rate: {(( (breakdown.taxPaid + breakdown.niPaid) / breakdown.gross) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BreakdownRow: React.FC<{ 
  label: string; 
  value: number; 
  icon?: React.ReactNode; 
  color?: string; 
  isNegative?: boolean; 
  isBold?: boolean;
}> = ({ label, value, icon, color, isNegative, isBold }) => {
  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  return (
    <div className={`flex justify-between items-center ${isBold ? 'font-black text-gray-900' : 'font-bold text-gray-600'} text-sm`}>
      <span className="flex items-center gap-3">
        {icon && <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-50">{icon}</div>}
        {label}
      </span>
      <span className={`font-mono ${color}`}>
        {isNegative ? '-' : ''}{formatter.format(value)}
      </span>
    </div>
  );
};

export default ResultDashboard;
