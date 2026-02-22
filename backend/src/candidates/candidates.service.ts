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
        // Use header: 1 to get an array of arrays, so 1-line excels with no headers work
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];

        if (!rawRows || rawRows.length === 0 || !rawRows[0] || rawRows[0].length === 0) {
            throw new BadRequestException('Excel must contain at least one row');
        }

        // If the user included headers anyway, skip the first row
        let dataRow = rawRows[0];
        if (rawRows.length > 1 && typeof dataRow[0] === 'string' && dataRow[0].toLowerCase() === 'seniority') {
            dataRow = rawRows[1];
        }

        const seniority = String(dataRow[0] ?? '').toLowerCase().trim();
        if (seniority !== 'junior' && seniority !== 'senior') {
            throw new BadRequestException(`Seniority must be "junior" or "senior" (column A), got: "${seniority}"`);
        }

        const years = Number(dataRow[1]);
        if (isNaN(years)) {
            throw new BadRequestException('Years of experience must be a number (column B)');
        }

        const rawAvail = dataRow[2];
        const availability =
            rawAvail === true ||
            rawAvail === 1 ||
            String(rawAvail).toLowerCase() === 'true' ||
            String(rawAvail).toLowerCase() === 'yes' ||
            String(rawAvail).toLowerCase() === 'verdadero' ||
            String(rawAvail) === '1';

        return { seniority: seniority as 'junior' | 'senior', years, availability };
    }

    async create(dto: CreateCandidateDto): Promise<CandidateEntity> {
        const entity = this.repo.create(dto);
        return this.repo.save(entity);
    }

    async findAll(): Promise<CandidateEntity[]> {
        return this.repo.find({ order: { id: 'ASC' } });
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
