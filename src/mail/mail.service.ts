import got from 'got';
import FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { MailModuleOptions } from './mail.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log(options);
  }
  private sendEmail(subject: string, content: string): void {
    const formData = new FormData();
    formData.append('from', `Excited User <mailgun@${this.options.fromEmail}>`);
    try { 
      got(`https://api.mailgun.net/v3/${this.options.emailDomain}/messages`, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
      });
    } catch (error) {}
  }
}
