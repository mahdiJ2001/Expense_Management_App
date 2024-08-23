import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    ReactiveFormsModule
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categoryForm: FormGroup;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
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
    if (this.categoryForm.valid) {
      const userId = this.authService.getUserId();

      console.log('Retrieved User ID:', userId);

      if (userId) {
        const newCategory: any = {
          name: this.categoryForm.value.name,
          user: { id: Number(userId) }
        };

        console.log('Submitting new category:', newCategory);

        this.categoryService.createCategory(newCategory).subscribe(
          (createdCategory: Category) => {
            console.log('Category created successfully:', createdCategory);
            this.categories.push(createdCategory);
            this.categoryForm.reset();
          },
          error => {
            console.error('Failed to create category:', error);
          }
        );
      } else {
        console.error('User ID is not available.');
      }
    } else {
      Object.values(this.categoryForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe(
        () => {
          this.categories = this.categories.filter(category => category.id !== categoryId);
        },
        error => {
          console.error('Failed to delete category:', error);
        }
      );
    }
  }
}
