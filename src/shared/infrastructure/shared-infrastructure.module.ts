import {Module, OnModuleInit} from "@nestjs/common";
import {ApplicationBootstrapOptions} from "../../common/interfaces/application-bootstrap-options.interface";
import {MailerModule} from "@nestjs-modules/mailer";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RabbitMQModule} from "@golevelup/nestjs-rabbitmq";
import {RabbitmqSubscriber} from "./rabbitmq/rabbitmq.subscriber";

@Module({
    imports:[
        RabbitMQModule.forRootAsync(RabbitMQModule,{
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                uri: config.get('rabbitmq.uri'),
                exchanges:[
                    {
                        name: config.get('rabbitmq.main_exchange.name'),
                        type: config.get('rabbitmq.main_exchange.type'),
                        createExchangeIfNotExists: true
                    }
                ]
            }),
            inject: [ConfigService]
        }),
    ],
    providers:[
        RabbitmqSubscriber
    ],
    exports:[]
})
export class SharedInfrastructureModule implements OnModuleInit{
    constructor(
        private readonly rbmqSubscriber: RabbitmqSubscriber,
    ) {
    }

    async onModuleInit(): Promise<any> {
        await this.rbmqSubscriber.connect();
    }

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