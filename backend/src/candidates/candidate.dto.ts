import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCandidateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    surname: string;

    @IsIn(['junior', 'senior'])
    seniority: 'junior' | 'senior';

    @Type(() => Number)
    @IsNumber()
    years: number;

    @Type(() => Boolean)
    @IsBoolean()
    availability: boolean;
}

export class UpdateCandidateDto {
    name?: string;
    surname?: string;
    seniority?: 'junior' | 'senior';
    years?: number;
    availability?: boolean;
}
