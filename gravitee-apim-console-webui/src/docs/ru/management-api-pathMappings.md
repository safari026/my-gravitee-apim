# Сопоставление путей API

Сопоставление путей позволяет видеть основные ресурсы на панели аналитики.

Ресурсы группируются по этому сопоставлению.

Пример:

```text
/products
/products/1
/products/2
/products/2
/products/1/characteristics
```


С таким сопоставлением:
```text
/products
/products/:productId
```

Результат будет таким:
```text
/products => 1 hit
/products/:productId => 3 hits
```
