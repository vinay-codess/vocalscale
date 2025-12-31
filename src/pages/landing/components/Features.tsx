import { Bot, BarChart3, Shield } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Bot,
      title: 'AI Receptionist',
      description: 'Natural conversations powered by advanced AI. Handles inquiries, takes messages, and routes calls intelligently—just like a human receptionist.',
      gradient: 'from-indigo-500 to-indigo-600',
      shadowColor: 'shadow-indigo-500/20'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Deep insights into call patterns, customer sentiment, and peak hours. Make data-driven decisions with beautiful dashboards and reports.',
      gradient: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/20'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, GDPR compliant, and SOC 2 certified. Your customer data is protected with the highest security standards.',
      gradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/20'
    }
  ];

  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
            <span className="text-sm text-indigo-700 font-semibold">Features</span>
          </div>
          <h2 className="text-5xl sm:text-6xl text-slate-900 mb-6 tracking-tight font-bold">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Powerful features that help your business run smoothly, even when you're not available.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative p-8 bg-white rounded-3xl border border-slate-200 hover:border-transparent hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl"
            >
              {/* Gradient Border on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${feature.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl text-slate-900 mb-4 tracking-tight font-bold">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Element */}
              <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
