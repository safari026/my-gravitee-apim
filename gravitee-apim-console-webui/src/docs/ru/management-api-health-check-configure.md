# Health Check API

Настройка health check позволяет включить или выключить сервис, задать частоту, выбрать относительный путь `health` и добавить проверки состояния endpoint API.

Как записать проверку:

Пример 1. Статус HTTP-ответа
`#response.status == 200`

Пример 2. JSON-содержимое ответа
`#jsonPath(#response.content, '$.status') == 'green'`
