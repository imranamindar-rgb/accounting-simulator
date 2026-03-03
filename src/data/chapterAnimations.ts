import type { AnimationSequence } from '../components/concepts/TransactionAnimator'

// ---------------------------------------------------------------------------
// Chapter 1 — The Accounting Equation
// Slides: ch1-s1 (Accounting Equation), ch1-s2 (Double-Entry), ch1-s3 (T-Accounts)
// ---------------------------------------------------------------------------

// ch1-s1: Owner invests cash → BS: Assets +50K, Equity +50K
const ch1s1Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Owner Invests Cash',
      description:
        'The business owner contributes $50,000 personal funds to start the company. This is the founding transaction — it creates both an asset and the owner\'s equity stake.',
      data: {
        who: 'Business Owner',
        what: 'Contributes personal funds to start the company',
        amount: '$50,000',
      },
    },
    {
      type: 'journal',
      title: 'Record the Journal Entry',
      description:
        'Cash increases (debit, left side) because the company received funds. Common Stock increases (credit, right side) because the owner now has an equity claim. Total debits equal total credits — the equation stays balanced.',
      data: {
        date: 'Jan 1, Year 1',
        entries: [
          { account: 'Cash', debit: 50000 },
          { account: 'Common Stock', credit: 50000 },
        ],
        memo: 'Owner investment to capitalize the business',
      },
    },
    {
      type: 'taccount',
      title: 'Post to T-Accounts',
      description:
        'Each journal entry line posts to its ledger account. Cash has a debit balance of $50,000. Common Stock has a credit balance of $50,000. The two sides mirror each other — double-entry in action.',
      data: {
        accounts: [
          { name: 'Cash', debits: [50000], credits: [] },
          { name: 'Common Stock', debits: [], credits: [50000] },
        ],
      },
    },
    {
      type: 'statement',
      title: 'Impact on Balance Sheet',
      description:
        'The balance sheet after this transaction shows $50,000 in assets funded by $50,000 in equity. The equation Assets = Liabilities + Equity holds: $50,000 = $0 + $50,000.',
      data: {
        type: 'BS',
        title: 'Balance Sheet — After Transaction',
        sections: [
          {
            heading: 'Assets',
            lines: [
              { label: 'Cash', value: 50000 },
              { label: 'Total Assets', value: 50000, highlight: true },
            ],
          },
          {
            heading: 'Liabilities',
            lines: [{ label: 'Total Liabilities', value: 0 }],
          },
          {
            heading: 'Equity',
            lines: [
              { label: 'Common Stock', value: 50000 },
              { label: 'Total Equity', value: 50000, highlight: true },
            ],
          },
        ],
      },
    },
  ],
}

// ch1-s2: Purchase equipment for cash → asset swap, no net change to equity
const ch1s2Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Purchase Equipment for Cash',
      description:
        'The company pays $10,000 cash for a piece of equipment. This is an asset exchange — one asset goes down while another goes up. Total assets and equity are unchanged.',
      data: {
        who: 'Company',
        what: 'Pays cash to acquire office equipment',
        amount: '$10,000',
      },
    },
    {
      type: 'journal',
      title: 'Record the Journal Entry',
      description:
        'Equipment increases (debit) because the company gained a new asset. Cash decreases (credit) because cash was paid out. Notice equity accounts are untouched — this is a pure asset swap.',
      data: {
        date: 'Jan 5, Year 1',
        entries: [
          { account: 'Equipment', debit: 10000 },
          { account: 'Cash', credit: 10000 },
        ],
        memo: 'Purchase of office equipment for cash',
      },
    },
    {
      type: 'taccount',
      title: 'Post to T-Accounts',
      description:
        'Equipment gains a $10,000 debit entry. Cash gains a $10,000 credit entry, reducing its balance from $50,000 to $40,000. The net effect on total assets is zero.',
      data: {
        accounts: [
          { name: 'Cash', debits: [50000], credits: [10000] },
          { name: 'Equipment', debits: [10000], credits: [] },
          { name: 'Common Stock', debits: [], credits: [50000] },
        ],
      },
    },
    {
      type: 'statement',
      title: 'Impact on Balance Sheet',
      description:
        'Total assets remain $50,000 — the mix changed (less cash, more equipment) but the total did not. Equity is unchanged at $50,000. This demonstrates that not every transaction changes net worth.',
      data: {
        type: 'BS',
        title: 'Balance Sheet — After Asset Swap',
        sections: [
          {
            heading: 'Assets',
            lines: [
              { label: 'Cash', value: 40000 },
              { label: 'Equipment', value: 10000 },
              { label: 'Total Assets', value: 50000, highlight: true },
            ],
          },
          {
            heading: 'Liabilities',
            lines: [{ label: 'Total Liabilities', value: 0 }],
          },
          {
            heading: 'Equity',
            lines: [
              { label: 'Common Stock', value: 50000 },
              { label: 'Total Equity', value: 50000, highlight: true },
            ],
          },
        ],
      },
    },
  ],
}

// ch1-s3: Earn service revenue for cash → Assets +5K, Equity +5K via net income
const ch1s3Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Earn Service Revenue',
      description:
        'The company performs consulting services and collects $5,000 cash immediately. Revenue is earned when service is delivered — cash collection and earning happen simultaneously here.',
      data: {
        who: 'Company',
        what: 'Delivers consulting services and collects payment',
        amount: '$5,000',
      },
    },
    {
      type: 'journal',
      title: 'Record the Journal Entry',
      description:
        'Cash increases (debit) because cash was received. Service Revenue increases (credit) — revenue is a component of equity via net income. When revenue is earned, equity rises.',
      data: {
        date: 'Jan 15, Year 1',
        entries: [
          { account: 'Cash', debit: 5000 },
          { account: 'Service Revenue', credit: 5000 },
        ],
        memo: 'Cash received for consulting services rendered',
      },
    },
    {
      type: 'taccount',
      title: 'Post to T-Accounts',
      description:
        'Cash increases by $5,000 (now $45,000 total). Service Revenue shows a $5,000 credit balance. At period-end, revenue will be closed to Retained Earnings, permanently increasing equity.',
      data: {
        accounts: [
          { name: 'Cash', debits: [50000, 5000], credits: [10000] },
          { name: 'Equipment', debits: [10000], credits: [] },
          { name: 'Service Revenue', debits: [], credits: [5000] },
          { name: 'Common Stock', debits: [], credits: [50000] },
        ],
      },
    },
    {
      type: 'statement',
      title: 'Impact on Financial Statements',
      description:
        'Revenue increases assets by $5,000 (more cash) and increases equity by $5,000 (via net income added to retained earnings). The equation now: $55,000 = $0 + $55,000.',
      data: {
        type: 'BS',
        title: 'Balance Sheet — After Revenue',
        sections: [
          {
            heading: 'Assets',
            lines: [
              { label: 'Cash', value: 45000 },
              { label: 'Equipment', value: 10000 },
              { label: 'Total Assets', value: 55000, highlight: true },
            ],
          },
          {
            heading: 'Liabilities',
            lines: [{ label: 'Total Liabilities', value: 0 }],
          },
          {
            heading: 'Equity',
            lines: [
              { label: 'Common Stock', value: 50000 },
              { label: 'Retained Earnings (Net Income)', value: 5000 },
              { label: 'Total Equity', value: 55000, highlight: true },
            ],
          },
        ],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 2 — Revenue Recognition
// Slides: ch2-s1 (ASC 606 Five-Step Model), ch2-s2 (Accrual vs Cash), ch2-s3 (Manipulation)
// ---------------------------------------------------------------------------

// ch2-s1: Prepayment received → Deferred Revenue, then monthly recognition
const ch2s1Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Receive 12-Month Prepayment',
      description:
        'A customer pays $12,000 upfront for a 12-month SaaS subscription. Under ASC 606, cash receipt does not equal revenue recognition — the performance obligation (delivering monthly service) has not been satisfied yet.',
      data: {
        who: 'Customer',
        what: 'Pays $12,000 upfront for a 12-month subscription',
        amount: '$12,000',
      },
    },
    {
      type: 'journal',
      title: 'Record the Prepayment Receipt',
      description:
        'Cash increases (debit) — we received the money. But instead of crediting Revenue, we credit Deferred Revenue (a liability) — we owe the customer 12 months of service. No revenue yet.',
      data: {
        date: 'Jan 1, Year 1',
        entries: [
          { account: 'Cash', debit: 12000 },
          { account: 'Deferred Revenue', credit: 12000 },
        ],
        memo: 'Receipt of 12-month subscription prepayment — obligation not yet satisfied',
      },
    },
    {
      type: 'taccount',
      title: 'T-Accounts After Prepayment',
      description:
        'Cash rises $12,000. Deferred Revenue (a liability) rises $12,000. The balance sheet is now heavier on both sides, but no income has been recognized.',
      data: {
        accounts: [
          { name: 'Cash', debits: [12000], credits: [] },
          { name: 'Deferred Revenue', debits: [], credits: [12000] },
        ],
      },
    },
    {
      type: 'journal',
      title: 'Month-End: Recognize $1,000 Revenue',
      description:
        'At the end of each month, 1/12 of the obligation is satisfied. $1,000 moves from Deferred Revenue (liability decreases) to Service Revenue (equity increases). This repeats 12 times.',
      data: {
        date: 'Jan 31, Year 1',
        entries: [
          { account: 'Deferred Revenue', debit: 1000 },
          { account: 'Service Revenue', credit: 1000 },
        ],
        memo: 'Monthly revenue recognition — 1/12 of annual subscription earned',
      },
    },
    {
      type: 'statement',
      title: 'Income Statement — Month 1',
      description:
        'After one month, only $1,000 appears as revenue. The remaining $11,000 stays on the balance sheet as Deferred Revenue. This is the matching principle: revenue recognized as performance obligations are satisfied.',
      data: {
        type: 'IS',
        title: 'Income Statement — January',
        sections: [
          {
            heading: 'Revenue',
            lines: [
              { label: 'Service Revenue (earned)', value: 1000 },
              { label: 'Total Revenue', value: 1000, highlight: true },
            ],
          },
          {
            heading: 'Remaining Obligation',
            lines: [
              { label: 'Deferred Revenue (balance sheet — liability)', value: 11000 },
            ],
          },
        ],
      },
    },
  ],
}

// ch2-s2: Deliver goods on credit → Accounts Receivable, then collect cash
const ch2s2Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Deliver Goods on Credit',
      description:
        'The company ships $8,000 of goods to a customer on 30-day credit terms. Under accrual accounting, revenue is recognized at delivery — control has transferred — even though no cash has been received yet.',
      data: {
        who: 'Company',
        what: 'Ships goods to customer on 30-day credit terms',
        amount: '$8,000',
      },
    },
    {
      type: 'journal',
      title: 'Record the Sale on Credit',
      description:
        'Accounts Receivable increases (debit) — the customer owes us money. Sales Revenue increases (credit) — we\'ve earned the revenue by delivering the goods. Cash hasn\'t moved yet.',
      data: {
        date: 'Feb 1, Year 1',
        entries: [
          { account: 'Accounts Receivable', debit: 8000 },
          { account: 'Sales Revenue', credit: 8000 },
        ],
        memo: 'Sale of goods on account — 30-day payment terms',
      },
    },
    {
      type: 'taccount',
      title: 'T-Accounts After Credit Sale',
      description:
        'Accounts Receivable shows $8,000 debit (asset). Sales Revenue shows $8,000 credit. The company has earned income but hasn\'t collected the cash — a timing difference that shows up in working capital.',
      data: {
        accounts: [
          { name: 'Accounts Receivable', debits: [8000], credits: [] },
          { name: 'Sales Revenue', debits: [], credits: [8000] },
        ],
      },
    },
    {
      type: 'journal',
      title: 'Collect Cash from Customer',
      description:
        'The customer pays 30 days later. Cash increases (debit). Accounts Receivable decreases (credit) — the obligation the customer owed is now settled. No revenue is recognized here; it was already recognized at delivery.',
      data: {
        date: 'Mar 3, Year 1',
        entries: [
          { account: 'Cash', debit: 8000 },
          { account: 'Accounts Receivable', credit: 8000 },
        ],
        memo: 'Collection of receivable — customer pays invoice in full',
      },
    },
    {
      type: 'taccount',
      title: 'T-Accounts After Collection',
      description:
        'Cash increases by $8,000. Accounts Receivable is cleared to zero. Sales Revenue remains at $8,000 — it was recognized at delivery and doesn\'t change at collection. This is accrual accounting in practice.',
      data: {
        accounts: [
          { name: 'Cash', debits: [8000], credits: [] },
          { name: 'Accounts Receivable', debits: [8000], credits: [8000] },
          { name: 'Sales Revenue', debits: [], credits: [8000] },
        ],
      },
    },
  ],
}

// ch2-s3: Channel stuffing red flag — rising DSO while revenue grows
const ch2s3Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Push Inventory to Distributors (Channel Stuffing)',
      description:
        'A company ships $20,000 of inventory to distributors at quarter-end with informal return rights. Management books revenue immediately. Under ASC 606, "control" may not have transferred if the customer can return goods without consequence.',
      data: {
        who: 'Company (aggressive)',
        what: 'Ships product to distributors with informal return rights at quarter-end',
        amount: '$20,000',
      },
    },
    {
      type: 'journal',
      title: 'Revenue Booked (Potentially Premature)',
      description:
        'The journal entry looks correct on the surface. But if the distributor has undisclosed return rights, Step 5 of ASC 606 (control transfer) has not occurred — making this premature recognition.',
      data: {
        date: 'Mar 31, Year 1',
        entries: [
          { account: 'Accounts Receivable', debit: 20000 },
          { account: 'Sales Revenue', credit: 20000 },
        ],
        memo: 'Q1 channel fill — distributor shipments; return terms not disclosed',
      },
    },
    {
      type: 'taccount',
      title: 'T-Accounts Show Growing Receivables',
      description:
        'Accounts Receivable builds up relative to prior quarters because distributors aren\'t paying — they\'re sitting on inventory they may return. Days Sales Outstanding (DSO) rises as a result.',
      data: {
        accounts: [
          { name: 'Accounts Receivable', debits: [8000, 12000, 20000], credits: [8000] },
          { name: 'Sales Revenue', debits: [], credits: [8000, 12000, 20000] },
        ],
      },
    },
    {
      type: 'statement',
      title: 'Detecting the Red Flag on Financial Statements',
      description:
        'Revenue is growing, but cash collected from customers (per the cash flow statement) lags far behind. DSO is rising — 45 days vs. 30-day terms. This divergence is the primary signal of channel stuffing or premature revenue recognition.',
      data: {
        type: 'IS',
        title: 'Revenue Quality Analysis — Q1',
        sections: [
          {
            heading: 'Income Statement (Accrual)',
            lines: [
              { label: 'Sales Revenue (booked)', value: 40000 },
              { label: 'Net Income (reported)', value: 8000, highlight: true },
            ],
          },
          {
            heading: 'Cash Flow Warning Signs',
            lines: [
              { label: 'Cash Collected from Customers', value: 20000 },
              { label: 'Accrual-Cash Gap (red flag)', value: 20000, highlight: true },
            ],
          },
        ],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 3 — Inventory Methods
// Slides: ch3-s1 (FIFO/LIFO/WA), ch3-s2 (LCNRV)
// ---------------------------------------------------------------------------

// ch3-s1: Buy inventory then sell → Dr COGS, Cr Inventory + Dr Cash, Cr Revenue
const ch3s1Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Purchase Inventory',
      description:
        'The company purchases 100 units of inventory for $3,000 ($30 per unit). The cost is capitalized as an asset — it becomes an expense (COGS) only when the inventory is sold.',
      data: {
        who: 'Company',
        what: 'Purchases 100 units of inventory at $30 per unit',
        amount: '$3,000',
      },
    },
    {
      type: 'journal',
      title: 'Record the Inventory Purchase',
      description:
        'Inventory increases (debit) — the company now has an asset. Accounts Payable increases (credit) — the company owes the supplier. The cost sits on the balance sheet until the goods are sold.',
      data: {
        date: 'Mar 1, Year 1',
        entries: [
          { account: 'Inventory', debit: 3000 },
          { account: 'Accounts Payable', credit: 3000 },
        ],
        memo: 'Purchase of 100 units @ $30/unit on account',
      },
    },
    {
      type: 'event',
      title: 'Sell 60 Units for Cash',
      description:
        'The company sells 60 units at $60 each ($3,600 revenue). Two things happen simultaneously: revenue is earned, and the cost of the sold units is expensed as Cost of Goods Sold (COGS).',
      data: {
        who: 'Company',
        what: 'Sells 60 units to customers at $60 per unit for cash',
        amount: '$3,600 revenue / $1,800 cost',
      },
    },
    {
      type: 'journal',
      title: 'Record the Sale (Two Entries)',
      description:
        'Entry 1: Record the revenue — Cash up, Sales Revenue credited. Entry 2: Record the cost — COGS expensed (debit) and Inventory reduced (credit). 60 units × $30 = $1,800 COGS. Gross profit = $3,600 − $1,800 = $1,800.',
      data: {
        date: 'Mar 15, Year 1',
        entries: [
          { account: 'Cash', debit: 3600 },
          { account: 'Sales Revenue', credit: 3600 },
          { account: 'Cost of Goods Sold', debit: 1800 },
          { account: 'Inventory', credit: 1800 },
        ],
        memo: 'Sale of 60 units @ $60; COGS @ $30/unit (60 × $30 = $1,800)',
      },
    },
    {
      type: 'taccount',
      title: 'T-Accounts After Sale',
      description:
        'Inventory balance: $3,000 − $1,800 = $1,200 (40 units remaining). Cash up $3,600. COGS has a $1,800 debit (expense). Sales Revenue has a $3,600 credit. The matching principle: expense recorded in same period as revenue.',
      data: {
        accounts: [
          { name: 'Inventory', debits: [3000], credits: [1800] },
          { name: 'Cash', debits: [3600], credits: [] },
          { name: 'Sales Revenue', debits: [], credits: [3600] },
          { name: 'Cost of Goods Sold', debits: [1800], credits: [] },
        ],
      },
    },
    {
      type: 'statement',
      title: 'Income Statement Impact',
      description:
        'The income statement shows gross profit of $1,800 (50% gross margin). The remaining 40 units ($1,200) stay on the balance sheet as Inventory — a future expense when sold.',
      data: {
        type: 'IS',
        title: 'Income Statement — Inventory Sale',
        sections: [
          {
            heading: 'Revenue',
            lines: [{ label: 'Sales Revenue (60 units × $60)', value: 3600 }],
          },
          {
            heading: 'Cost of Goods Sold',
            lines: [{ label: 'COGS (60 units × $30)', value: 1800 }],
          },
          {
            heading: 'Gross Profit',
            lines: [
              { label: 'Gross Profit', value: 1800, highlight: true },
              { label: 'Gross Margin', value: 50 },
            ],
          },
        ],
      },
    },
  ],
}

// ch3-s2: FIFO vs LIFO cost flow comparison — same purchases, different COGS
const ch3s2Sequence: AnimationSequence = {
  stages: [
    {
      type: 'event',
      title: 'Rising Prices: Two Inventory Purchases',
      description:
        'The company buys inventory in two batches at rising prices: 50 units at $20 (Jan), then 50 units at $30 (Feb). It sells 50 units in March. The COGS depends entirely on which cost flow assumption is used.',
      data: {
        who: 'Company',
        what: 'Buys inventory at rising prices, then sells 50 units',
        amount: '$20/unit (Jan) → $30/unit (Feb)',
      },
    },
    {
      type: 'journal',
      title: 'FIFO: First In, First Out — Journal Entry',
      description:
        'Under FIFO, the oldest costs (Jan batch at $20) are assigned to COGS first. Selling 50 units: COGS = 50 × $20 = $1,000. The newer, more expensive Feb batch stays on the balance sheet.',
      data: {
        date: 'Mar 31, Year 1 — FIFO',
        entries: [
          { account: 'Cost of Goods Sold (FIFO)', debit: 1000 },
          { account: 'Inventory', credit: 1000 },
        ],
        memo: 'FIFO: 50 units sold; cost assigned from oldest layer (Jan @ $20/unit)',
      },
    },
    {
      type: 'journal',
      title: 'LIFO: Last In, First Out — Journal Entry',
      description:
        'Under LIFO, the newest costs (Feb batch at $30) are assigned to COGS first. Selling 50 units: COGS = 50 × $30 = $1,500. The older, cheaper Jan batch stays on the balance sheet.',
      data: {
        date: 'Mar 31, Year 1 — LIFO',
        entries: [
          { account: 'Cost of Goods Sold (LIFO)', debit: 1500 },
          { account: 'Inventory', credit: 1500 },
        ],
        memo: 'LIFO: 50 units sold; cost assigned from newest layer (Feb @ $30/unit)',
      },
    },
    {
      type: 'taccount',
      title: 'T-Account Comparison: FIFO vs LIFO',
      description:
        'FIFO assigns $1,000 to COGS; $1,500 stays in Inventory (the pricier Feb batch). LIFO assigns $1,500 to COGS; $1,000 stays in Inventory (the cheaper Jan batch). Same physical inventory — completely different financial statements.',
      data: {
        accounts: [
          { name: 'COGS (FIFO)', debits: [1000], credits: [] },
          { name: 'COGS (LIFO)', debits: [1500], credits: [] },
          { name: 'Inventory (FIFO end)', debits: [2500], credits: [1000] },
          { name: 'Inventory (LIFO end)', debits: [2500], credits: [1500] },
        ],
      },
    },
    {
      type: 'statement',
      title: 'Gross Profit: FIFO vs LIFO Comparison',
      description:
        'Assume revenue = $2,500 (50 units × $50). FIFO reports $500 higher gross profit than LIFO in a rising-price environment. LIFO reports lower profit and pays less in taxes — the LIFO tax advantage. LIFO is not permitted under IFRS.',
      data: {
        type: 'IS',
        title: 'Gross Profit Comparison — Rising Prices',
        sections: [
          {
            heading: 'Revenue (same under both methods)',
            lines: [{ label: 'Sales Revenue (50 units × $50)', value: 2500 }],
          },
          {
            heading: 'FIFO Method',
            lines: [
              { label: 'COGS (50 × $20 oldest cost)', value: 1000 },
              { label: 'FIFO Gross Profit', value: 1500, highlight: true },
            ],
          },
          {
            heading: 'LIFO Method',
            lines: [
              { label: 'COGS (50 × $30 newest cost)', value: 1500 },
              { label: 'LIFO Gross Profit', value: 1000, highlight: true },
            ],
          },
        ],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Export: keyed by slide ID
// ---------------------------------------------------------------------------

export const CHAPTER_ANIMATIONS: Record<string, AnimationSequence> = {
  'ch1-s1': ch1s1Sequence, // Accounting Equation → owner investment
  'ch1-s2': ch1s2Sequence, // Double-Entry Bookkeeping → asset swap
  'ch1-s3': ch1s3Sequence, // T-Accounts → earn service revenue
  'ch2-s1': ch2s1Sequence, // ASC 606 Five-Step → prepayment + monthly recognition
  'ch2-s2': ch2s2Sequence, // Accrual vs Cash → credit sale + cash collection
  'ch2-s3': ch2s3Sequence, // Revenue Manipulation → channel stuffing red flags
  'ch3-s1': ch3s1Sequence, // FIFO/LIFO/WA → buy inventory then sell
  'ch3-s2': ch3s2Sequence, // LCNRV → FIFO vs LIFO cost flow comparison
}
