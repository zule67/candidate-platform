import { Routes } from '@angular/router';
import { CandidateDetailComponent } from './features/candidate-detail/candidate-detail.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./features/candidate-list/candidate-list.component').then(
                (m) => m.CandidateListComponent,
            ),
    },
    {
        path: 'candidates/:id',
        component: CandidateDetailComponent,
    },
    { path: '**', redirectTo: '' },
];
