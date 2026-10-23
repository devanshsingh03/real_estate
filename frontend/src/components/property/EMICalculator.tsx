import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { formatINR } from '../../lib/format';

export default function EMICalculator({ price }: { price: number }) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(15);

  const { emi, loanAmount, totalInterest, totalPayment } = useMemo(() => {
    const down = (price * downPaymentPct) / 100;
    const principal = price - down;
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    const emiVal =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const total = emiVal * months;
    return {
      emi: Math.round(emiVal),
      loanAmount: Math.round(principal),
      totalInterest: Math.round(total - principal),
      totalPayment: Math.round(total + down),
    };
  }, [price, downPaymentPct, rate, years]);

  return (
    <div className="rounded-2xl border border-forest/10 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-forest">
        <Calculator size={18} className="text-sage" /> EMI Calculator
      </h3>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="font-medium text-charcoal">Down Payment</label>
            <span className="text-charcoal/60">{downPaymentPct}% · {formatINR((price * downPaymentPct) / 100)}</span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            className="w-full accent-forest"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="font-medium text-charcoal">Interest Rate</label>
            <span className="text-charcoal/60">{rate}% p.a.</span>
          </div>
          <input
            type="range"
            min={6}
            max={14}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-forest"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="font-medium text-charcoal">Loan Tenure</label>
            <span className="text-charcoal/60">{years} years</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-forest"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-sage/10 p-4 text-center">
        <p className="text-xs text-charcoal/50">Estimated Monthly EMI</p>
        <p className="font-display text-3xl font-semibold text-forest">{formatINR(emi)}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="font-semibold text-charcoal">{formatINR(loanAmount)}</p>
          <p className="text-charcoal/50">Loan Amount</p>
        </div>
        <div>
          <p className="font-semibold text-charcoal">{formatINR(totalInterest)}</p>
          <p className="text-charcoal/50">Total Interest</p>
        </div>
        <div>
          <p className="font-semibold text-charcoal">{formatINR(totalPayment)}</p>
          <p className="text-charcoal/50">Total Payment</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-charcoal/40">
        Indicative estimate only — actual loan terms depend on your lender and eligibility.
      </p>
    </div>
  );
}
