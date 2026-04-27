import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MlController } from './ml/ml.controller';
import { MLService } from './ml/ml.service';
import { ConfigModule } from './config/config.module';
import ConfigService from './config/config.service';

@Module({
  imports: [
    ConfigModule,

    ClientsModule.register([
      {
        name: 'ML_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'predict',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [MlController],
  providers: [MLService],
})
export class AppModule {}
