import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreatePollDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    isPublic: boolean;

    @IsArray()
    @ArrayMinSize(2)
    @ArrayUnique()
    options: string[];

    @IsInt()
    @Min(1)
    @Max(120)
    duration: number;
    

}