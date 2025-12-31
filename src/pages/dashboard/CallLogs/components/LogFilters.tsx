import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, RefreshCcw } from 'lucide-react';

interface LogFiltersProps {
  filters: {
    search: string;
    status: string;
    type: string;
    dateRange: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

// Helper for the active styling of chips
const getChipStyle = (isActive: boolean) => 
  `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
    isActive 
      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/30'
  }`;

const LogFilters: React.FC<LogFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange('search', localSearch);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [localSearch, onFilterChange, filters.search]);

  // Sync local search with external changes (like Reset)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Helper to handle toggling chips (All vs Specific)
  const handleChipClick = (category: 'status' | 'type', value: string) => {
    if (filters[category] === value) {
      onFilterChange(category, 'All');
    } else {
      onFilterChange(category, value);
    }
  };

  const activeFiltersCount = [
    filters.status !== 'All',
    filters.type !== 'All',
    filters.dateRange !== '7d',
    !!filters.search
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 space-y-4">
      
      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        
        {/* Search Bar - Fixed Width */}
        <div className="relative w-full lg:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 h-4 w-4 transition-colors" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
          />
          {localSearch && (
             <button 
               onClick={() => setLocalSearch('')}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-1 transition-all"
             >
               <X size={14} />
             </button>
          )}
        </div>

        {/* Category Filters - Moved to Right */}
        <div className="flex flex-col xl:flex-row flex-1 gap-4 xl:items-center">
          {/* Call Type Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Category</span>
            {['All', 'Booking', 'Inquiry', 'Urgent', 'General'].map((type) => (
              <button
                key={type}
                onClick={() => handleChipClick('type', type)}
                className={getChipStyle(filters.type === type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range & Reset */}
        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="relative w-full lg:w-44 group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={12} className="text-gray-400 group-focus-within:text-indigo-500" />
             </div>
             <select 
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              className="w-full pl-8 pr-8 py-2.5 bg-gray-50/50 border border-gray-200 text-gray-700 text-xs rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white appearance-none cursor-pointer hover:border-gray-300 transition-all font-semibold"
            >
              <option value="Today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown size={14} />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button 
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <RefreshCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogFilters;