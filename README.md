### Tech stack notes

//TODO

#### Base de Datos PostgreSQL:

El proyecto se apoya en una base de datos PostgreSQL para la persistencia de datos.
Un detalle clave es que esta base de datos opera directamente en el mismo servidor que la aplicación principal. Esta configuración puede simplificar la arquitectura de red y potencialmente reducir la latencia en el acceso a los datos para las operaciones que se realizan localmente en el servidor.
Servicio de Traducción con LibreTranslate y Gunicorn:

Para las capacidades de traducción automática, el repositorio integra LibreTranslate, una API de traducción de código abierto y autoalojable.
Este servicio de traducción se expone y gestiona mediante Gunicorn, un servidor WSGI HTTP de Python para UNIX. El uso de Gunicorn sugiere un despliegue robusto y escalable para LibreTranslate, diseñado para manejar múltiples solicitudes de traducción de manera eficiente y concurrente en un entorno de producción.

#### Servicio de Traducción con LibreTranslate y Gunicorn:

Para las capacidades de traducción automática, el repositorio integra LibreTranslate, una API de traducción de código abierto y autoalojable.
Este servicio de traducción se expone y gestiona mediante Gunicorn, un servidor WSGI HTTP de Python para UNIX. El uso de Gunicorn sugiere un despliegue robusto y escalable para LibreTranslate, diseñado para manejar múltiples solicitudes de traducción de manera eficiente y concurrente en un entorno de producción.
