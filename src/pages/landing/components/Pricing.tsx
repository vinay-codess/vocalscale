import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses just getting started',
      monthlyPrice: 39,
      annualPrice: 35,
      features: [
        'Handles up to 9,000 seconds of calls/month',
        'AI responses 24/7',
        'Email support',
        'Call analytics dashboard',
        'Mobile app access',
        '1 phone number'
      ],
      cta: 'Start Free Trial',
      popular: false,
      gradient: 'from-slate-600 to-slate-700'
    },
    {
      name: 'Professional',
      description: 'For growing teams that need more power',
      monthlyPrice: 99,
      annualPrice: 95,
      features: [
        'Handles up to 102,000 seconds of calls/year',
        'Advanced AI with custom training',
        'Priority support',
        'Advanced analytics & insights',
        'Mobile app access',
        'Up to 5 phone numbers',
        'Custom voice options',
        'Call recording & transcripts'
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-indigo-600 to-purple-600'
    }
  ];

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white"></div>
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 rounded-full mb-6 shadow-sm">
            <span className="text-sm text-indigo-700">Pricing</span>
          </div>
          <h2 className="text-5xl sm:text-6xl text-slate-900 mb-6 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Choose the perfect plan for your business. Always know what you'll pay.
          </p>

          <div className="inline-flex items-center gap-4 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2.5 rounded-lg transition-all text-[15px] ${
                !isAnnual
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2.5 rounded-lg transition-all text-[15px] flex items-center gap-2 ${
                isAnnual
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                plan.popular
                    ? 'bg-white border-indigo-200 shadow-2xl shadow-indigo-600/10 scale-105 md:-mt-4'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className={`px-4 py-1.5 bg-gradient-to-r ${plan.gradient} text-white rounded-full shadow-lg flex items-center gap-1.5 text-sm`}>
                    <Sparkles className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl text-slate-900 mb-2 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl text-slate-900 tracking-tight">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600">
                    Billed annually (${plan.annualPrice * 12}/year)
                  </p>
                )}
              </div>

              <button
                className={`w-full px-6 py-3.5 rounded-xl transition-all mb-8 ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-2xl hover:shadow-indigo-600/30 hover:scale-105`
                    : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-xl'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-4">
                <p className="text-sm text-slate-500 uppercase tracking-wide">
                  What's included:
                </p>
                <ul className="space-y-3.5">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-slate-700 text-[15px] leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <a href="#" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
            View detailed feature comparison →
          </a>
        </div>
      </div>
    </section>
  );
}
