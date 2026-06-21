import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ example: 'uuid-курсу' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'Корисне відео про клітину' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-модуля', required: false, description: 'ID теми/модуля курсу' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({ example: 'https://youtube.com/...' })
  @IsUrl({}, { message: 'Введіть коректне URL посилання' })
  @IsNotEmpty()
  linkUrl!: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class CreateFileMaterialDto {
  @ApiProperty({ example: 'uuid-курсу' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'Презентація до уроку 1' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-модуля', required: false, description: 'ID теми/модуля курсу' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Файл для завантаження' })
  file: any;
}

export class UpdateMaterialDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({ example: 'uuid-модуля', required: false, description: 'ID теми/модуля курсу' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isHidden?: boolean;
}
