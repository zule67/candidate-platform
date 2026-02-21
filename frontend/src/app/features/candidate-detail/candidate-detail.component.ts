import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, switchMap } from 'rxjs';
import { Candidate } from '@candidate-platform/shared';
import { CandidateService } from '../../services/candidate.service';

@Component({
    selector: 'app-candidate-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatProgressSpinnerModule,
    ],
    template: `
    <div class="detail-container">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon> Back to list
      </button>

      <ng-container *ngIf="candidate$ | async as candidate; else loading">
        <mat-card class="detail-card">
          <mat-card-header>
            <div mat-card-avatar class="avatar">
              {{ candidate.name[0] }}{{ candidate.surname[0] }}
            </div>
            <mat-card-title>{{ candidate.name }} {{ candidate.surname }}</mat-card-title>
            <mat-card-subtitle>Candidate #{{ candidate.id }}</mat-card-subtitle>
          </mat-card-header>

          <mat-divider></mat-divider>

          <mat-card-content class="details">
            <div class="detail-row">
              <span class="label">Seniority</span>
              <mat-chip [class]="candidate.seniority">{{ candidate.seniority | titlecase }}</mat-chip>
            </div>
            <div class="detail-row">
              <span class="label">Years of Experience</span>
              <strong>{{ candidate.years }} yr{{ candidate.years !== 1 ? 's' : '' }}</strong>
            </div>
            <div class="detail-row">
              <span class="label">Availability</span>
              <span class="avail-badge" [class.available]="candidate.availability">
                <mat-icon>{{ candidate.availability ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ candidate.availability ? 'Available' : 'Not Available' }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <ng-template #loading>
        <div class="spinner-wrap">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      </ng-template>
    </div>
  `,
    styles: [`
    .detail-container { max-width: 540px; margin: 24px auto; padding: 0 16px; }
    .detail-card { margin-top: 16px; }
    .avatar {
      background: #3f51b5; color: #fff; border-radius: 50%;
      width: 40px; height: 40px; display: flex; align-items: center;
      justify-content: center; font-weight: bold;
    }
    .details { padding: 16px 0; }
    .detail-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,.06);
    }
    .label { color: rgba(0,0,0,.6); font-size: 14px; }
    mat-chip.junior { background: #e3f2fd; color: #1565c0; }
    mat-chip.senior { background: #fce4ec; color: #880e4f; }
    .avail-badge { display: flex; align-items: center; gap: 4px; font-size: 14px; }
    .avail-badge.available { color: #4caf50; }
    .avail-badge:not(.available) { color: #f44336; }
    .spinner-wrap { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class CandidateDetailComponent implements OnInit {
    candidate$!: Observable<Candidate>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private candidateService: CandidateService,
    ) { }

    ngOnInit(): void {
        this.candidate$ = this.route.paramMap.pipe(
            switchMap((params) => this.candidateService.getOne(Number(params.get('id')))),
        );
    }

    goBack(): void {
        this.router.navigate(['/']);
    }
}
