export const SAMPLE_STATEMENT = {
  period: "Jan 2025 – Mar 2025",
  currency: "MYR",
  summary:
    "Ahmad's account shows a net positive cash flow of MYR 2,653 over the quarter. Salary income is consistent at MYR 8,500/month but discretionary spending on food and dining is elevated at 28% of total outgoings. Three anomalies flagged — including a large round-number cash withdrawal and a duplicate streaming subscription charge.",
  totalCredits: 27150,
  totalDebits: 24497,
  netFlow: 2653,
  topCategories: [
    { name: "Food & Dining", amount: 6859, percentage: 28 },
    { name: "Transport", amount: 4409, percentage: 18 },
    { name: "Shopping", amount: 3674, percentage: 15 },
    { name: "Utilities & Bills", amount: 2939, percentage: 12 },
    { name: "Healthcare", amount: 2450, percentage: 10 },
    { name: "Entertainment", amount: 1959, percentage: 8 },
  ],
  anomalies: [
    {
      description:
        "Large round-number cash withdrawal — unusual pattern for this account",
      amount: 5000,
      severity: "high",
    },
    {
      description:
        "Duplicate Netflix subscription charge within same billing cycle",
      amount: 54.9,
      severity: "medium",
    },
    {
      description:
        "Late-night transaction at 2:47 AM — outside normal spending pattern",
      amount: 342,
      severity: "low",
    },
  ],
  insights: [
    "Food & dining spend (28%) is significantly above the 15–18% benchmark for this income bracket — consider a monthly dining budget.",
    "Net cash flow is positive but declining month-over-month: MYR 1,200 → MYR 890 → MYR 563. Spending is creeping up.",
    "No loan repayments detected — strong liquidity position with no major debt obligations.",
    "Utility costs increased 22% in March — worth reviewing for new subscriptions or rate changes.",
  ],
};

export const SAMPLE_CREDIT = {
  overallHealth: "Good",
  healthScore: 68,
  summary:
    "Ahmad has a solid credit profile with no missed payments in the past 18 months and a manageable credit utilisation rate of 34%. His relatively short credit history (3 years) and one recent credit enquiry are the main factors keeping the score from the 'Excellent' range.",
  positives: [
    "Zero missed or late payments in the past 18 months",
    "Credit utilisation at 34% — within the recommended 35% threshold",
    "2 active accounts in good standing — demonstrates responsible credit management",
    "No legal or bankruptcy records found",
  ],
  concerns: [
    "Credit history is only 3 years old — limited track record for lenders",
    "1 credit enquiry recorded 2 months ago — may indicate recent credit-seeking behaviour",
    "Single income source detected — lenders may prefer diversified income streams",
  ],
  recommendations: [
    "Maintain your current payment record — each month of on-time payments improves your score",
    "Avoid applying for new credit for at least 6 months to reduce enquiry impact",
    "Consider requesting a credit limit increase on your existing card without spending more — this lowers utilisation ratio",
    "Diversify your credit mix by adding a small instalment loan if you have a genuine need",
  ],
  keyFacts: [
    { label: "Active Accounts", value: "2" },
    { label: "Payment History", value: "100% on time" },
    { label: "Credit Utilisation", value: "34%" },
    { label: "Credit History", value: "3 years" },
    { label: "Recent Enquiries", value: "1 (60 days ago)" },
    { label: "Legal Records", value: "None" },
  ],
};

export const SAMPLE_FRAUD_INPUTS = {
  applicantName: "Tan Wei Ming",
  applicationCount: 5,
  applicationWindowDays: 14,
  identityCheckResult: "Passed",
  identityCheckFailures: 1,
  addressMatchCount: 4,
  courtRecords: "",
  employerVerified: false,
  incomeConsistency: "Major discrepancy",
  deviceFlags:
    "VPN detected, device fingerprint matches 3 other applications",
  additionalNotes:
    "Applicant provided payslip but employer name on payslip does not match employer declared on form",
};

export const SAMPLE_FRAUD_RESULT = {
  riskLevel: "High",
  riskScore: 82,
  verdict: "Escalate",
  summary:
    "This application exhibits multiple concurrent fraud indicators: unusually high application velocity (5 in 14 days), address shared with 4 other recent applications, unverified employer with a payslip discrepancy, VPN usage, and a shared device fingerprint. No single signal is conclusive, but the combination warrants escalation to the fraud team before any credit decision is made.",
  redFlags: [
    "5 credit applications in 14 days — far above the 1–2 per month typical baseline",
    "Declared address matches 4 other recent applications — possible synthetic identity or fraud ring",
    "Employer unverified and payslip employer name does not match declared employer",
    "Income declared is MYR 8,500 but bank credits average MYR 3,200/month — major discrepancy",
    "VPN detected during application — applicant is masking their actual location",
    "Device fingerprint linked to 3 other applications in the past 30 days",
  ],
  mitigatingFactors: [
    "Identity check ultimately passed — biometric match successful on second attempt",
    "No court records, bankruptcy, or legal proceedings found",
    "Credit history exists — this is not a first-time applicant",
  ],
  recommendedActions: [
    "Do not approve or decline — escalate to fraud team for manual investigation",
    "Contact applicant directly via phone to verify employer and income",
    "Request original payslip or 3 months of certified bank statements",
    "Cross-reference the declared address against CTOS database for linked entities",
    "Flag this device fingerprint for monitoring across all new applications",
  ],
  signalBreakdown: [
    {
      signal: "Application Velocity",
      value: "5 in 14 days",
      riskContribution: "High",
    },
    {
      signal: "Address Matches",
      value: "4 other applications",
      riskContribution: "High",
    },
    {
      signal: "Identity Check",
      value: "Passed (1 failure)",
      riskContribution: "Medium",
    },
    {
      signal: "Employer Verification",
      value: "Unverified",
      riskContribution: "High",
    },
    {
      signal: "Income Consistency",
      value: "Major discrepancy",
      riskContribution: "High",
    },
    {
      signal: "Device Flags",
      value: "VPN + shared device",
      riskContribution: "Medium",
    },
    { signal: "Legal Records", value: "None", riskContribution: "Low" },
  ],
};

export const SAMPLE_ROI_INPUTS = {
  initiativeName: "AI Document Processing System",
  description:
    "Automate extraction and validation of supporting documents (payslips, bank statements, SSM certificates) for the credit operations team using AI. Eliminates manual data entry and flags inconsistencies before they reach analysts.",
  teamSize: 15,
  hoursSavedPerWeek: 4,
  hourlyRate: 80,
  implementationCost: 200000,
  maintenanceCostPerYear: 30000,
  timelineMonths: 3,
};

export const SAMPLE_DOC_CHUNKS = [
  `CTOS DATA SYSTEMS BERHAD — ANNUAL REPORT 2024

FINANCIAL HIGHLIGHTS

Revenue: MYR 412.3 million (FY2024) vs MYR 358.1 million (FY2023) — growth of 15.1% year-on-year.
Profit Before Tax: MYR 98.7 million (FY2024) vs MYR 81.2 million (FY2023) — growth of 21.6%.
Net Profit: MYR 76.4 million (FY2024) vs MYR 62.1 million (FY2023).
Earnings Per Share (EPS): 7.8 sen (FY2024) vs 6.4 sen (FY2023).
Dividend Per Share: 4.0 sen (FY2024) — a 33% increase from the prior year's 3.0 sen.
Total Assets: MYR 1.2 billion. Net Assets Per Share: MYR 0.58.`,

  `BUSINESS SEGMENT PERFORMANCE

Consumer Solutions (MyCTOS, CTOS Score):
Revenue contribution: MYR 156.2 million (38% of total). Subscriber base grew 24% to 1.8 million registered users. Key products: MyCTOS Basic (free tier), MyCTOS Score (subscription), and CTOS Alert for identity monitoring.

Commercial Solutions (B2B credit data, APIs):
Revenue contribution: MYR 198.4 million (48% of total). Serving 2,400+ corporate clients including all major banks, 18 licensed moneylenders, and 30+ fintech platforms. API transaction volume grew 31% year-on-year.

Decisioning Solutions (VeriSafe, eKYC, Fraud Intelligence):
Revenue contribution: MYR 57.7 million (14% of total). Fastest-growing segment at 42% year-on-year. eKYC transaction volume exceeded 3.2 million verifications in FY2024.`,

  `RISK FACTORS AND OUTLOOK

Key Risks:
1. Regulatory risk: BNM may introduce new frameworks for credit data usage that could restrict certain data products.
2. Data privacy risk: PDPA amendments under review may require additional consent mechanisms for data processing.
3. Competition risk: Regional credit bureaus and global players (Experian, TransUnion) expanding in Southeast Asia.
4. Cybersecurity risk: As a custodian of sensitive financial and identity data, CTOS faces elevated threat exposure.

Management Guidance for FY2025:
Revenue growth target: 12–15% organic growth. Key growth drivers: (1) continued eKYC adoption driven by digital financial services; (2) SME credit product expansion via RAM Credit Information (RAMCI); (3) open finance API integrations as BNM's open finance framework matures.

Capital Expenditure: MYR 45 million planned for FY2025, primarily for technology infrastructure and AI capability development.`,
];

export const SAMPLE_DOC_META = {
  filename: "CTOS_Annual_Report_2024.pdf",
  pages: 148,
  wordCount: 42350,
  chunks: SAMPLE_DOC_CHUNKS,
};

export const SUGGESTED_QUESTIONS = [
  "What was the total revenue in FY2024?",
  "How much did the dividend per share increase?",
  "What are the key risks mentioned in the report?",
  "Which business segment grew the fastest?",
  "What is the FY2025 revenue growth target?",
];
