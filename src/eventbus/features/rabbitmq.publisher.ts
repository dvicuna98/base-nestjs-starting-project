import {Injectable} from "@nestjs/common";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import {ConfigService} from "@nestjs/config";
import {PublisherInterface} from "../interfaces/publisher.interface";

@Injectable()
export class RabbitmqPublisher implements PublisherInterface{

    constructor(
        private readonly amqpConnection: AmqpConnection,
        private config:ConfigService
    ) {
    }

    publish() {
    }
}