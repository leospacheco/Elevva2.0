// FIX: Implemented full content for Dashboard.tsx to provide the client area UI.
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { Ticket, Service, Quote, TicketStatus, ServiceStatus, QuoteStatus, User, UserRole } from '../types';
import {
  UserIcon,
  TicketIcon,
  QuoteIcon,
  ServiceIcon,
  LogoutIcon,
  PlusIcon,
  SendIcon,
  CloseIcon,
  EditIcon,
  SearchIcon,
  MenuIcon,
} from './Icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR'; // FIX: Corrected import path

type NavItem = 'Início' | 'Tickets' | 'Serviços' | 'Orçamentos' | 'Clientes';
type Notification = {
    id: number;
    message: string;
    type: 'ticket' | 'message';
};

// ... (statusColors remain the same)
const statusColors: { [key in TicketStatus | ServiceStatus | QuoteStatus]: string } = {
  // Ticket
  [TicketStatus.Open]: 'bg-blue-100 text-blue-800',
  [TicketStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.Closed]: 'bg-green-100 text-green-800',
  // Service
  [ServiceStatus.Pending]: 'bg-gray-100 text-gray-800',
  [ServiceStatus.Development]: 'bg-indigo-100 text-indigo-800',
  [ServiceStatus.Review]: 'bg-purple-100 text-purple-800',
  [ServiceStatus.Completed]: 'bg-green-100 text-green-800',
  // Quote
  [QuoteStatus.Requested]: 'bg-blue-100 text-blue-800',
  [QuoteStatus.Sent]: 'bg-yellow-100 text-yellow-800',
  [QuoteStatus.Approved]: 'bg-green-100 text-green-800',
  [QuoteStatus.Rejected]: 'bg-red-100 text-red-800',
};

const Sidebar: React.FC<{ 
    user: User | null; 
    activeItem: NavItem; 
    setActiveItem: (item: NavItem) => void; 
    handleLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
    hasNewTicketUpdate: boolean;
    onTicketsViewed: () => void;
}> = ({ user, activeItem, setActiveItem, handleLogout, isOpen, onClose, hasNewTicketUpdate, onTicketsViewed }) => {
    const baseNavItems: { name: NavItem, icon: React.FC<{ className?: string }> }[] = [
      { name: 'Início', icon: UserIcon },
      { name: 'Tickets', icon: TicketIcon },
      { name: 'Serviços', icon: ServiceIcon },
      { name: 'Orçamentos', icon: QuoteIcon },
    ];

    if (user?.role === UserRole.Employee) {
      baseNavItems.push({ name: 'Clientes', icon: UserIcon });
    }

    const handleItemClick = (item: NavItem) => {
        if (item === 'Tickets') {
            onTicketsViewed();
        }
        setActiveItem(item);
        onClose(); // Close sidebar on mobile after navigation
    };

    return (
      <>
        {/* Backdrop for mobile */}
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            aria-hidden="true"
        ></div>
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
                <div>
                    <span className="text-green-400">Elevva</span><span className="text-blue-400">Web</span>
                </div>
                <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white" aria-label="Close menu">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-grow">
              <ul>
                {baseNavItems.map(({ name, icon: Icon }) => (
                  <li key={name}>
                    <button
                      onClick={() => handleItemClick(name)}
                      className={`flex items-center w-full px-6 py-4 text-left transition-colors duration-200 relative ${activeItem === name ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-6 h-6 mr-3" />
                      <span>{name}</span>
                       {name === 'Tickets' && hasNewTicketUpdate && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-6 border-t border-gray-700">
              {/* FIX: Changed onClick from `logout` to `handleLogout` to match the component's props. */}
              <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 rounded-md">
                <LogoutIcon className="w-6 h-6 mr-3" />
                <span>Sair</span>
              </button>
            </div>
        </aside>
      </>
    );
  };
const NotificationToast: React.FC<{ notification: Notification; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    return (
        <div className="bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {notification.type === 'ticket' ? (
                            <TicketIcon className="h-6 w-6 text-blue-500" />
                        ) : (
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        )}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">{notification.type === 'ticket' ? 'Novo Ticket!' : 'Nova Mensagem!'}</p>
                        <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onDismiss(notification.id)} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="sr-only">Close</span>
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState<NavItem>('Início');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNewTicketUpdate, setHasNewTicketUpdate] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, context.currentTime); // A4 pitch
    gainNode.gain.setValueAtTime(0.1, context.currentTime); // Volume
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  };
  const triggerNotification = (message: string, type: 'ticket' | 'message') => {
    playNotificationSound();
    setHasNewTicketUpdate(true);
    setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
  };

   const dismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

  const refreshTickets = async () => {
    try {
      const ticketsData = await apiService.getTickets();
      setTickets(ticketsData);
    } catch (error) {
      console.error("Failed to refresh tickets:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
          setIsLoading(true);
          const [ticketsData, servicesData, quotesData] = await Promise.all([
            apiService.getTickets(),
            apiService.getServices(),
            apiService.getQuotes()
          ]);
          setTickets(ticketsData);
          setServices(servicesData);
          setQuotes(quotesData);
          if (user?.role === UserRole.Employee) {
            const clientsData = await apiService.getClients();
            setClients(clientsData);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
    };
    
    if (user) {
      fetchInitialData();

      // Subscription for new tickets
      const unsubscribeTickets = apiService.subscribeToTickets((payload) => {
        refreshTickets(); // Refresh ticket list in real-time
        if (document.hidden || user.role === UserRole.Employee) {
             const newTicket = payload.new as { subject: string };
             triggerNotification(`Assunto: ${newTicket.subject}`, 'ticket');
        }
      });

      // Subscription for new messages
      const unsubscribeMessages = apiService.subscribeToAllMessages((payload) => {
        const newMessage = payload.new as { author_id: string; ticket_id: number };
        // Notify if the message is from another user
        if (newMessage.author_id !== user.id) {
            refreshTickets(); // Update "last updated" time
            triggerNotification(`Nova mensagem no ticket #${newMessage.ticket_id}`, 'message');
        }
      });
      
      return () => {
        unsubscribeTickets();
        unsubscribeMessages();
      };
    }
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
    }
    switch (activeItem) {
      case 'Início':
        return <HomeView user={user} tickets={tickets} services={services} quotes={quotes} />;
      case 'Tickets':
        return <TicketsView user={user} tickets={tickets} clients={clients} refreshData={refreshTickets} />;
      case 'Serviços':
        return <ServicesView user={user} services={services} clients={clients} refreshData={() => {}} />;
      case 'Orçamentos':
        return <QuotesView user={user} quotes={quotes} clients={clients} refreshData={() => {}} />;
      case 'Clientes':
        return user?.role === UserRole.Employee ? <ClientsView clients={clients} /> : null;
      default:
        return <HomeView user={user} tickets={tickets} services={services} quotes={quotes} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
       <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map(notification => (
                    <NotificationToast key={notification.id} notification={notification} onDismiss={dismissNotification} />
                ))}
            </div>
        </div>
      <Sidebar 
        user={user} 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
        handleLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        hasNewTicketUpdate={hasNewTicketUpdate}
        onTicketsViewed={() => setHasNewTicketUpdate(false)}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
            <button onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
                <MenuIcon className="w-6 h-6 text-gray-700" />
            </button>
            <div className="text-lg font-bold text-gray-800">
                {activeItem}
            </div>
            <div className="w-6"></div> {/* Spacer */}
        </header>
        <div className="p-4 md:p-8 flex-grow">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// --- VIEWS ---

const HomeView: React.FC<{ user: User | null; tickets: Ticket[]; services: Service[]; quotes: Quote[] }> = ({ user, tickets, services, quotes }) => {
  const title = user?.role === UserRole.Employee ? "Visão Geral da Agência" : "Resumo da Sua Conta";
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo(a), {user?.name}!</h1>
      <p className="text-gray-600 mb-8">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Tickets de Suporte</h2>
          <p className="text-4xl font-bold text-blue-500">{tickets.length}</p>
          <p className="text-gray-500 mt-1">{tickets.filter(t => t.status === TicketStatus.Open).length} abertos</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Serviços</h2>
          <p className="text-4xl font-bold text-green-500">{services.length}</p>
          <p className="text-gray-500 mt-1">{services.filter(s => s.status !== ServiceStatus.Completed).length} em andamento</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Orçamentos</h2>
          <p className="text-4xl font-bold text-yellow-500">{quotes.length}</p>
          <p className="text-gray-500 mt-1">{quotes.filter(q => q.status === QuoteStatus.Requested || q.status === QuoteStatus.Sent).length} pendentes</p>
        </div>
      </div>
    </div>
  );
};

const TicketsView: React.FC<{ user: User | null; tickets: Ticket[]; clients: User[]; refreshData: () => void; }> = ({ user, tickets, clients, refreshData }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');

  const handleFinish = () => {
    setIsCreating(false);
    setSelectedTicketId(null);
    refreshData();
  }

  const filteredTickets = tickets
    .filter(ticket => {
      if (statusFilter === 'All') return true;
      return ticket.status === statusFilter;
    })
    .filter(ticket => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (!lowerSearchTerm) return true;
      const clientNameMatch = user?.role === UserRole.Employee
        ? ticket.clientName.toLowerCase().includes(lowerSearchTerm)
        : false;
      return ticket.subject.toLowerCase().includes(lowerSearchTerm) || clientNameMatch;
    });

  if (isCreating) {
    return <CreateTicketForm user={user} clients={clients} onFinish={handleFinish} />
  }

  if (selectedTicketId) {
    return <TicketDetailView ticketId={selectedTicketId} onBack={handleFinish} user={user} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tickets</h1>
        <button onClick={() => setIsCreating(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Abrir Novo Ticket
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder={user?.role === UserRole.Employee ? "Buscar por assunto ou cliente..." : "Buscar por assunto..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | TicketStatus)}
            className="w-full md:w-auto px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">Todos os Status</option>
            {Object.values(TicketStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assunto</th>
              {user?.role === UserRole.Employee && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atualização</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.subject}</td>
                {user?.role === UserRole.Employee && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.clientName}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(ticket.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={user?.role === UserRole.Employee ? 4 : 3} className="text-center py-10 text-gray-500">Nenhum ticket encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- FORMS and MODALS ---
const TicketDetailView: React.FC<{ ticketId: number; onBack: () => void; user: User | null; }> = ({ ticketId, onBack, user }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    try {
      // Don't set loading to true on refetch, to avoid flicker
      // setIsLoading(true);
      const fetchedTicket = await apiService.getTicketById(ticketId);
      setTicket(fetchedTicket);
    } catch (e) {
      console.error("Failed to fetch ticket", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchTicket(); // Initial fetch

    // FIX: Subscribe to new messages for this ticket
    const unsubscribe = apiService.subscribeToTicketMessages(ticketId, () => {
        // When a new message arrives, refetch the ticket data to get the new message
        fetchTicket();
    });

    // Cleanup subscription on component unmount
    return () => {
        unsubscribe();
    };
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;
  
    setIsSending(true);
    try {
      await apiService.addTicketMessage(ticket.id, newMessage);
      setNewMessage('');
      // CORREÇÃO: É necessário buscar os dados manualmente após o envio.
      // A assinatura em tempo real notifica apenas *outros* clientes, não o cliente que enviou a mensagem.
      // Isso garante que a mensagem do remetente apareça imediatamente.
      await fetchTicket();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    const originalStatus = ticket.status;
    setTicket(prev => prev ? { ...prev, status: newStatus } : null); // Optimistic update
    try {
      await apiService.updateTicketStatus(ticket.id, newStatus);
      await fetchTicket(); // Refresh to get latest updated_at
    } catch (error) {
      console.error("Failed to update status:", error);
      setTicket(prev => prev ? { ...prev, status: originalStatus } : null); // Revert on error
      alert("Falha ao atualizar o status do ticket.");
    }
  };


  if (isLoading) return <div className="text-center p-8">Carregando ticket...</div>;
  if (!ticket) return <div className="text-center p-8">Ticket não encontrado.</div>;

  return (
    <div>
      <button onClick={onBack} className="text-blue-600 mb-4 font-semibold">&larr; Voltar para tickets</button>
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <h1 className="text-2xl font-bold text-gray-800 flex-grow">{ticket.subject}</h1>
            {user?.role === UserRole.Employee ? (
              <div className="flex-shrink-0 w-full md:w-auto">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className={`w-full text-sm font-semibold rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2 ${statusColors[ticket.status].replace('bg-', 'border-').replace('-100', '-300')} ${statusColors[ticket.status].replace('text-', 'bg-').replace('-800', '-100')} ${statusColors[ticket.status]}`}
                  aria-label="Alterar status do ticket"
                >
                  {Object.values(TicketStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            ) : (
              <span className={`px-3 py-1 self-start inline-flex text-sm leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>{ticket.status}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
            <span>Cliente: <span className="font-medium text-gray-700">{ticket.clientName}</span></span>
            <span>Criado em: {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
            <span>Última atualização: {format(new Date(ticket.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
        </div>
        <div className="p-6 space-y-4 h-96 overflow-y-auto bg-gray-50">
          {ticket.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.authorId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-3 rounded-lg shadow ${msg.authorId === user?.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                <p className="font-bold text-sm">{msg.authorName}</p>
                <p className="text-base whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-right mt-1 opacity-75">{format(new Date(msg.timestamp), "HH:mm")}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {ticket.status !== TicketStatus.Closed && (
          <form onSubmit={handleSendMessage} className="flex items-center border-t p-4">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-grow border-gray-300 rounded-md shadow-sm mr-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="submit" disabled={isSending} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors">
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


const CreateTicketForm: React.FC<{ user: User | null; clients: User[]; onFinish: () => void }> = ({ user, clients, onFinish }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [clientId, setClientId] = useState<string | undefined>(user?.role === UserRole.Client ? user?.id : undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === UserRole.Employee && !clientId) {
      alert("Por favor, selecione um cliente.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiService.createTicket({ subject, message, clientId: clientId! });
      onFinish();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={onFinish} className="text-blue-600 mb-4 font-semibold">&larr; Voltar</button>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Abrir Novo Ticket</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === UserRole.Employee && (
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700">Cliente</label>
              <select id="client" value={clientId} onChange={e => setClientId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="">Selecione um cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Assunto</label>
            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Descreva seu problema</label>
            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors">
            {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};


const ServicesView: React.FC<{ user: User | null; services: Service[]; clients: User[]; refreshData: () => void; }> = ({ user, services, clients, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingService(null);
    refreshData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Serviços</h1>
        {user?.role === UserRole.Employee && (
          <button onClick={() => { setEditingService(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Criar Serviço
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
              {user?.role === UserRole.Employee && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Início</th>
              {user?.role === UserRole.Employee && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map(service => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                {user?.role === UserRole.Employee && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.clientName}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[service.status]}`}>
                    {service.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(service.startDate), "dd/MM/yyyy", { locale: ptBR })}</td>
                {user?.role === UserRole.Employee && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => { setEditingService(service); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900">
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={user?.role === UserRole.Employee ? 5 : 4} className="text-center py-10 text-gray-500">Nenhum serviço encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && <ServiceFormModal service={editingService} clients={clients} onClose={handleClose} />}
    </div>
  );
};


const QuotesView: React.FC<{ user: User | null; quotes: Quote[]; clients: User[]; refreshData: () => void; }> = ({ user, quotes, clients, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingQuote(null);
    refreshData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orçamentos</h1>
        {user?.role === UserRole.Employee && (
          <button onClick={() => { setEditingQuote(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Criar Orçamento
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              {user?.role === UserRole.Employee && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              {user?.role === UserRole.Employee && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quotes.map(quote => (
              <tr key={quote.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.description}</td>
                {user?.role === UserRole.Employee && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.clientName}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[quote.status]}`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(quote.createdAt), "dd/MM/yyyy", { locale: ptBR })}</td>
                {user?.role === UserRole.Employee && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => { setEditingQuote(quote); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900">
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={user?.role === UserRole.Employee ? 6 : 5} className="text-center py-10 text-gray-500">Nenhum orçamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && <QuoteFormModal quote={editingQuote} clients={clients} onClose={handleClose} />}
    </div>
  );
};


const ClientsView: React.FC<{ clients: User[] }> = ({ clients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Clientes</h1>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map(client => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.company || 'N/A'}</td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr><td colSpan={3} className="text-center py-10 text-gray-500">Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- MODAL COMPONENTS ---

const Modal: React.FC<{ children: React.ReactNode; title: string; onClose: () => void }> = ({ children, title, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);


const ServiceFormModal: React.FC<{ service: Service | null; clients: User[]; onClose: () => void }> = ({ service, clients, onClose }) => {
  const [formData, setFormData] = useState({
    clientId: service?.clientId || '',
    name: service?.name || '',
    status: service?.status || ServiceStatus.Pending,
    startDate: service ? format(new Date(service.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    observation: service?.observation || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // FIX: The `Service` type expects `startDate` to be a `Date` object, but the form state stores it as a string.
      // Create a new payload object converting the `startDate` string to a `Date` object to satisfy the type checking.
      // Appending 'T00:00:00' ensures the date string is parsed in the local timezone, preventing off-by-one day errors.
      const payload = {
        ...formData,
        startDate: new Date(`${formData.startDate}T00:00:00`),
      };

      if (service) { // Editing
        await apiService.updateService(service.id, payload);
      } else { // Creating
        await apiService.createService(payload);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save service", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={service ? "Editar Serviço" : "Criar Novo Serviço"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Cliente</label>
          <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option value="">Selecione um cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
          <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            {Object.values(ServiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="observation" className="block text-sm font-medium text-gray-700">Observação</label>
          <textarea id="observation" name="observation" value={formData.observation} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const QuoteFormModal: React.FC<{ quote: Quote | null; clients: User[]; onClose: () => void }> = ({ quote, clients, onClose }) => {
  const [formData, setFormData] = useState({
    clientId: quote?.clientId || '',
    description: quote?.description || '',
    status: quote?.status || QuoteStatus.Requested,
    value: quote?.value || 0,
    observation: quote?.observation || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (quote) { // Editing
        await apiService.updateQuote(quote.id, formData);
      } else { // Creating
        await apiService.createQuote(formData);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save quote", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Modal title={quote ? "Editar Orçamento" : "Criar Novo Orçamento"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Cliente</label>
          <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option value="">Selecione um cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
          <input type="number" id="value" name="value" value={formData.value} onChange={handleChange} required step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            {Object.values(QuoteStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="observation" className="block text-sm font-medium text-gray-700">Observação</label>
          <textarea id="observation" name="observation" value={formData.observation} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default Dashboard;