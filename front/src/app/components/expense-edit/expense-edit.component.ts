import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-expense-edit',
  templateUrl: './expense-edit.component.html',
  styleUrls: ['./expense-edit.component.css'],
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
    MatGridListModule,
    MatListModule
  ]
})
export class ExpenseEditComponent implements OnInit {
  expenseEditForm: FormGroup;
  categories: Category[] = [];
  expenseId: number;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.expenseEditForm = this.fb.group({
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.expenseId = +this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.loadExpense();
    }
    this.loadCategories();
  }

  loadExpense(): void {
    this.expenseService.getExpenseById(this.expenseId).subscribe(
      (expense: Expense) => {
        console.log('Fetched expense:', expense);
        if (expense) {
          this.expenseEditForm.patchValue({
            amount: expense.amount,
            category: expense.categoryId || '',
            date: new Date(expense.date),
            note: expense.note
          });
        } else {
          console.error('Expense is undefined');
        }
      },
      error => {
        console.error('Failed to load expense:', error);
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

  submitEditForm(): void {
    if (this.expenseEditForm.valid) {
      const formValues = this.expenseEditForm.value;

      const userId = this.authService.getUserId();
      const categoryId = formValues.category;

      const updatedExpense: any = {
        amount: parseFloat(formValues.amount),
        category: {
          id: categoryId,
        },
        date: formValues.date,
        note: formValues.note,
        user: {
          id: userId
        }
      };

      this.expenseService.updateExpense(this.expenseId, updatedExpense).subscribe(
        () => {
          console.log('Expense updated successfully');
          this.router.navigate(['/expense']);
        },
        error => {
          console.error('Failed to update expense:', error);
        }
      );
    } else {
      Object.values(this.expenseEditForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  goToCategoryPage(): void {
    this.router.navigate(['/categories']);
  }
}
