import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationGuardProps {
  isAuthenticated: boolean;
}

export const NavigationGuard = ({ isAuthenticated }: NavigationGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handlePopState = (event: PopStateEvent) => {
      const currentPath = location.pathname;

      if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/dashboard/')) {
        event.preventDefault();
        window.history.pushState(null, '', currentPath);
        return false;
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, location, navigate]);

  return null;
};

export const useNavigationBlocker = (block: boolean, message?: string) => {
  useEffect(() => {
    if (!block) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message || 'Are you sure you want to leave?';
      return message || 'Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [block, message]);
};
