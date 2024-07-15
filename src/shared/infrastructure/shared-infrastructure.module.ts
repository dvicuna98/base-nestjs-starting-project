import {Module} from "@nestjs/common";
import {ApplicationBootstrapOptions} from "../../common/interfaces/application-bootstrap-options.interface";
import {MailerModule} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";

@Module({
    imports:[],
    providers:[],
    exports:[]
})
export class SharedInfrastructureModule{

    static register (options: ApplicationBootstrapOptions){

        const imports =
        options.mailing === "production"
            ? [
                MailerModule.forRootAsync({
                    imports: undefined,
                    useFactory: async (config: ConfigService) =>({
                        transport:{
                            host: config.get('mail.host'),
                            port: config.get('mail.port'),
                            secure: false,
                            auth:{
                                user: config.get('mail.username'),
                                pass: config.get('mail.password')
                            },
                        },
                        defaults: {
                            from: config.get('mail.from_address'),
                        },
                    }),
                    inject: [ConfigService]
                })
            ]
            : [
                MailerModule.forRootAsync({
                    imports: undefined,
                    useFactory: async (config: ConfigService) =>({
                        transport:{
                            host: config.get('mail.host'),
                            port: config.get('mail.port')
                        },
                        defaults: {
                            from: config.get('mail.from_address'),
                        },
                    }),
                    inject: [ConfigService]
                })
            ]

        return {
            module: SharedInfrastructureModule,
            imports
        }
    }
}