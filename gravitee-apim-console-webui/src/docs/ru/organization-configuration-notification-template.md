# Шаблон уведомления

## Уведомления портала

Настройте уведомления, которые показываются в колокольчике на панели навигации. Можно изменить заголовок и текст.

## Уведомления по email

Настройте уведомления, которые отправляются по email. Можно изменить тему и тело письма.

---
**ПРИМЕЧАНИЕ**: для **template to include** можно переопределить только тело.

---

## Параметры
Чтобы добавить в шаблоны конкретные сведения, используйте движок шаблонов Freemarker.
Примеры:

* `${user.name}`
* `${api.metadata['foo-bar']}`

Для всех уведомлений можно использовать эти параметры:

| API               | Application      | Group            |
|-------------------|------------------|------------------|
| name              | name             | name             |
| description       | description      | -                |
| version           | type             | -                |
| role              | status           | -                |
| metadata (Map)    | role             | -                |
| deployedAt (Date) | -                | -                |
| createdAt (Date)  | createdAt (Date) | createdAt (Date) |
| updatedAt (Date)  | updatedAt (Date) | updatedAt (Date) |

| Plan               | Owner/User  | Subscription        |
|--------------------|-------------|---------------------|
| name               | name        | status              |
| description        | description | request             |
| order              | order       | reason              |
| publishedAt (Date) | displayName | processedAt (Date)  |
| closedAt (Date)    | email       | startingAt (Date)   |
| -                  | -           | endingAt (Date)     |
| createdAt (Date)   | -           | closedAt (Date)     |
| updatedAt (Date)   | -           | subscribedAt (Date) |
