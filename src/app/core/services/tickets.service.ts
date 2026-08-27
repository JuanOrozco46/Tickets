import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket, Comment, TicketStatus, TicketPriority } from '../models/ticket.model';

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  agentId?: string | null;
}

export interface TicketFilterParams {
  status?: string;
  priority?: string;
  clientId?: string;
  agentId?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tickets`;

  getTickets(filters?: TicketFilterParams): Observable<Ticket[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.clientId) params = params.set('clientId', filters.clientId);
      if (filters.agentId) params = params.set('agentId', filters.agentId);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    return this.http.get<Ticket[]>(this.apiUrl, { params });
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  createTicket(payload: CreateTicketPayload): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, payload);
  }

  updateTicket(id: string, payload: UpdateTicketPayload): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, payload);
  }

  assignAgent(ticketId: string, agentId: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}`, { agentId });
  }

  getComments(ticketId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${ticketId}/comments`);
  }

  addComment(ticketId: string, message: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${ticketId}/comments`, { message });
  }
}
