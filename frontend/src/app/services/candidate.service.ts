import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '@candidate-platform/shared';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
    private readonly base = `${environment.apiUrl}/candidates`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(this.base);
    }

    getOne(id: number): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.base}/${id}`);
    }

    create(formData: FormData): Observable<Candidate> {
        return this.http.post<Candidate>(this.base, formData);
    }

    update(id: number, data: Partial<Candidate> | FormData): Observable<Candidate> {
        return this.http.patch<Candidate>(`${this.base}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
