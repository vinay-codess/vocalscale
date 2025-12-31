import React, { useState, useMemo, useCallback } from 'react';
import { useAppointments, type Appointment } from '../../../hooks/useAppointments';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useSearch } from '../../../context/SearchContext';
import { 
  format, addDays, startOfWeek, isSameDay, 
  getHours, getMinutes, setHours, setMinutes, addMinutes 
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, Moon, Sun, 
  X, Calendar, Eye, EyeOff, Maximize2, Minimize2,
  User, Phone, MapPin, GripVertical, Settings,
  ToggleLeft, ToggleRight, Layers, Filter, FileText, Globe
} from 'lucide-react';

// ============ TYPES ============
interface DragState {
  isDragging: boolean;
  appointmentId: string | null;
  originalStart: Date | null;
  currentDropTarget: { day: Date; hour: number; minute: number } | null;
}

type TimeFormat = '12h' | '24h';
type ViewDensity = 'compact' | 'comfortable' | 'spacious';

// ============ MAIN COMPONENT ============
const FullScreenAppointments: React.FC = () => {
  const { appointments, loading, error, updateAppointment, createAppointment } = useAppointments();
  const { searchQuery } = useSearch();
  
  // View State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [show24Hours, setShow24Hours] = useState(false);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Timezone State
  const defaultTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [timezone, setTimezone] = useState(defaultTimezone);
  
  const timeZones = useMemo(() => {
    const supported = [
      defaultTimezone,
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Asia/Dubai',
      'Asia/Kolkata'
    ];
    return Array.from(new Set(supported)); // Remove duplicates
  }, [defaultTimezone]);

  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const [density, setDensity] = useState<ViewDensity>('compact');
  const [showWeekend, setShowWeekend] = useState(true);

  // New Appointment State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    customer_name: '',
    start_time: '',
    type: 'Consultation',
    status: 'Pending' as const,
    notes: ''
  });
  
  // Drag State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    appointmentId: null,
    originalStart: null,
    currentDropTarget: null
  });

  // Time Configuration
  const START_HOUR = show24Hours ? 0 : 6;
  const END_HOUR = show24Hours ? 24 : 22;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  // Calculate visible days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    return showWeekend ? days : days.slice(0, 5);
  }, [weekStart, showWeekend]);

  const hours = useMemo(() => 
    Array.from({ length: TOTAL_HOURS }).map((_, i) => START_HOUR + i),
    [START_HOUR, TOTAL_HOURS]
  );

  // ============ HELPER FUNCTIONS ============
  const getZonedTime = useCallback((dateStr: string) => {
    try {
      if (!dateStr) return new Date();
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return new Date();
      
      // Use Intl to get the components in the target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const partValues: Record<string, string> = {};
      parts.forEach(part => {
        partValues[part.type] = part.value;
      });
      
      return new Date(
        parseInt(partValues.year),
        parseInt(partValues.month) - 1,
        parseInt(partValues.day),
        parseInt(partValues.hour),
        parseInt(partValues.minute),
        parseInt(partValues.second)
      );
    } catch (e) {
      console.error('Error in getZonedTime:', e);
      return new Date(dateStr);
    }
  }, [timezone]);

  const formatHour = useCallback((hour: number): string => {
    if (timeFormat === '24h') {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  }, [timeFormat]);

  const formatTime = useCallback((date: Date): string => {
    if (timeFormat === '24h') {
      return format(date, 'HH:mm');
    }
    return format(date, 'h:mm a');
  }, [timeFormat]);

  const getDayAppointments = useCallback((day: Date): Appointment[] => {
    return appointments.filter(appt => {
      const matchesDay = isSameDay(getZonedTime(appt.start_time), day);
      if (!matchesDay) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          appt.customer_name?.toLowerCase().includes(query) ||
          appt.notes?.toLowerCase().includes(query) ||
          appt.type?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [appointments, getZonedTime, searchQuery]);

  // Check if appointment is in night hours (before 6 AM or after 10 PM)
  const isNightAppointment = (appt: Appointment): boolean => {
    const hour = getHours(getZonedTime(appt.start_time));
    return hour < 6 || hour >= 22;
  };

  const nightAppointmentsCount = useMemo(() => {
    return appointments.filter(isNightAppointment).length;
  }, [appointments]);

  // Calculate appointment position with overlap handling
  const getAppointmentPosition = (appt: Appointment, dayAppts: Appointment[]) => {
    const start = getZonedTime(appt.start_time);
    const end = getZonedTime(appt.end_time);
    
    const startHour = getHours(start) + getMinutes(start) / 60;
    const endHour = getHours(end) + getMinutes(end) / 60;
    
    // Clamp to visible range
    const visibleStart = Math.max(startHour, START_HOUR);
    const visibleEnd = Math.min(endHour, END_HOUR);
    
    const top = ((visibleStart - START_HOUR) / TOTAL_HOURS) * 100;
    const height = ((visibleEnd - visibleStart) / TOTAL_HOURS) * 100;
    
    // Find overlapping appointments
    const overlapping = dayAppts.filter(other => {
      if (other.id === appt.id) return false;
      const otherStart = getZonedTime(other.start_time);
      const otherEnd = getZonedTime(other.end_time);
      return start < otherEnd && end > otherStart;
    });
    
    // Sort for consistent column assignment
    const sortedGroup = [...overlapping, appt].sort((a, b) => {
      const aStart = getZonedTime(a.start_time).getTime();
      const bStart = getZonedTime(b.start_time).getTime();
      if (aStart !== bStart) return aStart - bStart;
      return a.id.localeCompare(b.id);
    });
    
    const columnIndex = sortedGroup.findIndex(a => a.id === appt.id);
    const totalColumns = sortedGroup.length;
    
    // Calculate width and position with gaps
    const gap = 2; // pixels
    const availableWidth = 100;
    const columnWidth = availableWidth / totalColumns;
    const left = columnIndex * columnWidth;
    
    return {
      top: `${Math.max(0, top)}%`,
      height: `${Math.max(2, height)}%`,
      left: `calc(${left}% + ${gap}px)`,
      width: `calc(${columnWidth}% - ${gap * 2}px)`,
      rawTop: top,
      rawHeight: height,
      isPartiallyVisible: startHour < START_HOUR || endHour > END_HOUR,
      isBeforeVisible: startHour < START_HOUR,
      isAfterVisible: endHour > END_HOUR
    };
  };

  // ============ DRAG & DROP ============
  const handleDragStart = (e: React.DragEvent, appt: Appointment) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appt.id);
    
    // Custom drag image
    const ghost = document.createElement('div');
    ghost.className = 'bg-blue-600 text-white px-3 py-2 rounded-lg shadow-xl text-sm font-medium';
    ghost.innerHTML = `<span class="font-bold">${appt.customer_name}</span><br/><span class="text-xs opacity-80">${formatTime(getZonedTime(appt.start_time))}</span>`;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 50, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
    
    setDragState({
      isDragging: true,
      appointmentId: appt.id,
      originalStart: getZonedTime(appt.start_time),
      currentDropTarget: null
    });
  };

  const handleDragOver = (e: React.DragEvent, day: Date, hour: number, minute: number = 0) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        currentDropTarget: { day, hour, minute }
      }));
    }
  };

  const handleDrop = async (e: React.DragEvent, day: Date, hour: number, minute: number = 0) => {
    e.preventDefault();
    
    const appointmentId = e.dataTransfer.getData('text/plain');
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment || !updateAppointment) return;
    
    const originalStart = getZonedTime(appointment.start_time);
    const originalEnd = getZonedTime(appointment.end_time);
    const durationMinutes = (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60);
    
    // Snap to 15-minute intervals
    const snappedMinute = Math.round(minute / 15) * 15;
    
    let newStart = setHours(day, hour);
    newStart = setMinutes(newStart, snappedMinute);
    const newEnd = addMinutes(newStart, durationMinutes);
    
    try {
      await updateAppointment(appointmentId, {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString()
      });
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
    
    setDragState({
      isDragging: false,
      appointmentId: null,
      originalStart: null,
      currentDropTarget: null
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      appointmentId: null,
      originalStart: null,
      currentDropTarget: null
    });
  };

  // ============ FULLSCREEN ============
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ============ STATUS COLORS ============
  const getAppointmentColors = (appt: Appointment) => {
    const isNight = isNightAppointment(appt);

    if (appt.status === 'Canceled') {
      return {
        bg: 'bg-gray-400',
        hover: 'hover:bg-gray-500',
        border: 'border-gray-500',
        text: 'text-white',
        dot: 'bg-gray-500'
      };
    }
    
    // Status-based colors
    if (appt.status === 'Pending') {
      return {
        bg: isNight ? 'bg-amber-600' : 'bg-amber-500',
        hover: 'hover:bg-amber-600',
        border: 'border-amber-700',
        text: 'text-white',
        dot: 'bg-amber-500'
      };
    }
    
    if (appt.status === 'Scheduled' || appt.status === 'Confirmed') {
      return {
        bg: isNight ? 'bg-indigo-700' : 'bg-indigo-600',
        hover: 'hover:bg-indigo-700',
        border: 'border-indigo-800',
        text: 'text-white',
        dot: 'bg-indigo-600'
      };
    }

    // Type-based fallback colors
    if (appt.type === 'Strategy') {
      return {
        bg: isNight ? 'bg-purple-700' : 'bg-purple-500',
        hover: 'hover:bg-purple-600',
        border: 'border-purple-600',
        text: 'text-white',
        dot: 'bg-purple-500'
      };
    }
    if (appt.type === 'Consultation') {
      return {
        bg: isNight ? 'bg-emerald-700' : 'bg-emerald-500',
        hover: 'hover:bg-emerald-600',
        border: 'border-emerald-600',
        text: 'text-white',
        dot: 'bg-emerald-500'
      };
    }
    
    // Default fallback
    return {
      bg: isNight ? 'bg-blue-700' : 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      border: 'border-blue-800',
      text: 'text-white',
      dot: 'bg-blue-600'
    };
  };

  // Height based on density
  const getRowHeight = () => {
    switch (density) {
      case 'compact': return 'h-8';
      case 'comfortable': return 'h-12';
      case 'spacious': return 'h-16';
    }
  };

  const selectedApptData = appointments.find(a => a.id === selectedAppointment);
  const todayAppts = getDayAppointments(new Date());

  // ============ EDIT HANDLERS ============
  const handleStartEdit = () => {
    if (selectedApptData) {
      setEditForm(selectedApptData);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedAppointment || !updateAppointment) return;
    try {
      await updateAppointment(selectedAppointment, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setIsEditing(false);
    setEditForm({});
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newAppointmentData.start_time || !newAppointmentData.customer_name) {
        alert('Please fill in all required fields');
        return;
      }

      await createAppointment({
        ...newAppointmentData,
        start_time: new Date(newAppointmentData.start_time).toISOString(),
        end_time: addMinutes(new Date(newAppointmentData.start_time), 60).toISOString(),
        title: newAppointmentData.type,
      });
      setIsNewModalOpen(false);
      setNewAppointmentData({
        customer_name: '',
        start_time: '',
        type: 'Consultation',
        status: 'Pending',
        notes: ''
      });
    } catch (err) {
      console.error('Failed to create appointment', err);
      alert('Failed to create appointment');
    }
  };

  if (loading) {
    return (
      <DashboardLayout fullWidth>
        <div className="h-full bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">Loading appointments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout fullWidth>
        <div className="h-full bg-white flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load appointments</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout fullWidth>
      <div className="h-full flex flex-col overflow-hidden">
      
        {/* ============ HEADER ============ */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center justify-between w-full md:w-auto">
          
          {/* Left: Title (Logo Removed) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
                <p className="text-xs text-gray-500">{format(currentDate, 'MMMM yyyy')}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-gray-200">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-gray-600">Today:</span>
                <span className="text-sm font-bold text-gray-900">{todayAppts.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-gray-600">Pending:</span>
                <span className="text-sm font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'Pending').length}
                </span>
              </div>
              {nightAppointmentsCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
                  <Moon className="w-3 h-3 text-indigo-500" />
                  <span className="text-xs font-medium text-gray-600">Night:</span>
                  <span className="text-sm font-bold text-gray-900">{nightAppointmentsCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Controls Wrapper */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          {/* Navigation */}
          <div className="flex items-center gap-2 self-center md:self-auto">
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Today
            </button>
            <div className="flex items-center bg-gray-100 rounded-lg">
              <button 
                onClick={() => setCurrentDate(d => addDays(d, -7))} 
                className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-3 text-sm font-medium text-gray-900 min-w-[140px] sm:min-w-[180px] text-center">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <button 
                onClick={() => setCurrentDate(d => addDays(d, 7))} 
                className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            
            {/* Timezone Selector */}
            <div className="flex items-center justify-center w-12 h-10 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors relative group">
              <Globe className="w-5 h-5" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Select Timezone"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* 24-Hour Toggle */}
            <button
              onClick={() => setShow24Hours(!show24Hours)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                show24Hours 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={show24Hours ? 'Switch to 12h' : 'Switch to 24h'}
            >
              {show24Hours ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Time Format Toggle */}
            <button
              onClick={() => setTimeFormat(f => f === '12h' ? '24h' : '12h')}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title={`Format: ${timeFormat === '12h' ? '12h' : '24h'}`}
            >
              <Clock className="w-5 h-5" />
            </button>

            {/* Weekend Toggle */}
            <button
              onClick={() => setShowWeekend(!showWeekend)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                showWeekend 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-orange-100 text-orange-700 border border-orange-200'
              }`}
              title={showWeekend ? 'Hide Weekends' : 'Show Weekends'}
            >
              <Layers className="w-5 h-5" />
            </button>

            {/* Add New */}
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/25"
              title="New Appointment"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

        {/* ============ CALENDAR GRID ============ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Days Header */}
        <div
          className="flex-shrink-0 grid border-b-2 border-gray-200 bg-gray-50"
          style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}
        >
          <div className="border-r border-gray-200 flex items-center justify-center py-2">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const dayAppts = getDayAppointments(day);
            const hasNightAppts = dayAppts.some(isNightAppointment);
            
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center py-2 border-r border-gray-200 transition-colors ${
                  isToday ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isToday ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {format(day, 'EEE')}
                  </span>
                  {hasNightAppts && !show24Hours && (
                    <Moon className="w-3 h-3 text-indigo-400" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-lg font-bold ${
                    isToday 
                      ? 'text-white bg-blue-600 w-8 h-8 flex items-center justify-center rounded-full' 
                      : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayAppts.length > 0 && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {dayAppts.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid - Scrollable */}
        <div 
          className="flex-1 grid overflow-y-auto"
          style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}
        >
          
          {/* Time Column */}
          <div className="border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
            {hours.map((hour) => {
              const isNightHour = hour < 6 || hour >= 22;
              return (
                <div 
                  key={hour} 
                  className={`${getRowHeight()} flex items-start justify-end pr-2 pt-0.5 border-b border-gray-100 ${
                    isNightHour ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <span className={`text-[10px] font-semibold ${
                    isNightHour ? 'text-indigo-400' : 'text-gray-400'
                  }`}>
                    {formatHour(hour)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => {
            const dayAppts = getDayAppointments(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={dayIndex} 
                className={`border-r border-gray-200 relative ${
                  isToday ? 'bg-blue-50/20' : ''
                }`}
              >
                {/* Hour Rows */}
                {hours.map((hour) => {
                  const isNightHour = hour < 6 || hour >= 22;
                  const isDropTarget = dragState.currentDropTarget?.day && 
                    isSameDay(dragState.currentDropTarget.day, day) && 
                    dragState.currentDropTarget.hour === hour;
                  
                  return (
                    <div 
                      key={hour}
                      className={`${getRowHeight()} border-b border-gray-100 transition-colors ${
                        isNightHour ? 'bg-indigo-50/30' : ''
                      } ${isDropTarget ? 'bg-blue-100 border-blue-300' : ''} ${
                        dragState.isDragging ? 'cursor-copy' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, day, hour, 0)}
                      onDrop={(e) => handleDrop(e, day, hour, 0)}
                    >
                      {/* 15-minute slots for precise drop */}
                      {dragState.isDragging && (
                        <div className="h-full grid grid-rows-4">
                          {[0, 15, 30, 45].map(minute => {
                            const isSlotTarget = isDropTarget && 
                              dragState.currentDropTarget?.minute === minute;
                            return (
                              <div 
                                key={minute}
                                className={`transition-colors ${
                                  isSlotTarget ? 'bg-blue-200' : 'hover:bg-blue-50'
                                }`}
                                onDragOver={(e) => handleDragOver(e, day, hour, minute)}
                                onDrop={(e) => handleDrop(e, day, hour, minute)}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Current Time Line */}
                {isToday && (() => {
                  const now = new Date();
                  const currentHour = getHours(now) + getMinutes(now) / 60;
                  if (currentHour >= START_HOUR && currentHour <= END_HOUR) {
                    const topPercent = ((currentHour - START_HOUR) / TOTAL_HOURS) * 100;
                    return (
                      <div 
                        className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                        style={{ top: `${topPercent}%` }}
                      >
                        <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 ring-2 ring-white shadow-lg animate-pulse" />
                        <div className="h-0.5 bg-red-500 flex-1" />
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Appointments */}
                {dayAppts.map(appt => {
                  const pos = getAppointmentPosition(appt, dayAppts);
                  const isSelected = selectedAppointment === appt.id;
                  const isDragging = dragState.appointmentId === appt.id;
                  const colors = getAppointmentColors(appt);
                  const isNight = isNightAppointment(appt);

                  return (
                    <div 
                      key={appt.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, appt)}
                      onDragEnd={handleDragEnd}
                      className={`absolute ${colors.bg} ${colors.hover} ${colors.text} 
                        rounded-md shadow-sm cursor-grab active:cursor-grabbing 
                        transition-all group overflow-hidden border-l-4 ${colors.border}
                        hover:shadow-lg hover:z-30
                        ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400 z-40 scale-[1.02]' : 'z-20'}
                        ${isDragging ? 'opacity-40 scale-95' : ''}
                        ${appt.status === 'Canceled' ? 'opacity-50' : ''}`}
                      style={{
                        top: pos.top,
                        height: pos.height,
                        left: pos.left,
                        width: pos.width,
                        minHeight: '20px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          handleCloseModal();
                        } else {
                          setSelectedAppointment(appt.id);
                          setIsEditing(false);
                        }
                      }}
                    >
                      {/* Night Indicator */}
                      {isNight && (
                        <div className="absolute top-1 right-1">
                          <Moon className="w-3 h-3 text-white/60" />
                        </div>
                      )}
                      
                      {/* Drag Handle */}
                      <div className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-70 transition-opacity cursor-grab">
                        <GripVertical className="w-3 h-3" />
                      </div>
                      
                      {/* Partial visibility indicators */}
                      {pos.isBeforeVisible && (
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/50 rounded-full" />
                      )}
                      {pos.isAfterVisible && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/50 rounded-full" />
                      )}

                      <div className="px-1.5 py-1 h-full flex flex-col justify-start">
                        <p className="font-semibold truncate text-[11px] leading-tight">
                          {appt.customer_name}
                        </p>
                        {pos.rawHeight > 5 && (
                          <p className="text-[9px] opacity-80 mt-0.5 truncate">
                            {formatTime(getZonedTime(appt.start_time))}
                          </p>
                        )}
                        {pos.rawHeight > 8 && (
                          <p className="text-[9px] opacity-70 truncate">
                            {appt.title}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ APPOINTMENT DETAIL MODAL ============ */}
      {selectedAppointment && selectedApptData && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={handleCloseModal}
          />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              bg-white rounded-2xl shadow-2xl border border-gray-200 z-[101] 
              w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-5 ${getAppointmentColors(selectedApptData).bg}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {isNightAppointment(selectedApptData) && (
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Moon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full">
                    {selectedApptData.status}
                  </span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {isEditing ? (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    value={editForm.customer_name || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Customer Name"
                  />
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Service Type / Title"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mt-4">{selectedApptData.customer_name}</h2>
                  <p className="text-white/80 mt-1">{selectedApptData.title}</p>
                </>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</p>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <input
                        type="datetime-local"
                        value={editForm.start_time ? format(getZonedTime(editForm.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={e => setEditForm(prev => ({ ...prev, start_time: new Date(e.target.value).toISOString() }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={editForm.end_time ? format(getZonedTime(editForm.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={e => setEditForm(prev => ({ ...prev, end_time: new Date(e.target.value).toISOString() }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {format(getZonedTime(selectedApptData.start_time), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {formatTime(getZonedTime(selectedApptData.start_time))} - {formatTime(getZonedTime(selectedApptData.end_time))}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {(selectedApptData.location || isEditing) && (
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="Location"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">{selectedApptData.location || 'Online'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Field */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
                  {isEditing ? (
                    <textarea
                      value={editForm.notes || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="Add notes..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedApptData.notes || 'No notes'}
                    </p>
                  )}
                </div>
              </div>

              {(selectedApptData.phone || isEditing) && (
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-100 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="Phone Number"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">{selectedApptData.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-medium border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleStartEdit}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-medium border border-gray-200 transition-colors">
                    Reschedule
                  </button>
                  <button className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 rounded-xl font-medium border border-gray-200 hover:border-red-200 transition-colors">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============ NEW APPOINTMENT MODAL ============ */}
      {isNewModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={() => setIsNewModalOpen(false)}
          />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              bg-white rounded-2xl shadow-2xl border border-gray-200 z-[101] 
              w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-blue-600">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-white">New Appointment</h2>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={newAppointmentData.customer_name}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newAppointmentData.start_time}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Type
                </label>
                <select
                  value={newAppointmentData.type}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Demo">Demo</option>
                  <option value="Review">Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Notes
                </label>
                <textarea
                  value={newAppointmentData.notes}
                  onChange={e => setNewAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Add any notes..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Create Appointment
                </button>
                <button 
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-medium border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ============ LEGEND ============ */}
      <footer className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500 font-medium">Legend:</span>
            {[
              { color: 'bg-blue-500', label: 'Confirmed' },
              { color: 'bg-amber-500', label: 'Pending' },
              { color: 'bg-purple-500', label: 'Strategy' },
              { color: 'bg-emerald-500', label: 'Consultation' },
              { color: 'bg-gray-400', label: 'Canceled' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-gray-600">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300">
              <Moon className="w-3 h-3 text-indigo-400" />
              <span className="text-gray-600">Night Appointment</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Drag appointments to reschedule • Click to view details
          </div>
        </div>
      </footer>
      </div>
    </DashboardLayout>
  );
};

export default FullScreenAppointments;