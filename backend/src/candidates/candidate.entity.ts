import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('candidates')
export class CandidateEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    seniority: string;

    @Column()
    years: number;

    @Column()
    availability: boolean;
}
