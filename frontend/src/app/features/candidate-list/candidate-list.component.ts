import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable } from 'rxjs';
import { Candidate } from '@candidate-platform/shared';
import { CandidateStoreService } from '../../store/candidate.store';
import { CandidateFormComponent } from '../candidate-form/candidate-form.component';

@Component({
  selector: 'app-candidate-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule, MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Candidate</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Surname</mat-label>
          <input matInput formControlName="surname" />
        </mat-form-field>
        <div class="row-fields">
          <mat-form-field appearance="outline">
            <mat-label>Seniority</mat-label>
            <mat-select formControlName="seniority">
              <mat-option value="junior">Junior</mat-option>
              <mat-option value="senior">Senior</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Years Exp.</mat-label>
            <input matInput type="number" formControlName="years" />
          </mat-form-field>
        </div>
        <div class="checkbox-field">
          <mat-checkbox formControlName="availability" color="primary">Available</mat-checkbox>
        </div>
        <div class="file-field">
          <label class="file-label">Replace Excel File (Optional)</label>
          <div class="file-row">
            <button type="button" mat-stroked-button (click)="fileInput.click()" color="primary">
              <mat-icon>upload_file</mat-icon>
              {{ selectedFileName || 'Choose new file (.xlsx)' }}
            </button>
            <input #fileInput type="file" accept=".xlsx,.xls" hidden (change)="onFileChange($event)" />
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-form { padding-top: 16px; min-width: 320px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .row-fields { display: flex; gap: 16px; }
    .row-fields mat-form-field { flex: 1; }
    .checkbox-field { margin-bottom: 16px; }
    .file-field { margin-top: 8px; margin-bottom: 16px; }
    .file-label { display: block; font-size: 12px; color: rgba(0,0,0,.6); margin-bottom: 6px; }
    .file-row { display: flex; align-items: center; gap: 8px; }
  `]
})
export class CandidateEditDialog {
  form: FormGroup;
  selectedFileName = '';
  file: File | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CandidateEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Candidate
  ) {
    this.form = this.fb.group({
      name: [data.name, [Validators.required, Validators.minLength(2)]],
      surname: [data.surname, [Validators.required, Validators.minLength(2)]],
      seniority: [data.seniority, [Validators.required]],
      years: [data.years, [Validators.required, Validators.min(0)]],
      availability: [data.availability]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFileName = file?.name ?? '';
    this.file = file;
  }

  save(): void {
    if (this.form.invalid) return;

    if (this.file) {
      const fd = new FormData();
      fd.append('name', this.form.value.name.trim());
      fd.append('surname', this.form.value.surname.trim());
      fd.append('file', this.file);
      this.dialogRef.close(fd);
    } else {
      const jsonPayload = {
        name: this.form.value.name.trim(),
        surname: this.form.value.surname.trim(),
        seniority: this.form.value.seniority,
        years: this.form.value.years,
        availability: this.form.value.availability,
      };
      this.dialogRef.close(jsonPayload);
    }
  }
}

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    CandidateFormComponent,
  ],
  template: `
    <app-candidate-form></app-candidate-form>
    <mat-card>
      <mat-card-header>
        <mat-card-title>Candidates</mat-card-title>
        <mat-card-subtitle>{{ (candidates$ | async)?.length ?? 0 }} total</mat-card-subtitle>
      </mat-card-header>

      <mat-progress-bar mode="indeterminate" *ngIf="loading$ | async"></mat-progress-bar>

      <mat-card-content>
        <div *ngIf="error$ | async as err" class="error-banner">
          <mat-icon>error_outline</mat-icon> {{ err }}
        </div>

        <table mat-table [dataSource]="(candidates$ | async) ?? []" class="full-width">
          <!-- Name -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>
          <!-- Surname -->
          <ng-container matColumnDef="surname">
            <th mat-header-cell *matHeaderCellDef>Surname</th>
            <td mat-cell *matCellDef="let c">{{ c.surname }}</td>
          </ng-container>
          <!-- Seniority -->
          <ng-container matColumnDef="seniority">
            <th mat-header-cell *matHeaderCellDef>Seniority</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [class]="c.seniority">{{ c.seniority | titlecase }}</mat-chip>
            </td>
          </ng-container>
          <!-- Years -->
          <ng-container matColumnDef="years">
            <th mat-header-cell *matHeaderCellDef>Years Exp.</th>
            <td mat-cell *matCellDef="let c">{{ c.years }}</td>
          </ng-container>
          <!-- Availability -->
          <ng-container matColumnDef="availability">
            <th mat-header-cell *matHeaderCellDef>Available</th>
            <td mat-cell *matCellDef="let c">
              <mat-icon [style.color]="c.availability ? '#4caf50' : '#f44336'">
                {{ c.availability ? 'check_circle' : 'cancel' }}
              </mat-icon>
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" (click)="editCandidate($event, c)" matTooltip="Edit name/surname">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteCandidate($event, c.id)" matTooltip="Delete candidate">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="clickable-row"
            (click)="goToDetail(row)"
            matTooltip="View details"
          ></tr>
        </table>

        <p *ngIf="(candidates$ | async)?.length === 0 && !(loading$ | async)"
           class="empty-message">
          No candidates yet. Submit the form above to add one!
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width { width: 100%; }
    .clickable-row { cursor: pointer; transition: background 0.2s; }
    .clickable-row:hover { background: rgba(0,0,0,.04); }
    .error-banner { color: #f44336; display: flex; align-items: center; gap: 6px; padding: 8px; }
    .empty-message { text-align: center; color: rgba(0,0,0,.5); padding: 24px 0; }
    mat-chip.junior { background: #e3f2fd; color: #1565c0; }
    mat-chip.senior { background: #fce4ec; color: #880e4f; }
    .actions-column { width: 60px; text-align: right; }
  `],
})
export class CandidateListComponent implements OnInit {
  readonly displayedColumns = ['name', 'surname', 'seniority', 'years', 'availability', 'actions'];
  readonly candidates$: Observable<Candidate[]> = this.store.candidates$;
  readonly loading$: Observable<boolean> = this.store.loading$;
  readonly error$: Observable<string | null> = this.store.error$;

  constructor(private store: CandidateStoreService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.loadAll();
  }

  goToDetail(candidate: Candidate): void {
    this.router.navigate(['/candidates', candidate.id]);
  }

  editCandidate(event: Event, candidate: Candidate): void {
    event.stopPropagation();
    if (!candidate.id) return;

    const dialogRef = this.dialog.open(CandidateEditDialog, { data: candidate, width: '400px' });

    dialogRef.afterClosed().subscribe((result: FormData | undefined) => {
      if (result) {
        this.store.update(candidate.id!, result);
      }
    });
  }

  deleteCandidate(event: Event, id: number | undefined): void {
    event.stopPropagation(); // prevent row click
    if (!id) return;

    if (confirm('Are you sure you want to delete this candidate?')) {
      this.store.remove(id);
    }
  }
}
