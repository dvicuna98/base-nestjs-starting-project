import * as process from "node:process";

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
    mail:{
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        username: process.env.MAIL_USERNAME,
        password: process.env.MAIL_PASSWORD,
        from_address: process.env.MAIL_FROM_ADDRESS
    }
});