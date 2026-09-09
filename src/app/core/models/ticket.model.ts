export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Comment {
  id: string;
  ticketId: string;
  userId?: string;
  authorId?: string;
  userName?: string;
  author?: {
    id: string;
    name: string;
    role: string;
  };
  message?: string;
  body?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  clientId?: string;
  createdBy?: string;
  agentId?: string | null;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}
