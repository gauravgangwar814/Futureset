import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { RegistrationView } from './components/RegistrationView';
import { PaymentView } from './components/PaymentView';
import { LoginView } from './components/LoginView';
import { ProfileInitialView } from './components/ProfileInitialView';
import { MyProfileView } from './components/MyProfileView';
import { CoursesView } from './components/CoursesView';
import { AffiliateDashboardView } from './components/AffiliateDashboardView';
import { AffiliateLinkView } from './components/AffiliateLinkView';
import { KYCView } from './components/KYCView';
import { WithdrawalView } from './components/WithdrawalView';
import { UpgradePackageView } from './components/UpgradePackageView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminDashboardView } from './components/AdminDashboardView';

const MainAppContent: React.FC = () => {
  const { activeView, isAdminAuthenticated } = useApp();

  const isAdminRoute = activeView === 'admin_login' || activeView === 'admin_dashboard';

  const renderCurrentView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'checkout_registration':
        return <RegistrationView />;
      case 'checkout_payment':
        return <PaymentView />;
      case 'login':
        return <LoginView />;
      case 'profile_initial':
        return <ProfileInitialView />;
      case 'profile_edit':
        return <MyProfileView />;
      case 'courses':
        return <CoursesView />;
      case 'affiliate_dashboard':
        return <AffiliateDashboardView />;
      case 'affiliate_link':
        return <AffiliateLinkView />;
      case 'upgrade_package':
        return <UpgradePackageView />;
      case 'kyc':
        return <KYCView />;
      case 'withdrawal':
        return <WithdrawalView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'admin_login':
        return <AdminLoginView />;
      case 'admin_dashboard':
        return isAdminAuthenticated ? <AdminDashboardView /> : <AdminLoginView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar with Logo & 3-line Menu (Only on normal website views, completely isolated from Admin Panel) */}
      {!isAdminRoute && <Navbar />}

      {/* Main Active Screen */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

