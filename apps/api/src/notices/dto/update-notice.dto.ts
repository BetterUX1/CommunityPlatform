import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoticeDto {
  @ApiPropertyOptional({ example: 'Uppdaterad titel' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'Uppdaterad text' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  body?: string;
}
