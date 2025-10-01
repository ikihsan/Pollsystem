import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class EditPollDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean; 
  
  @IsOptional()
  @IsInt()
  duration?: number;
}