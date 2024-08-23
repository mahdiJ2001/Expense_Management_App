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
import { IncomeService } from '../../services/income.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { Income } from '../../models/income.model';
import { Category } from '../../models/category.model';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadIncomesComponent } from '../upload-incomes/upload-incomes.component';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css'],
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
export class IncomeComponent implements OnInit {
  incomeForm: FormGroup;
  allIncomes: Income[] = [];
  recentIncome: Income[] = [];
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private incomeService: IncomeService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private reportService: ReportService,
    private dialog: MatDialog
  ) {
    this.incomeForm = this.fb.group({
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      date: [new Date(), Validators.required],
      category: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadIncomes();
  }

  get totalIncome(): number {
    return this.allIncomes.reduce((sum, income) => sum + income.amount, 0);
  }

  loadIncomes(): void {
    this.incomeService.getAllIncomes().subscribe(
      (incomes: Income[]) => {
        this.allIncomes = incomes;
        this.recentIncome = this.allIncomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
      },
      error => {
        console.error('Failed to load incomes:', error);
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
    if (this.incomeForm.valid) {
      const formValues = this.incomeForm.value;
      const userIdStr = this.authService.getUserId();

      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const categoryId = formValues.category;

        const newIncome: any = {
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

        this.incomeService.createIncome(newIncome).subscribe(
          (createdIncome: any) => {
            console.log('Income created successfully:', createdIncome);
            this.allIncomes.unshift(createdIncome);
            if (this.allIncomes.length > 10) {
              this.allIncomes.pop();
            }
            this.recentIncome = this.allIncomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
            this.incomeForm.reset();
          },
          error => {
            console.error('Failed to create income:', error);
          }
        );
      } else {
        console.error('User not logged in');
      }
    } else {
      Object.values(this.incomeForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  editIncome(income: Income): void {
    console.log('Edit income:', income);
    this.router.navigate(['/income/edit', income.id]);
  }

  deleteIncome(incomeId: number): void {
    if (confirm('Are you sure you want to delete this income?')) {
      this.incomeService.deleteIncome(incomeId).subscribe(
        () => {
          this.allIncomes = this.allIncomes.filter(income => income.id !== incomeId);
          this.recentIncome = this.allIncomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
          console.log('Income deleted successfully');
        },
        error => {
          console.error('Failed to delete income:', error);
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
      this.reportService.generateIncomeReport(Number(userId)).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'UserIncomeReport.pdf';
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
    const dialogRef = this.dialog.open(UploadIncomesComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.loadIncomes();
    });
  }
}
