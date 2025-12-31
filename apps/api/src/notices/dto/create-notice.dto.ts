import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoticeDto {
  @ApiProperty({ example: 'Vattenavstängning' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({
    example:
      'På grund av underhållsarbete kommer vattnet att vara avstängt från kl. 10:00 till 14:00.',
  })
  @IsString()
  @MinLength(1)
  body!: string;
}
