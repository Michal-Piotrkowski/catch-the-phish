import { Body, Controller, Post } from '@nestjs/common';
import EmailContentDto from 'src/dto/email-content.dto';
import { MLService } from './ml.service';
import MlResponseDto from 'src/dto/ml-response.dto';

@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MLService) {}

  @Post('detect')
  detect(@Body() emailContentDto: EmailContentDto): Promise<MlResponseDto> {
    return this.mlService.detect(emailContentDto);
  }
}
