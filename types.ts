
export interface TaxRates {
  personalAllowance: number;
  basicRateThreshold: number;
  higherRateThreshold: number;
  additionalRateThreshold: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
  niThreshold: number;
  niRate: number;
  niUpperLimit: number;
  niUpperRate: number;
  lastUpdated: string;
  sourceUrls: Array<{ web: { uri: string; title: string } }>;
}

export interface SalaryInputs {
  grossSalary: number;
  pensionContribution: number;
  employerPensionContribution: number;
  useAutoEnrolment: boolean;
  studentLoanPlan: 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad';
  isScottish: boolean;
  taxYear: '2023/24' | '2024/25' | '2025/26';
  taxCode: string;
  giftAid: number;
  eisRelief: number;
  seisRelief: number;
  isaContribution: number;
}

export interface TaxBreakdown {
  gross: number;
  pension: number;
  employerPension: number;
  taxableIncome: number;
  taxPaid: number;
  niPaid: number;
  studentLoanPaid: number;
  netPay: number;
  takeHomeMonthly: number;
  totalCostToEmployer: number;
  appliedPersonalAllowance: number;
  basicBandLimit: number;
  higherBandLimit: number;
  giftAidExtension: number;
  investmentCredit: number;
  totalTaxSavings: number;
  isaContribution: number;
  isAutoEnrolment: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
