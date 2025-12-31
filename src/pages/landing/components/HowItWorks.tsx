import { MessageSquare, Sparkles, TrendingUp } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Customer Calls In',
      description: 'A customer reaches out to your business. Our AI instantly answers with a natural, human-like conversation.'
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI Handles Request',
      description: 'The AI understands context, answers questions, schedules appointments, or routes to the right team member.'
    },
    {
      number: '03',
      icon: TrendingUp,
      title: 'You Get Insights',
      description: 'Review conversation summaries, track metrics, and continuously improve your customer experience.'
    }
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-6">
              <span className="text-sm text-slate-700">How it works</span>
            </div>
            <h2 className="text-5xl sm:text-6xl text-slate-900 mb-6 tracking-tight">
              Three steps to
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                scale your operations
              </span>
            </h2>
            <p className="text-xl text-slate-600 mb-16">
              Simple setup, powerful results. Get started in minutes.
            </p>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 group">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-6xl opacity-5 mb-1 tracking-tight">{step.number}</div>
                    <h3 className="text-2xl text-slate-900 mb-3 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-3xl"></div>
            <div className="relative bg-slate-900 rounded-3xl p-6 shadow-2xl shadow-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-slate-400 ml-2">AI Chat Interface</span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none px-5 py-3.5 max-w-xs border border-slate-700/50">
                    <p className="text-sm text-slate-200 leading-relaxed">
                      Hi! How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0"></div>
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-5 py-3.5 max-w-xs shadow-lg shadow-indigo-600/30">
                    <p className="text-sm text-white leading-relaxed">
                      I'd like to schedule an appointment for next week.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none px-5 py-3.5 max-w-sm border border-slate-700/50">
                    <p className="text-sm text-slate-200 leading-relaxed">
                      Perfect! I have Tuesday at 2 PM or Thursday at 10 AM available. Which works better for you?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0"></div>
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-5 py-3.5 max-w-xs shadow-lg shadow-indigo-600/30">
                    <p className="text-sm text-white leading-relaxed">
                      Thursday at 10 AM sounds great!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AI is typing...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
