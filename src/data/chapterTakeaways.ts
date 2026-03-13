import { CHAPTERS } from './toc'

interface Takeaway {
  concept: string
  insight: string
  connection: string
}

interface ChapterTakeawayData {
  takeaways: Takeaway[]
  skepticsLens: string[]
  color: string
}

const colorMap = Object.fromEntries(CHAPTERS.map(c => [c.id, c.color]))

export const CHAPTER_TAKEAWAYS: Record<number, ChapterTakeawayData> = {
  1: {
    color: colorMap[1],
    takeaways: [
      { concept: 'The Accounting Equation Always Balances', insight: 'Every single transaction affects at least two accounts, and the equation Assets = Liabilities + Equity must hold after every entry. This mathematical constraint is the foundation of audit trail integrity.', connection: 'Connects to Ch5: when liabilities are hidden off-balance-sheet, the equation appears to balance but misrepresents reality.' },
      { concept: 'Double Entry Creates a Complete Record', insight: 'Double-entry bookkeeping was invented in the 15th century and has never been improved upon — because it works. Every debit has a credit, creating a self-checking system that makes accidental errors (and deliberate fraud) harder to sustain.', connection: 'Connects to Ch2: when revenue is recognized improperly, a corresponding asset (AR) must be inflated to keep the equation balanced.' },
      { concept: 'T-Accounts Are the Language of Accounting', insight: 'T-accounts visualize how accounts behave. Asset and expense accounts increase with debits; liability, equity, and revenue accounts increase with credits. Knowing this instinctively lets you spot mis-entries immediately.', connection: 'Connects to Ch6: equity accounts record all changes to shareholders\' ownership — understanding T-accounts makes equity manipulation visible.' },
    ],
    skepticsLens: [
      'Are total assets fully supported by independently verifiable documentation?',
      'Does the balance sheet include all known obligations, including contingent liabilities?',
      'Have there been any unusual or large adjusting journal entries near the reporting period?',
      'Are there any accounts with unexplained large balances relative to business activity?',
      'Has the chart of accounts changed recently, and if so, why?',
    ],
  },
  2: {
    color: colorMap[2],
    takeaways: [
      { concept: 'Revenue Is Recognized When Earned, Not When Cash Arrives', insight: 'Accrual accounting records revenue when the performance obligation is satisfied — not when payment is received. This gives a more accurate picture of economic activity but creates room for manipulation.', connection: 'Connects to Ch7: the gap between net income and cash from operations directly reflects accrual accounting choices.' },
      { concept: 'ASC 606 Requires Identifying Performance Obligations', insight: 'The 5-step revenue recognition model (identify contract → identify obligations → determine price → allocate price → recognize) was designed to standardize recognition. Companies still find ways to front-load revenue within this framework.', connection: 'Connects to Ch8: days sales outstanding (AR / daily revenue) is the primary ratio for detecting premature revenue recognition.' },
      { concept: 'The Matching Principle Ties Revenue to Its Costs', insight: 'Costs incurred to generate revenue must be recognized in the same period. Violating the matching principle — by deferring costs while accelerating revenue — is the most common earnings inflation technique.', connection: 'Connects to Ch3: inventory cost flow assumptions (FIFO/LIFO) directly affect the matching of cost to revenue.' },
    ],
    skepticsLens: [
      'Is revenue growing faster than cash collected from customers?',
      'Are accounts receivable days increasing while revenue grows — a sign of channel stuffing?',
      'What percentage of revenue is recognized in Q4, and has that pattern changed?',
      'Has the company changed its revenue recognition policy or accounting estimates in the past two years?',
      'Does management guidance consistently land within 1% of reported results — suspiciously precise?',
    ],
  },
  3: {
    color: colorMap[3],
    takeaways: [
      { concept: 'FIFO Matches Current Costs to Balance Sheet; LIFO to Income Statement', insight: 'In rising price environments, FIFO reports higher inventory on the balance sheet (recent costs remain) but lower COGS (older, cheaper costs are used first). LIFO does the opposite. The choice of method directly affects reported profits.', connection: 'Connects to Ch8: inventory turnover (COGS / Average Inventory) is distorted by method choice — always normalize before comparing companies.' },
      { concept: 'Phantom Inventory Is Impossible to Audit Without Physical Counts', insight: 'Crazy Eddie\'s $65M phantom inventory survived multiple audits because auditors trusted management\'s counts. Physical inventory observation is a required audit procedure precisely because inventory is the easiest asset to fabricate.', connection: 'Connects to Ch1: overstated inventory inflates assets, forcing a compensating credit — usually to retained earnings or accounts payable.' },
      { concept: 'Inventory Write-Downs Are a One-Way Street', insight: 'GAAP requires inventory to be recorded at the lower of cost or net realizable value. Write-downs are required when value falls, but write-ups are prohibited. Delaying write-downs overstates assets and understates COGS.', connection: 'Connects to Ch7: large unexpected inventory write-downs depress operating cash flow and are a classic red flag.' },
    ],
    skepticsLens: [
      'Is inventory growing faster than revenue — a potential sign of obsolescence or phantom inventory?',
      'Has the company changed its inventory valuation method, and what was the stated reason?',
      'How does the company\'s inventory turnover compare to industry peers?',
      'Has the company taken inventory write-downs, and were they disclosed clearly?',
      'Are there large, unexplained variances between physical counts and book inventory?',
    ],
  },
  4: {
    color: colorMap[4],
    takeaways: [
      { concept: 'The Capitalize-vs-Expense Decision Directly Controls Reported Profit', insight: 'Capitalizing a cost spreads it over years as depreciation; expensing it hits the P&L immediately. WorldCom simply reclassified $3.8B of normal operating phone-line costs as capital expenditure — boosting profit by exactly that amount, instantly.', connection: 'Connects to Ch7: capex appears in investing activities (cash outflow), while operating expenses appear in operating activities — reclassification distorts both sections.' },
      { concept: 'Useful Life and Salvage Value Assumptions Drive Depreciation', insight: 'Management chooses useful life and salvage value, and these choices are rarely challenged by auditors. Extending asset lives reduces annual depreciation expense and inflates profits. Waste Management did this systematically for years.', connection: 'Connects to Ch8: asset turnover (Revenue / Total Assets) is inflated when assets are not properly depreciated down.' },
      { concept: 'Impairment Testing Is Judgment-Driven and Manipulable', insight: 'Long-lived assets must be tested for impairment when indicators exist — but management controls the cash flow projections used in impairment tests. Optimistic assumptions delay write-downs that are economically necessary.', connection: 'Connects to Ch9: goodwill impairment is the largest single form of judgment-driven asset write-down in modern accounting.' },
    ],
    skepticsLens: [
      'Is the company\'s capital expenditure as a percentage of revenue significantly higher or lower than industry peers?',
      'Have the assumed useful lives of major asset categories changed in recent filings?',
      'Are there assets that have been fully depreciated but are still in use — indicating useful life was underestimated?',
      'Has the company taken any impairment charges, and how do the timing and magnitude compare to operating performance?',
      'Does the company\'s depreciation policy match how assets actually wear out in the business?',
    ],
  },
  5: {
    color: colorMap[5],
    takeaways: [
      { concept: 'Off-Balance-Sheet Obligations Are Real Economic Liabilities', insight: 'Operating leases (pre-ASC 842), SPEs, and take-or-pay contracts were classic off-balance-sheet vehicles. The obligation to pay existed regardless of accounting treatment — Enron\'s $30B in hidden debt became very real when the structure collapsed.', connection: 'Connects to Ch8: leverage ratios computed without full liability disclosure are meaningless and dangerous.' },
      { concept: 'Debt Covenants Create Perverse Incentives', insight: 'When a company approaches a debt covenant violation, management faces pressure to manage earnings upward or manipulate ratios. Understanding covenants tells you when and why earnings management is most likely.', connection: 'Connects to Ch2: revenue acceleration is most common when a company is near a covenant breach at quarter-end.' },
      { concept: 'Repo Agreements Can Disguise Borrowing as Sales', insight: 'Lehman Brothers\' Repo 105 removed $50B from the balance sheet at each quarter-end by treating short-term repos as sales. The assets returned in days, but the quarterly snapshot looked pristine. Cash flow analysis would have exposed this.', connection: 'Connects to Ch7: Repo 105 improved the balance sheet but had no effect on operating cash flow — the divergence was visible.' },
    ],
    skepticsLens: [
      'Does the company have significant operating leases, take-or-pay contracts, or other off-balance-sheet commitments?',
      'What are the current debt covenant terms, and how much headroom does the company have?',
      'Has total debt (including off-balance-sheet) grown faster than revenue or operating income?',
      'Are there related-party transactions involving the transfer of liabilities or risks?',
      'Have any liabilities been derecognized near period-end and subsequently re-recognized?',
    ],
  },
  6: {
    color: colorMap[6],
    takeaways: [
      { concept: 'Diluted EPS Includes All Potential Share Issuances', insight: 'Options, warrants, and convertible securities are included in diluted EPS. Companies with large option programs can show strong basic EPS while diluted EPS tells a very different story about the economic cost to existing shareholders.', connection: 'Connects to Ch9: M&A transactions that pay in stock immediately dilute EPS for acquiring shareholders.' },
      { concept: 'Stock-Based Compensation Is a Real Cost, Not a Non-Cash Benefit', insight: 'Many executives present "adjusted EPS" excluding stock-based compensation. But options and restricted stock are real economic transfers of value from existing shareholders to employees. Backdating options made this cost even more egregious.', connection: 'Connects to Ch8: return on equity is distorted when compensation expense is excluded from earnings in "adjusted" metrics.' },
      { concept: 'Share Buybacks Mechanically Reduce the EPS Denominator', insight: 'Buying back shares reduces the weighted average share count, boosting EPS even if net income is flat. A company can report "record EPS growth" while its underlying business is stagnant — or declining.', connection: 'Connects to Ch7: buybacks consume cash and appear as financing outflows — companies that borrow to buy back shares are trading financial risk for cosmetic EPS improvement.' },
    ],
    skepticsLens: [
      'What is the dilution percentage from options and convertibles, and how has it trended?',
      'What is the total stock-based compensation expense, and how does it compare to net income?',
      'Is the company buying back stock while also issuing debt — leveraging the balance sheet for EPS optics?',
      'Have there been any restatements or investigations related to option grant timing?',
      'Does the company present non-GAAP metrics that exclude equity compensation, and by how much does this inflate "adjusted" EPS?',
    ],
  },
  7: {
    color: colorMap[7],
    takeaways: [
      { concept: 'Cash From Operations Is the Most Reliable Measure of Business Health', insight: 'Net income can be manufactured through accounting choices. Cash from operations requires actual cash to change hands. The divergence between net income and CFO is the single most powerful fraud signal in public company analysis.', connection: 'Connects to Ch2: every dollar of prematurely recognized revenue creates a corresponding AR that does not generate CFO until collected.' },
      { concept: 'Free Cash Flow Drives Intrinsic Value', insight: 'Free cash flow (CFO minus capex) is what remains to pay debt, dividends, and fund growth. Companies that grow earnings but generate no free cash flow are consuming capital — not creating it. Enron reported strong earnings for years while CFO was consistently negative.', connection: 'Connects to Ch4: the capitalize-vs-expense decision directly determines how much spending flows through operating vs investing activities.' },
      { concept: 'Working Capital Changes Reveal Operating Quality', insight: 'Increasing AR without increasing revenue means cash is not being collected. Increasing inventory without increasing COGS means product is not selling. Both appear as cash outflows in the operating section and should prompt investigation.', connection: 'Connects to Ch3: inventory method choice affects both COGS (income statement) and ending inventory (balance sheet) — but working capital cash flow is immune to this manipulation.' },
    ],
    skepticsLens: [
      'Is cash from operations consistently higher or lower than net income, and what explains the gap?',
      'Is free cash flow (CFO minus capex) positive and growing, or does growth consume more cash than it generates?',
      'Are accounts receivable and inventory growing faster than sales — a working capital quality concern?',
      'Has the company reclassified any items between operating, investing, and financing activities compared to prior periods?',
      'Does the company fund dividends or buybacks primarily from financing activities rather than operating cash flow?',
    ],
  },
  8: {
    color: colorMap[8],
    takeaways: [
      { concept: 'DuPont Breaks ROE Into Three Independently Actionable Drivers', insight: 'ROE = Net Margin × Asset Turnover × Equity Multiplier. A company can boost ROE by improving margins (operations), turning assets faster (efficiency), or taking on more debt (leverage). Only the first two create sustainable value; the third just transfers risk to creditors.', connection: 'Connects to Ch5: increasing the equity multiplier (leverage) is the fastest way to boost ROE — but also the fastest way to approach insolvency.' },
      { concept: 'Ratios Mean Nothing Without Trends and Peer Comparison', insight: 'A current ratio of 1.5 could be excellent or alarming depending on the industry and historical trend. Enron\'s ratios looked acceptable in isolation — it was the trend and peer divergence that should have triggered questions.', connection: 'Connects to Ch9: post-acquisition goodwill distorts asset turnover and return on assets, making acquiring companies look less efficient than standalone peers.' },
      { concept: 'Denominator Management Is the Oldest Trick in the Book', insight: 'Companies boost ratios by reducing the denominator rather than improving the numerator. Buying back shares improves EPS and ROE. Selling assets improves asset turnover. Paying down debt improves debt ratios. None of these improve the underlying business.', connection: 'Connects to Ch6: share buybacks mechanically improve EPS, ROE, and book value per share — all simultaneously, without a single dollar of operational improvement.' },
    ],
    skepticsLens: [
      'Which DuPont driver is primarily driving ROE improvement — margins, turnover, or leverage?',
      'How do the company\'s key ratios compare to industry medians over a 5-year period?',
      'Has the company made any transactions (buybacks, asset sales, debt paydowns) near period-end that would improve ratio snapshots?',
      'Is goodwill a growing percentage of total assets, which inflates the equity multiplier artificially?',
      'Are "adjusted" non-GAAP ratios significantly better than GAAP ratios, and what is excluded?',
    ],
  },
  9: {
    color: colorMap[9],
    takeaways: [
      { concept: 'Goodwill Is the Premium Paid for Expected Future Synergies', insight: 'Goodwill = Purchase Price − Fair Value of Net Assets Acquired. It represents the buyer\'s belief that the combined entity is worth more than the sum of its parts. When those synergies fail to materialize, goodwill must be written down — often years after the acquisition.', connection: 'Connects to Ch8: goodwill as a percentage of total assets is a primary red flag ratio for acquisition-heavy companies.' },
      { concept: 'Acquisition Accounting Creates "Cookie Jar" Reserves', insight: 'Acquirers can write up acquired liabilities and write down acquired assets at the time of purchase, creating reserves that are released into income in future periods. This is legal, widely practiced, and extremely difficult to detect.', connection: 'Connects to Ch2: releasing acquisition reserves into income mimics revenue recognition — it improves reported earnings without generating any cash.' },
      { concept: 'Synergy Estimates in Deal Valuations Are Almost Always Optimistic', insight: 'Research consistently shows that most M&A transactions destroy value for acquiring shareholders. The pressure to justify a deal price leads to optimistic synergy projections that rarely materialize at the forecasted magnitude or timeline.', connection: 'Connects to Ch7: the true test of acquisition value is whether the combined entity generates more free cash flow than either standalone entity — not whether EPS accretion occurs in year one.' },
    ],
    skepticsLens: [
      'What percentage of total assets is goodwill, and has it grown through serial acquisitions?',
      'Has the company delayed goodwill impairment while operating performance deteriorated?',
      'What were the stated synergy estimates at deal close, and have they been achieved on schedule?',
      'Are there "in-process R&D" or restructuring charges taken at acquisition that smooth future earnings?',
      'Does the acquiring company\'s free cash flow per share improve post-acquisition, or only reported EPS?',
    ],
  },
  10: {
    color: colorMap[10],
    takeaways: [
      { concept: 'The Fraud Triangle Predicts Where Fraud Will Occur', insight: 'Fraud requires all three: pressure (need), opportunity (access), and rationalization (justification). Analysts who understand which companies face the most pressure, have the weakest controls, and have management with the most to gain can prioritize their skepticism accordingly.', connection: 'Connects to all chapters: every chapter\'s concept has been weaponized — revenue acceleration (Ch2), phantom inventory (Ch3), capitalized expenses (Ch4), hidden liabilities (Ch5).' },
      { concept: 'Every Major Fraud Was Visible in the Public Financial Statements', insight: 'Enron\'s CFO was negative for years before collapse. Wirecard\'s receivables were impossible. Madoff\'s returns were too smooth. The information was available; the willingness to question management credibility was not.', connection: 'Connects to Ch7: cash flow divergence from net income is the most powerful and most accessible fraud signal — available in every public company\'s annual report.' },
      { concept: 'Professional Skepticism Is a Skill, Not a Personality Trait', insight: 'Skepticism means requiring evidence rather than accepting assurances, and following analytical red flags rather than dismissing them because management has a good reputation. It can be taught, practiced, and systematized — which is what the entire platform is designed to do.', connection: 'Connects to Ch8: ratio analysis applied with professional skepticism — trends, peer comparison, and denominator management awareness — catches what accepting management narratives misses.' },
    ],
    skepticsLens: [
      'Does net income consistently exceed operating cash flow by a growing margin — the primary fraud signal across all industries?',
      'Do the first digits of key reported numbers follow Benford\'s Law distribution, or are 4s, 5s, and 6s overrepresented?',
      'Has management consistently met or narrowly beaten earnings estimates over multiple quarters — suggesting guidance management?',
      'Are there multiple audit committee members who previously worked with current management — compromising independence?',
      'Has the external auditor been in place for more than 10 years without rotation of the engagement partner?',
    ],
  },
  11: {
    color: '#7B2D26',
    takeaways: [
      { concept: 'Financial Statements Are an Interconnected System, Not Isolated Reports', insight: 'Every manipulation of one financial statement must create a compensating distortion in at least one other statement. Premature revenue inflates both the income statement and accounts receivable on the balance sheet. Capitalized expenses inflate both operating income and total assets. The cash flow statement — because cash is objective — serves as the ultimate reality check on the other two statements.', connection: 'Connects to Ch7: cash flow analysis exploits these interconnections by comparing income statement claims to actual cash generation — the most reliable fraud detection technique available.' },
      { concept: 'Classification Determines What Ratios Show — and Hide', insight: 'The same dollar amount classified differently changes gross margins, operating income, liquidity ratios, and cash flow metrics without changing net income or total cash flow. WorldCom\'s reclassification of $3.8B in operating costs as capital expenditure inflated operating income and CFO simultaneously while leaving free cash flow unchanged. Classification fraud is the subtlest form of manipulation because the bottom line is often unaffected.', connection: 'Connects to Ch4: the capitalize-vs-expense decision is the most consequential classification judgment in accounting, controlling whether a cost hits the P&L immediately or is spread over years.' },
      { concept: 'Window Dressing Exploits the Snapshot Nature of the Balance Sheet', insight: 'The balance sheet reports a single point in time — December 31 or March 31. Companies can temporarily improve their financial position around this date and revert to normal operations days later. Comparing year-end snapshots to intra-period averages reveals when the balance sheet date does not represent normal operations.', connection: 'Connects to Ch5: Lehman Brothers\' Repo 105 is the most extreme example of balance sheet window dressing — removing $50B from the balance sheet at quarter-end through transactions that reversed within days.' },
    ],
    skepticsLens: [
      'Are revenue growth and accounts receivable growth moving in proportion — or is AR growing much faster, suggesting premature recognition?',
      'Has the company reclassified any items between operating and non-operating categories, or between cash flow statement sections, compared to prior periods?',
      'Do year-end liquidity ratios (current ratio, quick ratio) differ significantly from intra-period averages — a sign of window dressing?',
      'Are there large, unusual transactions executed in the final days of the reporting period that appear designed to improve financial metrics?',
      'Does the company present non-GAAP metrics that exclude recurring costs — and are these exclusions growing over time?',
    ],
  },
  12: {
    color: '#5C4033',
    takeaways: [
      { concept: 'Adjusting Entries Are Where Accounting Judgment Becomes Earnings Management', insight: 'Every adjusting entry — accruals, deferrals, depreciation estimates, reserve levels — involves management judgment about timing and amount. This judgment is the mechanism through which legitimate accounting becomes manipulation. The difference between conservative accrual and cookie jar creation, or between genuine write-down and big bath, lies in management intent — which is invisible in the financial statements.', connection: 'Connects to Ch2: revenue recognition timing is the highest-stakes adjusting entry judgment, directly controlling how much revenue appears in each period.' },
      { concept: 'Cookie Jars and Big Baths Are Complementary Strategies', insight: 'Cookie jar reserves are created by over-accruing in good periods and released to boost income in bad periods. Big baths front-load maximum charges in already-bad periods to depress the baseline and create reserves for future release. Both exploit the judgment inherent in period-end adjusting entries. Together, they create artificially smooth earnings that hide underlying business volatility.', connection: 'Connects to Ch10: the fraud triangle\'s "pressure" element is most acute when management faces earnings targets — the exact moment when cookie jar releases and adjusting entry manipulation are most likely.' },
      { concept: 'The Accrual Quality Ratio Is the Master Detection Metric', insight: 'The ratio of cash from operations to net income (the accrual quality ratio) captures the aggregate effect of all adjusting entry choices. A ratio consistently below 1.0 means reported income exceeds cash generation — indicating that accrual judgments are systematically inflating income. This single metric, tracked over time, catches more earnings management than any other indicator.', connection: 'Connects to Ch8: the accrual quality ratio should be included alongside traditional DuPont analysis to assess whether ROE improvement is supported by cash generation or driven by accrual-based inflation.' },
    ],
    skepticsLens: [
      'Are adjusting entries near period-end consistently directional (all income-increasing), or do they include both favorable and unfavorable adjustments?',
      'Have reserve levels (bad debt allowance, warranty reserves, restructuring reserves) changed significantly without corresponding changes in business activity?',
      'Does the company\'s earnings beat pattern correlate with identifiable reserve releases — precision matching between reserve changes and earnings surprises?',
      'Has a new CEO taken unusually large write-offs in the first year — a potential big bath designed to depress the baseline for future comparisons?',
      'Is the accrual quality ratio (CFO / Net Income) consistently below 1.0 and declining over time — the primary signal of deteriorating earnings quality?',
    ],
  },
  13: {
    color: '#3E2723',
    takeaways: [
      { concept: 'Complex Obligations Are Where Assumption-Driven Accounting Meets Material Risk', insight: 'Leases, deferred taxes, pensions, and contingent liabilities share a common feature: they are large, assumption-dependent, and difficult for non-specialists to analyze. This complexity creates an information asymmetry that management can exploit. Each of these areas involves multiple management choices (discount rates, expected returns, useful lives, probability assessments) that individually may be defensible but collectively can materially inflate reported results.', connection: 'Connects to Ch5: off-balance-sheet obligations (now partially addressed by ASC 842 for leases) remain significant through VIEs, guarantees, and purchase commitments — reading the footnotes is not optional.' },
      { concept: 'Pension Assumptions Are the Largest Legal Earnings Management Lever', insight: 'A company with a $30 billion pension portfolio can shift reported pension expense by hundreds of millions of dollars simply by changing its expected return assumption by 1 percentage point. The discount rate assumption similarly controls the reported obligation by billions. These are choices, not calculations — and comparing them to industry peers reveals which companies are using assumptions to manage reported results.', connection: 'Connects to Ch8: pension assumption differences between peers can explain a significant portion of apparent earnings and leverage differences — normalize before comparing.' },
      { concept: 'The Footnotes Often Contain More Risk Information Than the Face of the Financial Statements', insight: 'Contingent liabilities classified as "reasonably possible" are disclosed only in footnotes and can exceed recognized balance sheet liabilities. Purchase commitments, VIE guarantees, and pension sensitivities are all footnote disclosures. An analyst who reads only the face of the financial statements and ignores the footnotes is seeing half the picture — at best.', connection: 'Connects to Ch1: the accounting equation always balances on the face of the statements, but the footnotes reveal obligations and risks that the equation does not capture — making footnote analysis essential for complete assessment.' },
    ],
    skepticsLens: [
      'Are the company\'s pension discount rate and expected return on plan assets at the aggressive end of the peer range — reducing reported expense through assumption choices rather than operational performance?',
      'Has the company released a deferred tax valuation allowance, and if so, is the evidence of future profitability strong enough to justify the release — or is this a one-time income boost?',
      'What is the total of all off-balance-sheet obligations disclosed in the commitment and contingencies footnote — and how does this compare to on-balance-sheet debt?',
      'Are there contingent liabilities classified as "reasonably possible" that could become "probable" with deteriorating business conditions — and how material are they relative to equity?',
      'Do the company\'s lease discount rates and term assumptions differ significantly from peers, potentially understating lease liabilities on the balance sheet?',
    ],
  },
}
