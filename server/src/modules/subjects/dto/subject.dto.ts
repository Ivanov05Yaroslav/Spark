import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Математика', description: 'Назва предмету' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class AssignSubjectDto {
  @ApiProperty({ example: 'uuid-вчителя' })
  @IsString()
  @IsNotEmpty()
  teacherId!: string;

  @ApiProperty({ example: 'uuid-предмету' })
  @IsString()
  @IsNotEmpty()
  subjectId!: string;
}
