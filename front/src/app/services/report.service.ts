import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = 'http://localhost:8090/reports';

  constructor(private http: HttpClient) { }

  /**
   * Generate an expense report for the given user ID.
   * @param userId - The ID of the user for whom to generate the expense report.
   * @returns An Observable that emits the PDF report as a Blob.
   */
  generateExpenseReport(userId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/generate/expenses/${userId}`, { responseType: 'blob' });
  }

  /**
   * Generate an income report for the given user ID.
   * @param userId - The ID of the user for whom to generate the income report.
   * @returns An Observable that emits the PDF report as a Blob.
   */
  generateIncomeReport(userId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/generate/incomes/${userId}`, { responseType: 'blob' });
  }
}
