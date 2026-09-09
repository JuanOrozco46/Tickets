import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  createTicket(payload: CreateTicketPayload): Observable<Ticket> {
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  updateTicket(id: string, payload: UpdateTicketPayload): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  assignAgent(ticketId: string, agentId: string): Observable<Ticket> {
    return this.http.post<any>(`${this.apiUrl}/${ticketId}/assign`, { agentId }).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  getComments(ticketId: string): Observable<Comment[]> {
    return this.http.get<any>(`${this.apiUrl}/${ticketId}/comments`).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  addComment(ticketId: string, message: string): Observable<Comment> {
    return this.http.post<any>(`${this.apiUrl}/${ticketId}/comments`, { body: message }).pipe(
      map((res: any) => res?.data ?? res)
    );
  }
}
