import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange, onPrev, onNext }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  const formatDate = (date: Date) => {
    if (isToday) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDayClick = (day: Date) => {
    onDateChange(day);
    setShowCalendar(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  return (
    <div className="relative inline-flex items-center gap-2 bg-gray-50 rounded-xl p-1 shadow-sm border border-gray-200">
      <button 
        onClick={onPrev}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200/75 active:bg-gray-300/50 transition-all text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft size={18} />
      </button>
      
      <button onClick={() => setShowCalendar(!showCalendar)} className="px-3 min-w-[130px] text-center flex items-center gap-2">
        <Calendar size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700 tracking-wide">
          {formatDate(selectedDate)}
        </span>
      </button>

      <button 
        onClick={onNext}
        disabled={isToday}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          isToday 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'hover:bg-gray-200/75 active:bg-gray-300/50 text-gray-600 hover:text-gray-900'
        }`}
      >
        <ChevronRight size={18} />
      </button>

      {showCalendar && (
        <div ref={calendarRef} className="absolute top-full mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(day) => day && handleDayClick(day)}
            initialFocus
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;