# Сведения API на портале

Добавьте список пар имя/значение для боковой панели API.
Имя можно показать как есть или использовать как ключ перевода.

Чтобы добавить перевод, обновите JSON-файл (см. [Github](https://github.com/gravitee-io/gravitee-portal-webui/tree/master/src/assets/i18n)).

Значение может быть задано явно или через шаблон, как на страницах документации.

Примеры:

| Name               | Value                       |
|--------------------|-----------------------------|
| api.version        | `${api.version}`            |
| api.endpoint       | `${api.proxy.contextPath}`  |
| api.publishedAt    | `${(api.deployedAt?date)!}` |
| My hard coded name | `My hard coded value`       |

Можно сочетать атрибуты API, метаданные и строки.

Дополнительно раздел `API Page list options` позволяет решить,
нужно ли выделять API с наивысшим рейтингом этого окружения
вверху списка.
