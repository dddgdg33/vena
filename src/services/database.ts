import { supabase } from '../lib/supabase';
import { 
  Client, Project, TeamMember, Transaction, Package, AddOn,
  Card, FinancialPocket, Lead, Asset, Contract, ClientFeedback,
  SocialMediaPost, PromoCode, SOP, Notification, User, Profile,
  TransactionType, PaymentStatus, ClientStatus, LeadStatus,
  ContactChannel, AssetStatus, PostStatus, PostType, RevisionStatus,
  SatisfactionLevel, PerformanceNoteType, PocketType, CardType, ClientType
} from '../types';

// Transform functions to convert between database and app formats
const transformDbClient = (dbClient: any): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  email: dbClient.email,
  phone: dbClient.phone,
  instagram: dbClient.instagram || '',
  since: dbClient.since,
  status: dbClient.status as ClientStatus,
  clientType: dbClient.client_type as ClientType,
  lastContact: dbClient.last_contact,
  portalAccessId: dbClient.portal_access_id
});

const transformDbProject = (dbProject: any): Project => ({
  id: dbProject.id,
  projectName: dbProject.project_name,
  clientName: dbProject.client_name,
  clientId: dbProject.client_id,
  projectType: dbProject.project_type,
  packageName: dbProject.package_name,
  packageId: dbProject.package_id,
  addOns: dbProject.add_ons || [],
  date: dbProject.date,
  deadlineDate: dbProject.deadline_date,
  location: dbProject.location,
  progress: dbProject.progress,
  status: dbProject.status,
  activeSubStatuses: dbProject.active_sub_statuses || [],
  totalCost: dbProject.total_cost,
  amountPaid: dbProject.amount_paid,
  paymentStatus: dbProject.payment_status as PaymentStatus,
  team: dbProject.team || [],
  notes: dbProject.notes,
  accommodation: dbProject.accommodation,
  driveLink: dbProject.drive_link,
  clientDriveLink: dbProject.client_drive_link,
  finalDriveLink: dbProject.final_drive_link,
  startTime: dbProject.start_time,
  endTime: dbProject.end_time,
  image: dbProject.image,
  revisions: [], // Will be loaded separately
  promoCodeId: dbProject.promo_code_id,
  discountAmount: dbProject.discount_amount,
  shippingDetails: dbProject.shipping_details,
  dpProofUrl: dbProject.dp_proof_url,
  printingDetails: dbProject.printing_details || [],
  printingCost: dbProject.printing_cost,
  transportCost: dbProject.transport_cost,
  isEditingConfirmedByClient: dbProject.is_editing_confirmed_by_client,
  isPrintingConfirmedByClient: dbProject.is_printing_confirmed_by_client,
  isDeliveryConfirmedByClient: dbProject.is_delivery_confirmed_by_client,
  confirmedSubStatuses: dbProject.confirmed_sub_statuses || [],
  clientSubStatusNotes: dbProject.client_sub_status_notes || {},
  subStatusConfirmationSentAt: dbProject.sub_status_confirmation_sent_at || {},
  completedDigitalItems: dbProject.completed_digital_items || [],
  invoiceSignature: dbProject.invoice_signature
});

const transformDbTransaction = (dbTransaction: any): Transaction => ({
  id: dbTransaction.id,
  date: dbTransaction.date,
  description: dbTransaction.description,
  amount: dbTransaction.amount,
  type: dbTransaction.type as TransactionType,
  projectId: dbTransaction.project_id,
  category: dbTransaction.category,
  method: dbTransaction.method,
  pocketId: dbTransaction.pocket_id,
  cardId: dbTransaction.card_id,
  printingItemId: dbTransaction.printing_item_id,
  vendorSignature: dbTransaction.vendor_signature
});

// Database service functions
export const DatabaseService = {
  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformDbClient);
  },

  async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        name: client.name,
        email: client.email,
        phone: client.phone,
        instagram: client.instagram,
        since: client.since,
        status: client.status,
        client_type: client.clientType,
        last_contact: client.lastContact,
        portal_access_id: client.portalAccessId
      }])
      .select()
      .single();

    if (error) throw error;
    return transformDbClient(data);
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.clientType !== undefined) dbUpdates.client_type = updates.clientType;
    if (updates.lastContact !== undefined) dbUpdates.last_contact = updates.lastContact;

    const { data, error } = await supabase
      .from('clients')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformDbClient(data);
  },

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data.map(transformDbProject);
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        project_name: project.projectName,
        client_name: project.clientName,
        client_id: project.clientId,
        project_type: project.projectType,
        package_name: project.packageName,
        package_id: project.packageId,
        add_ons: project.addOns,
        date: project.date,
        deadline_date: project.deadlineDate,
        location: project.location,
        progress: project.progress,
        status: project.status,
        active_sub_statuses: project.activeSubStatuses,
        total_cost: project.totalCost,
        amount_paid: project.amountPaid,
        payment_status: project.paymentStatus,
        team: project.team,
        notes: project.notes,
        accommodation: project.accommodation,
        drive_link: project.driveLink,
        client_drive_link: project.clientDriveLink,
        final_drive_link: project.finalDriveLink,
        start_time: project.startTime,
        end_time: project.endTime,
        image: project.image,
        promo_code_id: project.promoCodeId,
        discount_amount: project.discountAmount,
        shipping_details: project.shippingDetails,
        dp_proof_url: project.dpProofUrl,
        printing_details: project.printingDetails,
        printing_cost: project.printingCost,
        transport_cost: project.transportCost,
        is_editing_confirmed_by_client: project.isEditingConfirmedByClient,
        is_printing_confirmed_by_client: project.isPrintingConfirmedByClient,
        is_delivery_confirmed_by_client: project.isDeliveryConfirmedByClient,
        confirmed_sub_statuses: project.confirmedSubStatuses,
        client_sub_status_notes: project.clientSubStatusNotes,
        sub_status_confirmation_sent_at: project.subStatusConfirmationSentAt,
        completed_digital_items: project.completedDigitalItems,
        invoice_signature: project.invoiceSignature
      }])
      .select()
      .single();

    if (error) throw error;
    return transformDbProject(data);
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data.map(transformDbTransaction);
  },

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        project_id: transaction.projectId,
        category: transaction.category,
        method: transaction.method,
        pocket_id: transaction.pocketId,
        card_id: transaction.cardId,
        printing_item_id: transaction.printingItemId,
        vendor_signature: transaction.vendorSignature
      }])
      .select()
      .single();

    if (error) throw error;
    return transformDbTransaction(data);
  },

  // Leads
  async createLead(lead: Omit<Lead, 'id'>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: lead.name,
        contact_channel: lead.contactChannel,
        location: lead.location,
        status: lead.status,
        date: lead.date,
        notes: lead.notes
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      contactChannel: data.contact_channel as ContactChannel,
      location: data.location,
      status: data.status as LeadStatus,
      date: data.date,
      notes: data.notes
    };
  },

  // Client Feedback (public form)
  async createClientFeedback(feedback: Omit<ClientFeedback, 'id'>): Promise<ClientFeedback> {
    const { data, error } = await supabase
      .from('client_feedback')
      .insert([{
        client_name: feedback.clientName,
        satisfaction: feedback.satisfaction,
        rating: feedback.rating,
        feedback: feedback.feedback,
        date: feedback.date
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      clientName: data.client_name,
      satisfaction: data.satisfaction as SatisfactionLevel,
      rating: data.rating,
      feedback: data.feedback,
      date: data.date
    };
  },

  // Get public data for forms
  async getPublicData() {
    const [packagesResult, addOnsResult, promoCodesResult, profileResult] = await Promise.all([
      supabase.from('packages').select('*'),
      supabase.from('add_ons').select('*'),
      supabase.from('promo_codes').select('*').eq('is_active', true),
      supabase.from('profiles').select('*').single()
    ]);

    return {
      packages: packagesResult.data || [],
      addOns: addOnsResult.data || [],
      promoCodes: promoCodesResult.data || [],
      profile: profileResult.data
    };
  },

  // Portal access
  async getClientPortalData(accessId: string) {
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('portal_access_id', accessId)
      .single();

    if (clientError) throw clientError;

    const [projectsResult, contractsResult, profileResult] = await Promise.all([
      supabase.from('projects').select('*').eq('client_id', client.id),
      supabase.from('contracts').select('*').eq('client_id', client.id),
      supabase.from('profiles').select('*').single()
    ]);

    return {
      client: transformDbClient(client),
      projects: (projectsResult.data || []).map(transformDbProject),
      contracts: contractsResult.data || [],
      profile: profileResult.data
    };
  },

  async getFreelancerPortalData(accessId: string) {
    const { data: freelancer, error: freelancerError } = await supabase
      .from('team_members')
      .select('*')
      .eq('portal_access_id', accessId)
      .single();

    if (freelancerError) throw freelancerError;

    const [projectsResult, sopsResult] = await Promise.all([
      supabase.from('projects').select('*').contains('team', [{ memberId: freelancer.id }]),
      supabase.from('sops').select('*')
    ]);

    return {
      freelancer: {
        id: freelancer.id,
        name: freelancer.name,
        role: freelancer.role,
        email: freelancer.email,
        phone: freelancer.phone,
        standardFee: freelancer.standard_fee,
        noRek: freelancer.no_rek,
        rewardBalance: freelancer.reward_balance,
        rating: freelancer.rating,
        performanceNotes: freelancer.performance_notes || [],
        portalAccessId: freelancer.portal_access_id
      } as TeamMember,
      projects: (projectsResult.data || []).map(transformDbProject),
      sops: sopsResult.data || []
    };
  }
};

export default DatabaseService;