import {Injectable, Logger} from "@nestjs/common";
import {ModuleRef} from "@nestjs/core";
import {AmqpConnection, Nack} from "@golevelup/nestjs-rabbitmq";
import {Channel, ConsumeMessage} from "amqplib";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class RabbitmqSubscriber{

    private readonly logger: Logger = new Logger(RabbitmqSubscriber.name);

    exchangeName:string;

    queueName:string;

    constructor(
        private moduleRef: ModuleRef,
        private readonly amqpConnection: AmqpConnection,
        private readonly configService: ConfigService
    ) {
        this.exchangeName = this.configService.get('rabbitmq.main_exchange.name');
        this.queueName = this.configService.get('rabbitmq.main_queues.name');
    }

    async connect(){

        let channel: Channel = this.amqpConnection.channel

        await channel.bindQueue(this.queueName,this.exchangeName,'');

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

                    channel.reject(msg, false);
                },
            },
            'handler',
        );
    }
}