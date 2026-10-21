export const ruObservability = {
  overview: {
    title: 'Обзор',
    subtitle: 'Краткий обзор того, что происходит на платформе.',
  },

  dashboards: {
    title: 'Дашборды',
    subtitle: 'Отслеживайте и визуализируйте аналитику API с помощью пользовательских дашбордов.',
    create: 'Создать дашборд',
    createFromTemplate: 'Создать из шаблона',
    createFromScratch: 'Создать с нуля',
    empty: 'Нет дашбордов для отображения',
    loading: 'Загрузка дашборда...',
    updated: 'Дашборд обновлён',
    saveFailed: 'Не удалось сохранить дашборд.',
    deleteTitle: 'Удалить дашборд',
    deleteContent: 'Удалить дашборд «<strong>{name}</strong>»?',
    deleteSuccess: 'Дашборд «{name}» успешно удалён.',
    deleteError: 'Произошла ошибка при удалении дашборда.',
    columns: {
      name: 'Имя',
      lastModified: 'Изменён',
      labels: 'Метки',
    },
  },

  templateSelector: {
    title: 'Создать из шаблона',
    info: 'Справка',
    labels: 'Метки:',
    useTemplate: 'Использовать шаблон',
    previewAlt: 'Предпросмотр {name}',
  },

  logs: {
    title: 'Логи',
    subtitle: 'Просматривайте и анализируйте runtime-логи API.',
    httpProxyOnly: 'Сейчас поддерживается только HTTP Proxy.',
    comingSoonApis: 'Поддержка Message API, SSE и webhook появится позже.',
    tableAria: 'Таблица логов окружения',
    warningsCount: 'Предупреждений: {count}',
    requestFailed: 'Ошибка запроса: {status} {statusText}',
    loadError: 'Неожиданная ошибка при загрузке логов.',
    columns: {
      timestamp: 'Время',
      assetType: 'Тип актива',
      method: 'Метод',
      status: 'Статус',
      api: 'API',
      path: 'Путь',
      application: 'Приложение',
      plan: 'План',
      gateway: 'Шлюз',
      responseTime: 'Время ответа',
      endpointReached: 'Endpoint достигнут',
      issues: 'Проблемы',
    },
    details: {
      loading: 'Загрузка сведений о логе…',
      back: 'Назад к логам',
      title: 'Лог',
      overview: 'Обзор',
      request: 'Запрос',
      response: 'Ответ',
      date: 'Дата',
      host: 'Хост',
      method: 'Метод',
      uri: 'URI',
      requestId: 'ID запроса',
      transactionId: 'ID транзакции',
      remoteIp: 'Удалённый IP',
      status: 'Статус',
      globalResponseTime: 'Общее время ответа',
      apiResponseTime: 'Время ответа API',
      latency: 'Задержка',
      contentLength: 'Длина содержимого',
      moreDetails: 'Дополнительные сведения',
      application: 'Приложение',
      plan: 'План',
      apiProduct: 'API-продукт',
      endpoint: 'Endpoint',
      headers: 'Заголовки',
      consumer: 'Consumer',
      gateway: 'Шлюз',
      body: 'Тело',
      noRequestBody: 'Тело запроса не зафиксировано.',
      noResponseBody: 'Тело ответа не зафиксировано.',
      notFound: 'Лог не найден.',
      loadFailed: 'Не удалось загрузить лог: {status} {statusText}',
      loadError: 'Неожиданная ошибка при загрузке лога.',
    },
  },

  templates: {
    'http-proxy': {
      name: 'HTTP Proxy',
      shortDescription: 'Мониторинг здоровья API, тенденций трафика и надёжности сервиса в реальном времени.',
      description:
        'Этот дашборд даёт централизованный обзор производительности API, распределения ошибок и задержки в инфраструктуре. Он помогает быстро находить узкие места и поддерживать стабильность для потребителей API.',
      info: 'Только для V4 proxy API. V2 API не поддерживаются.',
    },
    llm: {
      name: 'LLM',
      shortDescription: 'Мониторинг использования LLM, потребления токенов и связанных затрат на ИИ.',
      description:
        'Этот дашборд даёт централизованный обзор использования LLM, потребления токенов и затрат. Отслеживайте общее и среднее число токенов, стоимость во времени, использование по моделям и распределение статусов ответа, чтобы оптимизировать ИИ-интеграции.',
    },
    mcp: {
      name: 'MCP',
      shortDescription: 'Мониторинг использования протокола MCP, распределения методов и производительности шлюза.',
      description:
        'Этот дашборд даёт централизованный обзор использования MCP (Model Context Protocol) API. Отслеживайте объём запросов и задержку, анализируйте методы, ресурсы, инструменты и промпты, распределение статусов ответа и время ответа шлюза, чтобы оптимизировать MCP-интеграции.',
    },
  },

  widgets: {
    'proxy-requests': {
      title: 'Запросы',
      description: 'Число запросов',
    },
    'proxy-error-rate': {
      title: 'Доля ошибок',
      description: 'Процент ответов с ошибкой',
    },
    'proxy-average-latency': {
      title: 'Средняя задержка',
      description: 'Средняя задержка Gateway',
    },
    'proxy-average-response-time': {
      title: 'Среднее время ответа',
      description: 'Среднее время ответа Gateway',
    },
    'proxy-http-statuses': {
      title: 'HTTP-статусы',
      description: 'Число HTTP-запросов по HTTP-статусу',
    },
    'proxy-response-time': {
      title: 'Время ответа',
      description: 'Среднее время ответа Endpoint и Gateway в мс',
    },
    'proxy-response-statuses': {
      title: 'Статусы ответа',
      description: 'Число статусов ответа во времени',
    },
    'proxy-top-5-applications': {
      title: 'Топ-5 приложений',
      description: 'Топ-5 приложений по числу HTTP-запросов',
    },
    'llm-requests': {
      title: 'Запросы LLM',
      description: 'Число запросов к провайдерам LLM.',
    },
    'llm-total-tokens': {
      title: 'Всего токенов',
      description: 'Общее число обработанных токенов (prompt и completion).',
    },
    'llm-total-cost': {
      title: 'Общая стоимость',
      description: 'Общая стоимость использования LLM.',
    },
    'llm-average-cost-per-request': {
      title: 'Средняя стоимость запроса',
      description: 'Средняя стоимость одного запроса LLM.',
    },
    'llm-average-tokens-per-request': {
      title: 'Среднее число токенов на запрос',
      description: 'Среднее число токенов на один запрос LLM.',
    },
    'llm-total-requests': {
      title: 'Всего запросов',
      description: 'Общее число HTTP-запросов, обработанных шлюзом.',
    },
    'llm-token-count-over-time': {
      title: 'Токены во времени',
      description: 'Динамика потребления токенов (prompt, completion и всего).',
    },
    'llm-token-cost-over-time': {
      title: 'Стоимость токенов во времени',
      description: 'Динамика затрат LLM во времени с разбивкой на prompt и completion.',
    },
    'llm-total-tokens-per-model': {
      title: 'Токены по моделям',
      description: 'Распределение общего числа токенов по моделям LLM.',
    },
    'llm-response-status-repartition': {
      title: 'Распределение статусов ответа',
      description: 'Распределение HTTP-статусов ответа для запросов LLM.',
    },
    'mcp-requests': {
      title: 'Запросы MCP',
      description: 'Общее число запросов к MCP API.',
    },
    'mcp-average-latency': {
      title: 'Средняя задержка',
      description: 'Средняя задержка шлюза для запросов MCP.',
    },
    'mcp-max-latency': {
      title: 'Максимальная задержка',
      description: 'Максимальная задержка шлюза для запросов MCP.',
    },
    'mcp-p90-latency': {
      title: 'Задержка P90',
      description: '90-й процентиль задержки шлюза для запросов MCP.',
    },
    'mcp-p99-latency': {
      title: 'Задержка P99',
      description: '99-й процентиль задержки шлюза для запросов MCP.',
    },
    'mcp-method-usage': {
      title: 'Использование методов',
      description: 'Распределение методов MCP proxy по числу запросов (топ-10).',
    },
    'mcp-method-usage-over-time': {
      title: 'Использование методов во времени',
      description: 'Динамика использования методов во времени',
    },
    'mcp-most-used-resources': {
      title: 'Самые используемые Resources',
      description: 'Топ-5 самых используемых MCP resources по числу запросов.',
    },
    'mcp-response-status-repartition': {
      title: 'Распределение статусов ответа',
      description: 'Распределение HTTP-статусов ответа для запросов MCP.',
    },
    'mcp-most-used-prompts': {
      title: 'Самые используемые Prompts',
      description: 'Топ-5 самых используемых MCP prompts по числу запросов.',
    },
    'mcp-most-used-tools': {
      title: 'Самые используемые Tools',
      description: 'Топ-5 самых используемых MCP tools по числу запросов.',
    },
    'mcp-average-response-time': {
      title: 'Среднее время ответа',
      description: 'Среднее время ответа шлюза для запросов MCP во времени.',
    },
  },
} as const;
