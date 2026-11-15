## Конфигурация

Как редактор API вы можете задавать flows.

Каждый flow применяется к пути в заданном порядке.

Можно указать имя и описание. Если имя пустое, оно будет составлено из оператора ("Starts with" или "Equals"), пути и HTTP-методов.

Также можно задать условие на Expression Language (EL).

Этот язык позволяет запрашивать и изменять граф объектов и основан на SpEL (Spring Expression Language). Всё, что описано по ссылке, доступно и здесь.

##### Примеры:
- Значение свойства my-property из properties: `{#properties['my-property']}`
- Значение заголовка Content-Type входящего HTTP-запроса: `{#request.headers['content-type']}`
- Вторая часть пути запроса: `{#request.paths[1]}`
- Значение атрибута user-id входящего HTTP-запроса `{#context.attributes['user-id']}`
- Значение атрибута plan входящего HTTP-запроса `{#context.attributes['plan']}`
