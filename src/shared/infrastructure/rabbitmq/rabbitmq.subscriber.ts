import {Injectable, Logger} from "@nestjs/common";
import {ModuleRef} from "@nestjs/core";
import {AmqpConnection, Nack} from "@golevelup/nestjs-rabbitmq";
import {Channel, ConsumeMessage} from "amqplib";
import {ConfigService} from "@nestjs/config";
import {WithRetryException} from "./exceptions/with-retry.exception";

@Injectable()
export class RabbitmqSubscriber{

    private readonly logger: Logger = new Logger(RabbitmqSubscriber.name);

    private readonly exchangeName:string;

    private readonly queueName:string;

    private readonly directExchangeName:string;

    private readonly retryQueueName:string

    private readonly retryBindingKey:string

    private readonly deadLetterQueue:string;

    private readonly deadLetterBindingKey:string;

    constructor(
        private moduleRef: ModuleRef,
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

    async connect(){

        let channel: Channel = this.amqpConnection.channel

        await channel.bindQueue(this.queueName,this.exchangeName,'');
        await channel.bindQueue(this.retryQueueName,this.directExchangeName,this.retryBindingKey);
        await channel.bindQueue(this.deadLetterQueue,this.directExchangeName,this.deadLetterBindingKey);

        await this.mainQueueConnection();

    }

    private async mainQueueConnection (){

        await this.amqpConnection.createSubscriber<string>(
            async (message) => {

                console.log(message)

                return new Nack(false);
            },
            {
                exchange: this.exchangeName,

                queue: this.queueName,

                createQueueIfNotExists: true,

                errorHandler: (channel: Channel, msg: ConsumeMessage, e) => {

                    let counter:number|undefined = msg.properties.headers['retry_counter'];

                    if(counter){
                        counter++;
                    }else{
                        counter = 1;
                    }

                    if(e instanceof WithRetryException && counter < 4)
                    {
                        this.logger.log('Sending message to retry queue');
                        this.publishOnRetryQueue(msg, counter)
                    }else
                    {
                        this.logger.warn('Sending message to dead letter');
                        this.publishOnDeadLetter(msg);
                    }
                    channel.reject(msg, false);
                },
            },
            'handler',
        );
    }

    private publishOnRetryQueue(msg: ConsumeMessage, counter:number){

        this.amqpConnection.channel.publish(
            this.directExchangeName,
            this.retryBindingKey,
            msg.content,
            {
                headers:{
                    retry_counter: counter
                }
            }
        )
        this.logger.log('Message sent to retry queue');

    }

    private publishOnDeadLetter(msg: ConsumeMessage){

        this.amqpConnection.channel.publish(
            this.directExchangeName,
            this.deadLetterBindingKey,
            msg.content
        )
        this.logger.warn('Message sent to dead letter');
    }
}