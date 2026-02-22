import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CandidateStoreService } from '../../store/candidate.store';

function xlsxFileValidator(control: AbstractControl): ValidationErrors | null {
  const file: File | null = control.value;
  if (!file) return null;
  const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
    return { invalidFileType: true };
  }
  return null;
}

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>Add Candidate</mat-card-title>
        <mat-card-subtitle>Fill in the required fields and upload the Excel file</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="John" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Surname</mat-label>
            <input matInput formControlName="surname" placeholder="Doe" />
            <mat-error *ngIf="form.get('surname')?.hasError('required')">Surname is required</mat-error>
          </mat-form-field>

          <div class="file-field">
            <label class="file-label">Excel File <span class="required">*</span></label>
            <div class="file-row">
              <button type="button" mat-stroked-button (click)="fileInput.click()" color="primary">
                <mat-icon>upload_file</mat-icon>
                {{ selectedFileName || 'Choose file (.xlsx)' }}
              </button>
              <input #fileInput type="file" accept=".xlsx,.xls" hidden (change)="onFileChange($event)" />
            </div>
            <mat-error *ngIf="form.get('file')?.invalid && form.get('file')?.touched" class="file-error">
              <span *ngIf="form.get('file')?.hasError('required')">Excel file is required</span>
              <span *ngIf="form.get('file')?.hasError('invalidFileType')">Only .xlsx or .xls files are accepted</span>
            </mat-error>
          </div>

          <div class="actions">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || (loading$ | async)"
            >
              <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
              <span *ngIf="!(loading$ | async)">Submit</span>
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card { max-width: 480px; margin: 24px auto; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .file-field { margin-bottom: 16px; }
    .file-label { display: block; font-size: 12px; color: rgba(0,0,0,.6); margin-bottom: 6px; }
    .required { color: #f44336; }
    .file-row { display: flex; align-items: center; gap: 8px; }
    .file-error { font-size: 12px; color: #f44336; margin-top: 4px; display: block; }
    .actions { display: flex; justify-content: flex-end; margin-top: 8px; }
    mat-spinner { display: inline-block; margin-right: 6px; }
  `],
})
export class CandidateFormComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  form!: FormGroup;
  selectedFileName = '';
  readonly loading$ = this.store.loading$;

  constructor(
    private fb: FormBuilder,
    private store: CandidateStoreService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      file: [null, [Validators.required, xlsxFileValidator]],
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFileName = file?.name ?? '';
    this.form.get('file')!.setValue(file);
    this.form.get('file')!.markAsTouched();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, surname, file } = this.form.value;
    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('surname', surname.trim());
    fd.append('file', file);

    this.store.create(fd).subscribe(() => {
      this.snackBar.open('Candidate added successfully!', 'Close', { duration: 3000 });
      this.form.reset();
      this.selectedFileName = '';
      if (this.fileInputRef) {
        this.fileInputRef.nativeElement.value = '';
      }
    });
  }
}
