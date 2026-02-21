import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CandidateEntity } from '../candidates/candidate.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env['DATABASE_URL'],
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    username: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASS'] ?? 'postgres',
    database: process.env['DB_NAME'] ?? 'candidate_platform',
    entities: [CandidateEntity],
    synchronize: process.env['NODE_ENV'] !== 'production',
    ssl: process.env['DATABASE_URL'] ? { rejectUnauthorized: false } : false,
});
