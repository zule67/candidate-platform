import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CandidateFormComponent } from './features/candidate-form/candidate-form.component';

@Component({
  selector: 'candidate-platform-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <mat-icon>people</mat-icon>
      <span class="brand" routerLink="/">Candidate Platform</span>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .toolbar { gap: 10px; }
    .brand { cursor: pointer; font-size: 18px; font-weight: 600; }
    .main-content { max-width: 960px; margin: 0 auto; padding: 16px; }
  `],
})
export class AppComponent { }
