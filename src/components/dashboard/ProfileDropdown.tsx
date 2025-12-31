
import React from 'react';
import { Link } from 'react-router-dom';
import { User, CreditCard, LogOut } from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  displayName: string;
  email: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onSignOut,
  displayName,
  email,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-14 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      onClick={onClose}
    >
      <div className="p-4 border-b border-gray-100">
        <p className="font-semibold text-gray-800">{displayName}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <div className="py-2">
        <Link
          to="/dashboard/settings"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <User size={16} className="mr-3" />
          Profile
        </Link>
        <Link
          to="/dashboard/billing"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <CreditCard size={16} className="mr-3" />
          Billing
        </Link>
      </div>
      <div className="border-t border-gray-100 py-2">
        <button
          onClick={onSignOut}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} className="mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
