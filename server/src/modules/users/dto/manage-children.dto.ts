import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddChildDto {
  @ApiProperty({ example: '123456', description: 'Унікальний код дитини' })
  @IsString()
  @IsNotEmpty({ message: "Код дитини є обов'язковим" })
  parentsCode!: string;
}
