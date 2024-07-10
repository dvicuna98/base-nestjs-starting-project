import { Module } from '@nestjs/common';
import {ApplicationBootstrapOptions} from "../common/interfaces/application-bootstrap-options.interface";
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({})
export class CoreModule {
    static forRootAsync(options: ApplicationBootstrapOptions, ) {

        const imports =
            options.driver === 'orm'
                ? [
                    MongooseModule.forRootAsync({
                        imports: [ConfigModule],
                        useFactory: async (config: ConfigService) => ({
                            uri: config.get('database.uri'),
                            directConnection:true,
                            auth:{
                                username: config.get('database.username'),
                                password: config.get('database.password')
                            },
                            authSource: config.get('database.authSource')
                        }),
                        inject: [ConfigService]
                    })
                ]
                : []

        return {
            module: CoreModule,
            imports
        }
    }
}
