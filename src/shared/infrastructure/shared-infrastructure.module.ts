import {Module, OnModuleInit} from "@nestjs/common";
import {ApplicationBootstrapOptions} from "../../common/interfaces/application-bootstrap-options.interface";
import {MailerModule} from "@nestjs-modules/mailer";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {CqrsModule, EventBus} from "@nestjs/cqrs";
import {RabbitMQModule} from "@golevelup/nestjs-rabbitmq";
import {RabbitMQSubscriber} from "./rabbitmq/rabbitmq.suscriber";
import { Events } from './rabbitmq/events';
import {RabbitMQPublisher} from "./rabbitmq/rabbitmq.publisher";

@Module({
    imports:[
        CqrsModule,
        RabbitMQModule.forRootAsync(RabbitMQModule,{
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                uri: config.get('rabbitmq.uri'),
                connectionInitOptions:{
                    wait:false
                },
                exchanges:[
                    {
                        name: config.get('rabbitmq.main_exchange.name'),
                        type: config.get('rabbitmq.main_exchange.type'),
                        createExchangeIfNotExists: true,
                    }
                ],
                queues:[
                    {
                        name: config.get('rabbitmq.main_queues.name'),
                        exchange: config.get('rabbitmq.main_exchange.name'),
                        createQueueIfNotExists: true,
                    }
                ]
            }),
            inject: [ConfigService]
        }),
    ],
    providers:[
        RabbitMQSubscriber,
        RabbitMQPublisher,
        {
            provide: 'EVENTS',
            useValue: Events,
        },
    ],
    exports:[]
})
export class SharedInfrastructureModule implements OnModuleInit{
    constructor(
        private readonly event$: EventBus,
        private readonly rbmqSubscriber: RabbitMQSubscriber,
        private readonly rbmqPublisher: RabbitMQPublisher,
    ) {
    }

    async onModuleInit(): Promise<any> {
        await this.rbmqSubscriber.connect();
        this.rbmqSubscriber.bridgeEventsTo(this.event$.subject$);

        await this.rbmqPublisher.connect();
        this.event$.publisher = this.rbmqPublisher;
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