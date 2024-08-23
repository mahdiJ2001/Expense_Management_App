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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-income-edit',
  templateUrl: './income-edit.component.html',
  styleUrls: ['./income-edit.component.css'],
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
export class IncomeEditComponent implements OnInit {
  incomeForm: FormGroup;
  categories: Category[] = [];
  incomeId: number;

  constructor(
    private fb: FormBuilder,
    private incomeService: IncomeService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.incomeForm = this.fb.group({
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.incomeId = +this.route.snapshot.paramMap.get('id');
    if (this.incomeId) {
      this.loadIncome();
    }
    this.loadCategories();
  }

  loadIncome(): void {
    this.incomeService.getIncomeById(this.incomeId).subscribe(
      (income: Income) => {
        this.incomeForm.patchValue({
          amount: income.amount,
          category: income.categoryId,
          date: new Date(income.date),
          note: income.note
        });
      },
      error => {
        console.error('Failed to load income:', error);
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
      const categoryId = formValues.category;

      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);

        const updatedIncome: any = {
          id: this.incomeId,
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

        console.log('Updating income with ID:', this.incomeId);
        console.log('Updated income payload:', updatedIncome);

        this.incomeService.updateIncome(this.incomeId, updatedIncome).subscribe(
          () => {
            console.log('Income updated successfully');
            this.router.navigate(['/income']);
          },
          error => {
            console.error('Failed to update income:', error);
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


  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  goToCategoryPage(): void {
    this.router.navigate(['/categories']);
  }
}
