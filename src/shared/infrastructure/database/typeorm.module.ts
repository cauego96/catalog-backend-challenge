import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDatabaseOptions } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildDatabaseOptions({
          DATABASE_HOST: configService.get<string>('DATABASE_HOST'),
          DATABASE_PORT: configService.get<string>('DATABASE_PORT'),
          DATABASE_USER: configService.get<string>('DATABASE_USER'),
          DATABASE_PASSWORD: configService.get<string>('DATABASE_PASSWORD'),
          DATABASE_NAME: configService.get<string>('DATABASE_NAME'),
          NODE_ENV: configService.get<string>('NODE_ENV'),
        }),
    }),
  ],
})
export class DatabaseModule {}
