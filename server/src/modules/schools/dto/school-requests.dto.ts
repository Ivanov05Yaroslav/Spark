import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectSchoolRequestDto {
  @ApiProperty({ example: 'Документи не розбірливі. Будь ласка, завантажте якісні копії наказів.' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}