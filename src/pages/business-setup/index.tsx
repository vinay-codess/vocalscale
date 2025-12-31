import React from 'react';
import {
  Building2, Clock, Layers, AlertTriangle, Save, Sparkles, Eye
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ToastProvider } from '../../context/ToastContext';
import { BusinessDetails } from './components/BusinessDetails';
import { BusinessHoursSettings } from './components/BusinessHoursSettings';
import { Services } from './components/Services';
import { UrgentCalls } from './components/UrgentCalls';
import { LivePreview } from './components/LivePreview';
import { ProTip } from './components/ProTip';
import { Footer } from './components/Footer';

// --- Reusable Section Card Component ---

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  isLast?: boolean;
}

const SectionCard = ({ title, subtitle, children, action, icon, isLast }: SectionCardProps) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-slate-300 transition-all duration-300 ${!isLast ? 'mb-8' : ''}`}>
    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 mt-1 text-sm leading-relaxed max-w-2xl">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0 self-start sm:self-center">{action}</div>}
      </div>
    </div>
    <div className="p-6 md:p-8">
      {children}
    </div>
  </div>
);

// --- Main Page Component ---

const BusinessSetup = () => {
  return (
    <ToastProvider>
      <DashboardLayout fullWidth>
        <div className="bg-[#FAFAFA] min-h-screen">
          <div className="w-full pt-10 pb-20 px-4 sm:px-6 lg:px-8">

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Main Content Column (Left) */}
              <div className="xl:col-span-8">
                
                {/* Section 1: Business Identity */}
                <SectionCard
                  title="Business Identity"
                  subtitle="Define who the AI represents. This information is used for greetings and caller identification."
                  icon={<Building2 size={20} />}
                >
                  <BusinessDetails />
                </SectionCard>

                {/* Section 2: Business Hours */}
                <SectionCard
                  title="Availability"
                  subtitle="Configure hours when your AI Agent is active. Outside these hours, calls can be sent to voicemail."
                  icon={<Clock size={20} />}
                >
                  <BusinessHoursSettings />
                </SectionCard>

                {/* Section 3: Services */}
                <SectionCard
                  title="Service Catalog"
                  subtitle="List your products or services. Use the AI extractor to auto-generate this list or add them manually."
                  icon={<Layers size={20} />}
                >
                  <Services />
                </SectionCard>

                {/* Section 4: Urgent Calls */}
                <SectionCard
                  title="Priority Handling"
                  subtitle="Define how AI reacts to urgent requests or keywords like 'emergency' or 'support needed now'."
                  icon={<AlertTriangle size={20} />}
                  isLast
                >
                  <UrgentCalls />
                </SectionCard>

                {/* Sticky Save Action for Mobile/Tablet */}
                <div className="lg:hidden mt-8 sticky bottom-4 z-20">
                    <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 transition-all">
                        <Save size={20} />
                        Save Configuration
                    </button>
                </div>

              </div>

              {/* Sidebar Column (Right) - Sticky */}
              <div className="xl:col-span-4 space-y-6 sticky top-6">
                
                {/* Live Preview Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       Live Preview
                    </h3>
                    <div className="p-1 bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                       <Eye size={14} />
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900 flex-1 min-h-[200px]">
                    <LivePreview />
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-mono text-center uppercase tracking-wider">
                      Simulation Mode
                    </p>
                  </div>
                </div>

                {/* Pro Tip Widget */}
                <ProTip />
                
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="mt-16 pt-8 border-t border-slate-200">
              <Footer />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ToastProvider>
  );
};

export default BusinessSetup;