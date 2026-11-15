# Мультитенантность

Мультитенантность позволяет управлять API в нескольких бизнес-единицах: странах, регионах, дата-центрах и т. д.
Tenants увеличивают совместное использование ресурсов при одном развёртывании API.

Например:

* Есть кластер из 2 экземпляров gateway: один в регионе ASIA, другой в регионе EUROPE.
* У API два endpoint: один в регионе ASIA, другой в регионе EUROPE.

Чтобы снизить затраты, tenant *europe* можно назначить экземпляру Gateway EUROPE и endpoint API EUROPE. То же самое делается для региона ASIA с tenant *asia*.

Новый tenant создаётся в поле *New tenant*, затем нажимается кнопка *SAVE*. Идентификатор tenant создаётся автоматически.

Чтобы связать endpoints API и экземпляры Gateway,
выберите этот tenant на странице конфигурации endpoints API и скопируйте его идентификатор в файл `gravitee.yml` экземпляра gateway:

```yaml
# Multi-tenant configuration
# Allow only a single-value
# tenant: europe
```
