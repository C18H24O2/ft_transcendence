# ft_trans's service-runtime library

> A library for abstracting away common service-related functionality

This bakes in a few things:
- RabbitMQ integration
  - Declare procedures via simple annotated methods
  - Remote service RPCs via an abstract object
- Database integration
  - Uses peewee as the ORM
- Custom log format
