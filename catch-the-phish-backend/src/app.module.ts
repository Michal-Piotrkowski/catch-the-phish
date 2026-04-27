import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MlController } from './ml/ml.controller';
import { MLService } from './ml/ml.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule,

    ClientsModule.register([
      {
        name: 'ML_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'predict',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [MlController],
  providers: [MLService],
})
export class AppModule {}
