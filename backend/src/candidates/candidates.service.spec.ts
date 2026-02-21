import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidateEntity } from './candidate.entity';
import * as XLSX from 'xlsx';

describe('CandidatesService', () => {
    let service: CandidatesService;

    const mockRepo = {
        create: jest.fn((dto) => ({ id: 1, ...dto })),
        save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
        find: jest.fn(() => Promise.resolve([])),
        findOneBy: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CandidatesService,
                { provide: getRepositoryToken(CandidateEntity), useValue: mockRepo },
            ],
        }).compile();

        service = module.get<CandidatesService>(CandidatesService);
        jest.clearAllMocks();
    });

    // --- parseExcel ---

    it('should parse a valid xlsx buffer correctly', () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { seniority: 'junior', years: 3, availability: true },
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

        const result = service.parseExcel(buffer);

        expect(result.seniority).toBe('junior');
        expect(result.years).toBe(3);
        expect(result.availability).toBe(true);
    });

    it('should throw BadRequestException when Excel is empty', () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['seniority', 'years', 'availability']]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

        expect(() => service.parseExcel(buffer)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid seniority value', () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { seniority: 'mid', years: 3, availability: true },
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

        expect(() => service.parseExcel(buffer)).toThrow(BadRequestException);
    });

    it('should handle string "TRUE"/"FALSE" for availability', () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { seniority: 'senior', years: 5, availability: 'TRUE' },
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

        const result = service.parseExcel(buffer);
        expect(result.availability).toBe(true);
    });

    // --- CRUD ---

    it('should create and save a candidate', async () => {
        const dto = { name: 'John', surname: 'Doe', seniority: 'junior' as const, years: 2, availability: true };
        const result = await service.create(dto);

        expect(mockRepo.create).toHaveBeenCalledWith(dto);
        expect(mockRepo.save).toHaveBeenCalled();
        expect(result.name).toBe('John');
    });

    it('should return all candidates', async () => {
        mockRepo.find.mockResolvedValue([{ id: 1, name: 'John' }]);
        const result = await service.findAll();
        expect(result).toHaveLength(1);
        expect(mockRepo.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException when candidate not found', async () => {
        mockRepo.findOneBy.mockResolvedValue(null);
        await expect(service.findOne(999)).rejects.toThrow();
    });
});
