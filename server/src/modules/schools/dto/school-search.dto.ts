import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetCitiesDto {
  @ApiProperty({ example: 'Харківська область', description: 'Назва області' })
  @IsString()
  @IsNotEmpty()
  region!: string;
}

export class GetSchoolsListDto {
  @ApiProperty({ example: 'Харків, Харківська область', description: 'Назва населеного пункту' })
  @IsString()
  @IsNotEmpty()
  city!: string;
}

export class SearchSchoolByEdeboDto {
  @ApiProperty({ example: '145819', description: 'Код закладу в ЄДЕБО' })
  @IsString()
  @IsNotEmpty()
  edeboId!: string;
}
