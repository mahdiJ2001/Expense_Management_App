import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ExpenseService } from '../../services/expense.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { Expense } from '../../models/expense.model';
import { Category } from '../../models/category.model';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadExpensesComponent } from '../upload-expenses/upload-expenses.component';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule
  ]
})
export class ExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  recentExpenses: Expense[] = [];
  allExpenses: Expense[] = [];
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private reportService: ReportService,
    private dialog: MatDialog
  ) {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      date: [new Date(), Validators.required],
      category: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadExpenses();
  }

  get totalExpense(): number {
    return this.allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  loadExpenses(): void {
    this.expenseService.getAllExpenses().subscribe(
      (expenses: Expense[]) => {
        this.allExpenses = expenses;

        this.recentExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
      },
      error => {
        console.error('Failed to load expenses:', error);
      }
    );
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (categories: Category[]) => {
        this.categories = categories;
      },
      error => {
        console.error('Failed to load categories:', error);
      }
    );
  }

  submitForm(): void {
    if (this.expenseForm.valid) {
      const formValues = this.expenseForm.value;
      const userIdStr = this.authService.getUserId();

      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const categoryId = formValues.category;

        const newExpense: any = {
          amount: parseFloat(formValues.amount),
          category: {
            id: categoryId
          },
          date: this.formatDate(formValues.date),
          note: formValues.note,
          user: {
            id: userId
          }
        };

        this.expenseService.createExpense(newExpense).subscribe(
          (createdExpense: any) => {
            console.log('Expense created successfully:', createdExpense);

            this.allExpenses.push(createdExpense);
            this.recentExpenses.unshift(createdExpense);

            if (this.recentExpenses.length > 10) {
              this.recentExpenses.pop();
            }

            this.expenseForm.reset();
          },
          error => {
            console.error('Failed to create expense:', error);
          }
        );
      } else {
        console.error('User not logged in');
      }
    } else {
      Object.values(this.expenseForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  editExpense(expense: Expense): void {
    console.log('Edit expense:', expense);
    this.router.navigate(['/expense/edit', expense.id]);
  }

  deleteExpense(expenseId: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(expenseId).subscribe(
        () => {
          this.allExpenses = this.allExpenses.filter(expense => expense.id !== expenseId);
          this.recentExpenses = this.recentExpenses.filter(expense => expense.id !== expenseId);
          console.log('Expense deleted successfully');
        },
        error => {
          console.error('Failed to delete expense:', error);
        }
      );
    }
  }

  goToCategoryPage(): void {
    this.router.navigate(['/categories']);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  generateReport(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.reportService.generateExpenseReport(Number(userId)).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'UserExpenseReport.pdf';
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error => {
          console.error('Failed to generate report:', error);
        }
      );
    } else {
      console.error('User not logged in');
    }
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadExpensesComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.loadExpenses();
    });
  }
}
