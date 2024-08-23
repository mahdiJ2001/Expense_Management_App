import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

export interface LoginResponse {
  token: string;
  userId: string;
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://localhost:8090/auth/login';
  private registerUrl = 'http://localhost:8090/auth/register';
  private tokenKey = 'authToken';
  private userIdKey = 'userId';

  private userDetailsSubject = new BehaviorSubject<any>(null);
  userDetails$ = this.userDetailsSubject.asObservable();

  constructor(private http: HttpClient, private userService: UserService) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { email, password }).pipe(
      tap(response => {
        if (this.isBrowserEnvironment() && response.token && response.userId) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userIdKey, response.userId);
        }
      }),
      switchMap(response => {

        return this.fetchUserDetails(response.userId);
      })
    );
  }

  register(user: { firstName: string; lastName: string; email: string; phone: string; password: string; role: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.registerUrl, user);
  }

  logout(): void {
    if (this.isBrowserEnvironment()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userIdKey);
      this.userDetailsSubject.next(null);
    }
  }

  isLoggedIn(): boolean {
    return this.isBrowserEnvironment() && !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return this.isBrowserEnvironment() ? localStorage.getItem(this.tokenKey) : null;
  }

  getUserId(): string | null {
    return this.isBrowserEnvironment() ? localStorage.getItem(this.userIdKey) : null;
  }

  /**
   * Fetch user details by user ID and update the user details subject.
   * @param userId - The ID of the user
   */
  fetchUserDetails(userId: string): Observable<any> {
    return this.userService.getUserById(userId).pipe(
      tap(user => {
        this.userDetailsSubject.next(user);
      })
    );
  }

  private isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
