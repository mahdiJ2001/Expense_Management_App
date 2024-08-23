import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ExpenseService } from '../../services/expense.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-upload-expenses',
  templateUrl: './upload-expenses.component.html',
  styleUrls: ['./upload-expenses.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ]
})
export class UploadExpensesComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  fileError: string | null = null;

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    public dialogRef: MatDialogRef<UploadExpensesComponent>
  ) {
    this.uploadForm = this.fb.group({});
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget as HTMLElement;
    container.classList.add('drag-over');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget as HTMLElement;
    container.classList.remove('drag-over');
    const file = event.dataTransfer?.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.selectedFile = file;
      this.fileError = null;
    } else {
      this.fileError = 'Please select a valid Excel file.';
      this.selectedFile = null;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget as HTMLElement;
    container.classList.remove('drag-over');
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.selectedFile = file;
      this.fileError = null;
    } else {
      this.fileError = 'Please select a valid Excel file.';
      this.selectedFile = null;
    }
  }

  onSubmit(): void {
    if (this.selectedFile) {
      this.expenseService.bulkUploadExpenses(this.selectedFile).subscribe(
        () => {
          this.dialogRef.close();
        },
        error => {
          console.error('Error uploading file:', error);
        }
      );
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
