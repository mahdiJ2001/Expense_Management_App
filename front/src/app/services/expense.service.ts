import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Expense } from '../models/expense.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private baseUrl = 'http://localhost:8090/expenses';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllExpenses(): Observable<Expense[]> {
    const userId = this.authService.getUserId();
    if (userId) {
      return this.http.get<Expense[]>(`${this.baseUrl}/user/${userId}`).pipe(
        catchError(error => {
          console.error('Failed to fetch expenses:', error);
          return throwError(error);
        })
      );
    } else {
      return throwError('User not logged in');
    }
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Failed to fetch expense:', error);
        return throwError(error);
      })
    );
  }

  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, expense).pipe(
      catchError(error => {
        console.error('Failed to create expense:', error);
        return throwError(error);
      })
    );
  }

  updateExpense(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, expense).pipe(
      catchError(error => {
        console.error('Failed to update expense:', error);
        return throwError(error);
      })
    );
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Failed to delete expense:', error);
        return throwError(error);
      })
    );
  }


  bulkUploadExpenses(file: File): Observable<any> {
    const userId = this.authService.getUserId();
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.baseUrl}/bulk-upload/${userId}`, formData).pipe(
      catchError(error => {
        console.error('Failed to upload expenses:', error);
        return throwError(error);
      })
    );
  }



}
