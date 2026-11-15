# Журналирование

Журналирование позволяет издателю API точнее задать, что записывать, когда gateway обрабатывает запрос.

Издатель API также может задать условие, при котором записываются запрос и ответ.

Примеры условий:

```text
#request.headers['X-DEBUG'] == 'true'
```

```text
#context.application == 'xxxx-xxx-xxx-xxxx'
```

```text
#request.headers['X-DEBUG'] == 'true' && #context.application == 'xxxx-xxx-xxx-xxxx'
```

```text
#request.timestamp < #date.now()
```
