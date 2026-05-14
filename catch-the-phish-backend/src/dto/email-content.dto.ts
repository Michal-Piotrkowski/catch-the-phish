import { IsString, MaxLength, MinLength } from 'class-validator';

export default class EmailContentDto {
  @IsString()
  @MinLength(10)
  // 2k characters is ~512 tokens,
  // prevents exceeding the architectural limit of DistilBERT model
  @MaxLength(2000, {
    message: 'Email content is too long. The maximum allowed length is 2000 characters.',
  })
  content: string;
}
