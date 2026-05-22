import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDatabaseOptions } from './typeorm.config';

config();

export default new DataSource(buildDatabaseOptions(process.env));
