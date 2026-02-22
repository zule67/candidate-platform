import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
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
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    surname?: string;

    @IsOptional()
    @IsIn(['junior', 'senior'])
    seniority?: 'junior' | 'senior';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    years?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    availability?: boolean;
}
