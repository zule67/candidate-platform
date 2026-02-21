import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CandidateFormComponent } from './candidate-form.component';
import { CandidateStoreService } from '../../store/candidate.store';
import { EMPTY, of } from 'rxjs';

const mockStore = {
    loading$: of(false),
    create: jest.fn().mockReturnValue(EMPTY),
};

describe('CandidateFormComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CandidateFormComponent,
                ReactiveFormsModule,
                NoopAnimationsModule,
                MatSnackBarModule,
                MatCardModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatIconModule,
                MatProgressSpinnerModule,
            ],
            providers: [{ provide: CandidateStoreService, useValue: mockStore }],
        }).compileComponents();
    });

    it('should create the component', () => {
        const fixture = TestBed.createComponent(CandidateFormComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('form should be invalid when empty', () => {
        const fixture = TestBed.createComponent(CandidateFormComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.invalid).toBe(true);
    });

    it('form should be valid with name, surname and file', () => {
        const fixture = TestBed.createComponent(CandidateFormComponent);
        fixture.detectChanges();
        const comp = fixture.componentInstance;

        const mockFile = new File(['data'], 'test.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        comp.form.setValue({ name: 'John', surname: 'Doe', file: mockFile });
        expect(comp.form.valid).toBe(true);
    });

    it('file validator should reject non-xlsx file types', () => {
        const fixture = TestBed.createComponent(CandidateFormComponent);
        fixture.detectChanges();
        const comp = fixture.componentInstance;

        const badFile = new File(['data'], 'test.pdf', { type: 'application/pdf' });
        comp.form.get('file')!.setValue(badFile);
        expect(comp.form.get('file')!.hasError('invalidFileType')).toBe(true);
    });

    it('should not call store.create when form is invalid', () => {
        const fixture = TestBed.createComponent(CandidateFormComponent);
        fixture.detectChanges();
        const comp = fixture.componentInstance;

        comp.onSubmit();
        expect(mockStore.create).not.toHaveBeenCalled();
    });
});
