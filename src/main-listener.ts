import {NestFactory} from '@nestjs/core';
import {EventsModule} from './app.module';

async function bootstrap() {
    await NestFactory.createApplicationContext(
        EventsModule.register({driver:'orm', mailing:"development"}),
    );
}
bootstrap();
