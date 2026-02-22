import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, EMPTY, finalize } from 'rxjs';
import { CandidateService } from '../services/candidate.service';
import { Candidate } from '@candidate-platform/shared';

@Injectable({ providedIn: 'root' })
export class CandidateStoreService {
    private readonly _candidates$ = new BehaviorSubject<Candidate[]>([]);
    private readonly _loading$ = new BehaviorSubject<boolean>(false);
    private readonly _error$ = new BehaviorSubject<string | null>(null);

    /** Public observables (read-only) */
    readonly candidates$: Observable<Candidate[]> = this._candidates$.asObservable();
    readonly loading$: Observable<boolean> = this._loading$.asObservable();
    readonly error$: Observable<string | null> = this._error$.asObservable();

    constructor(private candidateService: CandidateService) { }

    /** Load all candidates from the backend and seed the store (called once on app init) */
    loadAll(): void {
        this._loading$.next(true);
        this._error$.next(null);
        this.candidateService
            .getAll()
            .pipe(finalize(() => this._loading$.next(false)))
            .subscribe({
                next: (candidates) => this._candidates$.next(candidates),
                error: (err) => this._error$.next(err?.message ?? 'Failed to load candidates'),
            });
    }

    /**
     * Create a candidate: POST to backend, then ADD the returned candidate
     * to the current list WITHOUT fetching the full list again (incremental update).
     */
    create(formData: FormData): Observable<Candidate> {
        this._loading$.next(true);
        this._error$.next(null);
        return this.candidateService.create(formData).pipe(
            tap((newCandidate) => this.addCandidate(newCandidate)),
            catchError((err) => {
                this._error$.next(err?.error?.message ?? err?.message ?? 'Failed to create candidate');
                return EMPTY;
            }),
            finalize(() => this._loading$.next(false)),
        );
    }

    /** Append a single candidate to the existing list (incremental, no full reload) */
    addCandidate(candidate: Candidate): void {
        const current = this._candidates$.getValue();
        this._candidates$.next([...current, candidate]);
    }

    /** Remove candidate from local list after deletion */
    removeCandidate(id: number): void {
        const current = this._candidates$.getValue();
        this._candidates$.next(current.filter((c) => c.id !== id));
    }

    /** Call backend DELETE and incrementally remove from local state */
    remove(id: number): void {
        this._loading$.next(true);
        this._error$.next(null);
        this.candidateService
            .delete(id)
            .pipe(
                tap(() => this.removeCandidate(id)),
                catchError((err) => {
                    this._error$.next(err?.error?.message ?? err?.message ?? 'Failed to delete candidate');
                    return EMPTY;
                }),
                finalize(() => this._loading$.next(false)),
            )
            .subscribe();
    }

    /** Call backend PATCH and incrementally update local state */
    update(id: number, partialData: Partial<Candidate> | FormData): void {
        this._loading$.next(true);
        this._error$.next(null);
        this.candidateService
            .update(id, partialData)
            .pipe(
                tap((updatedCandidate) => {
                    const current = this._candidates$.getValue();
                    this._candidates$.next(
                        current.map((c) => (c.id === id ? updatedCandidate : c))
                    );
                }),
                catchError((err) => {
                    this._error$.next(err?.error?.message ?? err?.message ?? 'Failed to update candidate');
                    return EMPTY;
                }),
                finalize(() => this._loading$.next(false)),
            )
            .subscribe();
    }

    /** Return current snapshot of the list */
    getSnapshot(): Candidate[] {
        return this._candidates$.getValue();
    }
}
