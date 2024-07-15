import {Module, OnModuleInit} from '@nestjs/common';
import {AmqpConnection, RabbitMQModule} from "@golevelup/nestjs-rabbitmq";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RabbitmqSubscriber} from "./features/rabbitmq.subscriber";
import {RabbitmqPublisher} from "./features/rabbitmq.publisher";
import {Channel} from "amqplib";

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
        RabbitmqSubscriber,
        RabbitmqPublisher
    ],
})
export class EventBusModule implements OnModuleInit{
    private readonly exchangeName:string;

    private readonly queueName:string;

    private readonly directExchangeName:string;

    private readonly retryQueueName:string

    private readonly retryBindingKey:string

    private readonly deadLetterQueue:string;

    private readonly deadLetterBindingKey:string;

    constructor(
        private readonly amqpConnection: AmqpConnection,
        private readonly configService: ConfigService,
        private readonly rbmqSubscriber: RabbitmqSubscriber,
        private readonly rbmqPublisher: RabbitmqPublisher
    ) {
        this.exchangeName = this.configService.get('rabbitmq.main_exchange.name');
        this.queueName = this.configService.get('rabbitmq.main_queues.name');
        this.directExchangeName = this.configService.get('rabbitmq.direct_exchange.name');
        this.retryQueueName = this.configService.get('rabbitmq.retry_queue.name');
        this.deadLetterQueue = this.configService.get('rabbitmq.dead_letter_queue.name');
        this.retryBindingKey = this.configService.get('rabbitmq.retry_queue.binding_key');
        this.deadLetterBindingKey = this.configService.get('rabbitmq.dead_letter_queue.binding_key');
    }

    async onModuleInit(): Promise<any> {
        let channel: Channel = this.amqpConnection.channel;

        await channel.bindQueue(this.queueName,this.exchangeName,'');

        await channel.bindQueue(this.retryQueueName,this.directExchangeName,this.retryBindingKey);

        await channel.bindQueue(this.deadLetterQueue,this.directExchangeName,this.deadLetterBindingKey);

        await this.rbmqSubscriber.connect();

        await this.rbmqPublisher.publish();
    }
}
