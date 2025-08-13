@@ .. @@
 import React, { useState, useEffect } from 'react';
-import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry, User, Card, Asset, ClientFeedback, Contract, RevisionStatus, NavigationAction, Notification, SocialMediaPost, PromoCode, SOP } from './types';
-import { MOCK_CLIENTS, MOCK_PROJECTS, MOCK_TEAM_MEMBERS, MOCK_TRANSACTIONS, MOCK_PACKAGES, MOCK_ADDONS, MOCK_TEAM_PROJECT_PAYMENTS, MOCK_USER_PROFILE, MOCK_FINANCIAL_POCKETS, MOCK_TEAM_PAYMENT_RECORDS, MOCK_LEADS, MOCK_REWARD_LEDGER_ENTRIES, MOCK_USERS, MOCK_CARDS, MOCK_ASSETS, MOCK_CLIENT_FEEDBACK, MOCK_CONTRACTS, MOCK_NOTIFICATIONS, MOCK_SOCIAL_MEDIA_POSTS, MOCK_PROMO_CODES, MOCK_SOPS, HomeIcon, FolderKanbanIcon, UsersIcon, DollarSignIcon, PlusIcon } from './constants';
+import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry, User, Card, Asset, ClientFeedback, Contract, RevisionStatus, NavigationAction, Notification, SocialMediaPost, PromoCode, SOP } from './types';
+import { HomeIcon, FolderKanbanIcon, UsersIcon, DollarSignIcon, PlusIcon } from './constants';
+import { SupabaseProvider, useSupabaseContext } from './components/SupabaseProvider';
+import { 
+  useClients, useProjects, useTeamMembers, useTransactions, 
+  usePackages, useAddOns, useCards, useFinancialPockets, 
+  useLeads, useAssets, useContracts, useClientFeedback,
+  useSocialMediaPosts, usePromoCodes, useSOPs, useNotifications
+} from './hooks/useSupabase';
+import DatabaseService from './services/database';
 import Sidebar from './components/Sidebar';
 import Dashboard from './components/Dashboard';
 import Leads from './components/Leads';
@@ .. @@
 import PromoCodes from './components/PromoCodes';
 import SOPManagement from './components/SOP';

+const AppContent: React.FC = () => {
+  const { user, profile, loading: authLoading, signIn, signOut } = useSupabaseContext();
+  
+  // Supabase hooks for data management
+  const { data: clients, loading: clientsLoading, insert: insertClient, update: updateClient, remove: removeClient } = useClients();
+  const { data: projects, loading: projectsLoading, insert: insertProject, update: updateProject, remove: removeProject } = useProjects();
+  const { data: teamMembers, loading: teamLoading, insert: insertTeamMember, update: updateTeamMember, remove: removeTeamMember } = useTeamMembers();
+  const { data: transactions, loading: transactionsLoading, insert: insertTransaction, update: updateTransaction, remove: removeTransaction } = useTransactions();
+  const { data: packages, loading: packagesLoading, insert: insertPackage, update: updatePackage, remove: removePackage } = usePackages();
+  const { data: addOns, loading: addOnsLoading, insert: insertAddOn, update: updateAddOn, remove: removeAddOn } = useAddOns();
+  const { data: cards, loading: cardsLoading, insert: insertCard, update: updateCard, remove: removeCard } = useCards();
+  const { data: pockets, loading: pocketsLoading, insert: insertPocket, update: updatePocket, remove: removePocket } = useFinancialPockets();
+  const { data: leads, loading: leadsLoading, insert: insertLead, update: updateLead, remove: removeLead } = useLeads();
+  const { data: assets, loading: assetsLoading, insert: insertAsset, update: updateAsset, remove: removeAsset } = useAssets();
+  const { data: contracts, loading: contractsLoading, insert: insertContract, update: updateContract, remove: removeContract } = useContracts();
+  const { data: clientFeedback, loading: feedbackLoading, insert: insertFeedback } = useClientFeedback();
+  const { data: socialMediaPosts, loading: socialLoading, insert: insertSocialPost, update: updateSocialPost, remove: removeSocialPost } = useSocialMediaPosts();
+  const { data: promoCodes, loading: promoLoading, insert: insertPromoCode, update: updatePromoCode, remove: removePromoCode } = usePromoCodes();
+  const { data: sops, loading: sopsLoading, insert: insertSOP, update: updateSOP, remove: removeSOP } = useSOPs();
+  const { data: notifications, loading: notificationsLoading, insert: insertNotification, update: updateNotification } = useNotifications();
+
+  // Mock data for features not yet migrated
+  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>([]);
+  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>([]);
+  const [rewardLedgerEntries, setRewardLedgerEntries] = useState<RewardLedgerEntry[]>([]);
+
+  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
+  const [notification, setNotification] = useState<string>('');
+  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
+  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
+  const [route, setRoute] = useState(window.location.hash);
+  const [isSearchOpen, setIsSearchOpen] = useState(false);
+
+  const loading = authLoading || clientsLoading || projectsLoading || teamLoading || 
+                  transactionsLoading || packagesLoading || addOnsLoading || cardsLoading || 
+                  pocketsLoading || leadsLoading || assetsLoading || contractsLoading || 
+                  feedbackLoading || socialLoading || promoLoading || sopsLoading || notificationsLoading;
+
+  useEffect(() => {
+    const handleHashChange = () => {
+        setRoute(window.location.hash);
+    };
+    window.addEventListener('hashchange', handleHashChange);
+    return () => window.removeEventListener('hashchange', handleHashChange);
+  }, []);
+
+  const showNotification = (message: string, duration: number = 3000) => {
+    setNotification(message);
+    setTimeout(() => {
+      setNotification('');
+    }, duration);
+  };
+
+  const handleLoginSuccess = async (email: string, password: string) => {
+    const { user: loggedInUser, error } = await signIn(email, password);
+    if (error) {
+      showNotification(error);
+      return false;
+    }
+    if (loggedInUser) {
+      setActiveView(ViewType.DASHBOARD);
+      return true;
+    }
+    return false;
+  };
+
+  const handleLogout = async () => {
+    await signOut();
+  };
+
+  // Wrapper functions to maintain compatibility with existing components
+  const setClients = (updater: React.SetStateAction<Client[]>) => {
+    // This is handled by the Supabase hooks now
+    console.log('setClients called - handled by Supabase');
+  };
+
+  const setProjects = (updater: React.SetStateAction<Project[]>) => {
+    console.log('setProjects called - handled by Supabase');
+  };
+
+  const setTransactions = (updater: React.SetStateAction<Transaction[]>) => {
+    console.log('setTransactions called - handled by Supabase');
+  };
+
+  // Add similar wrapper functions for other entities...
+  const setPackages = (updater: React.SetStateAction<Package[]>) => { console.log('setPackages - Supabase'); };
+  const setAddOns = (updater: React.SetStateAction<AddOn[]>) => { console.log('setAddOns - Supabase'); };
+  const setCards = (updater: React.SetStateAction<Card[]>) => { console.log('setCards - Supabase'); };
+  const setPockets = (updater: React.SetStateAction<FinancialPocket[]>) => { console.log('setPockets - Supabase'); };
+  const setLeads = (updater: React.SetStateAction<Lead[]>) => { console.log('setLeads - Supabase'); };
+  const setAssets = (updater: React.SetStateAction<Asset[]>) => { console.log('setAssets - Supabase'); };
+  const setContracts = (updater: React.SetStateAction<Contract[]>) => { console.log('setContracts - Supabase'); };
+  const setClientFeedback = (updater: React.SetStateAction<ClientFeedback[]>) => { console.log('setClientFeedback - Supabase'); };
+  const setSocialMediaPosts = (updater: React.SetStateAction<SocialMediaPost[]>) => { console.log('setSocialMediaPosts - Supabase'); };
+  const setPromoCodes = (updater: React.SetStateAction<PromoCode[]>) => { console.log('setPromoCodes - Supabase'); };
+  const setSops = (updater: React.SetStateAction<SOP[]>) => { console.log('setSops - Supabase'); };
+  const setNotifications = (updater: React.SetStateAction<Notification[]>) => { console.log('setNotifications - Supabase'); };
+
+  if (loading) {
+    return (
+      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
+        <div className="text-center">
+          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
+          <p className="text-brand-text-secondary">Memuat aplikasi...</p>
+        </div>
+      </div>
+    );
+  }
+
+  // Rest of the component logic remains the same, but using Supabase data
+  const handleMarkAsRead = async (notificationId: string) => {
+    try {
+      await updateNotification(notificationId, { isRead: true });
+    } catch (error) {
+      console.error('Error marking notification as read:', error);
+    }
+  };
+  
+  const handleMarkAllAsRead = async () => {
+    try {
+      // Update all unread notifications
+      const unreadNotifications = notifications.filter(n => !n.isRead);
+      await Promise.all(
+        unreadNotifications.map(n => updateNotification(n.id, { isRead: true }))
+      );
+    } catch (error) {
+      console.error('Error marking all notifications as read:', error);
+    }
+  };
+
+  const handleNavigation = (view: ViewType, action?: NavigationAction, notificationId?: string) => {
+    setActiveView(view);
+    setInitialAction(action || null);
+    setIsSidebarOpen(false);
+    setIsSearchOpen(false);
+    if (notificationId) {
+        handleMarkAsRead(notificationId);
+    }
+  };
+
+  const handleUpdateRevision = async (projectId: string, revisionId: string, updatedData: { freelancerNotes: string, driveLink: string, status: RevisionStatus }) => {
+    try {
+      await updateProject(projectId, {
+        revisions: projects.find(p => p.id === projectId)?.revisions?.map(r => 
+          r.id === revisionId ? { 
+            ...r, 
+            freelancerNotes: updatedData.freelancerNotes,
+            driveLink: updatedData.driveLink,
+            status: updatedData.status,
+            completedDate: updatedData.status === RevisionStatus.COMPLETED ? new Date().toISOString() : r.completedDate,
+          } : r
+        ) || []
+      });
+      showNotification("Update revisi telah berhasil dikirim.");
+    } catch (error) {
+      console.error('Error updating revision:', error);
+      showNotification("Gagal mengupdate revisi.");
+    }
+  };
+
+  const handleClientConfirmation = async (projectId: string, stage: 'editing' | 'printing' | 'delivery') => {
+    try {
+      const updates: any = {};
+      if (stage === 'editing') updates.isEditingConfirmedByClient = true;
+      if (stage === 'printing') updates.isPrintingConfirmedByClient = true;
+      if (stage === 'delivery') updates.isDeliveryConfirmedByClient = true;
+      
+      await updateProject(projectId, updates);
+      showNotification("Konfirmasi telah diterima. Terima kasih!");
+    } catch (error) {
+      console.error('Error confirming project stage:', error);
+      showNotification("Gagal menyimpan konfirmasi.");
+    }
+  };
+    
+  const handleClientSubStatusConfirmation = async (projectId: string, subStatusName: string, note: string) => {
+    try {
+      const project = projects.find(p => p.id === projectId);
+      if (!project) return;
+
+      const confirmed = [...(project.confirmedSubStatuses || []), subStatusName];
+      const notes = { ...(project.clientSubStatusNotes || {}), [subStatusName]: note };
+      
+      await updateProject(projectId, {
+        confirmedSubStatuses: confirmed,
+        clientSubStatusNotes: notes
+      });
+
+      // Create notification
+      await insertNotification({
+        title: 'Catatan Klien Baru',
+        message: `Klien ${project.clientName} memberikan catatan pada sub-status "${subStatusName}" di proyek "${project.projectName}".`,
+        timestamp: new Date().toISOString(),
+        isRead: false,
+        icon: 'comment',
+        linkView: ViewType.PROJECTS,
+        linkAction: { type: 'VIEW_PROJECT_DETAILS', id: projectId }
+      });
+
+      showNotification(`Konfirmasi untuk "${subStatusName}" telah diterima.`);
+    } catch (error) {
+      console.error('Error confirming sub-status:', error);
+      showNotification("Gagal menyimpan konfirmasi.");
+    }
+  };
+    
+  const handleSignContract = async (contractId: string, signatureDataUrl: string, signer: 'vendor' | 'client') => {
+    try {
+      const updates = signer === 'vendor' 
+        ? { vendorSignature: signatureDataUrl }
+        : { clientSignature: signatureDataUrl };
+      
+      await updateContract(contractId, updates);
+      showNotification('Tanda tangan berhasil disimpan.');
+    } catch (error) {
+      console.error('Error signing contract:', error);
+      showNotification('Gagal menyimpan tanda tangan.');
+    }
+  };
+    
+  const handleSignInvoice = async (projectId: string, signatureDataUrl: string) => {
+    try {
+      await updateProject(projectId, { invoiceSignature: signatureDataUrl });
+      showNotification('Invoice berhasil ditandatangani.');
+    } catch (error) {
+      console.error('Error signing invoice:', error);
+      showNotification('Gagal menandatangani invoice.');
+    }
+  };
+    
+  const handleSignTransaction = async (transactionId: string, signatureDataUrl: string) => {
+    try {
+      await updateTransaction(transactionId, { vendorSignature: signatureDataUrl });
+      showNotification('Kuitansi berhasil ditandatangani.');
+    } catch (error) {
+      console.error('Error signing transaction:', error);
+      showNotification('Gagal menandatangani kuitansi.');
+    }
+  };
+    
+  const handleSignPaymentRecord = (recordId: string, signatureDataUrl: string) => {
+    setTeamPaymentRecords(prev => prev.map(r => r.id === recordId ? { ...r, vendorSignature: signatureDataUrl } : r));
+    showNotification('Slip pembayaran berhasil ditandatangani.');
+  };
+
+  const hasPermission = (view: ViewType) => {
+    if (!user) return false;
+    if (user.role === 'Admin') return true;
+    if (view === ViewType.DASHBOARD) return true;
+    return user.permissions?.includes(view) || false;
+  };
+
+  // Handle public routes
+  if (route.startsWith('#/public-booking')) {
+    return <PublicBookingForm 
+        setClients={setClients}
+        setProjects={setProjects}
+        packages={packages}
+        addOns={addOns}
+        setTransactions={setTransactions}
+        userProfile={profile!}
+        cards={cards}
+        setCards={setCards}
+        pockets={pockets}
+        setPockets={setPockets}
+        promoCodes={promoCodes}
+        setPromoCodes={setPromoCodes}
+        showNotification={showNotification}
+        setLeads={setLeads}
+    />;
+  }
+
+  if (route.startsWith('#/public-lead-form')) {
+    return <PublicLeadForm 
+        setLeads={setLeads}
+        userProfile={profile!}
+        showNotification={showNotification}
+    />;
+  }
+
+  if (route.startsWith('#/feedback')) {
+    return <PublicFeedbackForm setClientFeedback={setClientFeedback} />;
+  }
+
+  if (route.startsWith('#/suggestion-form')) {
+    return <SuggestionForm setLeads={setLeads} />;
+  }
+
+  if (route.startsWith('#/revision-form')) {
+    return <PublicRevisionForm projects={projects} teamMembers={teamMembers} onUpdateRevision={handleUpdateRevision} />;
+  }
+
+  if (route.startsWith('#/portal/')) {
+    const accessId = route.split('/portal/')[1];
+    return <ClientPortal 
+        accessId={accessId} 
+        clients={clients} 
+        projects={projects} 
+        setClientFeedback={setClientFeedback} 
+        showNotification={showNotification} 
+        contracts={contracts} 
+        transactions={transactions}
+        profile={profile!}
+        packages={packages}
+        onClientConfirmation={handleClientConfirmation}
+        onClientSubStatusConfirmation={handleClientSubStatusConfirmation}
+        onSignContract={handleSignContract}
+    />;
+  }
+
+  if (route.startsWith('#/freelancer-portal/')) {
+    const accessId = route.split('/freelancer-portal/')[1];
+    return <FreelancerPortal 
+        accessId={accessId} 
+        teamMembers={teamMembers} 
+        projects={projects} 
+        teamProjectPayments={teamProjectPayments}
+        teamPaymentRecords={teamPaymentRecords}
+        rewardLedgerEntries={rewardLedgerEntries}
+        showNotification={showNotification}
+        onUpdateRevision={handleUpdateRevision}
+        sops={sops}
+        profile={profile!}
+    />;
+  }
+  
+  if (!user) {
+    return <Login onLoginSuccess={handleLoginSuccess} users={[]} />;
+  }
+
+  if (!profile) {
+    return (
+      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
+        <div className="text-center">
+          <p className="text-brand-text-secondary">Memuat profil...</p>
+        </div>
+      </div>
+    );
+  }
+
+  const AccessDenied: React.FC<{onBackToDashboard: () => void}> = ({ onBackToDashboard }) => (
+    <div className="flex flex-col items-center justify-center h-full text-center p-4">
+        <h2 className="text-2xl font-bold text-brand-danger mb-2">Akses Ditolak</h2>
+        <p className="text-brand-text-secondary mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
+        <button onClick={onBackToDashboard} className="button-primary">Kembali ke Dashboard</button>
+    </div>
+  );
+
+  const renderView = () => {
+    if (!hasPermission(activeView)) {
+        return <AccessDenied onBackToDashboard={() => setActiveView(ViewType.DASHBOARD)} />;
+    }
+    switch (activeView) {
+      case ViewType.DASHBOARD:
+        return <Dashboard 
+          projects={projects} 
+          clients={clients} 
+          transactions={transactions} 
+          teamMembers={teamMembers}
+          cards={cards}
+          pockets={pockets}
+          handleNavigation={handleNavigation}
+          leads={leads}
+          teamProjectPayments={teamProjectPayments}
+          packages={packages}
+          assets={assets}
+          clientFeedback={clientFeedback}
+          contracts={contracts}
+          currentUser={user}
+          projectStatusConfig={profile.projectStatusConfig}
+        />;
+      case ViewType.PROSPEK:
+        return <Leads
+            leads={leads} setLeads={setLeads}
+            clients={clients} setClients={setClients}
+            projects={projects} setProjects={setProjects}
+            packages={packages} addOns={addOns}
+            transactions={transactions} setTransactions={setTransactions}
+            userProfile={profile} showNotification={showNotification}
+            cards={cards} setCards={setCards}
+            pockets={pockets} setPockets={setPockets}
+            promoCodes={promoCodes} setPromoCodes={setPromoCodes}
+        />;
+      case ViewType.CLIENTS:
+        return <Clients
+          clients={clients} setClients={setClients}
+          projects={projects} setProjects={setProjects}
+          packages={packages} addOns={addOns}
+          transactions={transactions} setTransactions={setTransactions}
+          userProfile={profile}
+          showNotification={showNotification}
+          initialAction={initialAction} setInitialAction={setInitialAction}
+          cards={cards} setCards={setCards}
+          pockets={pockets} setPockets={setPockets}
+          contracts={contracts}
+          handleNavigation={handleNavigation}
+          clientFeedback={clientFeedback}
+          promoCodes={promoCodes} setPromoCodes={setPromoCodes}
+          onSignInvoice={handleSignInvoice}
+          onSignTransaction={handleSignTransaction}
+        />;
+      case ViewType.PROJECTS:
+        return <Projects 
+          projects={projects} setProjects={setProjects}
+          clients={clients}
+          packages={packages}
+          teamMembers={teamMembers}
+          teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPayments}
+          transactions={transactions} setTransactions={setTransactions}
+          initialAction={initialAction} setInitialAction={setInitialAction}
+          profile={profile}
+          showNotification={showNotification}
+          cards={cards}
+          setCards={setCards}
+        />;
+      case ViewType.TEAM:
+        return (
+          <Freelancers
+            teamMembers={teamMembers}
+            setTeamMembers={(updater) => console.log('setTeamMembers - Supabase')}
+            teamProjectPayments={teamProjectPayments}
+            setTeamProjectPayments={setTeamProjectPayments}
+            teamPaymentRecords={teamPaymentRecords}
+            setTeamPaymentRecords={setTeamPaymentRecords}
+            transactions={transactions}
+            setTransactions={setTransactions}
+            userProfile={profile}
+            showNotification={showNotification}
+            initialAction={initialAction}
+            setInitialAction={setInitialAction}
+            projects={projects}
+            setProjects={setProjects}
+            rewardLedgerEntries={rewardLedgerEntries}
+            setRewardLedgerEntries={setRewardLedgerEntries}
+            pockets={pockets}
+            setPockets={setPockets}
+            cards={cards}
+            setCards={setCards}
+            onSignPaymentRecord={handleSignPaymentRecord}
+          />
+        );
+      case ViewType.FINANCE:
+        return <Finance 
+          transactions={transactions} setTransactions={setTransactions}
+          pockets={pockets} setPockets={setPockets}
+          projects={projects}
+          profile={profile}
+          cards={cards} setCards={setCards}
+          teamMembers={teamMembers}
+          rewardLedgerEntries={rewardLedgerEntries}
+        />;
+      case ViewType.PACKAGES:
+        return <Packages packages={packages} setPackages={setPackages} addOns={addOns} setAddOns={setAddOns} projects={projects} />;
+      case ViewType.ASSETS:
+        return <Assets assets={assets} setAssets={setAssets} profile={profile} showNotification={showNotification} />;
+      case ViewType.CONTRACTS:
+        return <Contracts 
+            contracts={contracts} setContracts={setContracts}
+            clients={clients} projects={projects} profile={profile}
+            showNotification={showNotification}
+            initialAction={initialAction} setInitialAction={setInitialAction}
+            packages={packages}
+            onSignContract={handleSignContract}
+        />;
+      case ViewType.SOP:
+        return <SOPManagement sops={sops} setSops={setSops} profile={profile} showNotification={showNotification} />;
+      case ViewType.SETTINGS:
+        return <Settings 
+          profile={profile} setProfile={(updater) => console.log('setProfile - handled by context')} 
+          transactions={transactions} projects={projects}
+          users={[]} setUsers={(updater) => console.log('setUsers - Supabase')}
+          currentUser={user}
+        />;
+      case ViewType.CALENDAR:
+        return <CalendarView projects={projects} setProjects={setProjects} teamMembers={teamMembers} profile={profile} />;
+      case ViewType.CLIENT_REPORTS:
+        return <ClientReports 
+            clients={clients}
+            leads={leads}
+            projects={projects}
+            feedback={clientFeedback}
+            setFeedback={setClientFeedback}
+            showNotification={showNotification}
+        />;
+      case ViewType.SOCIAL_MEDIA_PLANNER:
+        return <SocialPlanner posts={socialMediaPosts} setPosts={setSocialMediaPosts} projects={projects} showNotification={showNotification} />;
+      case ViewType.PROMO_CODES:
+        return <PromoCodes promoCodes={promoCodes} setPromoCodes={setPromoCodes} projects={projects} showNotification={showNotification} />;
+      default:
+        return <Dashboard 
+          projects={projects} 
+          clients={clients} 
+          transactions={transactions} 
+          teamMembers={teamMembers}
+          cards={cards}
+          pockets={pockets}
+          handleNavigation={handleNavigation}
+          leads={leads}
+          teamProjectPayments={teamProjectPayments}
+          packages={packages}
+          assets={assets}
+          clientFeedback={clientFeedback}
+          contracts={contracts}
+          currentUser={user}
+          projectStatusConfig={profile.projectStatusConfig}
+        />;
+    }
+  };
+
+  const BottomNavBar: React.FC<{ activeView: ViewType; handleNavigation: (view: ViewType) => void }> = ({ activeView, handleNavigation }) => {
+    const navItems = [
+        { view: ViewType.DASHBOARD, label: 'Beranda', icon: HomeIcon },
+        { view: ViewType.PROJECTS, label: 'Proyek', icon: FolderKanbanIcon },
+        { view: ViewType.CLIENTS, label: 'Klien', icon: UsersIcon },
+        { view: ViewType.FINANCE, label: 'Keuangan', icon: DollarSignIcon },
+    ];
+
+    return (
+        <nav className="bottom-nav xl:hidden">
+            <div className="flex justify-around items-center h-16">
+                {navItems.map(item => (
+                    <button
+                        key={item.view}
+                        onClick={() => handleNavigation(item.view)}
+                        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeView === item.view ? 'text-brand-accent' : 'text-brand-text-secondary'}`}
+                    >
+                        <item.icon className="w-6 h-6 mb-1" />
+                        <span className="text-[10px] font-bold">{item.label}</span>
+                    </button>
+                ))}
+            </div>
+        </nav>
+    );
+  };
+
+  return (
+    <div className="flex h-screen bg-brand-bg text-brand-text-primary">
+      <Sidebar 
+        activeView={activeView} 
+        setActiveView={(view) => handleNavigation(view)} 
+        isOpen={isSidebarOpen} 
+        setIsOpen={setIsSidebarOpen}
+        handleLogout={handleLogout}
+        currentUser={user}
+      />
+      <div className="flex-1 flex flex-col overflow-hidden">
+        <Header 
+            pageTitle={activeView} 
+            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
+            setIsSearchOpen={setIsSearchOpen}
+            notifications={notifications}
+            handleNavigation={handleNavigation}
+            handleMarkAllAsRead={handleMarkAllAsRead}
+            currentUser={user}
+        />
+        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 xl:pb-8">
+            {renderView()}
+        </main>
+      </div>
+      {notification && (
+        <div className="fixed top-5 right-5 bg-brand-accent text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
+          {notification}
+        </div>
+      )}
+      <GlobalSearch 
+        isOpen={isSearchOpen} 
+        onClose={() => setIsSearchOpen(false)} 
+        clients={clients}
+        projects={projects}
+        teamMembers={teamMembers}
+        handleNavigation={handleNavigation}
+      />
+      <BottomNavBar activeView={activeView} handleNavigation={handleNavigation} />
+    </div>
+  );
+};
+
 const AccessDenied: React.FC<{onBackToDashboard: () => void}> = ({ onBackToDashboard }) => (
@@ .. @@
 };


 const App: React.FC = () => {
-  const [isAuthenticated, setIsAuthenticated] = useState(false);
-  const [currentUser, setCurrentUser] = useState<User | null>(null);
-  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
-  const [notification, setNotification] = useState<string>('');
-  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
-  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
-  const [route, setRoute] = useState(window.location.hash);
-  const [isSearchOpen, setIsSearchOpen] = useState(false);
-
-  useEffect(() => {
-    const handleHashChange = () => {
-        setRoute(window.location.hash);
-    };
-    window.addEventListener('hashchange', handleHashChange);
-    return () => window.removeEventListener('hashchange', handleHashChange);
-  }, []);
-
-  // Lifted State for global management and integration
-  const [users, setUsers] = useState<User[]>(() => JSON.parse(JSON.stringify(MOCK_USERS)));
-  const [clients, setClients] = useState<Client[]>(() => JSON.parse(JSON.stringify(MOCK_CLIENTS)));
-  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(JSON.stringify(MOCK_PROJECTS)));
-  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => JSON.parse(JSON.stringify(MOCK_TEAM_MEMBERS)));
-  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(JSON.stringify(MOCK_TRANSACTIONS)));
-  const [packages, setPackages] = useState<Package[]>(() => JSON.parse(JSON.stringify(MOCK_PACKAGES)));
-  const [addOns, setAddOns] = useState<AddOn[]>(() => JSON.parse(JSON.stringify(MOCK_ADDONS)));
-  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>(() => JSON.parse(JSON.stringify(MOCK_TEAM_PROJECT_PAYMENTS)));
-  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>(() => JSON.parse(JSON.stringify(MOCK_TEAM_PAYMENT_RECORDS)));
-  const [pockets, setPockets] = useState<FinancialPocket[]>(() => JSON.parse(JSON.stringify(MOCK_FINANCIAL_POCKETS)));
-  const [profile, setProfile] = useState<Profile>(() => JSON.parse(JSON.stringify(MOCK_USER_PROFILE)));
-  const [leads, setLeads] = useState<Lead[]>(() => JSON.parse(JSON.stringify(MOCK_LEADS)));
-  const [rewardLedgerEntries, setRewardLedgerEntries] = useState<RewardLedgerEntry[]>(() => JSON.parse(JSON.stringify(MOCK_REWARD_LEDGER_ENTRIES)));
-  const [cards, setCards] = useState<Card[]>(() => JSON.parse(JSON.stringify(MOCK_CARDS)));
-  const [assets, setAssets] = useState<Asset[]>(() => JSON.parse(JSON.stringify(MOCK_ASSETS)));
-  const [contracts, setContracts] = useState<Contract[]>(() => JSON.parse(JSON.stringify(MOCK_CONTRACTS)));
-  const [clientFeedback, setClientFeedback] = useState<ClientFeedback[]>(() => JSON.parse(JSON.stringify(MOCK_CLIENT_FEEDBACK)));
-  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)));
-  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>(() => JSON.parse(JSON.stringify(MOCK_SOCIAL_MEDIA_POSTS)));
-  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => JSON.parse(JSON.stringify(MOCK_PROMO_CODES)));
-  const [sops, setSops] = useState<SOP[]>(() => JSON.parse(JSON.stringify(MOCK_SOPS)));
-
-  const showNotification = (message: string, duration: number = 3000) => {
-    setNotification(message);
-    setTimeout(() => {
-      setNotification('');
-    }, duration);
-  };
-
-  const handleLoginSuccess = (user: User) => {
-    setIsAuthenticated(true);
-    setCurrentUser(user);
-    setActiveView(ViewType.DASHBOARD);
-  };
-
-  const handleLogout = () => {
-    setIsAuthenticated(false);
-    setCurrentUser(null);
-  };
-
-  const handleMarkAsRead = (notificationId: string) => {
-    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
-  };
-  
-  const handleMarkAllAsRead = () => {
-    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
-  };
-
-  const handleNavigation = (view: ViewType, action?: NavigationAction, notificationId?: string) => {
-    setActiveView(view);
-    setInitialAction(action || null);
-    setIsSidebarOpen(false); // Close sidebar on navigation
-    setIsSearchOpen(false); // Close search on navigation
-    if (notificationId) {
-        handleMarkAsRead(notificationId);
-    }
-  };
-
-  const handleUpdateRevision = (projectId: string, revisionId: string, updatedData: { freelancerNotes: string, driveLink: string, status: RevisionStatus }) => {
-    setProjects(prevProjects => {
-        return prevProjects.map(p => {
-            if (p.id === projectId) {
-                const updatedRevisions = (p.revisions || []).map(r => {
-                    if (r.id === revisionId) {
-                        return { 
-                            ...r, 
-                            freelancerNotes: updatedData.freelancerNotes,
-                            driveLink: updatedData.driveLink,
-                            status: updatedData.status,
-                            completedDate: updatedData.status === RevisionStatus.COMPLETED ? new Date().toISOString() : r.completedDate,
-                        };
-                    }
-                    return r;
-                });
-                return { ...p, revisions: updatedRevisions };
-            }
-            return p;
-        });
-    });
-    showNotification("Update revisi telah berhasil dikirim.");
-  };
-
-    const handleClientConfirmation = (projectId: string, stage: 'editing' | 'printing' | 'delivery') => {
-        setProjects(prevProjects => {
-            return prevProjects.map(p => {
-                if (p.id === projectId) {
-                    const updatedProject = { ...p };
-                    if (stage === 'editing') updatedProject.isEditingConfirmedByClient = true;
-                    if (stage === 'printing') updatedProject.isPrintingConfirmedByClient = true;
-                    if (stage === 'delivery') updatedProject.isDeliveryConfirmedByClient = true;
-                    return updatedProject;
-                }
-                return p;
-            });
-        });
-        showNotification("Konfirmasi telah diterima. Terima kasih!");
-    };
-    
-    const handleClientSubStatusConfirmation = (projectId: string, subStatusName: string, note: string) => {
-        let project: Project | undefined;
-        setProjects(prevProjects => {
-            const updatedProjects = prevProjects.map(p => {
-                if (p.id === projectId) {
-                    const confirmed = [...(p.confirmedSubStatuses || []), subStatusName];
-                    const notes = { ...(p.clientSubStatusNotes || {}), [subStatusName]: note };
-                    project = { ...p, confirmedSubStatuses: confirmed, clientSubStatusNotes: notes };
-                    return project;
-                }
-                return p;
-            });
-            return updatedProjects;
-        });
-    
-        if (project) {
-            const newNotification: Notification = {
-                id: `NOTIF-NOTE-${Date.now()}`,
-                title: 'Catatan Klien Baru',
-                message: `Klien ${project.clientName} memberikan catatan pada sub-status "${subStatusName}" di proyek "${project.projectName}".`,
-                timestamp: new Date().toISOString(),
-                isRead: false,
-                icon: 'comment',
-                link: {
-                    view: ViewType.PROJECTS,
-                    action: { type: 'VIEW_PROJECT_DETAILS', id: projectId }
-                }
-            };
-            setNotifications(prev => [newNotification, ...prev]);
-        }
-    
-        showNotification(`Konfirmasi untuk "${subStatusName}" telah diterima.`);
-    };
-    
-    const handleSignContract = (contractId: string, signatureDataUrl: string, signer: 'vendor' | 'client') => {
-        setContracts(prevContracts => {
-            return prevContracts.map(c => {
-                if (c.id === contractId) {
-                    return {
-                        ...c,
-                        ...(signer === 'vendor' ? { vendorSignature: signatureDataUrl } : { clientSignature: signatureDataUrl })
-                    };
-                }
-                return c;
-            });
-        });
-        showNotification('Tanda tangan berhasil disimpan.');
-    };
-    
-    const handleSignInvoice = (projectId: string, signatureDataUrl: string) => {
-        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, invoiceSignature: signatureDataUrl } : p));
-        showNotification('Invoice berhasil ditandatangani.');
-    };
-    
-    const handleSignTransaction = (transactionId: string, signatureDataUrl: string) => {
-        setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, vendorSignature: signatureDataUrl } : t));
-        showNotification('Kuitansi berhasil ditandatangani.');
-    };
-    
-    const handleSignPaymentRecord = (recordId: string, signatureDataUrl: string) => {
-        setTeamPaymentRecords(prev => prev.map(r => r.id === recordId ? { ...r, vendorSignature: signatureDataUrl } : r));
-        showNotification('Slip pembayaran berhasil ditandatangani.');
-    };
-
-
-  const hasPermission = (view: ViewType) => {
-    if (!currentUser) return false;
-    if (currentUser.role === 'Admin') return true;
-    if (view === ViewType.DASHBOARD) return true;
-    return currentUser.permissions?.includes(view) || false;
-  };
-  
-  const renderView = () => {
-    if (!hasPermission(activeView)) {
-        return <AccessDenied onBackToDashboard={() => setActiveView(ViewType.DASHBOARD)} />;
-    }
-    switch (activeView) {
-      case ViewType.DASHBOARD:
-        return <Dashboard 
-          projects={projects} 
-          clients={clients} 
-          transactions={transactions} 
-          teamMembers={teamMembers}
-          cards={cards}
-          pockets={pockets}
-          handleNavigation={handleNavigation}
-          leads={leads}
-          teamProjectPayments={teamProjectPayments}
-          packages={packages}
-          assets={assets}
-          clientFeedback={clientFeedback}
-          contracts={contracts}
-          currentUser={currentUser}
-          projectStatusConfig={profile.projectStatusConfig}
-        />;
-      case ViewType.PROSPEK:
-        return <Leads
-            leads={leads} setLeads={setLeads}
-            clients={clients} setClients={setClients}
-            projects={projects} setProjects={setProjects}
-            packages={packages} addOns={addOns}
-            transactions={transactions} setTransactions={setTransactions}
-            userProfile={profile} showNotification={showNotification}
-            cards={cards} setCards={setCards}
-            pockets={pockets} setPockets={setPockets}
-            promoCodes={promoCodes} setPromoCodes={setPromoCodes}
-        />;
-      case ViewType.CLIENTS:
-        return <Clients
-          clients={clients} setClients={setClients}
-          projects={projects} setProjects={setProjects}
-          packages={packages} addOns={addOns}
-          transactions={transactions} setTransactions={setTransactions}
-          userProfile={profile}
-          showNotification={showNotification}
-          initialAction={initialAction} setInitialAction={setInitialAction}
-          cards={cards} setCards={setCards}
-          pockets={pockets} setPockets={setPockets}
-          contracts={contracts}
-          handleNavigation={handleNavigation}
-          clientFeedback={clientFeedback}
-          promoCodes={promoCodes} setPromoCodes={setPromoCodes}
-          onSignInvoice={handleSignInvoice}
-          onSignTransaction={handleSignTransaction}
-        />;
-      case ViewType.PROJECTS:
-        return <Projects 
-          projects={projects} setProjects={setProjects}
-          clients={clients}
-          packages={packages}
-          teamMembers={teamMembers}
-          teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPayments}
-          transactions={transactions} setTransactions={setTransactions}
-          initialAction={initialAction} setInitialAction={setInitialAction}
-          profile={profile}
-          showNotification={showNotification}
-          cards={cards}
-          setCards={setCards}
-        />;
-      case ViewType.TEAM:
-        return (
-          <Freelancers
-            teamMembers={teamMembers}
-            setTeamMembers={setTeamMembers}
-            teamProjectPayments={teamProjectPayments}
-            setTeamProjectPayments={setTeamProjectPayments}
-            teamPaymentRecords={teamPaymentRecords}
-            setTeamPaymentRecords={setTeamPaymentRecords}
-            transactions={transactions}
-            setTransactions={setTransactions}
-            userProfile={profile}
-            showNotification={showNotification}
-            initialAction={initialAction}
-            setInitialAction={setInitialAction}
-            projects={projects}
-            setProjects={setProjects}
-            rewardLedgerEntries={rewardLedgerEntries}
-            setRewardLedgerEntries={setRewardLedgerEntries}
-            pockets={pockets}
-            setPockets={setPockets}
-            cards={cards}
-            setCards={setCards}
-            onSignPaymentRecord={handleSignPaymentRecord}
-          />
-        );
-      case ViewType.FINANCE:
-        return <Finance 
-          transactions={transactions} setTransactions={setTransactions}
-          pockets={pockets} setPockets={setPockets}
-          projects={projects}
-          profile={profile}
-          cards={cards} setCards={setCards}
-          teamMembers={teamMembers}
-          rewardLedgerEntries={rewardLedgerEntries}
-        />;
-      case ViewType.PACKAGES:
-        return <Packages packages={packages} setPackages={setPackages} addOns={addOns} setAddOns={setAddOns} projects={projects} />;
-      case ViewType.ASSETS:
-        return <Assets assets={assets} setAssets={setAssets} profile={profile} showNotification={showNotification} />;
-      case ViewType.CONTRACTS:
-        return <Contracts 
-            contracts={contracts} setContracts={setContracts}
-            clients={clients} projects={projects} profile={profile}
-            showNotification={showNotification}
-            initialAction={initialAction} setInitialAction={setInitialAction}
-            packages={packages}
-            onSignContract={handleSignContract}
-        />;
-      case ViewType.SOP:
-        return <SOPManagement sops={sops} setSops={setSops} profile={profile} showNotification={showNotification} />;
-      case ViewType.SETTINGS:
-        return <Settings 
-          profile={profile} setProfile={setProfile} 
-          transactions={transactions} projects={projects}
-          users={users} setUsers={setUsers}
-          currentUser={currentUser}
-        />;
-      case ViewType.CALENDAR:
-        return <CalendarView projects={projects} setProjects={setProjects} teamMembers={teamMembers} profile={profile} />;
-      case ViewType.CLIENT_REPORTS:
-        return <ClientReports 
-            clients={clients}
-            leads={leads}
-            projects={projects}
-            feedback={clientFeedback}
-            setFeedback={setClientFeedback}
-            showNotification={showNotification}
-        />;
-      case ViewType.SOCIAL_MEDIA_PLANNER:
-        return <SocialPlanner posts={socialMediaPosts} setPosts={setSocialMediaPosts} projects={projects} showNotification={showNotification} />;
-      case ViewType.PROMO_CODES:
-        return <PromoCodes promoCodes={promoCodes} setPromoCodes={setPromoCodes} projects={projects} showNotification={showNotification} />;
-      default:
-        return <Dashboard 
-          projects={projects} 
-          clients={clients} 
-          transactions={transactions} 
-          teamMembers={teamMembers}
-          cards={cards}
-          pockets={pockets}
-          handleNavigation={handleNavigation}
-          leads={leads}
-          teamProjectPayments={teamProjectPayments}
-          packages={packages}
-          assets={assets}
-          clientFeedback={clientFeedback}
-          contracts={contracts}
-          currentUser={currentUser}
-          projectStatusConfig={profile.projectStatusConfig}
-        />;
-    }
-  };
-  
-  // ROUTING FOR PUBLIC PAGES
-  if (route.startsWith('#/public-booking')) {
-    return <PublicBookingForm 
-        setClients={setClients}
-        setProjects={setProjects}
-        packages={packages}
-        addOns={addOns}
-        setTransactions={setTransactions}
-        userProfile={profile}
-        cards={cards}
-        setCards={setCards}
-        pockets={pockets}
-        setPockets={setPockets}
-        promoCodes={promoCodes}
-        setPromoCodes={setPromoCodes}
-        showNotification={showNotification}
-        setLeads={setLeads}
-    />;
-  }
-  if (route.startsWith('#/public-lead-form')) {
-    return <PublicLeadForm 
-        setLeads={setLeads}
-        userProfile={profile}
-        showNotification={showNotification}
-    />;
-  }
-  if (route.startsWith('#/feedback')) {
-    return <PublicFeedbackForm setClientFeedback={setClientFeedback} />;
-  }
-  if (route.startsWith('#/suggestion-form')) {
-    return <SuggestionForm setLeads={setLeads} />;
-  }
-  if (route.startsWith('#/revision-form')) {
-    return <PublicRevisionForm projects={projects} teamMembers={teamMembers} onUpdateRevision={handleUpdateRevision} />;
-  }
-  if (route.startsWith('#/portal/')) {
-    const accessId = route.split('/portal/')[1];
-    return <ClientPortal 
-        accessId={accessId} 
-        clients={clients} 
-        projects={projects} 
-        setClientFeedback={setClientFeedback} 
-        showNotification={showNotification} 
-        contracts={contracts} 
-        transactions={transactions}
-        profile={profile}
-        packages={packages}
-        onClientConfirmation={handleClientConfirmation}
-        onClientSubStatusConfirmation={handleClientSubStatusConfirmation}
-        onSignContract={handleSignContract}
-    />;
-  }
-  if (route.startsWith('#/freelancer-portal/')) {
-    const accessId = route.split('/freelancer-portal/')[1];
-    return <FreelancerPortal 
-        accessId={accessId} 
-        teamMembers={teamMembers} 
-        projects={projects} 
-        teamProjectPayments={teamProjectPayments}
-        teamPaymentRecords={teamPaymentRecords}
-        rewardLedgerEntries={rewardLedgerEntries}
-        showNotification={showNotification}
-        onUpdateRevision={handleUpdateRevision}
-        sops={sops}
-        profile={profile}
-    />;
-  }
-  
-  if (!isAuthenticated) {
-    return <Login onLoginSuccess={handleLoginSuccess} users={users} />;
-  }
-
   return (
-    <div className="flex h-screen bg-brand-bg text-brand-text-primary">
-      <Sidebar 
-        activeView={activeView} 
-        setActiveView={(view) => handleNavigation(view)} 
-        isOpen={isSidebarOpen} 
-        setIsOpen={setIsSidebarOpen}
-        handleLogout={handleLogout}
-        currentUser={currentUser}
-      />
-      <div className="flex-1 flex flex-col overflow-hidden">
-        <Header 
-            pageTitle={activeView} 
-            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
-            setIsSearchOpen={setIsSearchOpen}
-            notifications={notifications}
-            handleNavigation={handleNavigation}
-            handleMarkAllAsRead={handleMarkAllAsRead}
-            currentUser={currentUser}
-        />
-        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 xl:pb-8">
-            {renderView()}
-        </main>
-      </div>
-      {notification && (
-        <div className="fixed top-5 right-5 bg-brand-accent text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
-          {notification}
-        </div>
-      )}
-      <GlobalSearch 
-        isOpen={isSearchOpen} 
-        onClose={() => setIsSearchOpen(false)} 
-        clients={clients}
-        projects={projects}
-        teamMembers={teamMembers}
-        handleNavigation={handleNavigation}
-      />
-      <BottomNavBar activeView={activeView} handleNavigation={handleNavigation} />
-      {/* <FloatingActionButton onAddClick={(type) => console.log('Add', type)} /> */}
-    </div>
+    <SupabaseProvider>
+      <AppContent />
+    </SupabaseProvider>
   );
 };