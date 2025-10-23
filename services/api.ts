// FIX: Implemented full content for api.ts to handle all Supabase interactions.
import { supabase } from '../lib/supabaseClient';
import type { PostgrestError, AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole, Ticket, TicketStatus, Service, Quote, TicketMessage, ServiceStatus, QuoteStatus } from '../types';

// --- TYPES ---

export interface Credentials {
  email: string;
  password: string;
}

// --- ERROR HANDLING ---

const checkError = (error: PostgrestError | AuthError | null) => {
  if (error) {
    console.error('Supabase API Error:', error);
    throw new Error(error.message);
  }
};

// --- HELPER FUNCTIONS ---

const getCurrentUserProfile = async (): Promise<User> => {
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  checkError(authError);
  if (!authUser) throw new Error('User not authenticated.');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  checkError(error);
  if (!data) throw new Error('User profile not found.');

  return data as User;
};

// --- API SERVICE OBJECT ---

export const apiService = {
  // --- AUTH ---

  async login(credentials: Credentials): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword(credentials);
    checkError(error);
  },

  async register(userData: Omit<User, 'id' | 'role'> & { password: string }): Promise<void> {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    checkError(signUpError);

    if (data.user) {
      // Mude de || '' para ?? null (Mais seguro se a coluna for Nullable no Supabase)
      const companyValue = userData.company ?? null;

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        role: UserRole.Client,
        company: companyValue, // Usará null se o campo não estiver preenchido.
      });
      checkError(profileError);
    } else {
      throw new Error("Registration succeeded but no user data was returned.");
    }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    checkError(error);
  },

  onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return subscription;
  },

  async getProfile(authedUser: SupabaseUser): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authedUser.id)
      .single();
    checkError(error);
    if (!data) throw new Error("User profile not found.");
    return data as User;
  },

  // --- NOTIFICATION SYSTEM (PULL-BASED) ---
  // NOTA: Para esta funcionalidade, adicione uma nova coluna à sua tabela 'profiles' no Supabase:
  // Nome da coluna: last_checked_tickets_at
  // Tipo: timestamptz (Timestamp with Time Zone)
  // Permitir Nulo (is nullable): Sim

  async getUnreadUpdatesCount(): Promise<number> {
    const user = await getCurrentUserProfile();

    // Fetch only the last_checked_tickets_at field to be efficient
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('last_checked_tickets_at')
      .eq('id', user.id)
      .single();

    checkError(profileError);

    const lastChecked = profileData?.last_checked_tickets_at;

    // If the user has never checked, there are no "new" updates for them yet.
    if (!lastChecked) {
      return 0;
    }

    // We consider a ticket "updated" if its `updated_at` is more recent than the last check.
    // This covers both new tickets and new messages in existing tickets.
    let query = supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .gt('updated_at', lastChecked);

    // Clients only see updates on their own tickets
    if (user.role === UserRole.Client) {
      query = query.eq('client_id', user.id);
    }

    const { count, error } = await query;
    checkError(error);
    return count || 0;
  },

  async updateLastCheckedTimestamp(): Promise<void> {
    const user = await getCurrentUserProfile();
    const { error } = await supabase
      .from('profiles')
      .update({ last_checked_tickets_at: new Date().toISOString() })
      .eq('id', user.id);

    checkError(error);
  },

  // --- DATA FETCHING ---

  async getTickets(): Promise<Ticket[]> {
    const currentUser = await getCurrentUserProfile();
    let query = supabase.from('tickets')
      .select(`
        id,
        client_id,
        subject,
        status,
        created_at,
        updated_at,
        client:profiles ( name )
      `)
      .order('updated_at', { ascending: false });

    if (currentUser.role === UserRole.Client) {
      query = query.eq('client_id', currentUser.id);
    }

    const { data, error } = await query;
    checkError(error);

    return data?.map((t: any) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      createdAt: new Date(t.created_at),
      updatedAt: new Date(t.updated_at),
      clientId: t.client_id,
      clientName: t.client?.name ?? 'Cliente Desconhecido',
      messages: [] // Messages are fetched on detail view
    })) ?? [];
  },

  async getTicketById(id: number): Promise<Ticket> {
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('*, client:profiles(name)')
      .eq('id', id)
      .single();
    checkError(ticketError);
    if (!ticketData) throw new Error("Ticket not found");

    const { data: messagesData, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('*, author:profiles(name)')
      .eq('ticket_id', id)
      .order('timestamp', { ascending: true });
    checkError(messagesError);

    return {
      id: ticketData.id,
      subject: ticketData.subject,
      status: ticketData.status,
      createdAt: new Date(ticketData.created_at),
      updatedAt: new Date(ticketData.updated_at),
      clientId: ticketData.client_id,
      clientName: (ticketData as any).client?.name ?? 'Cliente Desconhecido',
      messages: messagesData?.map((m: any) => ({
        id: m.id,
        content: m.content,
        timestamp: new Date(m.timestamp),
        authorName: m.author?.name ?? 'Usuário Desconhecido',
        authorId: m.author_id,
      })) ?? []
    };
  },

  async getServices(): Promise<Service[]> {
    const currentUser = await getCurrentUserProfile();
    let query = supabase.from('services')
      .select('*, client:profiles(name)')
      .order('start_date', { ascending: false });

    if (currentUser.role === UserRole.Client) {
      query = query.eq('client_id', currentUser.id);
    }

    const { data, error } = await query;
    checkError(error);
    return data?.map((s: any) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      observation: s.observation,
      clientId: s.client_id,
      clientName: s.client?.name ?? 'Cliente Desconhecido',
      startDate: new Date(s.start_date)
    })) ?? [];
  },

  async getQuotes(): Promise<Quote[]> {
    const currentUser = await getCurrentUserProfile();
    let query = supabase.from('quotes')
      .select('*, client:profiles(name)')
      .order('created_at', { ascending: false });

    if (currentUser.role === UserRole.Client) {
      query = query.eq('client_id', currentUser.id);
    }

    const { data, error } = await query;
    checkError(error);
    return data?.map((q: any) => ({
      id: q.id,
      description: q.description,
      status: q.status,
      value: q.value,
      observation: q.observation,
      clientId: q.client_id,
      clientName: q.client?.name ?? 'Cliente Desconhecido',
      createdAt: new Date(q.created_at)
    })) ?? [];
  },

  async getClients(): Promise<User[]> {
    const currentUser = await getCurrentUserProfile();
    if (currentUser.role !== UserRole.Employee) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', UserRole.Client)
      .order('name');
    checkError(error);
    return data as User[] ?? [];
  },

  // --- DATA MUTATION ---

  async createTicket(ticketData: { subject: string; message: string; clientId: string; }): Promise<void> {
    const currentUser = await getCurrentUserProfile();

    const { data: newTicket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        client_id: ticketData.clientId,
        subject: ticketData.subject,
        status: TicketStatus.Open,
      })
      .select()
      .single();
    checkError(ticketError);
    if (!newTicket) throw new Error("Failed to create ticket");

    const { error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: newTicket.id,
        author_id: currentUser.id,
        content: ticketData.message
      });
    checkError(messageError);
  },

  async addTicketMessage(ticketId: number, content: string): Promise<void> {
    const currentUser = await getCurrentUserProfile();

    const { error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        author_id: currentUser.id,
        content: content
      });
    checkError(messageError);

    // Also update the ticket's updated_at timestamp
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ updated_at: new Date().toISOString(), status: TicketStatus.InProgress })
      .eq('id', ticketId);
    checkError(updateError);
  },

  async updateTicketStatus(ticketId: number, status: TicketStatus): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId);
    checkError(error);
  },

  async createService(serviceData: Omit<Service, 'id' | 'clientName'>): Promise<void> {
    const { clientId, startDate, ...rest } = serviceData;
    const { error } = await supabase.from('services').insert({
      client_id: clientId,
      start_date: startDate,
      ...rest
    });
    checkError(error);
  },

  async updateService(id: number, serviceData: Partial<Omit<Service, 'id' | 'clientName'>>): Promise<void> {
    const { clientId, startDate, ...rest } = serviceData;
    const payload: { [key: string]: any } = { ...rest };
    if (clientId) payload.client_id = clientId;
    if (startDate) payload.start_date = startDate;

    const { error } = await supabase.from('services').update(payload).eq('id', id);
    checkError(error);
  },

  async createQuote(quoteData: Omit<Quote, 'id' | 'clientName' | 'createdAt'>): Promise<void> {
    const { clientId, ...rest } = quoteData;
    const { error } = await supabase.from('quotes').insert({
      client_id: clientId,
      ...rest
    });
    checkError(error);
  },

  async updateQuote(id: number, quoteData: Partial<Omit<Quote, 'id' | 'clientName' | 'createdAt'>>): Promise<void> {
    const { clientId, ...rest } = quoteData;
    const payload: { [key: string]: any } = { ...rest };
    if (clientId) payload.client_id = clientId;

    const { error } = await supabase.from('quotes').update(payload).eq('id', id);
    checkError(error);
  }

};