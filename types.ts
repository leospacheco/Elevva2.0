
export enum UserRole {
  Client = 'client',
  Employee = 'employee',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
}

export enum TicketStatus {
  Open = 'Aberto',
  InProgress = 'Em Andamento',
  Closed = 'Fechado',
}

export interface TicketMessage {
  // FIX: Changed id from string to number to match database schema.
  id: number;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
}

export interface Ticket {
  // FIX: Changed id from string to number to match database schema.
  id: number;
  clientId: string;
  clientName: string;
  subject: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
}

export enum ServiceStatus {
  Pending = 'Pendente',
  Development = 'Em Desenvolvimento',
  Review = 'Em Revisão',
  Completed = 'Concluído',
}

export interface Service {
  // FIX: Changed id from string to number to match database schema.
  id: number;
  clientId: string;
  clientName: string;
  name: string;
  status: ServiceStatus;
  startDate: Date;
  observation?: string;
}

export enum QuoteStatus {
  Requested = 'Solicitado',
  Sent = 'Enviado',
  Approved = 'Aprovado',
  Rejected = 'Rejeitado',
}

export interface Quote {
  // FIX: Changed id from string to number to match database schema.
  id: number;
  clientId: string;
  clientName: string;
  description: string;
  status: QuoteStatus;
  value: number;
  createdAt: Date;
  observation?: string;
}
