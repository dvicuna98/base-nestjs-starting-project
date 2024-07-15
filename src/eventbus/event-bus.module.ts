import {Module, OnModuleInit} from '@nestjs/common';
import {RabbitMQModule} from "@golevelup/nestjs-rabbitmq";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RabbitmqSubscriber} from "./features/rabbitmq.subscriber";

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
                    },
                    {
                        name: config.get('rabbitmq.direct_exchange.name'),
                        type: config.get('rabbitmq.direct_exchange.type'),
                        createExchangeIfNotExists: true
                    }
                ],
                queues: [
                    {
                        name: config.get('rabbitmq.main_queues.name'),
                        exchange: config.get('rabbitmq.main_exchange.name'),
                        createQueueIfNotExists: true
                    },
                    {
                        name: config.get('rabbitmq.retry_queue.name'),
                        exchange: config.get('rabbitmq.direct_exchange.name'),
                        createQueueIfNotExists: true,
                        options: {
                            deadLetterExchange: config.get('rabbitmq.main_exchange.name'),
                            messageTtl: 3000
                        }
                    },
                    {
                        name: config.get('rabbitmq.dead_letter_queue.name'),
                        exchange: config.get('rabbitmq.direct_exchange.name'),
                        createQueueIfNotExists: true
                    }
                ]
            }),
            inject: [ConfigService]
        }),
    ],
    providers:[
        RabbitmqSubscriber
    ],
})
export class EventBusModule implements OnModuleInit{

    constructor(
        private readonly rbmqSubscriber: RabbitmqSubscriber,
    ) {
    }

    async onModuleInit(): Promise<any> {
        await this.rbmqSubscriber.connect();
    }
}
