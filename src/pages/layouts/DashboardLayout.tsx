import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  HelpCircle, 
  Settings, 
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
  PhoneCall,
  Calendar,
  Building2,
  Search,
  Zap,
  User,
  Layers,
  CreditCard,
  Command
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../context/SearchContext';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import ProfileDropdown from '../../components/dashboard/ProfileDropdown';
import { NavigationGuard } from '../../utils/navigationGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  secondaryNav?: React.ReactNode;
}

interface BusinessProfile {
  id: string;
  business_name: string;
  business_type?: string;
  phone_number?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  fullWidth = false,
  secondaryNav
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, unreadCount, dismissNotification } = useNotifications();
  const { searchQuery, setSearchQuery, setIsSearchFocused, clearSearch } = useSearch();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.id || !supabase) return;

      const cached = localStorage.getItem(`business_profile_${user.id}`);
      if (cached) {
        try {
          setBusinessProfile(JSON.parse(cached));
        } catch (e) {
          console.error('Error parsing cached profile', e);
        }
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, business_name, business_type, phone_number')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setBusinessProfile(data);
          localStorage.setItem(`business_profile_${user.id}`, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
      }
    };

    fetchBusinessProfile();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userEmail = user?.email || '';
  const displayName = businessProfile?.business_name || userEmail.split('@')[0] || 'User';
  const isActive = (path: string) => location.pathname === path;

  // --- UI COMPONENTS ---

  const SectionLabel = ({ label }: { label: string }) => (
    <h3 className={`px-5 mt-8 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
      {label}
    </h3>
  );

  const NavItem = ({ 
    item,
    isCollapsed = false
  }: { 
    item: { path: string; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string };
    isCollapsed?: boolean;
  }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        to={item.path}
        className={`group relative flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'} py-3 mx-2 rounded-xl text-sm font-bold transition-all duration-200
          ${active
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
          }`}
        onClick={() => setMobileMenuOpen(false)}
        title={isCollapsed ? item.label : undefined}
      >
        {/* Active Indicator Bar */}
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
        )}
        
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Icon size={18} strokeWidth={2} className={active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'} />
          {!isCollapsed && <span>{item.label}</span>}
        </div>
        {!isCollapsed && item.badge && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-indigo-100 text-indigo-600'}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <NavigationGuard isAuthenticated={!!user} />
      <div className="h-screen bg-slate-50/50 flex font-sans overflow-hidden">

      {/* SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-100 h-full transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        
        {/* Logo Header */}
        <div className={`h-20 flex items-center border-b border-slate-100/60 bg-white transition-all duration-300 ${sidebarOpen ? 'justify-between px-6' : 'justify-center px-2'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Icon (Using Image) */}
            <button
              onClick={() => !sidebarOpen && setSidebarOpen(true)}
              className={`flex items-center justify-center flex-shrink-0 ${!sidebarOpen ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <img src="/logo-icon1.2.png" alt="Logo" className="w-9 h-9 object-contain transition-transform hover:scale-105" />
            </button>

            {/* Text Label */}
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
              <span className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">Vocal.Scale</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Agent Platform</span>
            </div>
          </div>

          {/* Toggle Button (Only visible when open) */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronRight size={16} className="transform rotate-180" strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden scrollbar-hide">
          
          <SectionLabel label="General" />
          <NavItem 
            item={{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }} 
            isCollapsed={!sidebarOpen}
          />
          
          <SectionLabel label="Operations" />
          <NavItem 
            item={{ path: '/dashboard/appointments', label: 'Appointments', icon: Calendar }} 
            isCollapsed={!sidebarOpen}
          />
          <NavItem 
            item={{ path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall }} 
            isCollapsed={!sidebarOpen}
          />
          
          <SectionLabel label="Configuration" />
          <NavItem 
            item={{ path: '/dashboard/business-details', label: 'Business Profile', icon: Building2 }} 
            isCollapsed={!sidebarOpen}
          />
          <NavItem 
            item={{ path: '/dashboard/voice-setup', label: 'Voice Setup', icon: Layers }} 
            isCollapsed={!sidebarOpen}
          />

          <div className="mt-auto">
            <SectionLabel label="System" />
            <NavItem 
              item={{ path: '/dashboard/settings', label: 'Settings', icon: Settings }} 
              isCollapsed={!sidebarOpen}
            />
            <NavItem 
              item={{ path: '/dashboard/help', label: 'Help & Docs', icon: HelpCircle }} 
              isCollapsed={!sidebarOpen}
            />
          </div>
        </div>

        {/* Bottom Card & Upgrade */}
        <div className="p-5 border-t border-slate-100 space-y-4 bg-slate-50/30">
          {/* Promo Card */}
          {sidebarOpen && (
             <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Zap size={16} className="text-indigo-500" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Upgrade to Pro</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">Unlock unlimited AI minutes & advanced analytics.</p>
                <button className="w-full py-2 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100">
                  View Plans
                </button>
             </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center'} py-3 text-sm font-bold text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors group`}
          >
            <LogOut size={18} strokeWidth={2.5} className={sidebarOpen ? 'mr-3 group-hover:translate-x-1 transition-transform' : ''} />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        
         {/* TOP NAVIGATION BAR */}
        <header className="h-20 bg-white/95 backdrop-blur-xl border-b border-slate-100 shrink-0 z-30 px-4 md:px-8 flex items-center justify-between transition-all duration-300">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col mr-4">
            <span className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">Vocal.Scale</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI Agent Platform</span>
          </div>

          {/* Left: Search (Always visible now, responsive width) */}
          <div className="flex-1 max-w-xl flex items-center">
            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} strokeWidth={2.5} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                role="searchbox"
                aria-label="Search dashboard"
                placeholder="Search logs, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm"
              />
              {/* Keyboard shortcut hint */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 group-focus-within:opacity-0 transition-opacity">
                <Command size={10} />
                <span>K</span>
              </div>
              {/* Clear button */}
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          {/* Secondary Nav / Filters Slot */}
          {secondaryNav && (
            <div className="hidden lg:flex items-center flex-1 px-8 max-w-2xl">
              {secondaryNav}
            </div>
          )}

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2 md:gap-4 ml-4">
            
            {/* Icon Actions */}
            <div className="flex items-center gap-1 border-r border-slate-100 pr-2 md:pr-4">
              <button className="hidden sm:flex p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors relative group" aria-label="Billing">
                <CreditCard size={20} strokeWidth={2} />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Billing</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                  className={`p-2.5 rounded-xl transition-all relative outline-none group ${
                    notificationPanelOpen 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  <Bell size={20} strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                    </span>
                  )}
                </button>
                <NotificationPanel 
                  isOpen={notificationPanelOpen} 
                  onClose={() => setNotificationPanelOpen(false)} 
                  notifications={notifications}
                  onDismiss={dismissNotification}
                />
              </div>
            </div>

            {/* Profile */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
                className="flex items-center gap-2 md:gap-3 p-1 pr-2 rounded-2xl border-2 border-transparent hover:border-slate-200 hover:bg-white transition-all shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate max-w-[80px]">{userEmail}</p>
                </div>
              </button>
              <ProfileDropdown 
                isOpen={profileDropdownOpen}
                onClose={() => setProfileDropdownOpen(false)}
                onSignOut={handleSignOut}
                displayName={displayName}
                email={userEmail}
              />
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main 
          className={`flex-1 overflow-y-auto ${fullWidth ? 'p-0' : 'p-4 md:p-8'}`}
          onDoubleClick={() => {
            if (sidebarOpen) setSidebarOpen(false);
          }}
        >
          
          {children}
        </main>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <img src="/logo-icon1.2.png" alt="Logo" className="w-10 h-10 object-contain" />
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tight">Vocal.Scale</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Agent Platform</span>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              <div>
                <SectionLabel label="General" />
                <NavItem item={{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }} />
              </div>
              
              <div>
                <SectionLabel label="Operations" />
                <NavItem item={{ path: '/dashboard/appointments', label: 'Appointments', icon: Calendar }} />
                <NavItem item={{ path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall }} />
              </div>
              
              <div>
                <SectionLabel label="Configuration" />
                <NavItem item={{ path: '/dashboard/business-details', label: 'Business Profile', icon: Building2 }} />
                <NavItem item={{ path: '/dashboard/voice-setup', label: 'Voice Setup', icon: Layers }} />
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50">
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default DashboardLayout;
