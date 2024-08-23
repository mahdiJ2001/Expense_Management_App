import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Income } from '../models/income.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  private baseUrl = 'http://localhost:8090/budgets';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllIncomes(): Observable<Income[]> {
    const userId = this.authService.getUserId();
    if (userId) {
      return this.http.get<Income[]>(`${this.baseUrl}/user/${userId}`).pipe(
        catchError(error => {
          console.error('Failed to fetch incomes:', error);
          return throwError(error);
        })
      );
    } else {
      return throwError('User not logged in');
    }
  }

  getIncomeById(id: number): Observable<Income> {
    return this.http.get<Income>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Failed to fetch income:', error);
        return throwError(error);
      })
    );
  }

  createIncome(income: Income): Observable<Income> {
    return this.http.post<Income>(this.baseUrl, income).pipe(
      catchError(error => {
        console.error('Failed to create income:', error);
        return throwError(error);
      })
    );
  }

  updateIncome(id: number, income: Income): Observable<Income> {
    return this.http.put<Income>(`${this.baseUrl}/${id}`, income).pipe(
      catchError(error => {
        console.error('Failed to update income:', error);
        return throwError(error);
      })
    );
  }

  deleteIncome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Failed to delete income:', error);
        return throwError(error);
      })
    );
  }

  bulkUploadIncomes(file: File): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError('User not logged in');
    }
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/bulk-upload/${userId}`, formData).pipe(
      catchError(error => {
        console.error('Failed to upload incomes:', error);
        return throwError(error);
      })
    );
  }
}
