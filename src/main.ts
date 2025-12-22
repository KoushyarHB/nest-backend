import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // // Log the JWT Secret for debugging
  // const config = app.get(ConfigService);
  // console.log(
  //   'JWT Secret (first 10 chars):',
  //   (config.get('auth.secret') as string)?.slice(0, 10),
  // );
  // console.log('JWT Expires:', config.get('auth.expiresIn'));

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tasks API')
    .setDescription('The Tasks API documentation')
    .setVersion('1.0')
    .build();

  // const document = SwaggerModule.createDocument(app, swaggerConfig);
  // SwaggerModule.setup('api', app, document);
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
