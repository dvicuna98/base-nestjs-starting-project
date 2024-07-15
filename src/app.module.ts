import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {SharedModule} from "./shared/shared.module";
import { CoreModule } from './core/core.module';
import {ApplicationBootstrapOptions} from "./common/interfaces/application-bootstrap-options.interface";
import appConfig, {JoiValidationObject as appValidationObject} from "./config/app.config";
import eventsConfig, {JoiValidationObject as eventsValidationObject} from "./config/events.config";
import {EventBusModule} from "./eventbus/event-bus.module";


@Module({
  imports: [
      ConfigModule.forRoot({
          validationSchema: appValidationObject(),
          load: [appConfig],
          expandVariables: true,
          isGlobal:true
      }),
  ],
  controllers: [],
  providers: [],
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


@Module({
    imports:[
        ConfigModule.forRoot({
            validationSchema: eventsValidationObject(),
            load: [eventsConfig],
            expandVariables: true,
            isGlobal:true
        }),
        EventBusModule
    ]
})
export class EventsModule {
    static register(options:ApplicationBootstrapOptions) {
        return {
            module: EventsModule,
            imports:[
                CoreModule.forRootAsync(options),
            ]
        }
    }
}
