
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ChevronRight, 
  ShieldCheck,
  Globe,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { fetchCurrentTaxRates, getFastSummary } from './geminiService';
import { TaxRates, SalaryInputs, TaxBreakdown } from './types';
import TaxCalculatorForm from './components/TaxCalculatorForm';
import ResultDashboard from './components/ResultDashboard';
import ChatBot from './components/ChatBot';

const DEFAULT_RATES: TaxRates = {
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  higherRateThreshold: 125140,
  additionalRateThreshold: 125140,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,
  niThreshold: 12570,
  niRate: 0.08,
  niUpperLimit: 50270,
  niUpperRate: 0.02,
  lastUpdated: '...',
  sourceUrls: [],
};

const App: React.FC = () => {
  const [rates, setRates] = useState<TaxRates>(DEFAULT_RATES);
  const [inputs, setInputs] = useState<SalaryInputs>({
    grossSalary: 55000,
    pensionContribution: 5,
    employerPensionContribution: 3,
    useAutoEnrolment: false,
    studentLoanPlan: 'none',
    isScottish: false,
    taxYear: '2024/25',
    taxCode: '1257L',
    giftAid: 0,
    eisRelief: 0,
    seisRelief: 0,
    isaContribution: 0,
  });
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const liveRates = await fetchCurrentTaxRates(inputs.taxYear);
        setRates(liveRates);
      } catch (error) {
        console.error("Failed to fetch live rates", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [inputs.taxYear]);

  const breakdown = useMemo((): TaxBreakdown => {
    const gross = inputs.grossSalary;
    
    // Pension Calculation
    let pension = 0;
    let employerPension = 0;
    
    if (inputs.useAutoEnrolment) {
      // Auto-enrolment rules (2024/25): 
      // Qualifying earnings are between £6,240 and £50,270.
      const lowerLimit = 6240;
      const upperLimit = 50270;
      const qualifyingEarnings = Math.max(0, Math.min(gross, upperLimit) - lowerLimit);
      
      pension = qualifyingEarnings * 0.05; // 5% Employee
      employerPension = qualifyingEarnings * 0.03; // 3% Employer
    } else {
      pension = gross * (inputs.pensionContribution / 100);
      employerPension = gross * (inputs.employerPensionContribution / 100);
    }

    // ISA contribution - Treated as tax-free deduction from taxable income as per user request
    const isaDeduction = inputs.isaContribution;
    
    // Adjusted taxable income
    const taxableIncome = Math.max(0, gross - pension - isaDeduction);
    
    let basePA = rates.personalAllowance;
    const taxCodeValue = inputs.taxCode.match(/(\d+)/);
    if (taxCodeValue) {
      basePA = parseInt(taxCodeValue[0], 10) * 10;
    }

    const pa = taxableIncome > 100000 
      ? Math.max(0, basePA - (taxableIncome - 100000) / 2)
      : basePA;
    
    const incomeForTax = Math.max(0, taxableIncome - pa);

    const giftAidGrossUp = inputs.giftAid / 0.8;
    const basicLimit = rates.basicRateThreshold + giftAidGrossUp;
    const higherLimit = rates.higherRateThreshold + giftAidGrossUp;

    const calculateRawTax = (inc: number, bLimit: number, hLimit: number) => {
      let tax = 0;
      if (inc > 0) {
        if (taxableIncome <= bLimit) {
          tax += inc * rates.basicRate;
        } else if (taxableIncome <= hLimit) {
          const basicBandSize = bLimit - pa;
          tax += Math.max(0, basicBandSize) * rates.basicRate;
          tax += (taxableIncome - bLimit) * rates.higherRate;
        } else {
          const basicBandSize = bLimit - pa;
          const higherBandSize = hLimit - bLimit;
          tax += Math.max(0, basicBandSize) * rates.basicRate;
          tax += Math.max(0, higherBandSize) * rates.higherRate;
          tax += (taxableIncome - hLimit) * rates.additionalRate;
        }
      }
      return tax;
    };

    const taxWithoutReliefs = calculateRawTax(incomeForTax, rates.basicRateThreshold, rates.higherRateThreshold);
    let taxWithReliefs = calculateRawTax(incomeForTax, basicLimit, higherLimit);

    const eisCredit = inputs.eisRelief * 0.30;
    const seisCredit = inputs.seisRelief * 0.50;
    const totalInvestmentCredit = eisCredit + seisCredit;
    taxWithReliefs = Math.max(0, taxWithReliefs - totalInvestmentCredit);

    // National Insurance
    let niPaid = 0;
    const niApplicable = Math.max(0, gross - rates.niThreshold);
    if (niApplicable > 0) {
      const currentNiRate = inputs.taxYear === '2023/24' ? 0.10 : rates.niRate; 
      const mainRange = Math.min(niApplicable, rates.niUpperLimit - rates.niThreshold);
      const upperRange = Math.max(0, gross - rates.niUpperLimit);
      niPaid = (mainRange * currentNiRate) + (upperRange * rates.niUpperRate);
    }

    // Student Loans
    let studentLoanPaid = 0;
    if (inputs.studentLoanPlan !== 'none') {
      const thresholds: Record<string, number> = { 
        plan1: 24990, 
        plan2: 27295, 
        plan4: 31395, 
        plan5: 25000, 
        postgrad: 21000 
      };
      const rate = inputs.studentLoanPlan === 'postgrad' ? 0.06 : 0.09;
      const thresh = thresholds[inputs.studentLoanPlan] || 27295;
      studentLoanPaid = Math.max(0, (gross - thresh) * rate);
    }

    const netPay = gross - pension - taxWithReliefs - niPaid - studentLoanPaid;
    const totalTaxSavings = taxWithoutReliefs - taxWithReliefs;

    return {
      gross,
      pension,
      employerPension,
      taxableIncome,
      taxPaid: taxWithReliefs,
      niPaid,
      studentLoanPaid,
      netPay,
      takeHomeMonthly: netPay / 12,
      totalCostToEmployer: gross + employerPension,
      appliedPersonalAllowance: pa,
      basicBandLimit: basicLimit,
      higherBandLimit: higherLimit,
      giftAidExtension: giftAidGrossUp,
      investmentCredit: totalInvestmentCredit,
      totalTaxSavings,
      isaContribution: inputs.isaContribution,
      isAutoEnrolment: inputs.useAutoEnrolment,
    };
  }, [inputs, rates]);

  useEffect(() => {
    const updateSummary = async () => {
      if (loading) return;
      const text = await getFastSummary(`
        Provide a 3-bullet point financial summary for this UK salary profile.
        Profile: £${inputs.grossSalary} (${inputs.taxYear}), Net: £${breakdown.netPay.toFixed(0)}, Monthly: £${breakdown.takeHomeMonthly.toFixed(0)}. 
        Pension Strategy: ${inputs.useAutoEnrolment ? 'Auto-enrolment' : 'Custom ' + inputs.pensionContribution + '%'}.
        ISA: £${inputs.isaContribution} tax-free allocation.
        Format: Return ONLY the 3 bullet points. No markdown bolding, no headers. Use simple bullet symbols.
      `);
      setSummary(text);
    };
    const timer = setTimeout(updateSummary, 1000);
    return () => clearTimeout(timer);
  }, [breakdown, inputs.taxYear, loading]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <nav className="bg-white border-b sticky top-0 z-40 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Calculator className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Income Intelligence <span className="text-blue-600">UK</span></span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-gray-100 rounded-full shadow-sm"><ShieldCheck className="w-4 h-4 text-green-500" /> HMRC Logic</span>
              <span className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-50 text-blue-600 rounded-full border border-blue-100"><Globe className="w-4 h-4" /> {inputs.taxYear}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Your Setup
                </h2>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recency</span>
                  <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold">
                    <Clock className="w-3 h-3" />
                    {rates.lastUpdated}
                  </div>
                </div>
              </div>
              <TaxCalculatorForm inputs={inputs} setInputs={setInputs} />
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2.5rem] shadow-xl shadow-blue-100 text-white relative overflow-hidden group">
              <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">AI Financial Snapshot</span>
                </div>
                <div className="text-sm leading-relaxed text-blue-50 font-medium whitespace-pre-line">
                  {loading ? "Aligning fiscal parameters..." : summary || "Calculation breakdown complete."}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-blue-200 font-bold uppercase tracking-tighter">
                  <span>Data Synced: {rates.lastUpdated}</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>
                </div>
              </div>
            </div>

            {rates.sourceUrls.length > 0 && (
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Verification Sources
                </h3>
                <ul className="text-xs space-y-3">
                  {rates.sourceUrls.slice(0, 2).map((chunk: any, i) => (
                    <li key={i}>
                      <a href={chunk.web?.uri} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="p-1 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ChevronRight className="w-3.5 h-3.5" /> 
                        </div>
                        <span className="line-clamp-2 font-medium text-gray-600 group-hover:text-gray-900">{chunk.web?.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ResultDashboard breakdown={breakdown} />
          </div>
        </div>
      </main>

      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

export default App;
