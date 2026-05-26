'use client'

import { useCheckout } from '../context/CheckoutContext';

export default function Step4Payment() {
  const { 
    checkoutState, 
    dict, 
    goToPreviousStep,
    handleCheckout
  } = useCheckout();

  const t = dict;

  const paymentMethods = [
    {
      id: 'sepa',
      title: t.payment.methods[0].title,
      description: t.payment.methods[0].description,
      icon: (
        <svg className="w-5 md:w-6 h-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'invoice_30', 
      title: t.payment.methods[1].title,
      description: t.payment.methods[1].description,
      icon: (
        <svg className="w-5 md:w-6 h-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4 md:space-y-12">
        <div className="bg-static-black/5 p-4 md:p-8 border border-static-black/10">
          <div className="flex justify-between items-center text-xs md:text-sm tracking-[0.2em] uppercase">
            <span className="text-static-black/60 font-bold">{t.summary.total}</span>
            <span className="text-static-black font-black tabular-nums">
              {checkoutState.targetCurrency} {checkoutState.convertedFinalTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-static-black/40">{t.payment.selectMethod}</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleCheckout(method.id)}
                className="group flex items-start p-3 md:p-6 border border-static-black/10 hover:border-static-black transition-all text-left space-x-6"
              >
                <div className="mt-1 text-static-black/40 group-hover:text-static-black transition-colors">
                  {method.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-static-black mb-1">
                    {method.title}
                  </h4>
                  <p className="text-[10px] leading-relaxed text-static-black/60 uppercase tracking-wider">
                    {method.description}
                  </p>
                </div>
                <div className="self-center">
                  <div className="w-4 h-4 border border-static-black/20 group-hover:border-static-black flex items-center justify-center">
                    <div className="w-2 h-2 bg-static-black opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-secondary/5 border border-secondary/10">
          <p className="text-[9px] uppercase tracking-widest font-bold text-secondary text-center">
            {t.payment.demoNotice}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center p-3 md:p-0">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="text-[10px] uppercase tracking-[0.2em] font-bold text-static-black/40 hover:text-static-black transition-colors"
        >
          {t.actions.back}
        </button>
      </div>
    </div>
  );
}
