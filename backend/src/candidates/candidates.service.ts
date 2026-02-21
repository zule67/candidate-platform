import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { CandidateEntity } from './candidate.entity';
import { CreateCandidateDto, UpdateCandidateDto } from './candidate.dto';
import { Candidate } from '@candidate-platform/shared';

@Injectable()
export class CandidatesService {
    constructor(
        @InjectRepository(CandidateEntity)
        private readonly repo: Repository<CandidateEntity>,
    ) { }

    /** Parse xlsx buffer → extract seniority, years, availability from row 1 */
    parseExcel(buffer: Buffer): Pick<Candidate, 'seniority' | 'years' | 'availability'> {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (!rows || rows.length === 0) {
            throw new BadRequestException('Excel must contain at least one data row');
        }

        const row = rows[0];

        const seniority = (String(row['seniority'] ?? row['Seniority'] ?? '')).toLowerCase();
        if (seniority !== 'junior' && seniority !== 'senior') {
            throw new BadRequestException(`Seniority must be "junior" or "senior", got: "${seniority}"`);
        }

        const years = Number(row['years'] ?? row['Years of experience'] ?? row['yearsOfExperience']);
        if (isNaN(years)) {
            throw new BadRequestException('years must be a number');
        }

        const rawAvail = row['availability'] ?? row['Availability'];
        const availability =
            rawAvail === true ||
            rawAvail === 1 ||
            String(rawAvail).toLowerCase() === 'true' ||
            String(rawAvail).toLowerCase() === 'yes' ||
            String(rawAvail) === '1';

        return { seniority: seniority as 'junior' | 'senior', years, availability };
    }

    async create(dto: CreateCandidateDto): Promise<CandidateEntity> {
        const entity = this.repo.create(dto);
        return this.repo.save(entity);
    }

    async findAll(): Promise<CandidateEntity[]> {
        return this.repo.find({ order: { id: 'DESC' } });
    }

    async findOne(id: number): Promise<CandidateEntity> {
        const entity = await this.repo.findOneBy({ id });
        if (!entity) throw new NotFoundException(`Candidate #${id} not found`);
        return entity;
    }

    async update(id: number, dto: UpdateCandidateDto): Promise<CandidateEntity> {
        const entity = await this.findOne(id);
        Object.assign(entity, dto);
        return this.repo.save(entity);
    }

    async remove(id: number): Promise<void> {
        const entity = await this.findOne(id);
        await this.repo.remove(entity);
    }
}
