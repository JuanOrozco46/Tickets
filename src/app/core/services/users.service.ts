import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  updateUserRole(userId: string, role: UserRole): Observable<User> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}/role`, { role }).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  getAgents(): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}?role=agent`).pipe(
      map((res: any) => res?.data ?? res)
    );
  }
}
