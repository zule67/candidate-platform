import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CandidateEntity } from '../candidates/candidate.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => {
    if (process.env['DATABASE_URL']) {
        return {
            type: 'postgres',
            url: process.env['DATABASE_URL'],
            entities: [CandidateEntity],
            synchronize: process.env['NODE_ENV'] !== 'production',
            ssl: { rejectUnauthorized: false },
        };
    }

    return {
        type: 'postgres',
        host: process.env['DB_HOST'] ?? 'localhost',
        port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
        username: process.env['DB_USER'] ?? 'postgres',
        password: process.env['DB_PASS'] ?? 'postgres',
        database: process.env['DB_NAME'] ?? 'candidate_platform',
        entities: [CandidateEntity],
        synchronize: process.env['NODE_ENV'] !== 'production',
    };
};
