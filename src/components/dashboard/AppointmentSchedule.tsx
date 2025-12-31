import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string | number;
  scheduled_time: string;
  customer_name: string;
  service_type: string;
}

interface AppointmentScheduleProps {
  appointments: Appointment[];
}

const AppointmentSchedule: React.FC<AppointmentScheduleProps> = ({ appointments }) => {
  const navigate = useNavigate();

  // Sort appointments by time
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  );

  const displayedAppointments = sortedAppointments.slice(0, 8);

  return (
    <div className="divide-y divide-slate-100/60">
      {appointments.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 ring-1 ring-indigo-200/30">
              <Calendar size={20} className="text-indigo-400" />
            </div>
            <div className="text-sm font-medium text-gray-900">No appointments today</div>
            <div className="text-xs text-slate-500 mt-1">Enjoy your free time!</div>
          </div>
        ) : (
          <>
            <div className="relative">
               {/* Timeline line */}
               <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100/40 z-0"></div>

               {displayedAppointments.map((appt) => {
                 const time = parseISO(appt.scheduled_time);
                 const isPast = new Date() > time;

                 return (
                     <div key={appt.id} className="relative z-10 p-5 pl-12 hover:bg-indigo-50/20 transition-all duration-200 group">
                      {/* Timeline Dot */}
                      <div className={`absolute left-[21px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm
                        ${isPast ? 'bg-slate-300' : 'bg-indigo-500 ring-2 ring-indigo-100/50'}
                      `}></div>

                     <div className="flex justify-between items-start">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`text-sm font-bold ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                             {format(time, 'h:mm a')}
                           </span>
                           {isPast && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Done</span>}
                         </div>
                         <h4 className={`font-semibold text-base ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>
                           {appt.customer_name}
                         </h4>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {appt.service_type}
                            </span>
                         </div>
                       </div>
                     </div>
                   </div>
                  );
                })}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100/60 text-center">
              <button
                onClick={() => navigate('/dashboard/appointments')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                View full schedule
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

export default AppointmentSchedule;
