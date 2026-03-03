import type { ConceptSlide } from './conceptTypes'

export const CHAPTER_CONCEPTS: Record<number, ConceptSlide[]> = {
  1: [
    {
      id: 'ch1-s1',
      chapterId: 1,
      sectionLabel: 'Foundations',
      title: 'The Accounting Equation',
      explanation:
        'Every financial statement begins with a single identity: Assets = Liabilities + Equity. This equation must hold after every transaction, without exception. It is not a guideline — it is a mathematical law. Every debit has a credit, every source of cash has a corresponding use, and the balance sheet always balances.',
      formula: 'Assets = Liabilities + Equity',
      highlights: [
        'Assets are resources the company controls that have future economic value.',
        'Liabilities are obligations owed to outside parties (banks, suppliers, employees).',
        'Equity is the residual claim — what remains for shareholders after all liabilities are paid.',
        'If this equation ever appears to not balance, there is an error — or fraud.',
      ],
      deepDive: {
        body: [
          'The accounting equation traces its origins to Luca Pacioli\'s 1494 treatise Summa de Arithmetica, which described double-entry bookkeeping in systematic form for the first time. The core insight was that every economic event has two equal and offsetting effects.',
          'In practice, this means every journal entry affects at least two accounts. A sale on credit increases Accounts Receivable (asset) and Sales Revenue (equity via net income). Paying a supplier decreases Cash (asset) and decreases Accounts Payable (liability). The equation stays balanced.',
          'When companies commit fraud, they must still respect this equation — which actually helps forensic accountants find manipulation. If assets are overstated, something else must be overstated or understated. Enron\'s SPEs violated this principle: hidden liabilities meant the visible balance sheet was structurally false.',
        ],
        keyInsights: [
          'Every fraud must still make the equation balance — which creates detectable distortions elsewhere.',
          'The equation is the foundation of all ratio analysis: any ratio that uses balance sheet numbers is derived from this relationship.',
          'Off-balance-sheet structures are designed to move items outside this equation while keeping economic exposure.',
        ],
        realWorldExample:
          'Enron created hundreds of Special Purpose Entities (SPEs) to remove $30B in debt from its balance sheet. The debt existed economically, but the accounting equation appeared to balance because assets and liabilities were moved off together — until they came back.',
        commonMistakes: [
          'Confusing revenue (equity increase) with cash receipt — they are different sides of the equation.',
          'Thinking a purchase of inventory with cash doesn\'t change equity — it doesn\'t: assets swap (inventory ↑, cash ↓).',
          'Believing the equation can be "managed" — it always balances, but it can be made to balance using fiction.',
        ],
      },
      predictionPrompt: {
        question:
          'A company borrows $500,000 from a bank. Before reading on — what happens to the accounting equation?',
        options: [
          { id: 'a', text: 'Assets increase by $500K; Equity increases by $500K', correct: false, explanation: 'Borrowing creates a liability, not equity. Equity increases only when shareholders contribute capital or the company earns income.' },
          { id: 'b', text: 'Assets increase by $500K; Liabilities increase by $500K', correct: true, explanation: 'Correct. Cash (asset) goes up $500K; Bank Loan (liability) goes up $500K. The equation stays balanced: Assets = Liabilities + Equity still holds, with both sides increasing by $500K.' },
          { id: 'c', text: 'No change — the company still owes the money back', correct: false, explanation: 'The obligation to repay is precisely why Liabilities increases. Recording the liability is what makes the equation balance.' },
        ],
      },
    },
    {
      id: 'ch1-s2',
      chapterId: 1,
      sectionLabel: 'Mechanics',
      title: 'Double-Entry Bookkeeping',
      explanation:
        'Double-entry means every transaction is recorded with equal debits and credits. This is not just a technique — it is a self-auditing system. If total debits ≠ total credits, something is wrong. Developed in 15th-century Venice, double-entry has never been improved upon because it already captures the complete economic reality of every transaction.',
      highlights: [
        'Debits are entries on the LEFT side of an account.',
        'Credits are entries on the RIGHT side of an account.',
        'The system is self-checking: if journals don\'t balance, errors can be isolated.',
        'Every fraudulent adjustment must still balance — which leaves detectable traces.',
      ],
      deepDive: {
        body: [
          'The terms "debit" and "credit" have no inherent meaning of "increase" or "decrease" — they simply refer to the left and right sides of the T-account. Whether a debit increases or decreases an account depends on its normal balance.',
          'Asset and expense accounts have debit normal balances (debits increase them). Liability, equity, and revenue accounts have credit normal balances (credits increase them). This creates a mnemonic: DEAD CLIC (Debit: Expenses, Assets, Dividends; Credit: Liabilities, Income, Capital).',
          'In a fraud context, knowing normal balances is the first step in spotting manipulation. A credit to an expense account is unusual — it could indicate a vendor creating fictitious credits, or management reversing accruals to inflate profit.',
        ],
        keyInsights: [
          'Unusual credits to expense accounts are a common fraud indicator — expenses should normally be debited.',
          'Rounding in journal entries (round numbers like $1,000,000 instead of $998,247) suggests estimate-based entries and warrants scrutiny.',
          'The double-entry system makes "erasing" a transaction impossible — it must be reversed, which creates an audit trail.',
        ],
        realWorldExample:
          'WorldCom capitalized $3.8B in operating expenses by debiting "Property, Plant & Equipment" (an asset) instead of "Network Line Costs" (an expense). The double-entry was internally consistent — which is why it passed automated balance checks and required human judgment to detect.',
        commonMistakes: [
          'Thinking debits are always "good" or credits always "bad" — this is incorrect.',
          'Confusing the bank\'s perspective (where your deposit is their liability) with the company\'s perspective.',
          'Assuming equal debits and credits means the entries are correct — they can be consistently wrong.',
        ],
      },
    },
    {
      id: 'ch1-s3',
      chapterId: 1,
      sectionLabel: 'Visual Tools',
      title: 'T-Accounts and Normal Balances',
      explanation:
        'A T-account is the visual representation of a ledger account: the account name at the top, debits on the left, credits on the right. The "T" shape makes it easy to see the net balance. Professional accountants think in T-accounts instinctively — they can trace any transaction through the system by drawing T-accounts.',
      highlights: [
        'Normal balance = the side that increases the account (debit for assets/expenses; credit for liabilities/equity/revenue).',
        'A balance on the opposite side of normal is a red flag (e.g., a credit balance in Cash).',
        'All T-accounts feed into the Trial Balance, which summarizes every account before statements are prepared.',
        'Adjusting entries are recorded before financial statements to align accrual accounting.',
      ],
      deepDive: {
        body: [
          'The Trial Balance is a critical internal control checkpoint. It lists every account and its balance, with total debits equaling total credits. An out-of-balance trial balance immediately signals an error. However, a balanced trial balance doesn\'t guarantee correctness — errors can offset each other.',
          'Adjusting entries are journal entries made at period-end to ensure revenue and expenses are recorded in the correct period. Common adjustments include accrued expenses (expense occurred but not yet paid), prepaid expenses (paid in advance, now being used), and deferred revenue (collected but not yet earned).',
          'Financial statement fraud often manipulates adjusting entries, which are judgment-driven and occur late in the reporting cycle when oversight is lowest. Large, late-period journal entries made by senior management are the highest-risk category in any audit.',
        ],
        keyInsights: [
          'Large adjusting entries made by CFOs or controllers near period-end are the most common vehicle for earnings management.',
          'A debit balance in a normally-credit account (like Accounts Payable) suggests the liability was paid before it was recorded — potentially indicating pressure on cash management.',
          'Chart of accounts changes (adding new accounts or renaming existing ones) can obscure where expenses are being parked.',
        ],
        realWorldExample:
          'HealthSouth CEO Richard Scrushy directed accountants to record false journal entries — specifically, credits to "Fixed Assets" accounts (which shouldn\'t have random credits) to inflate the balance sheet. The manipulation persisted because internal auditors didn\'t question why assets were growing faster than capital expenditures.',
        commonMistakes: [
          'Confusing "adjusting entries" with corrections — they are normal accrual-basis entries, not error fixes.',
          'Thinking closing entries change the balance sheet — they transfer revenue/expense balances to retained earnings, affecting equity.',
          'Overlooking contra accounts (like Accumulated Depreciation, which has a credit balance even though it offsets an asset).',
        ],
      },
    },
  ],

  2: [
    {
      id: 'ch2-s1',
      chapterId: 2,
      sectionLabel: 'Framework',
      title: 'The Five-Step Revenue Recognition Model (ASC 606)',
      explanation:
        'ASC 606, effective 2018, created a unified framework for recognizing revenue across all industries. The five steps: (1) identify the contract, (2) identify performance obligations, (3) determine transaction price, (4) allocate price to obligations, (5) recognize revenue when each obligation is satisfied. Revenue is earned when control transfers to the customer — not when cash is collected.',
      formula: 'Revenue = \\sum_{i=1}^{n} P_i \\cdot \\mathbb{1}[\\text{obligation } i \\text{ satisfied}]',
      highlights: [
        'Step 5 is where the manipulation occurs: management decides when "control has transferred."',
        'Multi-element arrangements (hardware + software + maintenance) require price allocation across all obligations.',
        'Variable consideration (bonuses, rebates, returns) must be estimated and constrained.',
        'Contract modifications can create or eliminate performance obligations — affecting timing.',
      ],
      deepDive: {
        body: [
          'Before ASC 606, revenue recognition rules varied by industry, creating comparison problems. SAB 101/104 (SEC guidance) required fixed/determinable amounts, persuasive evidence of arrangement, delivery, and collectibility — but interpretation varied widely.',
          'The "performance obligation" concept is where most aggressive revenue recognition occurs today. Companies structure contracts to front-load obligations that satisfy quickly while deferring costs. A software company might separate "license delivery" from "support" and recognize 90% of revenue on day one, even if implementation takes a year.',
          'Channel stuffing — shipping product to distributors at period-end with informal return rights — violates Step 1 (enforceable contract) or Step 5 (control transfer) under ASC 606. But it takes an auditor willing to question management\'s "business judgment" to catch it.',
        ],
        keyInsights: [
          'Bill-and-hold arrangements (booking revenue before shipping) require specific criteria: customer must request it, product must be separately identified, and the product must be ready for transfer.',
          'Round-number revenue that exactly hits quarterly guidance (to the nearest million) suggests management of estimates rather than genuine business performance.',
          '"Sell-through" vs "sell-in" is a critical distinction: recognizing revenue when you ship to a distributor vs when the distributor sells to end customers.',
        ],
        realWorldExample:
          'Lucent Technologies recognized $679M of revenue in 2000 by selling equipment to distributors with side agreements allowing returns. The stock fell 70% when the SEC forced restatement. The arrangements satisfied the technical form of a sale while violating the substance of "control transfer."',
        commonMistakes: [
          'Assuming all revenue in the period is earned revenue — deferred revenue on the balance sheet represents collected-but-unearned amounts.',
          'Confusing recognition with billing: a company can invoice before delivery (deferred) or deliver before invoice (accrued revenue).',
          'Missing the significance of "stand-alone selling price" allocation — companies set these prices, creating room for manipulation.',
        ],
      },
      predictionPrompt: {
        question:
          'A SaaS company collects $12,000 upfront for a 12-month subscription. When is revenue recognized?',
        options: [
          { id: 'a', text: 'All $12,000 recognized on the day cash is received', correct: false, explanation: 'Cash receipt creates Deferred Revenue (a liability), not Revenue. The performance obligation — providing the service — has not been satisfied yet.' },
          { id: 'b', text: '$1,000 per month recognized as the service is delivered', correct: true, explanation: 'Correct. The performance obligation is satisfied ratably over 12 months as the service is delivered. Each month, $1,000 moves from Deferred Revenue (liability) to Revenue (equity).' },
          { id: 'c', text: 'Recognized when the contract is signed', correct: false, explanation: 'Contract signing creates the obligation but doesn\'t satisfy it. Performance must occur before revenue is recognized under ASC 606.' },
        ],
      },
    },
    {
      id: 'ch2-s2',
      chapterId: 2,
      sectionLabel: 'Principles',
      title: 'Accrual Accounting vs Cash Basis',
      explanation:
        'Accrual accounting records revenues when earned and expenses when incurred, regardless of cash movement. Cash basis records only when cash changes hands. GAAP requires accrual accounting for all public companies because it better matches economic activity to the period it occurs — but it also creates room for manipulation through accounting estimates.',
      formula: '\\text{Net Income} = \\text{Revenue Earned} - \\text{Expenses Incurred}',
      highlights: [
        'Accounts Receivable (asset) records revenue earned but not yet collected.',
        'Accounts Payable (liability) records expenses incurred but not yet paid.',
        'Deferred Revenue (liability) records cash collected but not yet earned.',
        'Accrued Liabilities (liability) records expenses incurred but not yet invoiced.',
      ],
      deepDive: {
        body: [
          'The gap between net income (accrual) and cash from operations is called the accruals ratio or the quality of earnings gap. A widening gap — net income consistently exceeding cash flow from operations — is the most powerful fraud signal in accounting analysis.',
          'Beneish M-Score and Sloan Accruals Ratio both use the relationship between accruals and cash flows to identify earnings management. Companies with high accruals (receivables, inventories growing faster than revenue) are statistically more likely to experience negative earnings surprises.',
          'The matching principle — recognizing expenses in the same period as the revenue they generate — is the flip side of revenue recognition. WorldCom violated the matching principle by capitalizing $3.8B of operating costs, deferring expenses while recognizing revenue, inflating current-period margins by exactly that amount.',
        ],
        keyInsights: [
          'The Sloan (1996) accruals anomaly showed that firms in the highest accruals quintile underperform the lowest quintile by 10% annually over the next year — the market was slow to price in the lower quality of accrual earnings.',
          'Revenue growth without corresponding cash collection growth is the primary indicator of premature recognition or channel stuffing.',
          'Days Sales Outstanding (DSO = AR / Daily Revenue) rising while revenue grows is the single most actionable ratio for detecting revenue manipulation.',
        ],
        realWorldExample:
          'Sunbeam (CEO "Chainsaw Al" Dunlap) used "bill-and-hold" to ship barbecue grills to warehouses in winter and book revenue immediately. When channel inventory reversed in the next period, revenue collapsed — and the fraud became visible in the AR-to-revenue divergence that had been building for quarters.',
        commonMistakes: [
          'Assuming accrual net income overstates cash flow — it can go either way depending on working capital changes.',
          'Thinking cash flow from operations is manipulation-proof — it can be managed through vendor payment timing and customer billing acceleration.',
          'Ignoring deferred revenue as a positive quality indicator: a company with growing deferred revenue has future revenue locked in.',
        ],
      },
    },
    {
      id: 'ch2-s3',
      chapterId: 2,
      sectionLabel: 'Manipulation',
      title: 'Revenue Manipulation Techniques',
      explanation:
        'Revenue manipulation is the most common form of financial statement fraud. Techniques include: (1) premature recognition — booking before earned; (2) fictitious revenue — booking sales that never happened; (3) channel stuffing — pushing inventory to distributors with return rights; (4) round-tripping — exchanging payments with no economic substance. Each technique distorts the income statement while creating detectable balance sheet anomalies.',
      highlights: [
        'Channel stuffing shows up as DSO (days sales outstanding) rising while revenue grows.',
        'Fictitious revenue requires either fake AR or circular payments — both leave traces.',
        'Round-tripping creates revenue and matching expense simultaneously — look for unusual symmetry.',
        'Bill-and-hold violations: product not physically moved to customer, or informal return rights exist.',
      ],
      deepDive: {
        body: [
          'Round-tripping was widely used in the early 2000s telecom bubble. Companies A and B would buy capacity from each other simultaneously, booking the cash received as revenue and the cash paid as capex. Net cash impact: zero. But revenue was up, and capex appeared to justify future growth projections.',
          'The SEC\'s Staff Accounting Bulletin 104 (SAB 104) requires four criteria for revenue recognition: (1) persuasive evidence of arrangement, (2) delivery has occurred, (3) price is fixed/determinable, (4) collectibility is reasonably assured. Channel stuffing typically fails criterion 2 or 4 when there are undisclosed return rights.',
          'Qualitative red flags for revenue manipulation include: CFO departure after Q4 (too late to restate), unusual seasonality (Q4 disproportionately large), management guidance that is always precisely met, and high revenue concentration in a single customer that appears/disappears.',
        ],
        keyInsights: [
          'Q4 revenue as a % of annual total above 35% in non-seasonal businesses is a red flag for year-end channel stuffing.',
          'Revenue that exceeds cash collected from customers (per the cash flow statement) by a growing amount signals aggressive accrual practices.',
          '"Sell-in" companies (book when they ship) are higher manipulation risk than "sell-through" companies (book when distributors sell to end users).',
        ],
        realWorldExample:
          'Xerox restated $6.4B in revenue over 1997-2001 by shifting revenue from equipment maintenance contracts to equipment sales — accelerating recognition while deferring the performance obligation. Auditors KPMG were fined $22M. The manipulation was visible in unusual revenue mix shifts that were never explained in MD&A.',
        commonMistakes: [
          'Assuming only small companies commit revenue fraud — Enron, Xerox, Lucent, and WorldCom were all large-cap companies.',
          'Ignoring non-cash revenue — barter transactions and round-trips can inflate revenue without any cash changing hands.',
          'Overlooking adjustments to "estimates" — revenue reversals are often buried in footnotes as "changes in accounting estimates."',
        ],
      },
    },
  ],

  3: [
    {
      id: 'ch3-s1',
      chapterId: 3,
      sectionLabel: 'Cost Flow',
      title: 'FIFO, LIFO, and Weighted Average',
      explanation:
        'Inventory accounting requires a cost flow assumption: which costs are assigned to cost of goods sold (COGS) and which remain in ending inventory. FIFO (First In, First Out) assumes oldest costs are sold first. LIFO (Last In, First Out) assumes newest costs are sold first. Weighted Average uses an average cost. In rising price environments, these choices produce materially different reported profits.',
      formula: '\\text{COGS} = \\text{Beginning Inventory} + \\text{Purchases} - \\text{Ending Inventory}',
      highlights: [
        'FIFO: older (cheaper) costs in COGS, newer (higher) costs on balance sheet → higher profit in inflationary periods.',
        'LIFO: newer (higher) costs in COGS, older (cheaper) costs on balance sheet → lower profit, lower taxes.',
        'LIFO is not permitted under IFRS — only GAAP allows it.',
        'The LIFO Reserve reveals how much LIFO understates inventory vs FIFO — add it back to compare companies.',
      ],
      deepDive: {
        body: [
          'The LIFO conformity rule requires that if a company uses LIFO for taxes, it must also use LIFO for financial reporting. This creates a real tension: LIFO saves taxes in inflationary periods but reports lower inventory on the balance sheet.',
          'The LIFO Reserve is disclosed in footnotes and represents the cumulative difference between LIFO inventory and FIFO inventory. Adding the LIFO Reserve to LIFO inventory gives the economic (FIFO) inventory value. To compare gross margins across companies using different methods, you must normalize to a common cost flow assumption.',
          'LIFO liquidation occurs when a LIFO company sells more inventory than it purchases, dipping into older (cheaper) cost layers. This artificially boosts gross margin and is a one-time, non-recurring earnings boost. It should be excluded from normalized earnings analysis.',
        ],
        keyInsights: [
          'LIFO reserves can be enormous: in 2022, ExxonMobil\'s LIFO reserve was $22B — meaning LIFO inventory was $22B lower than FIFO inventory on the balance sheet.',
          'LIFO liquidation gains are disclosed in footnotes and should be stripped out of comparable-period analysis.',
          'A switch from LIFO to FIFO (which companies sometimes make when adopting IFRS-like reporting) typically generates a large one-time income statement boost — not an improvement in operations.',
        ],
        realWorldExample:
          'During the 1970s oil embargo, energy companies using LIFO reported dramatically lower profits (due to high replacement costs flowing through COGS) while FIFO companies reported record profits. The choice of method — identical physical inventory — produced 40-50% differences in reported net income between otherwise identical companies.',
        commonMistakes: [
          'Confusing FIFO/LIFO with physical inventory flow — cost flow assumptions are independent of how goods physically move.',
          'Thinking FIFO always produces higher profits — only true in rising price environments; LIFO produces higher profits when prices are falling.',
          'Ignoring the LIFO Reserve when comparing inventory-heavy companies (retail, manufacturing, commodities).',
        ],
      },
      predictionPrompt: {
        question:
          'Prices have been rising for three years. A competitor switches from FIFO to LIFO. What happens to their reported gross profit?',
        options: [
          { id: 'a', text: 'Gross profit increases — LIFO assigns higher costs to balance sheet', correct: false, explanation: 'LIFO assigns the most recent (higher) costs to COGS, not to the balance sheet. Higher COGS = lower gross profit.' },
          { id: 'b', text: 'Gross profit decreases — LIFO assigns higher recent costs to COGS', correct: true, explanation: 'Correct. In a rising price environment, LIFO uses the most recently purchased (higher-cost) inventory as COGS, increasing the expense and reducing gross profit. The balance sheet inventory is understated using older, cheaper costs.' },
          { id: 'c', text: 'Gross profit is unchanged — it\'s just an accounting assumption', correct: false, explanation: 'The cost flow assumption directly affects reported COGS and therefore gross profit. It is not merely an accounting label — it determines which dollar amounts appear on which statements.' },
        ],
      },
    },
    {
      id: 'ch3-s2',
      chapterId: 3,
      sectionLabel: 'Valuation',
      title: 'Lower of Cost or Net Realizable Value (LCNRV)',
      explanation:
        'GAAP requires inventory to be written down to net realizable value (NRV) when NRV falls below cost. NRV = estimated selling price minus estimated costs to complete and sell. Write-downs are required and immediate; write-ups (once impaired) are prohibited under US GAAP. Delaying required write-downs is one of the most common ways management overstates assets.',
      highlights: [
        'NRV = Selling Price − Completion Costs − Selling Costs.',
        'Write-downs flow through COGS (reducing gross margin) or as a separate line item.',
        'Write-downs cannot be reversed under US GAAP (IFRS allows reversal up to original cost).',
        'Obsolete inventory — products no longer sellable at cost — must be written down immediately.',
      ],
      deepDive: {
        body: [
          'Inventory write-downs are a frequent vehicle for "big bath" accounting — taking an unusually large charge in a period when results are already bad to create a clean slate for future periods. The write-down reduces current-period income but improves future gross margins when the inventory is sold at its written-down value.',
          'Management has significant discretion in estimating NRV, particularly for (1) slow-moving inventory, (2) inventory with declining market prices, (3) custom/specialized inventory with a limited market, and (4) fashion or technology items with rapid obsolescence.',
          'Forensic analysis of inventory involves comparing the inventory aging report to the write-down history. If management is consistently writing down the same categories of inventory, it suggests the NRV estimates have been systematically optimistic. If write-downs suddenly spike after a management change, the predecessor was likely deferring them.',
        ],
        keyInsights: [
          'An inventory write-down improves future gross margins in periods when the written-down inventory is sold — this is a known earnings smoothing technique.',
          '"Days Inventory Outstanding" (DIO) rising while margins hold steady is a warning sign of delayed write-downs.',
          'Physical inventory counts conducted by auditors are required precisely because inventory is the easiest asset to fabricate — paper inventory doesn\'t rust or take up space.',
        ],
        realWorldExample:
          'Phar-Mor (a discount pharmacy chain) maintained $350M in phantom inventory by overstating physical counts. When the fraud collapsed in 1992, write-downs eliminated almost all equity. The auditors (Coopers & Lybrand) were sued for negligence; the case established important standards for inventory observation procedures.',
        commonMistakes: [
          'Assuming write-downs are always a sign of a problem — they can reflect prudent management marking obsolete items before they harm cash flow.',
          'Thinking write-downs only affect the balance sheet — they hit COGS and reduce gross margin immediately.',
          'Ignoring the asymmetry: US GAAP prohibits write-ups, so once inventory is impaired, it creates permanently lower asset values.',
        ],
      },
    },
    {
      id: 'ch3-s3',
      chapterId: 3,
      sectionLabel: 'Analysis',
      title: 'Inventory Efficiency Ratios',
      explanation:
        'Inventory ratios measure how efficiently a company converts inventory to sales. Inventory Turnover = COGS / Average Inventory. Days Inventory Outstanding (DIO) = 365 / Inventory Turnover. High turnover = efficient; low turnover = potential obsolescence, demand weakness, or overstated inventory. These ratios must be benchmarked against industry peers because "efficient" varies enormously by sector.',
      formula: '\\text{Inventory Turnover} = \\frac{\\text{COGS}}{\\text{Average Inventory}}',
      highlights: [
        'A falling inventory turnover (DIO rising) suggests demand is softening or inventory is being accumulated.',
        'Compare to prior periods AND industry peers — a single ratio in isolation is meaningless.',
        'FIFO vs LIFO differences in COGS and inventory must be normalized before cross-company comparison.',
        'Gross Margin = (Revenue − COGS) / Revenue; affected by both cost flow method and write-downs.',
      ],
      deepDive: {
        body: [
          'The Cash Conversion Cycle (CCC) links receivables, inventory, and payables into a single measure of working capital efficiency: CCC = DIO + DSO − DPO. A company with a negative CCC (Amazon\'s core business model) collects from customers before paying suppliers — effectively financing operations with supplier credit.',
          'Industry benchmarks vary significantly: grocery retailers (DIO 20-30 days), auto manufacturers (DIO 60-90 days), aerospace manufacturers (DIO 180-360 days). An absolute DIO number is meaningless without context. What matters is trend and peer comparison.',
          'The "inventory growth relative to revenue growth" test is a simple but powerful screen: if inventory grows at 2× revenue growth for multiple quarters, one of three things is happening — (1) the company is building buffer stock intentionally, (2) demand is softening and management is slow to respond, or (3) inventory is being fabricated.',
        ],
        keyInsights: [
          'A company whose inventory grows faster than revenue for 3+ consecutive quarters has never been proven correct in its "demand will recover" thesis in public markets.',
          'Write-downs that exactly offset unusual inventory build-ups (happening 1-2 quarters later) suggest management was deliberately timing recognition.',
          'COGS-based turnover is more reliable than revenue-based turnover because COGS is harder to inflate independently of inventory.',
        ],
        realWorldExample:
          'Crazy Eddie (consumer electronics retail) showed growing inventory turnover for years — because the fraud was overstating inventory, which was divided into real revenue. When auditors finally performed rigorous physical counts in 1987, inventory was $65M less than reported, wiping out all equity. The "good turnover ratios" had been fabricated alongside the inventory.',
        commonMistakes: [
          'Using revenue instead of COGS to calculate turnover — revenue is subject to markup and varies by pricing strategy.',
          'Comparing inventory turnover across industries without adjustment — a 5× turnover is excellent for a furniture retailer but concerning for a software company.',
          'Ignoring that different inventory costing methods (FIFO vs LIFO) affect both COGS and average inventory — always normalize.',
        ],
      },
    },
  ],

  4: [
    {
      id: 'ch4-s1',
      chapterId: 4,
      sectionLabel: 'Classification',
      title: 'Capitalize vs Expense: The Most Powerful Profit Lever',
      explanation:
        'When a company incurs a cost, it must classify it as either (1) a capital expenditure — recorded as an asset and depreciated over its useful life — or (2) an operating expense — charged to the income statement immediately. Capitalizing a $100M cost spreads it over 10 years ($10M/year); expensing it hits profit $100M now. This single decision is the most powerful lever management has for managing reported earnings.',
      highlights: [
        'Capitalize when: cost provides future economic benefits beyond one year (buys long-lived asset).',
        'Expense when: cost provides only current-period benefit (maintenance, repairs, ordinary operations).',
        'WorldCom capitalized $3.8B of network line costs that were clearly operating expenses.',
        'Capitalizing increases CFO (cost moves to investing) and reduces current-period expense.',
      ],
      deepDive: {
        body: [
          'The economic test for capitalization is whether the cost provides future economic benefits beyond the current accounting period. Replacing a roof on a factory (capital — extends asset life) vs patching a pothole in the parking lot (expense — maintenance). In practice, the line is deliberately blurred by companies seeking to defer expenses.',
          'The income statement impact is immediate and visible: a $100M capitalized cost adds $100M to assets and reduces cash $100M (or increases AP $100M). Over 10 years, $10M/year appears as depreciation. In year 1, reported income is $90M higher than if the cost were expensed.',
          'The cash flow statement exposes this manipulation: capitalized costs appear as investing outflows (capex), while expensed costs appear as operating outflows. A company that reclassifies expenses as capex will show artificially high operating cash flow — which should prompt investigation when CFO exceeds net income by an unusual amount.',
        ],
        keyInsights: [
          'Capex as a % of revenue increasing while maintenance quality declines is a sign of aggressive capitalization rather than genuine investment.',
          'Interest capitalization (capitalizing borrowing costs on self-constructed assets) is permitted but can be abused — companies can capitalize interest on any qualifying asset under construction.',
          'The "big bath" technique in reverse: aggressive capitalization during growth years creates a hidden expense burden in future periods when the assets are depreciated.',
        ],
        realWorldExample:
          'WorldCom\'s fraud was exposed when an internal auditor found unusual credits to "line cost" expense accounts — costs were being moved from operating expenses to PP&E accounts. The audit found $3.8B in fraudulent capitalizations between 1999-2002. CFO Scott Sullivan went to prison; auditor Arthur Andersen\'s telecom practice was effectively destroyed.',
        commonMistakes: [
          'Thinking all software costs must be expensed — ASC 350-40 requires capitalization once technological feasibility is established.',
          'Confusing maintenance capex (keeping assets running) with growth capex (expanding capacity) — only growth capex drives future revenue.',
          'Ignoring that aggressive capitalization front-loads profits — future periods face higher depreciation charges.',
        ],
      },
      predictionPrompt: {
        question:
          'A company capitalizes $50M of ordinary operating costs instead of expensing them. What is the immediate effect on operating cash flow?',
        options: [
          { id: 'a', text: 'Operating cash flow decreases by $50M — more money was spent', correct: false, explanation: 'The total cash spent is the same either way. The difference is where it appears in the cash flow statement.' },
          { id: 'b', text: 'Operating cash flow increases by $50M — the cost moves to investing activities', correct: true, explanation: 'Correct. When costs are capitalized, the cash outflow appears as investing activities (capex), not operating activities. Operating cash flow appears $50M higher — which is exactly why this fraud inflated WorldCom\'s reported CFO.' },
          { id: 'c', text: 'No effect — cash flow is cash flow regardless of classification', correct: false, explanation: 'Cash flow classification matters enormously. Investors use operating cash flow to assess business quality. Moving outflows from operating to investing creates the false appearance of stronger core business performance.' },
        ],
      },
    },
    {
      id: 'ch4-s2',
      chapterId: 4,
      sectionLabel: 'Depreciation',
      title: 'Depreciation Methods and Their Income Statement Impact',
      explanation:
        'Depreciation systematically allocates the cost of a long-lived asset over its useful life. Three primary methods: Straight-Line (equal annual charge), Declining Balance (accelerated front-loading), and Units of Production (proportional to output). Management chooses both the method and the useful life estimate — two judgment points that directly control reported profit.',
      formula: '\\text{Straight-Line Depreciation} = \\frac{\\text{Cost} - \\text{Salvage Value}}{\\text{Useful Life (years)}}',
      highlights: [
        'Extending useful life reduces annual depreciation → higher profit, higher asset book value.',
        'Increasing salvage value also reduces depreciable base → higher profit.',
        'Declining balance accelerates depreciation → lower early profit, higher later profit.',
        'Changes in estimates are prospective (no restatement) — easy to implement quietly.',
      ],
      deepDive: {
        body: [
          'Waste Management (1998) systematically extended the useful lives of garbage trucks and equipment over multiple years to reduce depreciation expense. The "earnings" generated were not real cash flows — just delayed accounting charges. When Arthur Andersen finally required write-downs, Waste Management restated $1.7B in net income over 10 years.',
          'The change-in-estimate approach is particularly insidious because GAAP requires only prospective treatment — no restatement of prior periods. A company that extends useful lives from 10 to 15 years simply discloses this in footnotes and continues reporting. Most investors never read footnote changes.',
          'Airlines are notorious for extending aircraft useful lives. After the pandemic, several airlines extended useful lives by 2-5 years, reducing depreciation and boosting reported income without any change in the aircraft\'s actual condition. The economic expense exists; it\'s just deferred to future periods.',
        ],
        keyInsights: [
          'Comparing gross PP&E to accumulated depreciation reveals the "age" of assets — a high ratio suggests assets haven\'t been replaced recently.',
          'Depreciation as a % of gross PP&E declining over time (without explanation) suggests useful life extensions.',
          '"Depreciation coverage ratio" = Operating Cash Flow / Depreciation — if this is falling, the company is generating less real cash per dollar of stated depreciation, suggesting over-capitalization.',
        ],
        realWorldExample:
          'Delta Air Lines changed the estimated useful life of its aircraft from 25 to 30 years in 2011, reducing annual depreciation by approximately $150M. The change was disclosed in a footnote. Analysts who read it could calculate the earnings benefit — but most quarterly earnings reports simply showed higher margins without attribution.',
        commonMistakes: [
          'Assuming depreciation method changes require restatement — changes in estimate are prospective only.',
          'Confusing depreciation (non-cash allocation) with actual physical deterioration — a fully depreciated asset can still function perfectly.',
          'Ignoring that different depreciation methods don\'t affect tax cash flows (tax depreciation uses MACRS, not book depreciation).',
        ],
      },
    },
    {
      id: 'ch4-s3',
      chapterId: 4,
      sectionLabel: 'Impairment',
      title: 'Impairment Testing and the Role of Judgment',
      explanation:
        'Long-lived assets must be tested for impairment when indicators suggest the carrying amount may not be recoverable. The two-step test: (1) compare carrying value to undiscounted future cash flows; (2) if impaired, write down to fair value. Management controls the cash flow projections — which creates enormous room for judgment. Assets that should be written down can remain on the balance sheet for years.',
      highlights: [
        'Impairment indicators: declining revenue, asset obsolescence, market cap below book value, regulatory changes.',
        'Undiscounted cash flows (Step 1) are generous — allows assets to pass even with modest future projections.',
        'If Step 1 fails, fair value is used — often estimated via discounted cash flows with management assumptions.',
        'Impairment reversal is prohibited under US GAAP (once written down, cannot be written back up).',
      ],
      deepDive: {
        body: [
          'The impairment test creates an asymmetric system: assets can be overvalued for years (no ceiling write-down required until the recoverability test fails), but once impaired, the write-down is permanent. This means the income statement can show inflated profits for multiple periods before a large charge appears.',
          'Good will impairment uses a one-step qualitative assessment: management first decides whether it is "more likely than not" that the fair value of the reporting unit exceeds carrying value. If they say yes, no quantitative test is required. This qualitative screen has resulted in impairments being delayed by years after economic deterioration is visible.',
          'The relationship between market cap and book equity is an accessible, external check on impairment. If a company\'s market cap is consistently below book equity, the market is implicitly saying that some assets are overvalued. This isn\'t conclusive, but it should prompt analysis of which assets have economic value below their carrying amounts.',
        ],
        keyInsights: [
          'A company whose market cap has been below book equity for 2+ years should have taken impairment charges — if it hasn\'t, management is using optimistic projections to pass the recoverability test.',
          'PP&E impairment timing that coincides with new management or restructuring announcements often signals that the predecessor was deferring required charges.',
          'Asset disposals at prices significantly below book value are retroactive evidence that impairments were needed — the asset was overvalued on the balance sheet.',
        ],
        realWorldExample:
          'General Electric\'s power division carried goodwill and long-lived assets at inflated values for years after the power market deteriorated. When GE finally took $22B in goodwill impairment in 2018, analysts noted that the cash flows supporting the goodwill had been declining for three years — the write-down was overdue by multiple reporting periods.',
        commonMistakes: [
          'Confusing impairment (triggered by specific indicators) with depreciation (systematic allocation over useful life) — they are separate processes.',
          'Assuming impairment only affects goodwill — long-lived PP&E, intangibles, and equity investments also require impairment testing.',
          'Ignoring the difference between "recoverable amount" (IFRS: higher of fair value less costs to sell or value in use) and "fair value" (US GAAP) — they can produce different impairment thresholds.',
        ],
      },
    },
  ],

  5: [
    {
      id: 'ch5-s1',
      chapterId: 5,
      sectionLabel: 'Obligations',
      title: 'Off-Balance-Sheet Financing and Hidden Debt',
      explanation:
        'Off-balance-sheet (OBS) financing involves structuring obligations so they do not appear as liabilities on the balance sheet. Pre-ASC 842 operating leases, Special Purpose Entities (SPEs), sale-leaseback transactions, and unconsolidated variable interest entities were the primary vehicles. The obligation to pay exists regardless of accounting treatment — when OBS structures collapse, the hidden debt becomes visible and often fatal.',
      highlights: [
        'Pre-ASC 842: operating leases were entirely off-balance-sheet — no asset, no liability recorded.',
        'SPEs (Special Purpose Entities): structured to avoid consolidation, used to park debt and losses.',
        'Sale-leaseback: sell an asset, lease it back — converts asset ownership to rental obligation.',
        'ASC 842 (2019): right-of-use assets and lease liabilities now required on balance sheet for all leases.',
      ],
      deepDive: {
        body: [
          'Enron created approximately 3,000 SPEs. The purpose was not tax efficiency (the stated rationale) but liability removal. By selling assets to SPEs and structuring those SPEs so they barely qualified for non-consolidation under FASB\'s 3% equity rule, Enron removed $30B in liabilities from its balance sheet. The critical flaw: Enron had guaranteed the SPEs\' obligations, so the debt was economically Enron\'s all along.',
          'ASC 810 (Variable Interest Entities) was strengthened after Enron specifically to prevent the 3% equity rule from being gamed. Under ASC 810, consolidation is required when an entity (1) lacks sufficient equity to finance activities without subordinated support, and (2) the company is the primary beneficiary of the entity\'s expected losses and residual returns.',
          'Take-or-pay contracts (common in energy, shipping, and airlines) obligate a company to pay for minimum quantities regardless of whether it takes delivery — creating debt-like obligations that don\'t appear on the balance sheet. These are disclosed in footnotes under "commitments and contingencies" but are rarely added to debt in standard analysis.',
        ],
        keyInsights: [
          'Adding capitalized operating lease obligations (8× annual rent expense, a rough rule of thumb) to reported debt gives a better picture of total financial obligations.',
          'Footnote disclosures of minimum future payments (under ASC 842 now on-balance-sheet, but not fully capitalized for below-cutoff leases) reveal the true payment obligation.',
          'A company whose market implied leverage (EV/EBITDA multiple) is much higher than its balance sheet leverage should prompt investigation for OBS obligations.',
        ],
        realWorldExample:
          'Lehman Brothers\' Repo 105 used $50B in short-term repurchase agreements, classified as "sales" rather than borrowings, to remove assets from the balance sheet at each quarter-end. The repos reversed days after quarter-end. Lehman\'s actual leverage at the time of bankruptcy was 40×+ (assets to equity) — the reported leverage was 24-28×.',
        commonMistakes: [
          'Assuming ASC 842 eliminated OBS risk — short-term leases (<12 months) and low-value assets are still excluded.',
          'Thinking sale-leaseback always reduces leverage — it creates operating lease obligations that should be treated as debt equivalents.',
          'Ignoring the disclosure of contingent liabilities and guarantees — these can be larger than the balance sheet liabilities themselves.',
        ],
      },
      predictionPrompt: {
        question:
          'A company uses an operating lease (pre-ASC 842) for its headquarters instead of buying the building. How does this affect reported debt?',
        options: [
          { id: 'a', text: 'Reported debt is the same — the obligation exists either way', correct: false, explanation: 'The economic obligation is the same, but the accounting treatment is different. Under operating lease accounting (pre-ASC 842), no liability appeared on the balance sheet at all.' },
          { id: 'b', text: 'Reported debt is lower — the lease obligation is off-balance-sheet', correct: true, explanation: 'Correct. Under pre-ASC 842 operating lease rules, the lease obligation didn\'t appear on the balance sheet. Debt ratios looked better even though the company had the same economic obligation to make payments as if it had borrowed to buy the building.' },
          { id: 'c', text: 'Reported debt is higher — leases create additional obligations', correct: false, explanation: 'This is the correct economic intuition but not the pre-ASC 842 accounting result. The lease payments appeared only as operating expenses, not as liabilities. This is exactly the loophole companies exploited.' },
        ],
      },
    },
    {
      id: 'ch5-s2',
      chapterId: 5,
      sectionLabel: 'Incentives',
      title: 'Debt Covenants and Perverse Incentives',
      explanation:
        'Debt covenants are contractual restrictions in loan agreements that limit the borrower\'s behavior to protect lenders. Common covenants include minimum interest coverage ratios, maximum leverage ratios, and minimum net worth requirements. When companies approach covenant violations, they face enormous pressure to manage earnings upward or manipulate balance sheet ratios — creating predictable, identifiable windows for accounting manipulation.',
      highlights: [
        'Interest Coverage Ratio = EBIT / Interest Expense (minimum level set by lender).',
        'Leverage Ratio = Total Debt / EBITDA (maximum level set by lender).',
        'Violating a covenant triggers acceleration: the entire debt becomes immediately due.',
        'Waiver negotiations give lenders leverage — and give analysts insight into real covenant pressure.',
      ],
      deepDive: {
        body: [
          'The earnings management literature consistently finds that companies near covenant violations show higher abnormal accruals than comparable companies with covenant headroom. The mechanism is straightforward: management knows the covenant threshold, knows how close they are, and has incentive to use every accounting judgment to cross the line on the right side.',
          'Key covenant ratios to monitor: (1) Fixed Charge Coverage Ratio = (EBITDA − Capex − Taxes) / (Interest + Debt Amortization) — a critical measure for leveraged buyout companies; (2) Net Worth Covenant = minimum total equity threshold — motivates against loss recognition and asset write-downs; (3) Current Ratio Covenant = triggers when liquidity deteriorates.',
          'Covenant violations often become public before earnings manipulation is revealed. The process: company receives a waiver from lenders → discloses waiver in 10-Q footnotes → analysts who read footnotes see the signal → stock sells off before manipulation is detected. The SEC enforcement timeline often begins with covenant waiver disclosures.',
        ],
        keyInsights: [
          'Covenant waiver disclosures buried in 10-Q footnotes are among the most valuable signals available to investors — they indicate the company is under financial stress and has negotiated with lenders.',
          'EBITDA adjustments in credit agreements ("Adjusted EBITDA" for covenant purposes) can include add-backs that are denied to equity analysts — creating divergence between financial strength as the company represents it to lenders vs the public.',
          'A company that consistently reports earnings just above covenant ratios (to 2 decimal places) is almost certainly managing to those thresholds.',
        ],
        realWorldExample:
          'Rite Aid approached maximum leverage covenant violations in the late 1990s and began recording fictitious credits to COGS — reducing expense and inflating EBITDA to preserve covenant compliance. The fraud was eventually discovered by a new CFO and resulted in the largest restatement in pharmacy retail history.',
        commonMistakes: [
          'Ignoring credit agreement language in 10-K filings — covenants are disclosed there and are publicly available.',
          'Assuming GAAP earnings are what lenders use for covenants — many agreements use "Adjusted EBITDA" with specific add-back definitions.',
          'Overlooking that covenant headroom narrows in good-to-bad transitions — when a sector turns down, the most covenant-constrained companies are the highest fraud risk.',
        ],
      },
    },
    {
      id: 'ch5-s3',
      chapterId: 5,
      sectionLabel: 'Transactions',
      title: 'Repo Agreements: Borrowing Disguised as Sales',
      explanation:
        'Repurchase agreements (repos) are short-term borrowings secured by assets. In a repo, a company sells assets (often securities or receivables) with an agreement to repurchase them at a slightly higher price. Economically, this is collateralized borrowing. Lehman Brothers classified repos as "sales" rather than financings — removing $50B from its balance sheet at each quarter-end while maintaining economic exposure to the assets.',
      highlights: [
        '"Repo 105" and "Repo 108" — Lehman\'s names for the schemes (% overcollateralization required).',
        'True sale criteria: transfer of substantially all risks and rewards, no repurchase obligation.',
        'Footnote 11 of Lehman\'s 10-K disclosed the policy — the scheme was technically visible.',
        'Auditor Ernst & Young signed off for years — eventually named in lawsuits.',
      ],
      deepDive: {
        body: [
          'Lehman\'s Repo 105 worked as follows: at quarter-end, Lehman sold $50B of securities under repo agreements that required 105% collateral (hence "Repo 105"). Because the overcollateralization was large enough, Lehman\'s legal counsel (Linklaters, in the UK) provided an opinion that the transfers qualified as "true sales." The assets and liabilities were both removed from the balance sheet.',
          'The key fraud: Lehman used the repo proceeds (cash received) to pay down other liabilities, then disclosed a lower leverage ratio at quarter-end. Days after quarter-end, Lehman used cash to repurchase the assets. The reported leverage was 24-28×; the actual leverage at peak was 44×.',
          'The pattern was visible in the cash flow statement: Lehman\'s net borrowings declined each quarter-end and recovered each quarter-start. But most analysts were tracking balance sheet leverage, not the intra-quarter pattern of net borrowings.',
        ],
        keyInsights: [
          'Repo agreements that expire shortly after period-end are a balance sheet management signal — check settlement dates vs quarter-end dates.',
          'Cash received from "sales" that is used to pay down debt (visible in financing activities) while similar assets are "repurchased" the next period is a Repo 105 pattern.',
          'Bank leverage ratios at quarter-end consistently lower than mid-quarter averages suggest window-dressing — Lehman\'s was documented at 44× mid-quarter vs 28× at quarter-end.',
        ],
        realWorldExample:
          'The Lehman Brothers Examiner\'s Report (Anton Valukas, 2010) documented the Repo 105 scheme in granular detail across 2,200 pages. It found that Repo 105 was used to remove an average of $38.6B from the balance sheet per quarter in 2008. The report was publicly available but contained information that was material to Lehman\'s investors — most of whom had no idea.',
        commonMistakes: [
          'Assuming "true sale" accounting treatment is correct just because counsel provided an opinion — Repo 105 had legal opinions that were technically valid under English law but violated the spirit of US GAAP.',
          'Ignoring the timing of repo settlements in the 10-K — Lehman disclosed that repos settled within days, not months.',
          'Failing to compare balance sheet leverage to book equity book value declines — Lehman\'s equity was declining while leverage appeared stable.',
        ],
      },
    },
  ],

  6: [
    {
      id: 'ch6-s1',
      chapterId: 6,
      sectionLabel: 'EPS',
      title: 'Basic vs Diluted EPS and Share Count Management',
      explanation:
        'Earnings Per Share (EPS) = Net Income / Weighted Average Shares. Basic EPS uses only shares currently outstanding. Diluted EPS includes all potentially dilutive securities — stock options, warrants, convertible notes, RSUs. For companies with large option programs, basic and diluted EPS can diverge significantly. Investors should always use diluted EPS and understand the dilution trajectory.',
      formula: '\\text{Diluted EPS} = \\frac{\\text{Net Income}}{\\text{Weighted Avg Shares} + \\text{Dilutive Securities}}',
      highlights: [
        'Treasury stock method applies to options: only net new shares (proceeds / avg price) are added.',
        'If-converted method applies to convertibles: adds shares and backs out interest expense.',
        'Antidilutive securities (those that would improve EPS) are excluded from diluted calculation.',
        'High dilution % (>5%) from options is a red flag — large management payouts at shareholders\' expense.',
      ],
      deepDive: {
        body: [
          'The treasury stock method for options assumes the company uses option exercise proceeds to repurchase shares at the average market price. Net dilutive shares = Shares issued on exercise − Shares repurchased with proceeds. This is why in-the-money options cause less dilution than face value suggests: the repurchase offsets most of the new shares.',
          'Convertible note dilution requires the if-converted method: assumes the notes are converted to equity at the beginning of the period. Share count increases by the conversion shares; net income increases by the after-tax interest saved. If the resulting diluted EPS is lower than basic, the security is dilutive and must be included.',
          'Option backdating (e.g., Apple\'s 2006 options scandal) involved setting exercise prices using historical low-stock-price dates rather than the actual grant date. This gave executives in-the-money options that violated APB 25 and ASC 718 expense recognition rules — and represented unreported compensation expense.',
        ],
        keyInsights: [
          'The dilution rate (diluted minus basic shares / basic shares) trending upward over multiple years indicates a company is issuing equity faster than it\'s buying it back.',
          'Options that are currently out-of-the-money are excluded from diluted EPS but will become dilutive if stock prices recover — a latent dilution overhang.',
          'A company reporting "adjusted EPS" excluding stock-based compensation while the dilution rate is rising is extracting value from shareholders twice: first via compensation expense excluded from "adjusted" metrics, then via share dilution.',
        ],
        realWorldExample:
          'Dell Technologies had basic EPS that diverged by 25% from diluted EPS in peak option-grant years (2000-2003), due to massive employee option programs. When the SEC investigated option backdating practices industry-wide in 2006, Dell was among 200+ companies investigated. Restated compensation expense amounted to billions across the industry.',
        commonMistakes: [
          'Ignoring that diluted EPS can equal basic EPS even with outstanding options — if options are out of the money, they are antidilutive and excluded.',
          'Confusing share repurchases (which reduce the weighted average share count) with dilution management — they\'re separate but related mechanisms.',
          'Failing to track the diluted share count trend over time — a rising diluted count with flat stock buybacks means options and grants are outpacing buybacks.',
        ],
      },
      predictionPrompt: {
        question:
          'A company grants 1 million stock options with an exercise price of $50. The current stock price is $45. Are these options dilutive?',
        options: [
          { id: 'a', text: 'Yes — options always dilute EPS', correct: false, explanation: 'Options dilute EPS only when they are in-the-money (exercise price < market price). Out-of-the-money options are antidilutive and are excluded from diluted EPS calculations.' },
          { id: 'b', text: 'No — options are out-of-the-money (exercise $50 > market $45)', correct: true, explanation: 'Correct. Since the exercise price ($50) exceeds the current market price ($45), the options are out-of-the-money. No one would exercise them today. They are excluded from diluted EPS. They become dilutive only if the stock price exceeds $50.' },
          { id: 'c', text: 'Depends on maturity date', correct: false, explanation: 'Dilution is determined by whether the option is currently in-the-money, not its maturity. GAAP uses the average market price during the reporting period, not the period-end price.' },
        ],
      },
    },
    {
      id: 'ch6-s2',
      chapterId: 6,
      sectionLabel: 'Compensation',
      title: 'Stock-Based Compensation: The Real Cost',
      explanation:
        'ASC 718 requires companies to recognize stock-based compensation expense (SBC) based on grant-date fair value, amortized over the vesting period. SBC is a real economic cost — it transfers value from existing shareholders to employees. Yet "adjusted EPS" metrics routinely exclude SBC. Understanding the magnitude of this exclusion is essential for valuation and executive incentive analysis.',
      highlights: [
        'Grant-date fair value is estimated using Black-Scholes or binomial models (for options) or stock price (for RSUs).',
        'SBC expense flows through the income statement even though no cash changes hands.',
        'SBC creates deferred tax assets and generates cash tax benefits on exercise (above grant-date fair value).',
        'The non-GAAP exclusion of SBC can inflate "adjusted EPS" by 10-30% for tech companies.',
      ],
      deepDive: {
        body: [
          'The economic cost of SBC is the dilution of existing shareholders. When an employee exercises options, new shares are issued at below-market prices — this is a wealth transfer from existing shareholders to the employee. The non-cash nature of this transfer doesn\'t make it less real; it just makes it invisible on the cash flow statement (SBC is added back to reconcile net income to CFO).',
          'Companies often present multiple "adjusted" metrics: Adjusted EBITDA (adds back depreciation, amortization, SBC), Non-GAAP EPS (adds back SBC, amortization of acquired intangibles), and "Pro Forma" (adds back restructuring). Each layer of adjustment typically improves the metric by 10-40% — with SBC the largest single add-back for most technology companies.',
          'Amazon\'s 2021 annual report showed GAAP net income of $33.4B but SBC expense of $11.5B — meaning 34% of GAAP net income was offset by SBC that many investors excluded from their valuation models. At the stock-based compensation level alone, this represented a significant wealth transfer from public shareholders to Amazon employees.',
        ],
        keyInsights: [
          'SBC as a % of revenue above 5% (consistently) suggests the business model relies on below-market labor compensation — tolerable in hypergrowth but concerning in mature businesses.',
          'The divergence between GAAP EPS and Non-GAAP EPS for the same company is a direct measure of how much SBC (and amortization) management considers irrelevant to valuation.',
          'Companies that increase SBC as a fraction of compensation (shifting cash compensation to equity) are extracting tax benefits from employees while appearing to reduce cash expenses.',
        ],
        realWorldExample:
          'In the options backdating scandal (2006-2008), over 200 companies were investigated by the SEC. Companies including Broadcom, Comverse Technology, and Marvell Technology had granted options with exercise prices set retroactively to historical lows — generating in-the-money options from the grant date. This violated APB 25 (which required expensing in-the-money options) and constituted unreported compensation.',
        commonMistakes: [
          'Treating SBC as a "non-cash" cost that can be safely ignored in valuation — SBC represents real dilution to existing shareholders.',
          'Comparing GAAP EPS across companies without normalizing for SBC differences — tech companies that exclude SBC from "adjusted" metrics look artificially profitable vs industrial companies that don\'t have large option programs.',
          'Ignoring the future dilution impact of unvested equity grants — outstanding unvested awards represent future dilution that isn\'t yet in the share count.',
        ],
      },
    },
    {
      id: 'ch6-s3',
      chapterId: 6,
      sectionLabel: 'Buybacks',
      title: 'Share Buybacks: Financial Engineering or Value Creation?',
      explanation:
        'Share repurchase programs reduce the outstanding share count, mechanically increasing EPS even if net income is flat. This is denominator management — improving a ratio by shrinking the denominator rather than growing the numerator. Buybacks can represent genuine capital allocation (when the stock is undervalued) or cosmetic earnings management (when borrowed capital funds buybacks to hit EPS targets).',
      highlights: [
        'Buyback math: if net income = $100M and shares fall from 100M to 90M, EPS rises 11% with zero business improvement.',
        'Companies that borrow to fund buybacks are levering up the balance sheet for cosmetic EPS improvement.',
        'Buybacks appear in the cash flow statement as financing activities (cash outflow).',
        'The Buffett test: is the stock trading below intrinsic value? Only then are buybacks accretive to remaining shareholders.',
      ],
      deepDive: {
        body: [
          'S&P 500 companies repurchased $882B of stock in 2023. The primary beneficiaries are: (1) executives with EPS-linked bonus targets, (2) existing shareholders who sell (realizing capital gains), (3) remaining shareholders if buybacks occur below intrinsic value. If buybacks occur above intrinsic value, remaining shareholders lose — they now own a smaller fraction of a business that overpaid for its own stock.',
          'The Modigliani-Miller framework says that buybacks and dividends are economically equivalent in a perfect market — both return cash to shareholders. In practice, buybacks have tax advantages (capital gains vs ordinary income) but are more discretionary than dividends. A dividend cut signals business weakness; a buyback pause is less visible.',
          'Corporate executives with option-heavy compensation have personal incentive to buy back stock: (1) EPS increases on their bonus targets, (2) reduced share count increases the stock price, (3) the intrinsic per-share value of their unvested options increases. When the same executives argue that buybacks "create shareholder value," their incentives align with the claim regardless of whether it\'s true.',
        ],
        keyInsights: [
          'A company that borrows at 5% to buy back stock at 20× earnings (5% earnings yield) is earning nothing net — but it\'s improving reported EPS via denominator reduction.',
          'The "buyback yield" (buybacks / market cap) should be compared to the FCF yield — companies buying back more than they generate in FCF are destroying value.',
          'Net buybacks (gross buybacks minus SBC-related issuances) are the correct measure — many tech companies issue as much in SBC as they repurchase.',
        ],
        realWorldExample:
          'IBM repurchased $138B of stock between 2000-2018, reducing shares outstanding from 1.7B to 900M. Revenue fell from $100B to $79B over the same period. EPS rose from $4.44 to $13.81 — primarily via the denominator effect. IBM\'s operating performance declined significantly while EPS metrics showed apparent "growth."',
        commonMistakes: [
          'Conflating EPS growth (which buybacks mechanically increase) with intrinsic value per share growth (which depends on business performance).',
          'Assuming buyback announcements equal actual repurchases — authorization programs often go unexecuted or are executed over years.',
          'Ignoring that gross buybacks must be netted against SBC issuances — the net repurchase is the economically relevant number.',
        ],
      },
    },
  ],

  7: [
    {
      id: 'ch7-s1',
      chapterId: 7,
      sectionLabel: 'Structure',
      title: 'Three Sections of the Cash Flow Statement',
      explanation:
        'The cash flow statement reconciles net income (accrual) to actual cash movements. Three sections: (1) Operating Activities — cash generated from core business operations; (2) Investing Activities — cash used for/from long-term asset transactions; (3) Financing Activities — cash flows from debt and equity transactions. The classification of items between sections directly affects how investors assess business quality.',
      highlights: [
        'CFO (Operating): the most watched section — should exceed net income for a healthy business.',
        'CFI (Investing): capex, acquisitions, asset sales — net negative in growing businesses.',
        'CFF (Financing): borrowings, repayments, dividends, buybacks — net positive when raising capital.',
        'The indirect method adds back non-cash charges to net income and adjusts for working capital changes.',
      ],
      deepDive: {
        body: [
          'The indirect method of presenting CFO starts with net income and adds back non-cash charges (depreciation, amortization, SBC) then adjusts for working capital changes (ΔAR, ΔInventory, ΔAP). The result is operating cash flow.',
          'Working capital changes reveal operating quality: AR increases are cash outflows (more revenue billed, less collected); inventory increases are cash outflows (more product built, not yet sold); AP increases are cash inflows (more obligations deferred). A company growing revenue with flat or improving working capital ratios is a high-quality business model.',
          'Classification manipulation involves moving items between sections to make CFO look better. WorldCom moved operating expenses to investing (capex) to inflate CFO. Tyco moved customer deposits (operating liability) to financing. The SEC\'s EITF 01-14 specifically addressed window-dressing of operating vs investing classifications.',
        ],
        keyInsights: [
          'CFO > Net Income for 5+ consecutive years is the single most powerful indicator of accounting quality and sustainable business performance.',
          'A company that consistently shows CFO < Net Income is either growing rapidly (legitimate temporary divergence) or is using aggressive accrual assumptions (manipulation risk).',
          'Acquisitions are disclosed in investing activities — a company that makes many acquisitions can show strong organic CFO while hiding operating weakness in the acquired businesses.',
        ],
        realWorldExample:
          'Enron reported strong operating cash flows for years while the business was economically failing. The mechanism: Enron was booking revenue from energy contracts and recording accounts receivable, but the CFO included related "monetization" of those receivables — moving them to investing activities. When the structures unraveled, CFO collapsed.',
        commonMistakes: [
          'Ignoring the indirect reconciliation items — the change in accounts receivable, inventory, and payables are more informative than the CFO headline.',
          'Confusing free cash flow (CFO minus capex) with operating cash flow — they can differ materially in capital-intensive businesses.',
          'Treating CFO as manipulation-proof — it can be managed through customer billing acceleration, vendor payment delays, and operating/investing reclassifications.',
        ],
      },
      predictionPrompt: {
        question:
          'Net income = $100M. Depreciation = $20M. Accounts Receivable increased by $30M. What is approximate CFO (indirect method)?',
        options: [
          { id: 'a', text: '$90M (100 + 20 − 30)', correct: true, explanation: 'Correct. Start with net income ($100M), add back non-cash depreciation ($20M), subtract the AR increase ($30M, since more was billed than collected, a cash outflow). CFO ≈ $90M. AR increases are cash outflows in the indirect method.' },
          { id: 'b', text: '$150M (100 + 20 + 30)', correct: false, explanation: 'An AR increase is a cash outflow, not inflow. When AR grows, the company billed more revenue than it collected in cash — meaning cash is tied up in uncollected receivables.' },
          { id: 'c', text: '$80M (100 − 20)', correct: false, explanation: 'Depreciation is added back to net income (not subtracted) because it\'s a non-cash charge. Net income was reduced by depreciation, but no cash left the company.' },
        ],
      },
    },
    {
      id: 'ch7-s2',
      chapterId: 7,
      sectionLabel: 'Valuation',
      title: 'Free Cash Flow: The Foundation of Intrinsic Value',
      explanation:
        'Free Cash Flow (FCF) = CFO − Capital Expenditures. FCF is what remains after a business maintains and grows its asset base — the cash available to pay debt, distribute dividends, fund acquisitions, or accumulate. Intrinsic value, in Buffett\'s framework, is the present value of all future FCF generated by the business. Companies that grow earnings but generate no FCF are consuming capital, not creating it.',
      formula: '\\text{FCF} = \\text{CFO} - \\text{Capex}',
      highlights: [
        'FCF Yield = FCF / Market Cap — measures the return on investment in real cash terms.',
        'Maintenance capex vs growth capex: true economic FCF should subtract only maintenance capex.',
        'FCF can be negative while growth is high — only problematic if FCF never materializes.',
        'DCF intrinsic value = PV of all future FCF + terminal value.',
      ],
      deepDive: {
        body: [
          'The conceptual challenge with FCF is separating maintenance capex (required to keep the business running) from growth capex (investments for future expansion). Companies typically don\'t separately disclose these. Analysts estimate maintenance capex as depreciation × a factor (typically 0.75-1.25×), but this is an approximation.',
          'Price-to-FCF (P/FCF) multiples are more reliable than P/E for comparison because FCF is harder to manipulate than net income. A company with a P/FCF of 15× is generating a 6.7% FCF yield — comparable to fixed income analysis. A company with a P/E of 15× but a P/FCF of 30× is generating only half the cash its earnings suggest.',
          'Enron is the definitive FCF fraud. Enron reported positive and growing net income from 1996-2000 while CFO was either negative or significantly below net income. Free cash flow was consistently deeply negative. The "earnings" were accounting artifacts — the real business consumed cash. Any investor using FCF would have seen the failure coming.',
        ],
        keyInsights: [
          'The FCF conversion ratio (FCF / Net Income) below 50% for multiple consecutive years is a major quality-of-earnings red flag.',
          'Negative FCF in hypergrowth businesses is expected and acceptable — what\'s unacceptable is negative FCF in mature businesses with declining growth.',
          'The FCF margin (FCF / Revenue) is the ultimate measure of business economics — it shows how much of each revenue dollar becomes real cash.',
        ],
        realWorldExample:
          'Amazon generated negative FCF for 20 consecutive years (1995-2014) while building its e-commerce and AWS infrastructure. Investors who understood growth capex vs maintenance capex could identify that FCF was negative due to deliberate reinvestment, not operational failure. Amazon\'s FCF exploded to $45B+ once growth capex moderated.',
        commonMistakes: [
          'Using net income as a proxy for FCF — they can differ by 50%+ for companies with heavy non-cash charges or working capital needs.',
          'Treating all capex as discretionary — maintenance capex is required to maintain existing revenue, and excluding it overstates true FCF.',
          'Ignoring lease payments in FCF calculations — under ASC 842, lease obligations show up as financing outflows, not operating outflows, potentially overstating true FCF.',
        ],
      },
    },
    {
      id: 'ch7-s3',
      chapterId: 7,
      sectionLabel: 'Quality',
      title: 'Working Capital Changes: The Operating Health Signal',
      explanation:
        'Working capital = Current Assets − Current Liabilities. Changes in working capital components reveal the health of the business cycle: AR changes reflect collection efficiency, inventory changes reflect demand signals, AP changes reflect payment behaviors. All three appear in the CFO section of the cash flow statement — making them visible to any analyst willing to look.',
      formula: '\\Delta\\text{Working Capital} = \\Delta\\text{AR} + \\Delta\\text{Inventory} - \\Delta\\text{AP}',
      highlights: [
        'AR increasing faster than revenue → DSO rising → cash collection deteriorating or revenue pull-forward.',
        'Inventory increasing faster than COGS → DIO rising → demand softening or inventory build.',
        'AP increasing → DPO rising → company is stretching payments → potential vendor friction.',
        'Cash Conversion Cycle = DIO + DSO − DPO: measures how long cash is tied up in operations.',
      ],
      deepDive: {
        body: [
          'The working capital analysis is one of the few areas where analysts can catch manipulation before it\'s disclosed. If a company reports strong revenue growth but AR is growing faster, the cash hasn\'t been collected — which suggests either aggressive credit terms (to incentivize purchases) or fictitious sales (where no cash will ever arrive).',
          'Supply chain signals: AP growth slower than revenue growth means the company is paying suppliers faster — possible sign of financial stress (suppliers requiring faster payment) or strength (using payment as a negotiating tool). AP growth faster than revenue means the company is stretching payables — possible liquidity management or sign of cash strain.',
          'The "days payable outstanding" (DPO = AP / (COGS/365)) exceeding 90 days consistently is a warning sign in industries where normal DPO is 30-45 days. It suggests either the company is near a cash crisis and cannot pay, or is unusually dominant with suppliers.',
        ],
        keyInsights: [
          'DSO rising for 3+ consecutive quarters while revenue grows is the highest-correlation predictor of subsequent revenue restatements in academic literature.',
          'Inventory builds that persist for 2+ years without either a write-down or demand recovery are invariably resolved negatively for the stock.',
          'A "channel stuffing" pattern: revenue accelerates in Q4, AR spikes, inventory at distributors grows → Q1 revenue disappoints and channel correction occurs.',
        ],
        realWorldExample:
          'Luckin Coffee (Chinese coffee chain) showed explosive revenue growth with corresponding AR growth that should have raised flags — the AR-to-revenue ratio was much higher than peer companies. Investigation revealed that 40% of reported 2019 net revenues were fabricated. The working capital analysis (excessive AR relative to industry peers) was one of the early public signals flagged by Muddy Waters Research.',
        commonMistakes: [
          'Calculating working capital changes on end-of-period balance sheet snapshots only — quarter-end window dressing makes snapshots unreliable; use averages.',
          'Ignoring that AP can be large at period-end due to large purchases — context matters for AP analysis.',
          'Conflating operating working capital (AR + Inventory − AP) with total working capital (which includes cash and short-term debt).',
        ],
      },
    },
  ],

  8: [
    {
      id: 'ch8-s1',
      chapterId: 8,
      sectionLabel: 'Decomposition',
      title: 'DuPont Analysis: Breaking Down Return on Equity',
      explanation:
        'Return on Equity (ROE) = Net Income / Equity. DuPont analysis decomposes ROE into three drivers: Net Profit Margin (how much you earn per dollar of revenue), Asset Turnover (how much revenue you generate per dollar of assets), and Equity Multiplier (how leveraged the balance sheet is). This decomposition identifies whether ROE improvement is from operations, efficiency, or financial engineering.',
      formula: '\\text{ROE} = \\underbrace{\\frac{\\text{Net Income}}{\\text{Revenue}}}_{\\text{Net Margin}} \\times \\underbrace{\\frac{\\text{Revenue}}{\\text{Assets}}}_{\\text{Asset Turnover}} \\times \\underbrace{\\frac{\\text{Assets}}{\\text{Equity}}}_{\\text{Equity Multiplier}}',
      highlights: [
        'Margin improvement: pricing power, cost reduction — most sustainable ROE driver.',
        'Turnover improvement: asset efficiency — moderately sustainable, harder to sustain at scale.',
        'Leverage increase: financial engineering — immediate ROE boost, increases insolvency risk.',
        '5-factor DuPont adds tax burden and interest burden to decompose net margin further.',
      ],
      deepDive: {
        body: [
          'The 3-factor DuPont decomposition is: ROE = Net Margin × Asset Turnover × Equity Multiplier. The 5-factor version further decomposes net margin into: (Net Income/EBT) × (EBT/EBIT) × (EBIT/Revenue), where the first factor captures the tax burden and the second captures the interest burden. This allows analysis of how much ROE is driven by tax optimization vs financial leverage vs operating performance.',
          'A company that improves ROE primarily via leverage increase is taking on credit risk in exchange for equity return. At low leverage, this trade-off is favorable. At high leverage (10×+ debt/EBITDA), the marginal risk of distress dominates. The equity multiplier trend is the first diagnostic: if it\'s rising while margin and turnover are flat or falling, ROE improvement is purely financial engineering.',
          'Enron\'s ROE looked attractive in its final years — but DuPont analysis would have shown that it was driven entirely by the equity multiplier (leverage) and financial trading revenues that were not sustainable. The asset turnover was low (consistent with a capital-intensive company pretending to be a trading firm), and margins were shrinking.',
        ],
        keyInsights: [
          'A company with ROE > 20% but Asset Turnover < 0.5× and Equity Multiplier > 5× is achieving returns through leverage, not operations.',
          'Industry comparison of each DuPont component reveals where companies compete: retailers win on turnover, tech companies on margins, banks on leverage.',
          'ROE that exceeds the cost of equity capital (WACC minus risk premium) creates economic value. ROE below cost of equity destroys value even if it\'s nominally positive.',
        ],
        realWorldExample:
          'In 2007, major investment banks had ROEs of 20-25% — appearing highly profitable. DuPont analysis showed: net margins of 15-18%, asset turnover of 0.05-0.10× (consistent with holding $20-30 of assets per dollar of revenue), and equity multipliers of 25-35×. All the ROE was leverage. When assets fell 3-5% in value, the equity was entirely wiped out — mathematically inevitable given those equity multipliers.',
        commonMistakes: [
          'Using ROE without understanding the decomposition — a single ROE number hides what\'s driving it.',
          'Ignoring that goodwill reduces asset turnover for acquisition-heavy companies — making them look less efficient than standalone peers.',
          'Comparing ROE across industries without normalization — banks\' ROE at 15× leverage looks similar to retailers\' at 2× leverage, but they carry vastly different risk profiles.',
        ],
      },
      predictionPrompt: {
        question:
          'A company\'s ROE improves from 12% to 18% in one year. Net margin is unchanged and revenue/assets ratio declined. What is the most likely driver?',
        options: [
          { id: 'a', text: 'Improved operational efficiency — asset turnover improved', correct: false, explanation: 'The revenue/assets ratio (asset turnover) declined, ruling out efficiency improvement as the driver.' },
          { id: 'b', text: 'Financial leverage increase — equity multiplier grew', correct: true, explanation: 'Correct. With net margin flat and asset turnover declining, the only DuPont component that could have improved ROE is the equity multiplier (Assets/Equity). This means the company increased debt relative to equity — financial engineering rather than operational improvement.' },
          { id: 'c', text: 'Tax optimization — effective tax rate fell', correct: false, explanation: 'The 3-factor DuPont doesn\'t isolate taxes directly — they\'re embedded in net margin. Since net margin is unchanged, tax rate changes cannot explain the ROE improvement.' },
        ],
      },
    },
    {
      id: 'ch8-s2',
      chapterId: 8,
      sectionLabel: 'Context',
      title: 'Ratio Analysis: Trends and Peer Comparison',
      explanation:
        'A single ratio in isolation is meaningless. A current ratio of 1.8 is excellent for a retailer and alarming for a utility. A gross margin of 40% is mediocre for SaaS and extraordinary for grocery. Effective ratio analysis requires three dimensions: (1) absolute level vs industry benchmarks, (2) trend over 5+ years, and (3) structural explanation for deviations. The combination of divergence from peers and unexplained trend change is the highest-risk pattern.',
      highlights: [
        'Liquidity: Current Ratio, Quick Ratio, Cash Ratio — measures of short-term payment ability.',
        'Leverage: Debt/Equity, Debt/EBITDA, Interest Coverage — measures of debt service capacity.',
        'Profitability: Gross Margin, Operating Margin, Net Margin, ROA, ROE — measures of earnings quality.',
        'Efficiency: Asset Turnover, Receivables Turnover, Inventory Turnover — measures of asset utilization.',
      ],
      deepDive: {
        body: [
          'Ratio analysis is the standard entry point into financial statement forensics. The academic framework (Penman\'s Financial Statement Analysis) suggests starting with profitability analysis, then working down to identify the source: Is gross margin changing? Is SG&A absorption improving or worsening? Are capital expenditures matching depreciation?',
          'The Beneish M-Score uses 8 financial ratios to identify likely earnings manipulators. Key variables include: Days Sales Outstanding ratio (DSO current year / DSO prior year), Gross Margin Index (GM prior year / GM current year), Asset Quality Index (non-current assets / total assets), Sales Growth Index, Total Accruals to Total Assets. A score above −1.78 indicates likely manipulation (over the threshold Beneish calibrated to actual manipulators).',
          'Piotroski F-Score uses 9 binary factors (1 = positive, 0 = negative) across profitability, leverage, and efficiency to score the fundamental quality of a company 0-9. High-F-score companies historically outperform low-F-score companies by 7.5% annually in value-stock contexts.',
        ],
        keyInsights: [
          'The Altman Z-Score (for public companies: Z > 2.99 = safe zone; Z < 1.81 = distress zone; between = gray zone) remains one of the best simple predictors of bankruptcy within 2 years.',
          'Gross margin is the hardest ratio to fake — it requires either fictitious revenue or understated COGS. A company with rising revenue and rising gross margins is almost always a genuine high-quality business.',
          'DSO rising faster than industry peers for 3+ years has a very high base rate of subsequent revenue restatement or credit deterioration.',
        ],
        realWorldExample:
          'Enron\'s ratios looked acceptable in isolation in 1999-2000. But peer comparison revealed problems: asset turnover much lower than comparable energy companies, receivables much higher relative to revenue, and gross margins inconsistent with the reported business mix. Analysts who did peer comparison (notably Jonathan Weil of the Wall Street Journal) asked the questions that ultimately exposed the company.',
        commonMistakes: [
          'Comparing ratios across industries without normalization — a "low" gross margin in one industry may be "high" in another.',
          'Using point-in-time ratios without 5-year trend analysis — a deteriorating trend at an "acceptable" level is more concerning than a stable low ratio.',
          'Ignoring structural explanations: a ratio change due to deliberate business model shift is different from unexplained deterioration.',
        ],
      },
    },
    {
      id: 'ch8-s3',
      chapterId: 8,
      sectionLabel: 'Manipulation',
      title: 'Denominator Management: Gaming Ratios',
      explanation:
        'Denominator management is the technique of improving a ratio by reducing its denominator rather than improving the numerator. Share buybacks reduce the share count (improving EPS and ROE). Asset sales reduce total assets (improving asset turnover). Debt paydowns at period-end reduce leverage ratios. None of these actions improve the underlying business — but they change reported ratios.',
      highlights: [
        'Share buybacks: reduce weighted-average shares → improve EPS without changing net income.',
        'Asset disposals: reduce total assets → improve asset turnover and return on assets.',
        'Debt paydown (quarter-end): reduce debt balance → improve leverage ratios for snapshot reporting.',
        'Reverse stock splits: reduce share count → improve stock price, but no economic value.',
      ],
      deepDive: {
        body: [
          'The financial incentive for denominator management is clear: executive compensation tied to EPS growth, ROE targets, or leverage ratios creates direct motivation to manage these metrics even when the numerator is fixed. The most common vehicle is share repurchases funded by debt — simultaneously improving EPS (fewer shares) and not triggering income tax (unlike dividends).',
          'Balance sheet window-dressing at period-end involves paying down commercial paper, repo agreements, or revolving credit facilities just before the quarter closes, then drawing them back down days later. The result: balance sheet ratios appear better at the measurement date than during the period. Banks are the most common practitioners; the OFR monitors this behavior in systemically important institutions.',
          'Non-GAAP metrics amplify denominator management. "Adjusted EBITDA" adds back unusual items to the numerator while the denominator (debt) remains at GAAP levels. The result: the leverage ratio appears lower than it would using GAAP earnings. Private equity transactions consistently use this to make leverage look more manageable.',
        ],
        keyInsights: [
          'Check whether EPS growth can be attributed to net income growth (numerator) or share count reduction (denominator) — these have very different quality implications.',
          'Compare balance sheet leverage at reporting dates to mid-quarter disclosures (8-Ks) for any unusually large quarter-end paydowns.',
          '"Adjusted EBITDA" add-backs that recur every quarter (restructuring charges, litigation reserves, SBC) are permanent, not temporary — they should not be added back in steady-state analysis.',
        ],
        realWorldExample:
          'HP repurchased $10.1B of stock in fiscal year 2014 while reporting EPS of $3.70. GAAP net income fell from $5.1B to $4.7B. Because share count fell 9%, EPS rose. The company presented "non-GAAP EPS" of $3.74 — substantially higher. Three major denominator management techniques (buybacks, non-GAAP adjustments, and timing of asset disposals) were all active simultaneously.',
        commonMistakes: [
          'Accepting reported EPS as the fundamental measure without analyzing share count changes.',
          'Ignoring the timing of debt paydowns relative to reporting dates — quarterly presentations often show period-end snapshots that are more favorable than period averages.',
          'Treating non-GAAP adjustments as equivalent to GAAP add-backs — only items that are (1) non-cash, (2) non-recurring, and (3) unrelated to core operations qualify for legitimate exclusion.',
        ],
      },
    },
  ],

  9: [
    {
      id: 'ch9-s1',
      chapterId: 9,
      sectionLabel: 'Purchase Accounting',
      title: 'Acquisition Accounting and Purchase Price Allocation',
      explanation:
        'Under ASC 805 (Business Combinations), acquisitions are recorded using the acquisition method. The purchase price is allocated to all identifiable assets and liabilities at fair value. The excess of purchase price over net fair value is recorded as Goodwill. This process — Purchase Price Allocation (PPA) — is highly judgment-driven: which intangibles are identified, how they are valued, and what the remaining goodwill will be.',
      formula: '\\text{Goodwill} = \\text{Purchase Price} - \\text{Fair Value of Net Assets Acquired}',
      highlights: [
        'Identifiable intangibles: customer relationships, patents, trademarks, non-competes, technology.',
        'Residual goodwill: the premium for expected synergies, management team, market position.',
        'Deferred tax liabilities arise from writing up assets to FV above their tax basis.',
        'Contingent consideration (earn-outs) is recorded at FV and remeasured each period.',
      ],
      deepDive: {
        body: [
          'PPA involves identifying every intangible asset that meets the criteria: (1) separable (can be sold separately) or (2) arising from contractual/legal rights. Common identified intangibles include customer relationships (valued using multi-period excess earnings method), trade names (relief from royalty method), and developed technology (relief from royalty or excess earnings).',
          'The PPA creates immediate income statement impact: identified intangibles are amortized over useful lives (typically 3-15 years), increasing future amortization expense. Companies acquiring other companies must disclose "amortization of acquired intangibles" — which is why Non-GAAP metrics routinely exclude this. The argument is that intangible amortization is a non-cash cost related to a historical transaction; the counter-argument is that customer relationships genuinely deteriorate and require reinvestment.',
          'Cookie jar reserves at acquisition: acquirers write up assumed liabilities (restructuring reserves, litigation reserves) to aggressive fair values at acquisition. These reserves are released into income in subsequent quarters — creating earnings that appear operational but are actually accounting artifacts. FASB addressed this with SFAS 141R (ASC 805) in 2008, but judgment remains significant.',
        ],
        keyInsights: [
          'Large goodwill relative to total assets (>40%) signals an acquisition-heavy strategy that requires continuous execution to sustain — goodwill is not a productive asset.',
          'Amortization of acquired intangibles as a % of revenue consistently above 5% suggests high M&A intensity — and each acquisition creates future amortization headwinds.',
          'Acquiring company stock performance in the 3 years post-acquisition consistently underperforms market by 10-15% on average (Moeller, Schlingemann, Stulz 2004) — the acquisition premium destroys acquirer value in most cases.',
        ],
        realWorldExample:
          'AOL Time Warner (2001) recorded $54B in goodwill from the $165B merger. By 2002, $54B was impaired when the merger synergies failed to materialize. This remains the largest goodwill impairment in history. The PPA had allocated massive values to AOL\'s dial-up customer relationships at the peak of the internet bubble — relationships that were worth far less as broadband arrived.',
        commonMistakes: [
          'Thinking goodwill impairment is a cash charge — it is not. It reduces book equity but does not affect cash flow or operating performance directly.',
          'Confusing acquired intangibles (separately identifiable, have finite lives) with goodwill (residual, indefinite life) — they are amortized differently.',
          'Assuming zero acquisition premium = good deal — negative acquisitions (where the target\'s fair value exceeds the purchase price) can also be poorly structured.',
        ],
      },
      predictionPrompt: {
        question:
          'Company A acquires Company B for $500M. B\'s net identifiable assets have a fair value of $350M. What is the goodwill recorded?',
        options: [
          { id: 'a', text: '$500M — the full purchase price becomes goodwill', correct: false, explanation: 'Goodwill = Purchase Price − Fair Value of Net Identifiable Assets. The identifiable assets are separately valued at $350M first; goodwill is only the residual premium.' },
          { id: 'b', text: '$150M (500 − 350)', correct: true, explanation: 'Correct. The $350M in identifiable net assets is allocated at fair value. The remaining $150M ($500M purchase price − $350M) is unallocated to any specific identifiable asset and is recorded as goodwill — the premium paid for expected synergies and intangibles that couldn\'t be separately identified.' },
          { id: 'c', text: 'Zero — goodwill is only recorded when there is a premium over book value', correct: false, explanation: 'Goodwill is computed based on fair value of identifiable assets, not book value. Fair value and book value often differ significantly, particularly for assets that have appreciated (real estate, brands) or been under-invested (human capital).' },
        ],
      },
    },
    {
      id: 'ch9-s2',
      chapterId: 9,
      sectionLabel: 'Reserves',
      title: 'Acquisition Reserves and "Cookie Jar" Accounting',
      explanation:
        'When acquiring a company, the acquirer often records large reserves at acquisition (restructuring liabilities, contingent liabilities, write-downs of acquired assets). These reserves, established in the purchase price allocation, can later be released into income — creating a "cookie jar" of future earnings. GAAP requires these reserves to relate to the acquired company\'s pre-acquisition activities, but management judgment in sizing them creates significant opportunity.',
      highlights: [
        '"In-process R&D" write-offs at acquisition shift future expense to acquisition date (lowers amortization later).',
        'Large restructuring reserves at acquisition release income as costs never materialize.',
        'Contingent liabilities written up aggressively at acquisition → future favorable settlements boost income.',
        'ASC 805 tightened cookie jar rules but judgment on fair value still allows reserve management.',
      ],
      deepDive: {
        body: [
          'The classic cookie jar acquisition works as follows: at acquisition, management records $200M in "restructuring charges" related to the acquired company\'s workforce, facilities, and contracts. This $200M goes into goodwill (it increases the purchase consideration allocated to a liability). As the restructuring actually costs $150M, the $50M excess reserve is released back to income — with no disclosure that it was ever a cookie jar.',
          'Write-downs of acquired assets at acquisition (inventory, PP&E, customer relationships written to conservative fair values) create lower future COGS and lower amortization. The result: the acquired company "improves" after acquisition because the post-acquisition cost base is lower — not because operations improved.',
          'The IPR&D (In-Process R&D) write-off was heavily abused in the 1990s. At acquisition, companies would write off up to 90% of the purchase price as "in-process R&D" immediately — avoiding amortization of what would otherwise be identifiable intangibles. The SEC launched enforcement actions against this practice in 1998-1999, resulting in ASC 805 tightening the rules.',
        ],
        keyInsights: [
          'Acquisition-year accounting should always prompt heightened scrutiny — the year of acquisition is when the "big bath" reserves are established.',
          'Post-acquisition margins that improve dramatically without operational explanation (revenue growth, cost structure changes) often reflect reserve releases.',
          'If management describes acquisition synergies as being realized "ahead of schedule," examine whether the synergies reflect genuine improvements or reserve releases.',
        ],
        realWorldExample:
          'Tyco International under CEO Dennis Kozlowski made 700+ acquisitions in 4 years. Each acquisition generated restructuring charges that reduced the acquisition-date balance sheet; subsequent releases boosted quarterly earnings. The complexity of tracking 700 deals gave management enormous reserve management capacity. Tyco restated $5.8B in earnings; Kozlowski went to prison.',
        commonMistakes: [
          'Assuming acquisition-related restructuring charges are one-time — they recur with each acquisition in serial acquirers.',
          'Confusing synergy realization (actual cost or revenue improvement) with accounting reserve release (accounting artifact).',
          'Ignoring that large acquisition reserves reduce goodwill (since they are liabilities written up at acquisition) — making future goodwill impairment tests easier to pass.',
        ],
      },
    },
    {
      id: 'ch9-s3',
      chapterId: 9,
      sectionLabel: 'Value',
      title: 'M&A Value Creation vs Destruction',
      explanation:
        'Academic research consistently finds that acquisitions create value for target shareholders (acquired companies receive 20-30% premiums) and destroy value for acquirers in most cases. The mechanism: acquirers pay full fundamental value plus a synergy premium; synergies are often overestimated; integration costs are underestimated. The only test of acquisition value is whether combined free cash flow per share exceeds standalone projections.',
      highlights: [
        'Target shareholders receive 20-30% premium on average — acquirer shareholders often give it away.',
        '"Winner\'s curse": competitive auctions drive up prices; winning acquirers often overpay.',
        'Dilutive vs accretive acquisitions: stock deals are dilutive when acquired EPS < acquirer P/E × cost.',
        'True synergy test: combined FCF per share vs acquirer standalone FCF per share (5+ year comparison).',
      ],
      deepDive: {
        body: [
          'The synergy fallacy: investment banks present synergy cases with NPV that "justifies" the premium. These cases are almost always optimistic: (1) revenue synergies (cross-selling, pricing power) are historically 30-50% unrealized; (2) cost synergies (headcount, facilities, procurement) are more reliable but often front-loaded and short-term; (3) integration costs are consistently underestimated by 50-100%.',
          'EPS accretion/dilution analysis is the wrong test for acquisition value. A deal can be EPS-accretive on year-one basis while being economically dilutive over 5 years, because: (1) the acquired EPS was generated with a lower cost of capital than the acquirer\'s, (2) integration disruption reduces organic growth, (3) goodwill amortization was excluded from the EPS test.',
          'The academic record is clear (Andrade, Mitchell, Stafford 2001; Moeller et al. 2004): on average, acquirers underperform their benchmark index by 7% in the year of the acquisition and continue to underperform for 3-5 years. The underperformance is larger for: (1) stock-financed deals, (2) large deals, (3) deals at market tops, (4) conglomerate acquisitions.',
        ],
        keyInsights: [
          'The market\'s reaction to deal announcement (acquirer stock price change in the 3 days around announcement) is the best predictor of deal value — negative reactions are predictive of subsequent underperformance.',
          'Large cash deals (acquirer pays cash) destroy less value than large stock deals — cash deals signal management believes the stock is not overvalued; stock deals signal management believes the stock is overvalued.',
          'Serial acquirers (5+ deals per year) have the worst long-term track records and require the most scrutiny of reserve management and cookie jar practices.',
        ],
        realWorldExample:
          'HP acquired Autonomy for $11.1B in 2011 — paying $8.8B above book value. Within 13 months, HP took an $8.8B write-down, blaming "accounting improprieties." The write-down equaled exactly the goodwill HP had recorded. Independent analysis suggested that even without alleged fraud, HP had overpaid by $5-7B. CEO Léo Apotheker was fired within weeks of the deal closing.',
        commonMistakes: [
          'Using EPS accretion as the measure of deal value — EPS accretion can occur while intrinsic per-share value declines.',
          'Taking management synergy estimates at face value — independently estimating synergies from public data is more reliable.',
          'Ignoring the opportunity cost: cash used for acquisitions could have been returned to shareholders via buybacks (at presumably below-intrinsic-value prices) or invested in organic growth.',
        ],
      },
    },
  ],

  10: [
    {
      id: 'ch10-s1',
      chapterId: 10,
      sectionLabel: 'Psychology',
      title: 'The Fraud Triangle and Behavioral Drivers',
      explanation:
        'Dr. Donald Cressey\'s Fraud Triangle (1953) identifies three necessary conditions for occupational fraud: Pressure (financial or professional motivation), Opportunity (access and weak controls), and Rationalization (cognitive justification). All three must be present simultaneously. Analysts and executives who understand when companies are at high-pressure, high-opportunity, high-rationalization intersections can predict where fraud is most likely before it occurs.',
      highlights: [
        'Pressure: near covenant breach, missed guidance, executive comp tied to EPS, financial distress.',
        'Opportunity: weak internal controls, dominant CEO, complex structures, high audit turnover.',
        'Rationalization: "everyone does it," "I\'ll fix it next quarter," "the company will recover."',
        'ACFE (Association of Certified Fraud Examiners) estimates occupational fraud costs organizations 5% of annual revenue.',
      ],
      deepDive: {
        body: [
          'The Fraud Diamond (Wolfe and Hermanson, 2004) added a fourth element: Capability — the perpetrator must have the skills, knowledge, and position to commit the fraud. Not everyone with pressure, opportunity, and rationalization can execute a multi-year $3.8B accounting fraud. The capability factor explains why CFOs commit fraud at higher rates than bookkeepers.',
          'Behavioral red flags for management manipulation include: unusual interest in accounting methods and estimates (beyond what the role requires), irritability with auditors, circumventing authorization processes, overriding internal controls "for efficiency," and close involvement in accounting journal entries that should be delegated.',
          'Institutional red flags include: audit committee members who are not financially literate, auditors who have worked with the same management team for 10+ years (familiarity bias), internal audit reporting to the CFO rather than the audit committee (conflicts of interest), and high auditor staff turnover on the engagement team.',
        ],
        keyInsights: [
          'CEO dominance — a single executive who controls the board, manages earnings guidance personally, and is unusually involved in accounting detail — is the highest-risk governance factor.',
          'Companies that routinely beat earnings estimates by exactly 1-2 cents per share are statistically more likely to have earnings management than those that beat by larger or smaller amounts.',
          'Rapid revenue growth combined with high executive ownership stakes and debt approaching maturity is the classic "pressure-opportunity-rationalization" intersection.',
        ],
        realWorldExample:
          'Bernie Madoff\'s Ponzi scheme exemplifies all three factors: pressure (initial losses that he couldn\'t recover from), opportunity (no independent custodian, self-clearing broker-dealer, friendly SEC examiners), and rationalization ("clients are better off with stable returns anyway"). The capability factor: 30 years of legitimate market-making experience gave him credibility and technical knowledge that enabled deception.',
        commonMistakes: [
          'Treating fraud detection as binary (fraud vs no fraud) — most earnings manipulation exists on a spectrum from aggressive-but-legal to clearly fraudulent.',
          'Assuming large companies are too big or too well-audited to commit fraud — Enron, WorldCom, Lehman, and Wirecard were all large-cap companies with Big Four auditors.',
          'Ignoring related-party transactions and governance indicators in favor of purely quantitative analysis — the most important fraud signals are often qualitative.',
        ],
      },
      predictionPrompt: {
        question:
          'A CFO holds $50M in unvested stock options that vest only if EPS hits $3.00 this year. Current EPS is $2.85. Which element of the Fraud Triangle is most prominently activated?',
        options: [
          { id: 'a', text: 'Opportunity — the CFO has access to journal entries and accounting estimates', correct: false, explanation: 'While opportunity certainly exists (CFOs have access), the specific driver here is the financial incentive — the EPS gap creates direct personal financial pressure, not just access.' },
          { id: 'b', text: 'Pressure — $50M in unvested options creates intense financial incentive to hit EPS target', correct: true, explanation: 'Correct. The EPS target shortfall creates direct financial pressure. This is textbook "incentive pressure" from the Fraud Triangle. The CFO has $50M motivation to find $0.15/share in accounting adjustments.' },
          { id: 'c', text: 'Rationalization — the CFO will argue that the company\'s "real" earnings justify the target', correct: false, explanation: 'Rationalization is the cognitive justification that comes after the decision to manipulate — not the primary driver. The pressure (financial incentive) is what creates the motivation that then seeks rationalization.' },
        ],
      },
    },
    {
      id: 'ch10-s2',
      chapterId: 10,
      sectionLabel: 'Statistical Detection',
      title: 'Benford\'s Law: The First-Digit Anomaly',
      explanation:
        'Benford\'s Law states that in naturally occurring datasets, the leading digit of numbers follows a predictable distribution: 1 appears ~30.1% of the time, 2 appears ~17.6%, 3 appears ~12.5%, and so on down to 9 at ~4.6%. Financial data — revenues, expenses, journal entries — should approximately follow this distribution. Fabricated numbers, created by human intuition, cluster around "middle" digits and violate the expected distribution.',
      formula: 'P(d) = \\log_{10}\\left(1 + \\frac{1}{d}\\right), \\quad d \\in \\{1, 2, ..., 9\\}',
      highlights: [
        '1 is the most common leading digit (30.1%) in natural financial data.',
        'Human-fabricated numbers over-represent 4s, 5s, 6s, and 7s — "middle" choices.',
        'Benford\'s Law applies to invoices, journal entries, expense reports, and large datasets.',
        'KPMG, Deloitte, and the SEC use Benford analysis as a standard forensic audit tool.',
      ],
      deepDive: {
        body: [
          'Benford\'s Law derives from logarithms: if numbers span multiple orders of magnitude (as financial data typically does — ranging from $1 to $1,000,000,000), the probability that the leading digit is d is log₁₀(1 + 1/d). This means 1 starts ~30% of financial numbers; 2 starts ~17.6%; 9 starts only ~4.6%.',
          'Applications in forensics: (1) expense reports — employees who fabricate reimbursements tend to choose amounts just below approval thresholds (e.g., $49.99, $99.99) — generating an unusual spike in 4s and 9s; (2) journal entries — round numbers ($1,000,000 exactly) are suspicious in datasets where natural entries would not round; (3) revenue and COGS — fabricated accounts should be screened for first-digit distribution.',
          'The chi-squared test or Kolmogorov-Smirnov test can formally assess whether a dataset\'s first-digit distribution is statistically consistent with Benford\'s Law. A p-value below 0.05 (rejecting the null hypothesis that the distribution follows Benford) is a red flag — though not conclusive proof of fraud.',
        ],
        keyInsights: [
          'Benford analysis is most powerful for large transaction datasets (1,000+ entries) — small datasets don\'t have enough statistical power to meaningfully test.',
          'Numbers that have been rounded to convenient amounts (ending in 00 or 000) are both a Benford violation and a separate "round number" red flag.',
          'Benford violation doesn\'t prove fraud — it prioritizes investigation. Many legitimate reasons can create Benford anomalies (truncated data ranges, prices set to specific round numbers).',
        ],
        realWorldExample:
          'A 2018 SEC enforcement action used Benford analysis to identify a pattern of inflated expense reimbursements: the defendant\'s expense reports showed a statistically significant excess of amounts just below $25 (the approval threshold) — a clear Benford and threshold violation that produced an unusual spike in the number 24 as a first two-digit combination. The pattern was not visible in any individual transaction but was statistically undeniable across hundreds.',
        commonMistakes: [
          'Applying Benford\'s Law to datasets that don\'t span multiple orders of magnitude (e.g., prices that range from $9.99 to $14.99 — Benford doesn\'t apply).',
          'Treating a Benford violation as proof of fraud rather than a starting point for investigation.',
          'Forgetting that both the first digit AND the second digit distributions should be tested — fraud often passes first-digit tests but fails second-digit analysis.',
        ],
      },
    },
    {
      id: 'ch10-s3',
      chapterId: 10,
      sectionLabel: 'Integration',
      title: 'Professional Skepticism as a System',
      explanation:
        'Professional skepticism — the ongoing questioning of information and critical assessment of evidence — is not a personality trait. It is a structured practice that can be taught, trained, and systematized. The entire platform is designed to build skepticism as a skill: by seeing how each accounting concept has been manipulated (not just explained), the goal is to make questioning the default cognitive mode when reading financial statements.',
      highlights: [
        'PCAOB AS 2301 requires auditors to maintain professional skepticism throughout the audit.',
        'The skeptic\'s posture: "What would have to be true for this number to be fraudulent?"',
        'Red flags are not proof — they are prioritization signals that justify deeper examination.',
        'The combination of multiple red flags (revenue + AR + CFO divergence) is far more powerful than any single signal.',
      ],
      deepDive: {
        body: [
          'Academic research on auditor judgment (Libby, Trotman, Nelson) consistently finds that auditors are subject to the same cognitive biases as other professionals: anchoring to management\'s proposed numbers, confirmation bias (seeking evidence that confirms prior beliefs), and availability bias (overweighting recent evidence). Systematic approaches — checklists, red flag screens, peer review — improve skepticism quality.',
          'The "fraud-only hypothesis test" is a useful technique: before accepting management\'s explanation for an unusual result, construct the fraud hypothesis explicitly — what manipulation would produce exactly this pattern? If the fraud hypothesis is plausible, the evidence standard for accepting the innocent explanation should be higher.',
          'Whistleblower programs (Dodd-Frank Section 922) provide financial incentives (10-30% of SEC recovery > $1M) for reporting securities violations. Since inception in 2011, the SEC has awarded $1.3B+ to whistleblowers who identified frauds that subsequent investigations confirmed. The most successful corporate fraud investigations begin with insider tips, not external analysis.',
        ],
        keyInsights: [
          'The "three no\'s" test: if a CFO says "no" to three sequential probing questions with identical force (no escalation of detail, no new evidence), this is a skepticism trigger — genuine refutation usually becomes more specific, not more uniform.',
          'A declining trend in financial statement quality across 5+ metrics simultaneously (margins, working capital, cash conversion) is statistically very unlikely to be coincidental and should trigger audit committee escalation.',
          'The most effective professional skepticism is applied to the things management is most confident about — their confidence is itself a signal that they\'ve prepared for pushback.',
        ],
        realWorldExample:
          'Wirecard ($2B fraud, 2020) was flagged by multiple journalists, short sellers, and analyst reports for years before the collapse. KPMG\'s special investigation (2020) could not confirm cash balances. But auditor EY continued to certify accounts for 4 years after the first FT report. Professional skepticism failure at the auditor level allowed a demonstrably impossible cash balance to pass for years.',
        commonMistakes: [
          'Conflating skepticism with cynicism — a skeptic requires evidence; a cynic dismisses everything. Skeptics find legitimate companies and confirm their quality; cynics miss good investments.',
          'Applying skepticism retroactively (after bad news is known) rather than prospectively (based on available signals).',
          'Overlooking that the quality of governance and management character is as important as quantitative analysis — Enron had beautiful financial ratios and excellent governance optics until the day it didn\'t.',
        ],
      },
    },
  ],
}
