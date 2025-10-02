import { Controller, Get, Logger, Param, Patch, UseGuards } from '@nestjs/common';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll';
import { Body, Post, Req} from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.gaurd';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { EditPollDto } from './dto/edit-poll';

@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}
  private readonly logger = new Logger(PollController.name);
  
 @UseGuards(JwtAuthGuard)
  @Get(':id')
  getPoll(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`Getting poll with id: ${id}`);
    const userId = req.user.id;
    return this.pollService.getPoll(id, userId);
  }

  
 
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllPolls( @Req() req: any) {
    this.logger.log(`Getting all polls`);
    const userId = req.user.id;
    return this.pollService.listPolls(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('results/:id')
  getPollResults(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.pollService.getResults(id, userId);
  }
@UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Post('create')
  createPoll(@Body() createPollDto: CreatePollDto, @Req() req: any) {
    this.logger.log(`Creating poll: ${JSON.stringify(createPollDto)}`);
    const userId = req.user.id;
    return this.pollService.createPoll(createPollDto, userId);
  }
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Post('allow/:id')
  allowPoll(@Param('id') id: string,@Body() body : { email: string }, @Req() req: any) {
    const userId = req.user.id;
    return this.pollService.allowPoll(id,body.email, userId);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Patch('delete/:id')
  deletePoll(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`Deleting poll with id: ${id}`);
    const userId = req.user.id;
    return this.pollService.deletePoll(id,userId);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Patch('edit/:id')
  editPoll(@Param('id') id: string, @Body() editPollDto: EditPollDto, @Req() req: any) {
    this.logger.log(`Editing poll with id: ${id}`);
    const userId = req.user.id;
    return this.pollService.editPoll(id, editPollDto, userId);
  }

}
