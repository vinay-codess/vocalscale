import { useState, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useDashboardData } from '../../hooks/useDashboardData';
import { subDays, addDays, isToday } from 'date-fns';
import { ArrowLeft, ArrowRight, TrendingUp, Phone, Users, Clock, Sparkles, AlertCircle } from 'lucide-react';

// Import sub-components
import HeaderControls from '../../components/dashboard/HeaderControls';
import StatsGrid from '../../components/dashboard/StatsGrid';
import CallVolumeChart from '../../components/dashboard/CallVolumeChart';
import RecentTranscripts from '../../components/dashboard/RecentTranscripts';
import AppointmentSchedule from '../../components/dashboard/AppointmentSchedule';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState('7d');

  // Map timeRange string to numeric days for the API
  const daysCount = useMemo(() => {
    switch (timeRange) {
      case '24h': return 1;
      case '30d': return 30;
      default: return 7;
    }
  }, [timeRange]);

  const { loading, stats, recentCalls, appointments, chartData } = useDashboardData(selectedDate, daysCount);

  const handlePrev = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNext = () => {
    if (!isToday(selectedDate)) setSelectedDate(prev => addDays(prev, 1));
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Overview
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Real-time performance metrics for your AI agent.
            </p>
          </div>

          <div className="flex items-center gap-2">
             {/* Date Navigation Controls */}
            <button 
              onClick={handlePrev}
              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="bg-white border border-slate-200 px-6 py-2 rounded-lg shadow-sm min-w-[140px] flex justify-center items-center">
               {/* Display formatted date here or use HeaderControls component inside */}
               <span className="text-sm font-bold text-slate-900">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
               </span>
            </div>
            <button 
              onClick={handleNext}
              disabled={isToday(selectedDate)}
              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* --- Stats Grid --- */}
            <StatsGrid 
              stats={stats} 
              appointmentsCount={appointments.length} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* --- LEFT: CHART & CALLS --- */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Real Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Call Volume</h3>
                      <p className="text-sm text-slate-500 mt-1">Real-time engagement metrics</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {['24h', '7d', '30d'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                            timeRange === range
                              ? 'bg-white text-indigo-600 shadow-sm scale-100'
                              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 scale-95 hover:scale-100'
                          }`}
                        >
                          {range.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <CallVolumeChart data={chartData} />
                </div>

                {/* Real Recent Calls */}
                <RecentTranscripts calls={recentCalls} />
              </div>

              {/* --- RIGHT: REAL APPOINTMENTS --- */}
              <div className="lg:col-span-1">
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Upcoming Schedule</h3>
                          <p className="text-sm text-slate-500 mt-1">Today's appointments</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                    </div>
                    <AppointmentSchedule appointments={appointments} />
                 </div>
              </div>

            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Home;