import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CandidateEntity } from '../candidates/candidate.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => {
    const dbUrl = process.env['DATABASE_URL'];
    console.log('--- TYPEORM CONFIGURATION ---');
    console.log('DATABASE_URL starts with:', dbUrl ? dbUrl.substring(0, 15) : 'UNDEFINED');
    console.log('Fallback DB_HOST is:', process.env['DB_HOST']);
    console.log('ENV KEYS:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('DATA') || k.includes('PORT')).join(', '));

    if (dbUrl) {
        return {
            type: 'postgres',
            url: dbUrl,
            entities: [CandidateEntity],
            synchronize: process.env['NODE_ENV'] !== 'production',
            ssl: dbUrl.includes('.internal') ? false : { rejectUnauthorized: false },
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
