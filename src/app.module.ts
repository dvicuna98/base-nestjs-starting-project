import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SharedModule} from "./shared/shared.module";
import { CoreModule } from './core/core.module';
import {ApplicationBootstrapOptions} from "./common/interfaces/application-bootstrap-options.interface";
import appConfig from "./config/app.config";
import * as Joi from 'joi'

@Module({
  imports: [
      ConfigModule.forRoot({
          validationSchema: Joi.object({
              DB_USERNAME: Joi.required(),
              DB_PASSWORD: Joi.required(),
              DB_AUTHSOURCE: Joi.required(),
              DB_URI_MONGODB: Joi.required(),
              DB_HOST: Joi.required(),
              DB_FORWARD_PORT: Joi.required(),
              RABBITMQ_HOST: Joi.required(),
              RABBITMQ_USERNAME: Joi.required(),
              RABBITMQ_PASSWORD: Joi.required(),
              RABBITMQ_PORT: Joi.required(),
              RABBITMQ_VHOST: Joi.required(),
              EXCHANGE_NAME: Joi.required(),
              EXCHANGE_TYPE: Joi.required(),
              QUEUE_NAME: Joi.required(),
              EXCHANGE_NAME_DIRECT: Joi.required(),
              EXCHANGE_TYPE_DIRECT: Joi.required(),
              QUEUE_NAME_RETRY: Joi.required(),
              DEAD_LETTER_QUEUE_NAME: Joi.required(),
              DIRECT_BINDING_KEY: Joi.required(),
              DEAD_LETTER_BINDING_KEY: Joi.required(),
              ENQUEUE_DSN: Joi.required(),
              MAIL_HOST: Joi.required(),
              MAIL_PORT: Joi.required(),
              MAIL_USERNAME: Joi.required(),
              MAIL_PASSWORD: Joi.required(),
              MAIL_FROM_ADDRESS: Joi.required(),
          }),
          load: [appConfig],
          expandVariables: true,
          isGlobal:true
      }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
    static register(options:ApplicationBootstrapOptions){
        return {
            module: AppModule,
            imports:[
                CoreModule.forRootAsync(options),
                SharedModule.register(options)
            ]
        }
    }
}
