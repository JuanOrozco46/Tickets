import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  updateUserRole(userId: string, role: UserRole): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role`, { role });
  }

  getAgents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?role=agent`);
  }
}
