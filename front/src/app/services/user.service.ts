import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userDetailsUrl = 'http://localhost:8090/users';

  constructor(private http: HttpClient) { }

  /**
   * Get user details by user ID
   * @param userId - The ID of the user
   * @returns An Observable containing the user details
   */
  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.userDetailsUrl}/${userId}`);
  }
}
