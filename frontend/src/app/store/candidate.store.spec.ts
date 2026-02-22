import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CandidateStoreService } from './candidate.store';
import { CandidateService } from '../services/candidate.service';
import { Candidate } from '@candidate-platform/shared';
import { of, throwError } from 'rxjs';

const mockCandidate: Candidate = {
    id: 1,
    name: 'John',
    surname: 'Doe',
    seniority: 'junior',
    years: 3,
    availability: true,
};

describe('CandidateStoreService', () => {
    let store: CandidateStoreService;
    let mockCandidateService: jest.Mocked<CandidateService>;

    beforeEach(() => {
        const spy = {
            getAll: jest.fn(),
            create: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                CandidateStoreService,
                { provide: CandidateService, useValue: spy },
            ],
        });

        store = TestBed.inject(CandidateStoreService);
        mockCandidateService = TestBed.inject(CandidateService) as jest.Mocked<CandidateService>;
    });

    it('should start with empty candidates list', (done) => {
        store.candidates$.subscribe((candidates) => {
            expect(candidates).toEqual([]);
            done();
        });
    });

    it('addCandidate() should append to the list without replacing it', () => {
        store.addCandidate({ ...mockCandidate, id: 10, name: 'Alice' });
        store.addCandidate({ ...mockCandidate, id: 11, name: 'Bob' });

        const snapshot = store.getSnapshot();
        expect(snapshot).toHaveLength(2);
        // newest is last
        expect(snapshot[0].name).toBe('Alice');
        expect(snapshot[1].name).toBe('Bob');
    });

    it('removeCandidate() should filter out the correct id', () => {
        store.addCandidate({ ...mockCandidate, id: 1 });
        store.addCandidate({ ...mockCandidate, id: 2 });
        store.removeCandidate(1);

        const snapshot = store.getSnapshot();
        expect(snapshot).toHaveLength(1);
        expect(snapshot[0].id).toBe(2);
    });

    it('loadAll() should seed the store from the backend', (done) => {
        mockCandidateService.getAll.mockReturnValue(of([mockCandidate]));

        store.loadAll();

        store.candidates$.subscribe((candidates) => {
            if (candidates.length > 0) {
                expect(candidates[0].name).toBe('John');
                done();
            }
        });
    });

    it('create() should call addCandidate incrementally (no full reload)', (done) => {
        mockCandidateService.create.mockReturnValue(of(mockCandidate));
        const addSpy = jest.spyOn(store, 'addCandidate');

        store.create(new FormData()).subscribe(() => {
            expect(addSpy).toHaveBeenCalledWith(mockCandidate);
            expect(mockCandidateService.getAll).not.toHaveBeenCalled();
            done();
        });
    });

    it('create() should set error$ when backend returns an error', (done) => {
        mockCandidateService.create.mockReturnValue(
            throwError(() => ({ message: 'Server error' })),
        );

        store.error$.subscribe((err) => {
            if (err) {
                expect(err).toContain('Server error');
                done();
            }
        });

        store.create(new FormData()).subscribe(); // returns EMPTY on error
    });
});
