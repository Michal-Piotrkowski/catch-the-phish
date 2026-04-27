import { Body, Controller, Post } from '@nestjs/common';
import EmailContentDto from 'src/dto/email-content.dto';
import { MLService } from './ml.service';

@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MLService) {}

  @Post('detect')
  detect(@Body() emailContentDto: EmailContentDto): Promise<any> {
    return this.mlService.detect(emailContentDto);
  }
}
