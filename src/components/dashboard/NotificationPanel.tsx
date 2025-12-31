import React, { useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Check, 
  CheckCheck,
  Calendar, 
  AlertTriangle, 
  Bell,
  BellOff,
  Clock,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import type { NotificationCall } from '../../hooks/useNotifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationCall[];
  onDismiss: (id: string) => void;
  onDismissAll?: () => void;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
}

// Helper function to format date groups
const formatDateGroup = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

// Group notifications by date
const groupByDate = (notifications: NotificationCall[]) => {
  return notifications.reduce((groups, notif) => {
    const dateKey = format(parseISO(notif.created_at), 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notif);
    return groups;
  }, {} as Record<string, NotificationCall[]>);
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onDismiss,
  onDismissAll,
  onSelect,
  isLoading = false
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSelect = useCallback((id: string) => {
    onSelect?.(id);
    onClose();
  }, [onSelect, onClose]);

  if (!isOpen) return null;

  const groupedNotifications = groupByDate(notifications);
  const dateGroups = Object.keys(groupedNotifications).sort().reverse();

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="
          fixed md:absolute 
          inset-x-4 md:inset-x-auto md:right-0 
          top-20 md:top-12
          md:w-[420px] 
          bg-white 
          rounded-2xl 
          shadow-2xl 
          border border-gray-200
          z-50 
          overflow-hidden 
          flex flex-col 
          max-h-[calc(100vh-120px)] md:max-h-[70vh]
          animate-in fade-in slide-in-from-top-2 duration-200
        "
      >
        {/* ═══════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════ */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Bell className="text-blue-600" size={18} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  Notifications
                </h2>
                <p className="text-xs text-gray-500">
                  {notifications.length === 0 
                    ? 'No new notifications' 
                    : `${notifications.length} unread`
                  }
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {notifications.length > 0 && onDismissAll && (
                <button 
                  onClick={onDismissAll}
                  className="
                    flex items-center gap-1.5 
                    text-xs font-medium 
                    text-gray-500 hover:text-blue-600 
                    px-3 py-1.5 
                    rounded-lg 
                    hover:bg-blue-50 
                    transition-all
                  "
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              )}
              <button 
                onClick={onClose}
                className="
                  p-2 
                  text-gray-400 hover:text-gray-600 
                  hover:bg-gray-100 
                  rounded-xl 
                  transition-all
                "
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CONTENT
        ═══════════════════════════════════════════════════════════ */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 mt-3">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full mb-4">
                <BellOff className="text-green-500" size={36} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                All caught up!
              </h3>
              <p className="text-sm text-gray-500 mt-1 text-center max-w-[200px]">
                You have no new notifications at the moment
              </p>
            </div>
          ) : (
            /* Notification List */
            <div className="p-3">
              {dateGroups.map((dateKey) => (
                <div key={dateKey} className="mb-4 last:mb-0">
                  {/* Date Group Header */}
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {formatDateGroup(groupedNotifications[dateKey][0].created_at)}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Notifications in Group */}
                  <div className="space-y-2">
                    {groupedNotifications[dateKey].map((notif) => (
                      <NotificationCard
                        key={notif.id}
                        notification={notif}
                        onSelect={handleSelect}
                        onDismiss={onDismiss}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FOOTER (Optional)
        ═══════════════════════════════════════════════════════════ */}
        {notifications.length > 5 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/80">
            <button className="
              w-full 
              text-center 
              text-sm font-medium 
              text-blue-600 hover:text-blue-700 
              py-2 
              rounded-lg 
              hover:bg-blue-50 
              transition-all
            ">
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   NOTIFICATION CARD COMPONENT
═══════════════════════════════════════════════════════════════════════ */

interface NotificationCardProps {
  notification: NotificationCall;
  onSelect: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = React.memo(({ 
  notification, 
  onSelect, 
  onDismiss 
}) => {
  const isBooking = notification.category === 'Booking';

  return (
    <div 
      onClick={() => onSelect(notification.id)}
      className="
        group 
        relative 
        bg-white 
        border border-gray-100 
        rounded-xl 
        p-4 
        hover:border-blue-200 
        hover:shadow-lg 
        hover:shadow-blue-500/5
        transition-all 
        duration-200 
        cursor-pointer
        active:scale-[0.99]
      "
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`
          shrink-0 
          w-11 h-11 
          rounded-xl 
          flex items-center justify-center
          transition-transform group-hover:scale-105
          ${isBooking 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600' 
            : 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600'
          }
        `}>
          {isBooking ? <Calendar size={20} /> : <AlertTriangle size={20} />}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {isBooking ? 'New Booking' : 'Action Req'}
                </h4>
                <span className={`
                  text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                  ${isBooking 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                  }
                `}>
                  {notification.category}
                </span>
              </div>
              <p className="text-sm text-gray-700 font-medium mt-0.5">
                {notification.caller_name}
              </p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-gray-400 shrink-0">
              <Clock size={12} />
              <span className="text-[11px] font-medium">
                {format(parseISO(notification.created_at), 'h:mm a')}
              </span>
            </div>
          </div>
          
          {/* Phone */}
          <p className="text-xs text-gray-500 mt-1">
            📞 {notification.caller_phone}
          </p>
          
          {/* Notes */}
          {(notification.notes || notification.summary) && (
            <div className="
              mt-3 
              p-3 
              bg-gray-50 
              rounded-lg 
              border border-gray-100
            ">
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                {notification.notes || notification.summary}
              </p>
            </div>
          )}

          {/* View Details Link */}
          <div className="
            flex items-center gap-1 
            mt-3 
            text-xs font-medium 
            text-blue-600 
            opacity-0 group-hover:opacity-100
            transition-opacity
          ">
            <span>View details</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Dismiss Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className="
            absolute 
            top-3 right-3 
            p-2 
            rounded-lg 
            bg-white 
            border border-gray-200 
            text-gray-400 
            hover:text-green-600 
            hover:border-green-300 
            hover:bg-green-50 
            shadow-sm 
            opacity-0 group-hover:opacity-100
            transition-all
            hover:scale-110
          "
          aria-label="Mark as handled"
          title="Mark as handled"
        >
          <Check size={14} />
        </button>
      </div>
    </div>
  );
});

NotificationCard.displayName = 'NotificationCard';

export default NotificationPanel;