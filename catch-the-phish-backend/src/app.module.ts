import { Module } from '@nestjs/common';
import { MlController } from '#ml/ml.controller';
@Module({
  imports: [],
  controllers: [MlController],
  providers: [],
})
export class AppModule {}
