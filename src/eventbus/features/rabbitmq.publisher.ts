import {Injectable, Logger} from "@nestjs/common";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import {ConfigService} from "@nestjs/config";
import {PublisherInterface} from "../interfaces/publisher.interface";
import {ConsumeMessage} from "amqplib";

@Injectable()
export class RabbitmqPublisher implements PublisherInterface{

    private readonly logger: Logger = new Logger(RabbitmqPublisher.name);

    private readonly exchangeName:string;

    private readonly queueName:string;

    private readonly directExchangeName:string;

    private readonly retryQueueName:string

    private readonly retryBindingKey:string

    private readonly deadLetterQueue:string;

    private readonly deadLetterBindingKey:string;

    constructor(
        private readonly amqpConnection: AmqpConnection,
        private readonly configService: ConfigService
    ) {
        this.exchangeName = this.configService.get('rabbitmq.main_exchange.name');
        this.queueName = this.configService.get('rabbitmq.main_queues.name');
        this.directExchangeName = this.configService.get('rabbitmq.direct_exchange.name');
        this.retryQueueName = this.configService.get('rabbitmq.retry_queue.name');
        this.deadLetterQueue = this.configService.get('rabbitmq.dead_letter_queue.name');
        this.retryBindingKey = this.configService.get('rabbitmq.retry_queue.binding_key');
        this.deadLetterBindingKey = this.configService.get('rabbitmq.dead_letter_queue.binding_key');
    }

    publish() {

    }

    publishOnRetryQueue(msg: ConsumeMessage, counter:number){

        this.amqpConnection.channel.publish(
            this.directExchangeName,
            this.retryBindingKey,
            msg.content,
            {
                headers:{
                    redelivery_count: counter
                }
            }
        )
        this.logger.log('Message sent to retry queue');

    }

    publishOnDeadLetter(msg: ConsumeMessage){

        this.amqpConnection.channel.publish(
            this.directExchangeName,
            this.deadLetterBindingKey,
            msg.content
        )
        this.logger.warn('Message sent to dead letter');
    }
}