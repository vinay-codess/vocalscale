import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { useToast } from '../../../context/ToastContext';

export const Footer = () => {
  const { state, actions } = useBusinessSetup();
  const { saving, isDirty } = state;
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!isDirty) return; // Don't save if no changes
    
    const success = await actions.saveData();
    if (success) {
      showToast('Changes saved successfully!', 'success');
    } else if (state.error) {
      showToast(state.error, 'error');
    }
  };

  const buttonText = saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved';
  const buttonColor = saving ? 'bg-gray-400' : isDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600';

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        {state.error && (
          <div className="text-red-600 text-sm">
            <span className="inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {state.error}
            </span>
          </div>
        )}
        
        {!saving && !state.error && (
          <div className={`text-sm ${isDirty ? 'text-amber-600' : 'text-green-600'}`}>
            <span className="inline-flex items-center">
              {isDirty ? (
                <>
                  <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Unsaved changes
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  All changes saved
                </>
              )}
            </span>
          </div>
        )}
      </div>

       <button
        id="save-button"
        onClick={handleSave}
        disabled={saving || !isDirty}
        className={`${buttonColor} text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ${
          saving || !isDirty ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};
