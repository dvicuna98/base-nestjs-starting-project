import * as process from "node:process";
import * as Joi from "joi";

export default () => ({
    environment: process.env.NODE_ENV || 'development',
    database: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        authSource: process.env.DB_AUTHSOURCE,
        uri: process.env.DB_URI_MONGODB,
    },
    rabbitmq:{
        uri: process.env.ENQUEUE_DSN,
        main_exchange: {
            name: process.env.EXCHANGE_NAME,
            type: process.env.EXCHANGE_TYPE
        },
        direct_exchange:{
            name: process.env.EXCHANGE_NAME_DIRECT,
            type: process.env.EXCHANGE_TYPE_DIRECT
        },
        main_queues:{
            name: process.env.QUEUE_NAME
        },
        retry_queue:{
            name: process.env.QUEUE_NAME_RETRY,
            binding_key: process.env.DIRECT_BINDING_KEY
        },
        dead_letter_queue:{
            name: process.env.DEAD_LETTER_QUEUE_NAME,
            binding_key: process.env.DEAD_LETTER_BINDING_KEY
        }
    },
});

export function JoiValidationObject () {

    return Joi.object({
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_AUTHSOURCE: Joi.required(),
        DB_URI_MONGODB: Joi.required(),
        DB_HOST: Joi.required(),
        DB_FORWARD_PORT: Joi.required(),
        RABBITMQ_HOST: Joi.required(),
        RABBITMQ_USERNAME: Joi.required(),
        RABBITMQ_PASSWORD: Joi.required(),
        RABBITMQ_PORT: Joi.required(),
        RABBITMQ_VHOST: Joi.required(),
        EXCHANGE_NAME: Joi.required(),
        EXCHANGE_TYPE: Joi.required(),
        QUEUE_NAME: Joi.required(),
        EXCHANGE_NAME_DIRECT: Joi.required(),
        EXCHANGE_TYPE_DIRECT: Joi.required(),
        QUEUE_NAME_RETRY: Joi.required(),
        DEAD_LETTER_QUEUE_NAME: Joi.required(),
        DIRECT_BINDING_KEY: Joi.required(),
        DEAD_LETTER_BINDING_KEY: Joi.required(),
        ENQUEUE_DSN: Joi.required(),
    });
}