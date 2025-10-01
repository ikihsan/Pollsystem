import { IsString } from "class-validator";

export class voteDto{
@IsString()
optionId :string;

}