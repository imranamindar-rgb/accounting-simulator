export type MissionRole = 'CFO' | 'GM' | 'Investor'

export type MissionStep =
  | {
      type: 'transaction'
      id: string
      title: string
      narrative: string
      templateId: string
      /** Pre-fill numeric params (e.g., { amount: 8000 }) */
      defaultParams?: Record<string, number>
      concepts: string[]
      debrief?: string
    }
  | {
      type: 'closePeriod'
      id: string
      title: string
      narrative: string
    }
  | {
      type: 'reflection'
      id: string
      title: string
      prompt: string
      placeholder?: string
    }

export interface Mission {
  id: string
  title: string
  role: MissionRole
  context: string
  objective: string
  constraints: string[]
  concepts: string[]
  steps: MissionStep[]
}

export const MISSIONS: Mission[] = [
  {
    id: 'mission-accrual-cash-ar',
    title: 'Revenue Is Not Cash (A/R Cycle)',
    role: 'CFO',
    context:
      'You are reviewing a growth spike. The CEO is excited about revenue, but cash feels tight. Your job is to explain what is happening and what to watch.',
    objective:
      'Build intuition for accrual vs cash by separating revenue recognition from collection and tracing the working capital impact.',
    constraints: ['Explain cash vs revenue in plain English', 'Identify the balance sheet “parking account”'],
    concepts: ['accrual_vs_cash', 'working_capital_ar'],
    steps: [
      {
        type: 'transaction',
        id: 'step-1',
        title: 'Book a Credit Sale',
        narrative:
          'A customer signs and you deliver. You earned the revenue, but you have not collected cash yet. Record the credit sale.',
        templateId: 'credit-sale',
        defaultParams: { amount: 8000 },
        concepts: ['accrual_vs_cash', 'working_capital_ar'],
        debrief:
          'Executive takeaway: this “profit without cash” shows up as an increase in A/R. Growth can consume cash even when net income rises.',
      },
      {
        type: 'transaction',
        id: 'step-2',
        title: 'Collect the Receivable',
        narrative:
          'The customer pays later. Record the collection and explain why this is not revenue.',
        templateId: 'collect-receivable',
        defaultParams: { amount: 8000 },
        concepts: ['accrual_vs_cash', 'working_capital_ar'],
        debrief:
          'Executive takeaway: collection is a balance sheet swap (A/R → Cash). If someone “celebrates” collection as revenue, they are not finance-literate.',
      },
      {
        type: 'reflection',
        id: 'step-3',
        title: 'CFO Note',
        prompt:
          'Write a 3-sentence CFO note to the CEO: What happened to revenue, cash, and A/R? What risk would you watch as we scale?',
        placeholder: 'Three sentences. Be specific.',
      },
    ],
  },
  {
    id: 'mission-unearned-rev',
    title: 'Cash Before Revenue (Unearned Revenue)',
    role: 'GM',
    context:
      'You just launched annual prepay. Cash is up, but you want to avoid “fake growth” stories. Your job is to account for it correctly and interpret it.',
    objective:
      'Separate cash receipt from revenue recognition and interpret the liability created by taking customer cash early.',
    constraints: ['Do not book revenue before it is earned', 'Explain why unearned revenue is not “bad”'],
    concepts: ['revenue_recognition', 'accrual_vs_cash', 'working_capital'],
    steps: [
      {
        type: 'transaction',
        id: 'step-1',
        title: 'Receive Customer Prepayment',
        narrative:
          'A customer prepays for services to be delivered next month. Record the cash receipt correctly.',
        templateId: 'unearned-revenue-received',
        defaultParams: { amount: 6000 },
        concepts: ['revenue_recognition', 'accrual_vs_cash'],
        debrief:
          'Executive takeaway: you improved cash and liquidity, but you also took on an obligation. The “growth” is a liability until delivered.',
      },
      {
        type: 'transaction',
        id: 'step-2',
        title: 'Earn the Revenue',
        narrative:
          'Now you deliver the service. Recognize the revenue.',
        templateId: 'recognize-unearned',
        defaultParams: { amount: 6000 },
        concepts: ['revenue_recognition'],
        debrief:
          'Executive takeaway: the liability unwinds into revenue as you perform. Good operators track this because it affects forecasting and cash planning.',
      },
      {
        type: 'reflection',
        id: 'step-3',
        title: 'Board Answer',
        prompt:
          'A board member asks: “Cash is up. Why isn’t revenue up?” Answer in 2–4 sentences without jargon.',
        placeholder: 'Clear, executive language.',
      },
    ],
  },
  {
    id: 'mission-capex-depr',
    title: 'Capex vs Expense (And Why CFO Adds Back Depreciation)',
    role: 'CFO',
    context:
      'Operations wants equipment. The CEO worries it will “hurt earnings.” Your job is to explain what hits the P&L now vs later, and what hits cash.',
    objective:
      'Build the capex intuition: balance sheet investment today, non-cash expense over time, and classification on the cash flow statement.',
    constraints: ['Separate P&L optics from cash reality', 'Classify cash flows correctly'],
    concepts: ['capitalization', 'noncash_expense', 'cashflow_classification'],
    steps: [
      {
        type: 'transaction',
        id: 'step-1',
        title: 'Buy Equipment for Cash',
        narrative:
          'You buy equipment with cash. Record the purchase.',
        templateId: 'purchase-equipment-cash',
        defaultParams: { amount: 50000 },
        concepts: ['capitalization', 'cashflow_classification'],
        debrief:
          'Executive takeaway: capex reduces cash today (CFI) but does not reduce net income today. Don’t confuse investment with expense.',
      },
      {
        type: 'transaction',
        id: 'step-2',
        title: 'Record Depreciation',
        narrative:
          'At month-end you record depreciation. Record it and interpret how it affects CFO under the indirect method.',
        templateId: 'record-depreciation',
        defaultParams: { amount: 2000 },
        concepts: ['noncash_expense', 'cashflow_classification'],
        debrief:
          'Executive takeaway: depreciation reduces net income but is non-cash. CFO “adds it back” because cash already left at purchase (CFI).',
      },
      {
        type: 'reflection',
        id: 'step-3',
        title: 'CEO Explanation',
        prompt:
          'Explain to the CEO why EBITDA and CFO can look “better” after depreciation even though the business did spend cash on capex.',
        placeholder: '2–5 sentences.',
      },
    ],
  },
  {
    id: 'mission-close-review',
    title: 'Close the Books and Review Like a CFO',
    role: 'CFO',
    context:
      'You are doing a month-end close. The purpose isn’t “accounting theater”; it is to generate decision-grade insight and catch issues early.',
    objective:
      'Close the period and review net income vs cash conversion using the CFO review pack (bridges and working capital drivers).',
    constraints: ['Reconcile NI to CFO', 'Identify a cash conversion driver', 'Flag one risk'],
    concepts: ['close_process', 'quality_of_earnings', 'working_capital'],
    steps: [
      {
        type: 'closePeriod',
        id: 'step-1',
        title: 'Close the Period',
        narrative:
          'Close the current period. Then open the review pack and interpret the bridges (NI → CFO) and the working capital waterfall.',
      },
      {
        type: 'reflection',
        id: 'step-2',
        title: 'CFO Debrief',
        prompt:
          'Write a 5-bullet CFO debrief: (1) headline, (2) what drove NI, (3) what drove CFO, (4) one red flag, (5) one operating action.',
        placeholder: 'Five bullets. Specific drivers, not vague statements.',
      },
    ],
  },
]

