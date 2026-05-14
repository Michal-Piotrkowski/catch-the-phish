import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MlController } from './ml/ml.controller';
import { MLService } from './ml/ml.service';
import { ConfigModule } from './config/config.module';
import ConfigService from './config/config.service';

@Module({
  imports: [
    ConfigModule,

    ClientsModule.registerAsync([
      {
        name: 'ML_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get('RABBITMQ_URL') ||
                'amqp://guest:guest@rabbitmq:5672/',
            ],
            queue: 'predict',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [MlController],
  providers: [MLService],
})
export class AppModule {}
