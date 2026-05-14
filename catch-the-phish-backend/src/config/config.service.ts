import { Injectable } from '@nestjs/common';

@Injectable()
export default class ConfigService {
  get(key: string): string | undefined {
    return process.env[key];
  }
}
