import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { Candidate } from '@candidate-platform/shared';
import { CandidateStoreService } from '../../store/candidate.store';

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
  ],
  template: `
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
  `],
})
export class CandidateListComponent implements OnInit {
  readonly displayedColumns = ['name', 'surname', 'seniority', 'years', 'availability'];
  readonly candidates$: Observable<Candidate[]> = this.store.candidates$;
  readonly loading$: Observable<boolean> = this.store.loading$;
  readonly error$: Observable<string | null> = this.store.error$;

  constructor(private store: CandidateStoreService, private router: Router) { }

  ngOnInit(): void {
    this.store.loadAll();
  }

  goToDetail(candidate: Candidate): void {
    this.router.navigate(['/candidates', candidate.id]);
  }
}
