import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: '10-А', description: 'Назва класу' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class BulkCreateClassDto {
  @ApiProperty({ example: ['1-А', '1-Б', '1-В'], description: 'Масив назв класів' })
  @IsArray()
  @IsString({ each: true })
  names!: string[];
}

export class AssignStudentDto {
  @ApiProperty({ example: 'uuid-учня' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;
}

export class AssignHomeroomTeacherDto {
  @ApiProperty({ example: 'uuid-вчителя' })
  @IsString()
  @IsNotEmpty()
  teacherId!: string;
}
