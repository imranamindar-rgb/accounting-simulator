import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTextbookAppendix } from '../data/textbookToc'

/* ================================================================== */
/*  Shared Styles                                                      */
/* ================================================================== */

const sectionCard: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.25rem',
}

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.15rem',
  fontWeight: 700,
  color: 'var(--color-text)',
  margin: '0 0 8px',
}

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: '6px',
}

const bodyText: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--color-text)',
  lineHeight: 1.7,
  margin: '0 0 12px',
}

const formulaBox: React.CSSProperties = {
  background: 'var(--color-base)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '12px 16px',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.92rem',
  fontWeight: 600,
  color: '#00695C',
  marginBottom: '12px',
  textAlign: 'center' as const,
}

const exampleBox: React.CSSProperties = {
  background: '#F0FAF8',
  border: '1px solid #B2DFDB',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
}

const exampleLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.65rem',
  fontWeight: 700,
  color: '#00695C',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  marginBottom: '8px',
}

const bulletList: React.CSSProperties = {
  fontSize: '0.87rem',
  color: 'var(--color-text)',
  lineHeight: 1.75,
  paddingLeft: '1.25rem',
  margin: '8px 0 0',
}

const keyTermStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#00695C',
}

/* ================================================================== */
/*  Appendix A — Time Value of Money (Full Educational Content)        */
/* ================================================================== */

function TVMContent() {
  return (
    <div>
      {/* Introduction */}
      <div style={sectionCard}>
        <div style={monoLabel}>Overview</div>
        <h3 style={sectionHeading}>Why Time Value of Money Matters</h3>
        <p style={bodyText}>
          A dollar received today is worth more than a dollar received in the future. This simple but
          powerful idea — the <span style={keyTermStyle}>time value of money (TVM)</span> — is the
          foundation of finance and accounting. It drives how we price bonds, evaluate capital
          investments, structure loan payments, and value pension obligations.
        </p>
        <p style={bodyText}>
          Two forces make money today more valuable: (1) <span style={keyTermStyle}>opportunity cost</span> — money
          received now can be invested to earn a return, and (2) <span style={keyTermStyle}>inflation</span> — purchasing
          power erodes over time. Every major financial decision involves comparing cash flows that occur
          at different points in time, which requires converting them to a common time frame using TVM techniques.
        </p>
      </div>

      {/* 1. Future Value Concepts */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 1</div>
        <h3 style={sectionHeading}>Future Value Concepts</h3>
        <p style={bodyText}>
          <span style={keyTermStyle}>Future value (FV)</span> answers the question: "If I invest a lump sum today,
          how much will it grow to after a certain number of periods at a given interest rate?" The process
          of growing a present amount forward in time is called <span style={keyTermStyle}>compounding</span>.
        </p>
        <p style={bodyText}>
          With <span style={keyTermStyle}>compound interest</span>, you earn interest not only on the original
          principal but also on previously accumulated interest. This "interest on interest" effect causes
          exponential growth — the longer the time horizon and the higher the rate, the more dramatic
          the compounding effect becomes.
        </p>
        <div style={formulaBox}>
          FV = PV × (1 + r)<sup>n</sup>
        </div>
        <p style={{ ...bodyText, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Where: PV = present value (amount today), r = interest rate per period, n = number of compounding periods
        </p>
        <div style={exampleBox}>
          <div style={exampleLabel}>Worked Example — Single Amount</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            You deposit <strong>$10,000</strong> in a savings account earning <strong>6% annually</strong>. How much will
            you have after <strong>3 years</strong>?
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            FV = $10,000 × (1.06)<sup>3</sup><br />
            FV = $10,000 × 1.19102<br />
            <strong>FV = $11,910.16</strong>
          </div>
          <p style={{ ...bodyText, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            You earned $1,910.16 over three years — $1,800 from simple interest on the principal plus
            $110.16 from compound interest (interest earned on interest).
          </p>
        </div>
        <div style={exampleBox}>
          <div style={exampleLabel}>The Power of Compounding — Rule of 72</div>
          <p style={{ ...bodyText, margin: 0 }}>
            A quick approximation: divide 72 by the annual interest rate to estimate how many years it takes
            to double your money. At 6%, money doubles in roughly 72 ÷ 6 = <strong>12 years</strong>. At 8%, it
            doubles in about <strong>9 years</strong>. This rule shows why even small differences in rates have
            enormous long-term effects.
          </p>
        </div>
      </div>

      {/* 2. Present Value Concepts — Single Amount */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 2</div>
        <h3 style={sectionHeading}>Present Value of a Single Amount</h3>
        <p style={bodyText}>
          <span style={keyTermStyle}>Present value (PV)</span> is the mirror image of future value. It answers:
          "How much is a future cash flow worth today?" The process of converting a future amount back
          to its present-day equivalent is called <span style={keyTermStyle}>discounting</span>.
        </p>
        <p style={bodyText}>
          Discounting is the most widely used TVM concept in accounting. It underpins the valuation of
          long-term receivables, notes payable, lease liabilities, asset retirement obligations, and pension
          obligations. The discount rate reflects the risk and opportunity cost of capital.
        </p>
        <div style={formulaBox}>
          PV = FV / (1 + r)<sup>n</sup> &nbsp;&nbsp;or equivalently&nbsp;&nbsp; PV = FV × [1 / (1 + r)<sup>n</sup>]
        </div>
        <div style={exampleBox}>
          <div style={exampleLabel}>Worked Example — Discounting</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            You will receive <strong>$15,000</strong> in <strong>5 years</strong>. If your required rate of return
            is <strong>8%</strong>, what is this payment worth to you today?
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            PV = $15,000 / (1.08)<sup>5</sup><br />
            PV = $15,000 / 1.46933<br />
            <strong>PV = $10,208.75</strong>
          </div>
          <p style={{ ...bodyText, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Receiving $15,000 in five years is economically equivalent to receiving $10,208.75 today
            (assuming you could earn 8% on your money).
          </p>
        </div>
      </div>

      {/* 3. Present Value of an Annuity */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 3</div>
        <h3 style={sectionHeading}>Present Value of an Annuity</h3>
        <p style={bodyText}>
          An <span style={keyTermStyle}>annuity</span> is a series of equal payments made at regular intervals.
          Examples include lease payments, pension payouts, and bond coupon payments. The present value of
          an annuity calculates the lump sum that would be equivalent today to receiving all those future
          payments.
        </p>
        <p style={bodyText}>
          Rather than discounting each payment individually and summing them, we use the
          <span style={keyTermStyle}> annuity present value factor</span>:
        </p>
        <div style={formulaBox}>
          PV<sub>annuity</sub> = PMT × [(1 − (1 + r)<sup>−n</sup>) / r]
        </div>
        <p style={{ ...bodyText, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Where: PMT = periodic payment amount, r = discount rate per period, n = number of payments
        </p>
        <div style={exampleBox}>
          <div style={exampleLabel}>Worked Example — Annuity PV</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            A company signs a lease requiring <strong>$5,000 annual payments</strong> for <strong>4 years</strong>.
            The appropriate discount rate is <strong>6%</strong>. What is the present value of the lease liability?
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            PV = $5,000 × [(1 − (1.06)<sup>−4</sup>) / 0.06]<br />
            PV = $5,000 × [(1 − 0.79209) / 0.06]<br />
            PV = $5,000 × [0.20791 / 0.06]<br />
            PV = $5,000 × 3.46511<br />
            <strong>PV = $17,325.53</strong>
          </div>
          <p style={{ ...bodyText, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            The company records a lease liability of $17,325.53 on day one — the present value of all future
            payments under ASC 842.
          </p>
        </div>
      </div>

      {/* 4. Installment Loans */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 4</div>
        <h3 style={sectionHeading}>Installment Loans</h3>
        <p style={bodyText}>
          An <span style={keyTermStyle}>installment loan</span> (such as a mortgage or car loan) is repaid
          through equal periodic payments that include both principal and interest. Each payment is
          calculated so that the present value of all payments equals the amount borrowed — making it a
          direct application of annuity PV.
        </p>
        <div style={formulaBox}>
          PMT = PV / [(1 − (1 + r)<sup>−n</sup>) / r]
        </div>
        <div style={exampleBox}>
          <div style={exampleLabel}>Worked Example — Mortgage Payment</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            A company borrows <strong>$100,000</strong> at <strong>5% annual interest</strong>, repayable in <strong>5 equal
            annual installments</strong>. What is each payment?
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            Annuity PV factor = (1 − (1.05)<sup>−5</sup>) / 0.05 = 4.32948<br />
            PMT = $100,000 / 4.32948<br />
            <strong>PMT = $23,097.48</strong>
          </div>
        </div>
        <div style={exampleBox}>
          <div style={exampleLabel}>Amortization Schedule (First 3 Years)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #B2DFDB' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Year</th>
                <th style={{ textAlign: 'right', padding: '6px 8px' }}>Payment</th>
                <th style={{ textAlign: 'right', padding: '6px 8px' }}>Interest</th>
                <th style={{ textAlign: 'right', padding: '6px 8px' }}>Principal</th>
                <th style={{ textAlign: 'right', padding: '6px 8px' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {[
                { yr: 0, pmt: '—', int: '—', prin: '—', bal: '$100,000' },
                { yr: 1, pmt: '$23,097', int: '$5,000', prin: '$18,097', bal: '$81,903' },
                { yr: 2, pmt: '$23,097', int: '$4,095', prin: '$19,002', bal: '$62,901' },
                { yr: 3, pmt: '$23,097', int: '$3,145', prin: '$19,952', bal: '$42,948' },
              ].map(row => (
                <tr key={row.yr} style={{ borderBottom: '1px solid #E0F2F1' }}>
                  <td style={{ padding: '6px 8px' }}>{row.yr}</td>
                  <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.pmt}</td>
                  <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.int}</td>
                  <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.prin}</td>
                  <td style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>{row.bal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...bodyText, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Notice: as the balance declines, less of each payment goes toward interest and more toward principal.
          </p>
        </div>
      </div>

      {/* 5. Bond Valuation */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 5</div>
        <h3 style={sectionHeading}>Bond Valuation</h3>
        <p style={bodyText}>
          A bond provides two types of cash flows: (1) periodic <span style={keyTermStyle}>coupon (interest) payments</span> — an
          annuity, and (2) the <span style={keyTermStyle}>face (par) value</span> returned at maturity — a single lump sum.
          The bond's price is simply the present value of both streams, discounted at the
          <span style={keyTermStyle}> market (yield) rate</span>.
        </p>
        <div style={formulaBox}>
          Bond Price = PV of Coupons + PV of Face Value<br />
          <span style={{ fontSize: '0.82rem' }}>
            = PMT × [(1 − (1 + r)<sup>−n</sup>) / r] + FV / (1 + r)<sup>n</sup>
          </span>
        </div>
        <div style={exampleBox}>
          <div style={exampleLabel}>Worked Example — Bond Pricing</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            A <strong>$1,000 face value bond</strong> pays <strong>6% annual coupons</strong> and matures
            in <strong>5 years</strong>. If the market interest rate is <strong>8%</strong>, what is the bond's price?
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            Annual coupon = $1,000 × 6% = $60<br />
            PV of coupons = $60 × [(1 − (1.08)<sup>−5</sup>) / 0.08] = $60 × 3.99271 = $239.56<br />
            PV of face value = $1,000 / (1.08)<sup>5</sup> = $1,000 / 1.46933 = $680.58<br />
            <strong>Bond price = $239.56 + $680.58 = $920.15</strong>
          </div>
          <p style={{ ...bodyText, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Because the market rate (8%) exceeds the coupon rate (6%), the bond sells at a <strong>discount</strong> —
            investors require compensation for the below-market coupon. If the market rate were below 6%, the
            bond would sell at a <strong>premium</strong>.
          </p>
        </div>
        <div style={{ ...exampleBox, background: '#FFF8E1', border: '1px solid #FFE082' }}>
          <div style={{ ...exampleLabel, color: '#F57F17' }}>Key Insight — Inverse Relationship</div>
          <p style={{ ...bodyText, margin: 0, fontSize: '0.85rem' }}>
            Bond prices move inversely to market interest rates. When rates rise, existing bond prices fall
            (and vice versa). This is because the fixed coupon becomes relatively less attractive compared
            to newly issued bonds at higher rates.
          </p>
        </div>
      </div>

      {/* 6. Calculating Bond Yields */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 6</div>
        <h3 style={sectionHeading}>Calculating Bond Yields</h3>
        <p style={bodyText}>
          The <span style={keyTermStyle}>yield to maturity (YTM)</span> is the discount rate that makes the
          present value of all future cash flows (coupons + face value) equal to the bond's current market
          price. It represents the total return an investor earns if the bond is held to maturity.
        </p>
        <p style={bodyText}>
          Unlike other TVM calculations, solving for the yield requires iteration (trial and error) or a
          financial calculator. The process involves testing different rates until the calculated price matches
          the observed market price.
        </p>
        <div style={exampleBox}>
          <div style={exampleLabel}>Conceptual Example — Finding the Yield</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            A <strong>$1,000 bond</strong> paying <strong>$60 annual coupons</strong> with <strong>5 years</strong> to
            maturity is trading at <strong>$920.15</strong>. What is its yield?
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            Try r = 7%: Price = $60 × 4.10020 + $1,000 / 1.40255 = $246.01 + $712.99 = $959.00 (too high)<br />
            Try r = 9%: Price = $60 × 3.88965 + $1,000 / 1.53862 = $233.38 + $649.93 = $883.31 (too low)<br />
            Try r = 8%: Price = $60 × 3.99271 + $1,000 / 1.46933 = $239.56 + $680.58 = $920.15 ✓<br />
            <strong>YTM = 8%</strong>
          </div>
        </div>
      </div>

      {/* 7. Future Value of Annuities */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 7</div>
        <h3 style={sectionHeading}>Future Value of Annuities</h3>
        <p style={bodyText}>
          The <span style={keyTermStyle}>future value of an annuity</span> answers: "If I invest a fixed amount
          at regular intervals, how much will I accumulate?" This concept is essential for retirement
          planning, sinking funds (where companies set aside money to repay bonds), and college savings plans.
        </p>
        <div style={formulaBox}>
          FV<sub>annuity</sub> = PMT × [((1 + r)<sup>n</sup> − 1) / r]
        </div>
        <div style={exampleBox}>
          <div style={exampleLabel}>Worked Example — Retirement Savings</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            An employee contributes <strong>$5,000 per year</strong> to a 401(k) plan earning <strong>7% annually</strong>.
            How much will they have after <strong>30 years</strong>?
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            FV = $5,000 × [((1.07)<sup>30</sup> − 1) / 0.07]<br />
            FV = $5,000 × [(7.61226 − 1) / 0.07]<br />
            FV = $5,000 × 94.46079<br />
            <strong>FV = $472,303.93</strong>
          </div>
          <p style={{ ...bodyText, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            The total contributions were only $150,000 (30 × $5,000). The remaining $322,304 came entirely
            from compound interest — demonstrating the extraordinary power of long-term compounding.
          </p>
        </div>
      </div>

      {/* 8. Using Excel for TVM */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 8</div>
        <h3 style={sectionHeading}>Using Excel to Compute Time Value</h3>
        <p style={bodyText}>
          In practice, most TVM calculations are performed using spreadsheet functions. Excel provides
          five core financial functions that correspond directly to the five TVM variables:
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem' }}>Variable</th>
              <th style={{ textAlign: 'left', padding: '8px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem' }}>Excel Function</th>
              <th style={{ textAlign: 'left', padding: '8px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem' }}>Solves For</th>
            </tr>
          </thead>
          <tbody>
            {[
              { variable: 'Future Value', fn: '=FV(rate, nper, pmt, [pv])', solves: 'How much will accumulate?' },
              { variable: 'Present Value', fn: '=PV(rate, nper, pmt, [fv])', solves: 'What is it worth today?' },
              { variable: 'Payment', fn: '=PMT(rate, nper, pv, [fv])', solves: 'What is each payment?' },
              { variable: 'Rate', fn: '=RATE(nper, pmt, pv, [fv])', solves: 'What is the interest rate?' },
              { variable: 'Periods', fn: '=NPER(rate, pmt, pv, [fv])', solves: 'How many periods?' },
            ].map(row => (
              <tr key={row.variable} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px', fontFamily: 'var(--font-body)' }}>{row.variable}</td>
                <td style={{ padding: '8px', color: '#00695C', fontWeight: 600 }}>{row.fn}</td>
                <td style={{ padding: '8px', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>{row.solves}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={exampleBox}>
          <div style={exampleLabel}>Excel Example — Bond Pricing</div>
          <p style={{ ...bodyText, margin: '0 0 6px' }}>
            To price our 6% coupon, 5-year, $1,000 bond at a market rate of 8%:
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8, background: '#fff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #B2DFDB' }}>
            =PV(0.08, 5, -60, -1000)<br />
            <span style={{ color: 'var(--color-text-muted)' }}>// Returns: $920.15</span>
          </div>
          <p style={{ ...bodyText, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Note: In Excel, cash outflows (payments you make) are negative and inflows (payments you receive) are
            positive. Enter the coupon and face value as negatives because they are paid by the bond issuer to you.
          </p>
        </div>
        <div style={exampleBox}>
          <div style={exampleLabel}>Excel Example — Loan Payment</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8, background: '#fff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #B2DFDB' }}>
            =PMT(0.05, 5, -100000)<br />
            <span style={{ color: 'var(--color-text-muted)' }}>// Returns: $23,097.48</span>
          </div>
        </div>
      </div>

      {/* Interactive Calculator */}
      <div style={sectionCard}>
        <div style={monoLabel}>Interactive Tool</div>
        <h3 style={sectionHeading}>TVM Calculator</h3>
        <p style={{ ...bodyText, marginBottom: '16px' }}>
          Use this calculator to practice the concepts above. Select a calculation mode, enter your values,
          and see the formula, step-by-step computation, and result.
        </p>
        <TVMCalculator />
      </div>

      {/* Key Terms */}
      <div style={sectionCard}>
        <div style={monoLabel}>Reference</div>
        <h3 style={sectionHeading}>Key Terms</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
          {[
            { term: 'Time Value of Money', def: 'The concept that money today is worth more than the same amount in the future' },
            { term: 'Compounding', def: 'Growing a present amount forward by earning interest on interest' },
            { term: 'Discounting', def: 'Converting a future amount back to its present value equivalent' },
            { term: 'Future Value (FV)', def: 'The amount a present sum will grow to at a given rate' },
            { term: 'Present Value (PV)', def: 'The current worth of a future cash flow' },
            { term: 'Annuity', def: 'A series of equal payments at regular intervals' },
            { term: 'Discount Rate', def: 'The interest rate used to compute present value' },
            { term: 'Yield to Maturity', def: 'The total return earned on a bond if held to maturity' },
            { term: 'Installment Loan', def: 'A loan repaid through equal periodic payments' },
            { term: 'Coupon Rate', def: 'The stated interest rate on a bond\'s face value' },
          ].map(({ term, def }) => (
            <div key={term} style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#00695C' }}>{term}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>— {def}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  TVM Calculator Component (Enhanced)                                */
/* ================================================================== */

type TvmMode = 'fv' | 'pv' | 'annuity-fv' | 'annuity-pv' | 'bond' | 'loan-pmt'

function TVMCalculator() {
  const [mode, setMode] = useState<TvmMode>('fv')
  const [pv, setPv] = useState('')
  const [fv, setFv] = useState('')
  const [rate, setRate] = useState('')
  const [periods, setPeriods] = useState('')
  const [payment, setPayment] = useState('')
  const [coupon, setCoupon] = useState('')
  const [faceValue, setFaceValue] = useState('')
  const [result, setResult] = useState<{ value: number; formula: string; steps: string; label: string } | null>(null)

  function compute() {
    const r = parseFloat(rate) / 100
    const n = parseFloat(periods)

    if (isNaN(r) || isNaN(n) || n <= 0) {
      setResult(null)
      return
    }

    switch (mode) {
      case 'fv': {
        const pvVal = parseFloat(pv)
        if (isNaN(pvVal)) return
        const val = pvVal * Math.pow(1 + r, n)
        setResult({
          value: val,
          label: 'Future Value',
          formula: 'FV = PV × (1 + r)^n',
          steps: `FV = ${pvVal.toLocaleString()} × (1 + ${r})^${n} = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'pv': {
        const fvVal = parseFloat(fv)
        if (isNaN(fvVal)) return
        const val = fvVal / Math.pow(1 + r, n)
        setResult({
          value: val,
          label: 'Present Value',
          formula: 'PV = FV / (1 + r)^n',
          steps: `PV = ${fvVal.toLocaleString()} / (1 + ${r})^${n} = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'annuity-fv': {
        const pmt = parseFloat(payment)
        if (isNaN(pmt)) return
        const val = r === 0 ? pmt * n : pmt * ((Math.pow(1 + r, n) - 1) / r)
        setResult({
          value: val,
          label: 'Future Value of Annuity',
          formula: 'FV = PMT × [((1 + r)^n − 1) / r]',
          steps: `FV = ${pmt.toLocaleString()} × [((1 + ${r})^${n} − 1) / ${r}] = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'annuity-pv': {
        const pmt = parseFloat(payment)
        if (isNaN(pmt)) return
        const val = r === 0 ? pmt * n : pmt * ((1 - Math.pow(1 + r, -n)) / r)
        setResult({
          value: val,
          label: 'Present Value of Annuity',
          formula: 'PV = PMT × [(1 − (1 + r)^−n) / r]',
          steps: `PV = ${pmt.toLocaleString()} × [(1 − (1 + ${r})^−${n}) / ${r}] = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'bond': {
        const cpn = parseFloat(coupon) / 100
        const face = parseFloat(faceValue)
        if (isNaN(cpn) || isNaN(face)) return
        const annualCoupon = face * cpn
        const pvCoupons = r === 0 ? annualCoupon * n : annualCoupon * ((1 - Math.pow(1 + r, -n)) / r)
        const pvFace = face / Math.pow(1 + r, n)
        const val = pvCoupons + pvFace
        setResult({
          value: val,
          label: 'Bond Price',
          formula: 'Price = PMT × [(1−(1+r)^−n)/r] + FV/(1+r)^n',
          steps: `Coupon = ${face.toLocaleString()} × ${(cpn * 100).toFixed(1)}% = ${annualCoupon.toLocaleString()}\nPV Coupons = ${pvCoupons.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nPV Face = ${pvFace.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nBond Price = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'loan-pmt': {
        const loanAmt = parseFloat(pv)
        if (isNaN(loanAmt)) return
        const factor = r === 0 ? n : (1 - Math.pow(1 + r, -n)) / r
        const val = loanAmt / factor
        setResult({
          value: val,
          label: 'Loan Payment',
          formula: 'PMT = PV / [(1 − (1+r)^−n) / r]',
          steps: `Annuity factor = (1 − (1+${r})^−${n}) / ${r} = ${factor.toFixed(5)}\nPMT = ${loanAmt.toLocaleString()} / ${factor.toFixed(5)} = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-base)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '4px',
    display: 'block',
  }

  const modes: { key: TvmMode; label: string }[] = [
    { key: 'fv', label: 'Future Value' },
    { key: 'pv', label: 'Present Value' },
    { key: 'annuity-fv', label: 'Annuity FV' },
    { key: 'annuity-pv', label: 'Annuity PV' },
    { key: 'bond', label: 'Bond Price' },
    { key: 'loan-pmt', label: 'Loan Payment' },
  ]

  return (
    <div>
      {/* Mode selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setResult(null) }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              transition: 'all 0.15s',
              background: mode === m.key ? '#00695C' : 'var(--color-surface)',
              color: mode === m.key ? 'white' : 'var(--color-text-muted)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(mode === 'fv' || mode === 'loan-pmt') && (
          <div>
            <label style={labelStyle}>{mode === 'loan-pmt' ? 'Loan Amount' : 'Present Value (PV)'}</label>
            <input type="number" value={pv} onChange={e => setPv(e.target.value)} placeholder={mode === 'loan-pmt' ? 'e.g. 100000' : 'e.g. 1000'} style={inputStyle} />
          </div>
        )}
        {(mode === 'pv') && (
          <div>
            <label style={labelStyle}>Future Value (FV)</label>
            <input type="number" value={fv} onChange={e => setFv(e.target.value)} placeholder="e.g. 1500" style={inputStyle} />
          </div>
        )}
        {(mode === 'annuity-fv' || mode === 'annuity-pv') && (
          <div>
            <label style={labelStyle}>Payment (PMT)</label>
            <input type="number" value={payment} onChange={e => setPayment(e.target.value)} placeholder="e.g. 200" style={inputStyle} />
          </div>
        )}
        {(mode === 'bond') && (
          <>
            <div>
              <label style={labelStyle}>Face Value</label>
              <input type="number" value={faceValue} onChange={e => setFaceValue(e.target.value)} placeholder="e.g. 1000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Coupon Rate (%)</label>
              <input type="number" value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="e.g. 6" style={inputStyle} />
            </div>
          </>
        )}
        <div>
          <label style={labelStyle}>{mode === 'bond' ? 'Market Rate (%)' : 'Interest Rate (%)'}</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 5" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{mode === 'bond' ? 'Years to Maturity' : 'Number of Periods'}</label>
          <input type="number" value={periods} onChange={e => setPeriods(e.target.value)} placeholder="e.g. 10" style={inputStyle} />
        </div>
      </div>

      {/* Compute button */}
      <button
        onClick={compute}
        style={{
          padding: '10px 28px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          border: 'none',
          background: '#00695C',
          color: 'white',
          transition: 'all 0.15s',
        }}
      >
        Calculate
      </button>

      {/* Result */}
      {result && (
        <div
          className="mt-6 rounded-xl p-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Formula
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '12px' }}>
            {result.formula}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Computation
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-text)', marginBottom: '12px', whiteSpace: 'pre-line' }}>
            {result.steps}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {result.label}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)' }}>
            ${result.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Appendix B — Data Analytics and Blockchain Technology              */
/* ================================================================== */

function DataAnalyticsContent() {
  return (
    <div>
      {/* Introduction */}
      <div style={sectionCard}>
        <div style={monoLabel}>Overview</div>
        <h3 style={sectionHeading}>Data Analytics and Blockchain Technology</h3>
        <p style={bodyText}>
          Technology is transforming the accounting profession. Two developments are especially
          significant: <span style={keyTermStyle}>data analytics</span> — the use of quantitative and
          statistical techniques to extract insights from large datasets — and <span style={keyTermStyle}>blockchain
          technology</span> — a distributed ledger system that can fundamentally change how
          transactions are recorded, verified, and reported.
        </p>
        <p style={bodyText}>
          Understanding these technologies is increasingly essential for accountants, auditors, and
          financial analysts. The AICPA, PCAOB, and major accounting firms have all identified
          data analytics and emerging technologies as critical competencies for the profession.
        </p>
      </div>

      {/* Data Analytics in the Accounting Profession */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 1</div>
        <h3 style={sectionHeading}>Data Analytics in the Accounting Profession</h3>
        <p style={bodyText}>
          <span style={keyTermStyle}>Data analytics</span> refers to the process of examining datasets to
          draw conclusions, identify patterns, and support decision-making. In accounting, data analytics
          has evolved from simple ratio analysis to sophisticated techniques that process millions of
          transactions in real time.
        </p>
        <p style={bodyText}>
          The four levels of analytics represent increasing sophistication:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { level: 'Descriptive', desc: 'What happened? Summarize historical data — financial statements, dashboards, variance reports', color: '#E3F2FD', border: '#90CAF9' },
            { level: 'Diagnostic', desc: 'Why did it happen? Drill into data to understand causes — ratio analysis, trend identification', color: '#E8F5E9', border: '#A5D6A7' },
            { level: 'Predictive', desc: 'What might happen? Use statistical models and machine learning to forecast — credit risk, revenue projections', color: '#FFF3E0', border: '#FFCC80' },
            { level: 'Prescriptive', desc: 'What should we do? Recommend actions based on analysis — optimal pricing, portfolio allocation', color: '#FCE4EC', border: '#F48FB1' },
          ].map(({ level, desc, color, border }) => (
            <div key={level} style={{ background: color, border: `1px solid ${border}`, borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{level}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: '16px 0 8px' }}>
          Applications in Accounting & Auditing
        </h4>
        <ul style={bulletList}>
          <li><strong>Audit analytics:</strong> Rather than sampling, auditors can analyze 100% of transactions to identify anomalies — unusual journal entries, transactions outside business hours, entries by unauthorized users, or round-dollar amounts near materiality thresholds</li>
          <li><strong>Continuous monitoring:</strong> Automated systems flag deviations from expected patterns in real time, enabling management to detect and address issues before they escalate</li>
          <li><strong>Fraud detection:</strong> Techniques like Benford's Law analysis (testing whether leading digits follow expected distributions) can reveal fabricated data. Machine learning models identify patterns consistent with historical fraud cases</li>
          <li><strong>Financial planning & analysis:</strong> Predictive models forecast revenue, expenses, and cash flows, helping companies allocate resources and manage risk more effectively</li>
          <li><strong>Tax compliance:</strong> Analytics tools process large volumes of transaction data to identify tax optimization opportunities and ensure compliance with complex regulations</li>
        </ul>
      </div>

      {/* Benford's Law */}
      <div style={sectionCard}>
        <div style={monoLabel}>Spotlight</div>
        <h3 style={sectionHeading}>Benford's Law — A Core Detection Technique</h3>
        <p style={bodyText}>
          <span style={keyTermStyle}>Benford's Law</span> predicts the frequency distribution of leading digits in
          naturally occurring datasets. In legitimate financial data, the digit 1 appears as the leading
          digit about 30.1% of the time, while 9 appears only about 4.6%. Deviations from this expected
          distribution can signal fabricated or manipulated figures.
        </p>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', margin: '12px 0', padding: '12px', background: 'var(--color-base)', borderRadius: '8px' }}>
          {[
            { digit: '1', pct: 30.1, height: 120 },
            { digit: '2', pct: 17.6, height: 70 },
            { digit: '3', pct: 12.5, height: 50 },
            { digit: '4', pct: 9.7, height: 39 },
            { digit: '5', pct: 7.9, height: 32 },
            { digit: '6', pct: 6.7, height: 27 },
            { digit: '7', pct: 5.8, height: 23 },
            { digit: '8', pct: 5.1, height: 20 },
            { digit: '9', pct: 4.6, height: 18 },
          ].map(({ digit, pct, height }) => (
            <div key={digit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{pct}%</div>
              <div style={{ width: '100%', height: `${height}px`, background: '#00695C', borderRadius: '4px 4px 0 0', opacity: 0.7 + (pct / 100) }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, marginTop: '4px' }}>{digit}</div>
            </div>
          ))}
        </div>
        <ul style={bulletList}>
          <li>Compare actual first-digit frequencies against the expected Benford distribution</li>
          <li>Flag accounts or journals where chi-squared tests show statistically significant deviation</li>
          <li>Most effective on large, unmanipulated datasets (revenue, expenses, population figures)</li>
          <li>Not applicable to constrained datasets (e.g., prices ending in .99, assigned ID numbers)</li>
        </ul>
      </div>

      {/* Blockchain Technology */}
      <div style={sectionCard}>
        <div style={monoLabel}>Section 2</div>
        <h3 style={sectionHeading}>Blockchain Technology</h3>
        <p style={bodyText}>
          A <span style={keyTermStyle}>blockchain</span> is a distributed, immutable digital ledger that records
          transactions across a network of computers. Once a transaction is recorded in a block and added
          to the chain, it cannot be altered without changing all subsequent blocks — making the record
          tamper-resistant and transparent.
        </p>

        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: '16px 0 8px' }}>
          How Blockchain Works
        </h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { step: '1', title: 'Transaction Initiated', desc: 'A party initiates a transaction (payment, contract, asset transfer)' },
            { step: '2', title: 'Block Created', desc: 'The transaction is grouped with others into a "block" of data' },
            { step: '3', title: 'Verification', desc: 'Network participants validate the block using consensus mechanisms' },
            { step: '4', title: 'Block Added', desc: 'The verified block is appended to the chain with a cryptographic hash' },
            { step: '5', title: 'Permanent Record', desc: 'The transaction is now part of an immutable, distributed ledger' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ flex: '1 1 160px', background: '#ECEFF1', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#37474F', marginBottom: '4px' }}>{step}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, color: '#37474F', marginBottom: '4px' }}>{title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: '16px 0 8px' }}>
          Smart Contracts
        </h4>
        <p style={bodyText}>
          <span style={keyTermStyle}>Smart contracts</span> are self-executing programs stored on a blockchain
          that automatically enforce the terms of an agreement when predefined conditions are met. For example,
          a smart contract could automatically release payment to a supplier when a shipping confirmation
          is recorded on the blockchain — eliminating the need for manual invoice processing.
        </p>

        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: '16px 0 8px' }}>
          Implications for Accounting
        </h4>
        <ul style={bulletList}>
          <li><strong>Triple-entry accounting:</strong> Blockchain enables a third entry — a cryptographically sealed receipt shared between parties — that provides independent verification beyond the traditional debit-credit system</li>
          <li><strong>Real-time auditing:</strong> With transactions recorded on an immutable ledger, auditors could potentially verify accounts continuously rather than relying on periodic sampling</li>
          <li><strong>Reduced reconciliation:</strong> When both parties to a transaction share the same ledger, the costly and time-consuming process of reconciling differences between separate books is eliminated</li>
          <li><strong>Supply chain transparency:</strong> Companies can track goods from raw materials to final sale, improving inventory accounting accuracy and enabling real-time cost of goods sold calculations</li>
          <li><strong>Revenue recognition:</strong> Smart contracts can automatically recognize revenue when performance obligations are satisfied, reducing judgment and potential for manipulation</li>
        </ul>

        <div style={{ ...exampleBox, background: '#ECEFF1', border: '1px solid #B0BEC5', marginTop: '16px' }}>
          <div style={{ ...exampleLabel, color: '#37474F' }}>Industry Adoption</div>
          <p style={{ ...bodyText, margin: 0, fontSize: '0.85rem' }}>
            All Big Four accounting firms (Deloitte, EY, KPMG, PwC) have invested heavily in blockchain
            initiatives. Deloitte's Rubix platform, EY's OpsChain, and PwC's blockchain validation
            solution are examples of how the profession is preparing for a blockchain-enabled future.
            The AICPA has issued guidance on auditing blockchain-based transactions and digital assets.
          </p>
        </div>
      </div>

      {/* Challenges and Future */}
      <div style={sectionCard}>
        <div style={monoLabel}>Looking Ahead</div>
        <h3 style={sectionHeading}>Challenges and the Future</h3>
        <p style={bodyText}>
          While data analytics and blockchain offer transformative potential, significant challenges remain:
        </p>
        <ul style={bulletList}>
          <li><strong>Data quality:</strong> Analytics are only as good as the underlying data — "garbage in, garbage out." Ensuring data integrity, completeness, and consistency is critical</li>
          <li><strong>Privacy and regulation:</strong> Immutable blockchain records can conflict with data privacy regulations (such as the GDPR's "right to be forgotten"). Regulators are still developing frameworks for digital assets and blockchain-based reporting</li>
          <li><strong>Scalability:</strong> Current blockchain platforms struggle with the volume of transactions that large enterprises process daily. Layer-2 solutions and alternative consensus mechanisms aim to address this</li>
          <li><strong>Skills gap:</strong> The profession needs accountants who combine traditional expertise with data science and technology skills. CPA exams are increasingly incorporating technology-related content</li>
          <li><strong>Standardization:</strong> No universally accepted standards exist yet for blockchain-based financial reporting. The FASB, IASB, and SEC continue to study the implications</li>
        </ul>
        <div style={{ ...exampleBox, background: '#FFF8E1', border: '1px solid #FFE082', marginTop: '12px' }}>
          <div style={{ ...exampleLabel, color: '#F57F17' }}>The Bottom Line</div>
          <p style={{ ...bodyText, margin: 0, fontSize: '0.85rem' }}>
            Data analytics is not replacing accountants — it is elevating the profession. Accountants who
            embrace these tools transition from "scorekeepers" to strategic advisors, using data-driven
            insights to inform business decisions. Blockchain, meanwhile, has the potential to make financial
            reporting more transparent, efficient, and trustworthy. The accountants of tomorrow will need
            to be as comfortable with algorithms as with journal entries.
          </p>
        </div>
      </div>

      {/* Key Terms */}
      <div style={sectionCard}>
        <div style={monoLabel}>Reference</div>
        <h3 style={sectionHeading}>Key Terms</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
          {[
            { term: 'Data Analytics', def: 'Examining datasets to draw conclusions and identify patterns' },
            { term: 'Descriptive Analytics', def: 'Summarizing what happened using historical data' },
            { term: 'Predictive Analytics', def: 'Forecasting future outcomes using statistical models' },
            { term: 'Prescriptive Analytics', def: 'Recommending optimal actions based on analysis' },
            { term: 'Benford\'s Law', def: 'Expected distribution of leading digits in natural datasets' },
            { term: 'Blockchain', def: 'A distributed, immutable digital ledger for recording transactions' },
            { term: 'Smart Contract', def: 'Self-executing program that enforces agreement terms automatically' },
            { term: 'Triple-Entry Accounting', def: 'Blockchain-based third entry providing independent verification' },
            { term: 'Distributed Ledger', def: 'A database shared across multiple network participants' },
            { term: 'Consensus Mechanism', def: 'The process by which blockchain participants validate transactions' },
          ].map(({ term, def }) => (
            <div key={term} style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#37474F' }}>{term}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>— {def}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Main Appendix Page                                                 */
/* ================================================================== */

export default function TextbookAppendixPage() {
  const { id = 'A' } = useParams<{ id: string }>()
  const appendix = getTextbookAppendix(id)

  if (!appendix) {
    return <div className="p-8" style={{ color: 'var(--color-text-muted)' }}>Appendix not found.</div>
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-base)' }}>
      {/* Header */}
      <div
        className="px-6 py-4 pl-16"
        style={{ background: appendix.color, color: 'white' }}
      >
        <div style={{ fontSize: '0.7rem', opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Appendix {appendix.id}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, margin: '2px 0 0', color: 'white' }}>
          {appendix.title}
        </h1>
        <p style={{ fontSize: '0.82rem', opacity: 0.8, margin: '2px 0 0' }}>
          {appendix.subtitle}
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-3 pl-16" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <Link
          to="/textbook"
          style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}
        >
          &larr; Back to Textbook Home
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {id === 'A' ? <TVMContent /> : <DataAnalyticsContent />}
      </div>
    </div>
  )
}
