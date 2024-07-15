import {Injectable, Logger} from "@nestjs/common";
import {AmqpConnection, Nack} from "@golevelup/nestjs-rabbitmq";
import {Channel, ConsumeMessage} from "amqplib";
import {ConfigService} from "@nestjs/config";
import {WithRetryException} from "../exceptions/with-retry.exception";
import {RabbitmqPublisher} from "./rabbitmq.publisher";

@Injectable()
export class RabbitmqSubscriber{

    private readonly logger: Logger = new Logger(RabbitmqSubscriber.name);

    private readonly exchangeName:string;

    private readonly queueName:string;

    constructor(
        private readonly amqpConnection: AmqpConnection,
        private readonly configService: ConfigService,
        private readonly publisherService: RabbitmqPublisher
    ) {
        this.exchangeName = this.configService.get('rabbitmq.main_exchange.name');
        this.queueName = this.configService.get('rabbitmq.main_queues.name');
    }

    async connect(){


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

                    let counter:number|undefined = msg.properties.headers['redelivery_count'];

                    if(counter){
                        counter++;
                    }else{
                        counter = 1;
                    }

                    if(e instanceof WithRetryException && counter < 4)
                    {
                        this.logger.log('Sending message to retry queue');
                        this.publisherService.publishOnRetryQueue(msg, counter)
                    }else
                    {
                        this.logger.warn('Sending message to dead letter');
                        this.publisherService.publishOnDeadLetter(msg);
                    }
                    channel.reject(msg, false);
                },
            },
            'handler',
        );

    }

}