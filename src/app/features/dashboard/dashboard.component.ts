import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TicketsService } from '../../core/services/tickets.service';
import { UsersService } from '../../core/services/users.service';
import { Ticket, Comment, TicketPriority, TicketStatus } from '../../core/models/ticket.model';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private ticketsService = inject(TicketsService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  currentUser$ = this.authService.currentUser$;
  currentUser: User | null = null;

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  agents: User[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Filter States
  selectedStatus: string = '';
  selectedPriority: string = '';
  searchQuery: string = '';

  // Modals
  showCreateModal = false;
  selectedTicket: Ticket | null = null;
  ticketComments: Comment[] = [];
  loadingComments = false;

  // Forms
  createTicketForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    priority: ['medium' as TicketPriority, [Validators.required]]
  });

  newCommentMessage = '';

  ngOnInit(): void {
    this.currentUser = this.authService.getUserFromStorage();
    this.currentUser$.subscribe(user => {
      this.currentUser = user || this.authService.getUserFromStorage();
      this.applyFilters();
    });
    this.loadTickets();
    if (this.currentUser?.role === 'admin') {
      this.loadAgents();
    }
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = null;

    this.ticketsService.getTickets().subscribe({
      next: (data: any) => {
        this.loading = false;
        const list = Array.isArray(data) ? data : data?.data || [];
        this.tickets = Array.isArray(list) ? list : [];
        this.applyFilters();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al cargar los tickets.';
      }
    });
  }

  loadAgents(): void {
    this.usersService.getAgents().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        this.agents = Array.isArray(list) ? list : [];
      },
      error: () => {}
    });
  }

  applyFilters(): void {
    let result = Array.isArray(this.tickets) ? [...this.tickets] : [];

    // Filter by role view rules if backend returns all
    if (this.currentUser?.role === 'client') {
      const uId = this.currentUser?.id;
      const uEmail = this.currentUser?.email;
      result = result.filter(t => {
        const creator = t.clientId || t.createdBy || (t as any).userId;
        return creator === uId || creator === uEmail;
      });
    } else if (this.currentUser?.role === 'agent') {
      const uId = this.currentUser?.id;
      const uEmail = this.currentUser?.email;
      result = result.filter(t => {
        const agent = t.agentId || t.assignedTo;
        return !agent || agent === uId || agent === uEmail;
      });
    }

    if (this.selectedStatus) {
      result = result.filter(t => t.status === this.selectedStatus);
    }

    if (this.selectedPriority) {
      result = result.filter(t => t.priority === this.selectedPriority);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    this.filteredTickets = result;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createTicketForm.reset({ priority: 'medium' });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onCreateTicket(): void {
    if (this.createTicketForm.invalid) {
      this.createTicketForm.markAllAsTouched();
      return;
    }

    const payload = {
      title: this.createTicketForm.value.title!,
      description: this.createTicketForm.value.description!,
      priority: this.createTicketForm.value.priority! as TicketPriority
    };

    this.ticketsService.createTicket(payload).subscribe({
      next: (newTicket: any) => {
        const ticketObj = newTicket?.data || newTicket;
        if (!Array.isArray(this.tickets)) {
          this.tickets = [];
        }
        this.tickets.unshift(ticketObj);
        this.applyFilters();
        this.closeCreateModal();
        this.showSuccess('Ticket creado exitosamente.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al crear el ticket.';
      }
    });
  }

  selectTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.loadComments(ticket.id);
  }

  closeTicketDetail(): void {
    this.selectedTicket = null;
    this.ticketComments = [];
  }

  loadComments(ticketId: string): void {
    this.loadingComments = true;
    this.ticketsService.getComments(ticketId).subscribe({
      next: (comments: any) => {
        this.loadingComments = false;
        const list = Array.isArray(comments) ? comments : comments?.data || [];
        this.ticketComments = Array.isArray(list) ? list : [];
      },
      error: () => {
        this.loadingComments = false;
        this.ticketComments = [];
      }
    });
  }

  onAddComment(): void {
    if (!this.newCommentMessage.trim() || !this.selectedTicket) return;

    this.ticketsService.addComment(this.selectedTicket.id, this.newCommentMessage.trim()).subscribe({
      next: (newComment: any) => {
        const commentObj = newComment?.data || newComment;
        if (!Array.isArray(this.ticketComments)) {
          this.ticketComments = [];
        }
        this.ticketComments.push(commentObj);
        this.newCommentMessage = '';
      },
      error: (err) => {
        alert(err.error?.message || 'Error al agregar el comentario.');
      }
    });
  }

  onUpdateStatus(ticket: Ticket, newStatus: string): void {
    this.ticketsService.updateTicket(ticket.id, { status: newStatus as TicketStatus }).subscribe({
      next: (updated: any) => {
        const updatedObj = updated?.data || updated;
        ticket.status = updatedObj.status || newStatus;
        this.applyFilters();
        this.showSuccess('Estado actualizado.');
      },
      error: (err) => {
        alert(err.error?.message || 'Error al cambiar el estado.');
      }
    });
  }

  onAssignAgent(ticket: Ticket, agentId: string): void {
    this.ticketsService.assignAgent(ticket.id, agentId).subscribe({
      next: (updated: any) => {
        const updatedObj = updated?.data || updated;
        ticket.agentId = updatedObj.agentId || updatedObj.assignedTo || agentId;
        ticket.assignedTo = updatedObj.assignedTo || updatedObj.agentId || agentId;
        this.applyFilters();
        this.showSuccess('Agente asignado.');
      },
      error: (err) => {
        alert(err.error?.message || 'Error al asignar el agente.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}
