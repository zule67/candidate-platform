import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto, UpdateCandidateDto } from './candidate.dto';

@Controller('candidates')
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    /**
     * POST /candidates
     * multipart/form-data: name, surname + xlsx file
     */
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (_req, file, cb) => {
                if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
                    return cb(new BadRequestException('Only Excel files (.xlsx, .xls) are allowed'), false);
                }
                cb(null, true);
            },
        }),
    )
    async create(
        @Body(new ValidationPipe({ transform: true })) body: { name: string; surname: string },
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('Excel file is required');
        if (!body.name?.trim()) throw new BadRequestException('name is required');
        if (!body.surname?.trim()) throw new BadRequestException('surname is required');

        const excelData = this.candidatesService.parseExcel(file.buffer);

        const dto: CreateCandidateDto = {
            name: body.name.trim(),
            surname: body.surname.trim(),
            ...excelData,
        };

        return this.candidatesService.create(dto);
    }

    @Get()
    findAll() {
        return this.candidatesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.candidatesService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (_req, file, cb) => {
                if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
                    return cb(new BadRequestException('Only Excel files (.xlsx, .xls) are allowed'), false);
                }
                cb(null, true);
            },
        }),
    )
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) body: UpdateCandidateDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let excelData = {};
        if (file) {
            excelData = this.candidatesService.parseExcel(file.buffer);
        }

        const dto: UpdateCandidateDto = {
            ...body,
            ...(body.name ? { name: body.name.trim() } : {}),
            ...(body.surname ? { surname: body.surname.trim() } : {}),
            ...(Object.keys(excelData).length > 0 ? excelData : {}),
        };

        return this.candidatesService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.candidatesService.remove(id);
    }
}
