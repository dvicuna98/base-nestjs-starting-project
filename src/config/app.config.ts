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
        main_queues:{
            name: process.env.QUEUE_NAME
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