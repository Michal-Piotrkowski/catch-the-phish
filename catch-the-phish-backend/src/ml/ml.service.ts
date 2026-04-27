import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import EmailContentDto from 'src/dto/email-content.dto';
import MlResponseDto from 'src/dto/ml-response.dto';

@Injectable()
export class MLService {
  constructor(@Inject('ML_SERVICE') private readonly client: ClientProxy) {}

  async detect(emailContentDto: EmailContentDto): Promise<MlResponseDto> {
    return await firstValueFrom(
      this.client.send({ cmd: 'predict' }, emailContentDto),
    );
  }
}
