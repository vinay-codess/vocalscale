import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/PageLoader';
import { BusinessSetupProvider } from './context/BusinessSetupContext';

// Lazy Load Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));

// Setup Pages
const Method = lazy(() => import('./pages/setup/Method'));
const Record = lazy(() => import('./pages/setup/Record'));
const Upload = lazy(() => import('./pages/setup/Upload'));
const Processing = lazy(() => import('./pages/setup/Processing'));
const Preview = lazy(() => import('./pages/setup/Preview'));

// Landing Page
const Landing = lazy(() => import('./pages/landing/index'));

// Dashboard Pages
const DashboardHome = lazy(() => import('./pages/dashboard/Home'));
const CallLogs = lazy(() => import('./pages/dashboard/CallLogs'));
const Appointments = lazy(() => import('./pages/dashboard/Appointments'));
const HelpCenter = lazy(() => import('./pages/dashboard/HelpCenter'));
const Settings = lazy(() => import('./pages/dashboard/settings'));
const VoiceSetup = lazy(() => import('./pages/voice-setup'));
const SetupSubaccount = lazy(() => import('./pages/voice-setup/SetupSubaccount'));
const GetNewNumber = lazy(() => import('./pages/voice-setup/GetNewNumber'));
const UseExistingNumber = lazy(() => import('./pages/voice-setup/UseExistingNumber'));
const BusinessSetup = lazy(() => import('./pages/business-setup'));

import { SetupProvider } from './context/SetupContext';
import { SearchProvider } from './context/SearchContext';

function App() {
  return (
    <Router>
      <LazyMotion features={domAnimation}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

           {/* Protected Setup Routes */}
           <Route element={<ProtectedRoute />}>
            
            {/* Dashboard Routes */}
            <Route element={
              <BusinessSetupProvider>
                <SearchProvider>
                  <Outlet />
                </SearchProvider>
              </BusinessSetupProvider>
            }>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/calls" element={<CallLogs />} />
              <Route path="/dashboard/calls/:callId" element={<CallLogs />} />
              <Route path="/dashboard/appointments" element={<Appointments />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/help" element={<HelpCenter />} />
              <Route path="/dashboard/voice-setup" element={<VoiceSetup />} />
              <Route path="/dashboard/voice-setup/setup-subaccount" element={<SetupSubaccount />} />
              <Route path="/dashboard/voice-setup/buy" element={<GetNewNumber />} />
              <Route path="/dashboard/voice-setup/existing" element={<UseExistingNumber />} />
              <Route path="/dashboard/business-details" element={<BusinessSetup />} />

              {/* Voice Model Setup Routes (Moved inside Dashboard) */}
              <Route path="/dashboard/voice-model/*" element={
                <SetupProvider>
                  <Routes>
                    <Route path="method" element={<Method />} />
                    <Route path="record" element={<Record />} />
                    <Route path="upload" element={<Upload />} /> 
                    <Route path="processing" element={<Processing />} />
                    <Route path="preview" element={<Preview />} />
                  </Routes>
                </SetupProvider>
              } />
            </Route>
          </Route>
        </Routes>
        </Suspense>
      </LazyMotion>
    </Router>
  );
}

export default App;
