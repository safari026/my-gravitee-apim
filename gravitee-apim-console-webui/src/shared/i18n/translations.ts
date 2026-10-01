export type Language = 'en' | 'ru';

export const translations = {
  en: {
    auth: {
      login: {
        title: 'Sign In',
        subtitle: 'to continue to the APIM Console',
        username: 'Username',
        password: 'Password',
        submit: 'Sign in',

        errors: {
          usernameRequired: 'Username is required.',
          passwordRequired: 'Password is required.',
        },

        signUp: {
          question: "Don't have an account yet?",
          link: 'Sign up',
        },
      },

      signUp: {
        title: 'Sign Up',
        subtitle: 'to access to the APIM Console',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        submit: 'Sign up',

        errors: {
          firstNameRequired: 'First name is required.',
          lastNameRequired: 'Last name is required.',
          emailRequired: 'Email is required.',
          fieldRequired: '{label} is required.',
        },

        alreadyHaveAccount: 'I have already an account!',
        signIn: 'Sign in',

        success: {
          title: 'Thank you for signing up!',
          body: 'You will receive an email with a link to activate your account.',
          goTo: 'Go to',
        },

        accountCreated: 'Your account has been created.',
        createError: 'An error occurred while creating your account.',
      },
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      close: 'Close',
      search: 'Search',
      selectPage: 'Select page',
      hits: 'Nb hits',
      hitsTotal: 'Nb hits total',
      noStatus: 'No status',

      language: {
        switch: 'Switch language',
      },
    },

    navigation: {
      environment: 'Environment',
      dashboard: 'Dashboard',
      apis: 'APIs',
      apiProducts: 'API Products',
      integrations: 'Integrations',
      applications: 'Applications',
      gateways: 'Gateways',
      kafka: {
        title: 'Kafka',
        standalone: 'Standalone',
      },
      apiScore: 'API Score',
      audit: 'Audit',
      observability: {
        title: 'Observability',
        overview: 'Overview',
        dashboards: 'Dashboards',
        logs: 'Logs',
      },
      analytics: {
        title: 'Analytics',
        dashboard: 'Dashboard',
        logs: 'Logs',
        v2Tooltip: 'This interface supports API V2 only. For API V4, switch to the new Observability interface.',
      },
      alerts: 'Alerts',
      portalSettings: 'Portal Settings',
      settings: 'Settings',
      organization: 'Organization',
      developerPortal: 'Developer Portal',
      apiManagement: 'API Management',
    },

    userMenu: {
      myAccount: 'My Account',
      tasks: 'Tasks',
      support: 'Support',
      signOut: 'Sign Out',
    },

    dashboard: {
      tabs: {
        overview: 'Overview',
        apiHealthCheck: 'API Health Check',
        tasks: 'Tasks',
        myTasks: 'My Tasks <span class="gio-badge-accent">{count}</span>',
        broadcasts: 'Broadcasts',
      },
      summary: {
        title: 'Summary',
        totalApis: 'Total APIs',
        totalApplications: 'Total Applications',
      },
      apiLifecycleState: 'API Lifecycle State',
      apiState: 'API State',
      apiResponseStatus: 'API Response Status',
      apiEvents: 'API Events',
      empty: 'No content to display',
      noData: 'No data to display',
      lifecycle: {
        created: 'Created',
        deprecated: 'Deprecated',
        published: 'Published',
        unpublished: 'Unpublished',
      },
      state: {
        stopped: 'Stopped',
        started: 'Started',
      },
      timeframe: {
        label: 'Timeframe',
        lastMinute: 'Last minute',
        lastHour: 'Last hour',
        lastDay: 'Last day',
        lastWeek: 'Last week',
        lastMonth: 'Last month',
        custom: 'Custom',
        from: 'From',
        to: 'To',
        apply: 'Apply',
        refresh: 'Refresh data',
        fromAria: 'Select from date',
        toAria: 'Select to date',
        customDateAria: 'Input for selecting custom date',
        applyAria: 'Apply custom range button',
        refreshAria: 'Refresh data',
        toBeforeFrom: 'Error: Date "to" is earlier than "from"',
      },
      table: {
        name: 'Name',
        hits: 'Hits',
        percent: 'Percent',
        api: 'API',
        date: 'Date',
        type: 'Type',
        deployment: 'Deployment',
      },
      topFailedApis: {
        title: 'Top failed APIs',
        tableAria: 'Top failed apis table',
      },
      topApplications: {
        title: 'Top applications',
        tableAria: 'Top Application table',
      },
      topApis: {
        title: 'Top APIs',
        tooltip:
          'This table shows the top APIs based on the number of hits they have received. It provides insights into which APIs are most frequently accessed, helping you understand usage patterns and prioritize API management efforts.',
        tableAria: 'Top APIs V4 table',
      },
      responseStatus: {
        title: 'Response status',
        subtitle: 'Hits repartition by HTTP Status',
      },
      responseTime: {
        title: 'Response time',
        subtitle: 'Average response time for the gateway and the API',
        series: 'Response time (ms)',
      },
      requestStats: {
        title: 'API Request Stats',
        tooltip: 'Excluding Websocket, Webhook and SSE',
        requests: 'Requests',
        perSecond: 'Per second',
        total: 'Total',
        responseTime: 'Response Time',
        min: 'Min',
        max: 'Max',
        average: 'Average',
        subMillisecond: '< 1 ms',
      },
      events: {
        tableAria: 'API Events table',
        types: {
          PUBLISH_API: 'Deploy',
          UNPUBLISH_API: 'Undeploy',
          START_API: 'Start',
          STOP_API: 'Stop',
        },
      },
      errors: {
        v4ResponseStatus: 'Can not get V4 Api Analytics Response Status',
        v4TopApis: 'Can not get V4 Top APIs',
      },
      healthCheck: {
        banner:
          'Each API is monitored by a periodic HTTP request to the health check endpoint. The API backend receives the request and responds, and the health check service determines if the response is as expected.',
        filterEnabled: 'Filter to APIs with Health Check enabled',
        reportTitle: 'API Health Check Report',
        loading: 'Loading...',
        allOperational: 'All APIs are operational',
        oneInError: '1 API is in error (HealthCheck availability <= 80%)',
        manyInError: '{count} APIs are in error (HealthCheck availability <= 80%)',
        oneInWarning: '1 API is in warning (HealthCheck availability <= 95%)',
        manyInWarning: '{count} APIs are in warning (HealthCheck availability <= 95%)',
        searchLabel: 'Search APIs | name:"My api *" ownerName:admin',
        tableAria: 'Apis table',
        availability: 'API Availability',
        availabilitySeries: 'Availability',
        notConfigured: 'Health check has not been configured',
        viewAria: 'Button to view API Health-check',
        viewTooltip: 'View API Health-check',
        noApis: 'No APIs to display.',
        showDataFor: 'Show data for',
        refresh: 'Refresh',
        hcAvailabilityTooltip: 'HealthCheck availability',
        outOfSync: 'API out of sync',
        kubernetesOrigin: 'Kubernetes Origin',
        badge: {
          draft: 'Draft',
          inReview: 'In Review',
          needChanges: 'Need changes',
        },
      },
    },

    tasks: {
      title: 'My Tasks ({count})',
      empty: 'No tasks to display.',
      loadError: 'Failed to load tasks',
      accept: 'Accept',
      reject: 'Reject',
      validate: 'Validate',
      review: 'Review',
      makeChanges: 'Make changes',
      details: 'Details',
      types: {
        subscription: 'Subscription',
        apiReview: 'API review',
        userRegistration: 'User registration',
        promotion: 'API promotion request',
      },
      ref: {
        api: 'API',
        apiProduct: 'API Product',
      },
      messages: {
        subscription:
          'The application <code>{appName}</code> requested a subscription for {refLabel} <code>{refName}</code> (plan: {planName})',
        inReview: 'The API <code>{apiName}</code> is ready to be reviewed',
        requestForChanges:
          'The API <code>{apiName}</code> has been reviewed and some changes are requested by the reviewer',
        requestForChangesWithComment:
          'The API <code>{apiName}</code> has been reviewed and some changes are requested by the reviewer: {comment}',
        userRegistration: 'The registration of the user <strong>{displayName}</strong> has to be validated',
        promotion:
          '<strong>{author}</strong> requested the promotion of API <code>{apiName}</code> from environment <strong>{sourceEnvironment}</strong> to environment <strong>{targetEnvironment}</strong>',
      },
      promotionDetails: {
        update: 'Since the API has already been promoted to this environment, accepting this promotion will update the existing API.',
        create: 'Accepting this promotion will create a new API in the specified environment.',
      },
      rejectDialog: {
        title: 'Reject Promotion Request',
        content:
          'After having rejected this promotion you will not be able to accept it without asking the author to create a new promotion',
      },
      accepted: 'API promotion accepted',
      rejected: 'API promotion rejected',
      promoteDialog: {
        title: 'Promote the API',
        shardingTags: 'Sharding tags',
        shardingTagsBody: 'The sharding tags of the promotion must exist in this environment.',
        update:
          'Since the API <code>{apiName}</code> has already been promoted to <strong>{environment}</strong> environment, accepting this promotion will update it.',
        create: 'Accepting this promotion will create a new API in <strong>{environment}</strong> environment.',
      },
    },

    messages: {
      title: 'Send a Broadcast Message',
      banner: 'Send a one-way message to specified recipients to inform them of any changes or updates.',
      channel: 'Channel',
      channelRequired: 'Channel is required',
      recipients: 'Recipients',
      recipientsRequired: 'Recipients is required',
      titleLabel: 'Title',
      titleRequired: 'Title is required',
      httpHeaders: 'HTTP headers',
      url: 'URL',
      urlRequired: 'URL is required',
      useSystemProxy: 'Use system proxy',
      text: 'Text',
      textRequired: 'Text is required',
      send: 'Send',
      channels: {
        portal: 'Portal Notifications',
        email: 'Email',
        http: 'POST HTTP Message',
      },
      recipient: {
        apiSubscribers: 'API subscribers',
        applicationRole: 'Members with the {role} role on applications subscribed to this API',
        environmentRole: 'Members with the {role} role on this environment',
      },
      success: {
        one: 'Message sent to {count} recipient',
        many: 'Message sent to {count} recipients',
      },
      error: 'Message could not be sent',
      errorBecause: 'Message could not be sent because of {reason}',
    },
  },

  ru: {
    auth: {
      login: {
        title: 'Вход',
        subtitle: 'для продолжения работы с APIM Console',
        username: 'Имя пользователя',
        password: 'Пароль',
        submit: 'Войти',

        errors: {
          usernameRequired: 'Введите имя пользователя.',
          passwordRequired: 'Введите пароль.',
        },

        signUp: {
          question: 'Ещё нет аккаунта?',
          link: 'Зарегистрироваться',
        },
      },

      signUp: {
        title: 'Регистрация',
        subtitle: 'для доступа к APIM Console',
        firstName: 'Имя',
        lastName: 'Фамилия',
        email: 'Email',
        submit: 'Зарегистрироваться',

        errors: {
          firstNameRequired: 'Введите имя.',
          lastNameRequired: 'Введите фамилию.',
          emailRequired: 'Введите email.',
          fieldRequired: '{label} обязательно для заполнения.',
        },

        alreadyHaveAccount: 'У меня уже есть аккаунт!',
        signIn: 'Войти',

        success: {
          title: 'Спасибо за регистрацию!',
          body: 'На указанный email придёт письмо со ссылкой для активации аккаунта.',
          goTo: 'Перейти к',
        },

        accountCreated: 'Аккаунт создан.',
        createError: 'Не удалось создать аккаунт.',
      },
    },
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      close: 'Закрыть',
      search: 'Поиск',
      selectPage: 'Выбрать страницу',
      hits: 'Число запросов',
      hitsTotal: 'Всего запросов',
      noStatus: 'Без статуса',

      language: {
        switch: 'Переключить язык',
      },
    },

    navigation: {
      environment: 'Окружение',
      dashboard: 'Дашборд',
      apis: 'API',
      apiProducts: 'API-продукты',
      integrations: 'Интеграции',
      applications: 'Приложения',
      gateways: 'Шлюзы',
      kafka: {
        title: 'Kafka',
        standalone: 'Автономный',
      },
      apiScore: 'Оценка API',
      audit: 'Аудит',
      observability: {
        title: 'Наблюдаемость',
        overview: 'Обзор',
        dashboards: 'Дашборды',
        logs: 'Логи',
      },
      analytics: {
        title: 'Аналитика',
        dashboard: 'Дашборд',
        logs: 'Логи',
        v2Tooltip: 'Этот интерфейс поддерживает только API V2. Для API V4 перейдите в новый интерфейс Observability.',
      },
      alerts: 'Оповещения',
      portalSettings: 'Настройки портала',
      settings: 'Настройки',
      organization: 'Организация',
      developerPortal: 'Портал разработчика',
      apiManagement: 'Управление API',
    },

    userMenu: {
      myAccount: 'Мой аккаунт',
      tasks: 'Задачи',
      support: 'Поддержка',
      signOut: 'Выйти',
    },

    dashboard: {
      tabs: {
        overview: 'Обзор',
        apiHealthCheck: 'Проверка работоспособности API',
        tasks: 'Задачи',
        myTasks: 'Мои задачи <span class="gio-badge-accent">{count}</span>',
        broadcasts: 'Рассылки',
      },
      summary: {
        title: 'Сводка',
        totalApis: 'Всего API',
        totalApplications: 'Всего приложений',
      },
      apiLifecycleState: 'Жизненный цикл API',
      apiState: 'Состояние API',
      apiResponseStatus: 'Статус ответов API',
      apiEvents: 'События API',
      empty: 'Нет данных для отображения',
      noData: 'Нет данных для отображения',
      lifecycle: {
        created: 'Создан',
        deprecated: 'Устарел',
        published: 'Опубликован',
        unpublished: 'Снят с публикации',
      },
      state: {
        stopped: 'Остановлен',
        started: 'Запущен',
      },
      timeframe: {
        label: 'Период',
        lastMinute: 'Последняя минута',
        lastHour: 'Последний час',
        lastDay: 'Последний день',
        lastWeek: 'Последняя неделя',
        lastMonth: 'Последний месяц',
        custom: 'Произвольный',
        from: 'С',
        to: 'По',
        apply: 'Применить',
        refresh: 'Обновить данные',
        fromAria: 'Выбрать начальную дату',
        toAria: 'Выбрать конечную дату',
        customDateAria: 'Поле выбора произвольной даты',
        applyAria: 'Применить произвольный период',
        refreshAria: 'Обновить данные',
        toBeforeFrom: 'Ошибка: дата «по» раньше даты «с»',
      },
      table: {
        name: 'Название',
        hits: 'Запросы',
        percent: 'Процент',
        api: 'API',
        date: 'Дата',
        type: 'Тип',
        deployment: 'Развёртывание',
      },
      topFailedApis: {
        title: 'API с наибольшим числом ошибок',
        tableAria: 'Таблица API с наибольшим числом ошибок',
      },
      topApplications: {
        title: 'Топ приложений',
        tableAria: 'Таблица топ приложений',
      },
      topApis: {
        title: 'Топ API',
        tooltip:
          'В этой таблице показаны API с наибольшим числом запросов. Она помогает понять, какие API используются чаще всего, и расставить приоритеты в управлении API.',
        tableAria: 'Таблица топ API V4',
      },
      responseStatus: {
        title: 'Статус ответов',
        subtitle: 'Распределение запросов по HTTP-статусу',
      },
      responseTime: {
        title: 'Время ответа',
        subtitle: 'Среднее время ответа шлюза и API',
        series: 'Время ответа (мс)',
      },
      requestStats: {
        title: 'Статистика запросов API',
        tooltip: 'Без учёта Websocket, Webhook и SSE',
        requests: 'Запросы',
        perSecond: 'В секунду',
        total: 'Всего',
        responseTime: 'Время ответа',
        min: 'Мин.',
        max: 'Макс.',
        average: 'Среднее',
        subMillisecond: '< 1 мс',
      },
      events: {
        tableAria: 'Таблица событий API',
        types: {
          PUBLISH_API: 'Развёртывание',
          UNPUBLISH_API: 'Снятие с развёртывания',
          START_API: 'Запуск',
          STOP_API: 'Остановка',
        },
      },
      errors: {
        v4ResponseStatus: 'Не удалось получить статус ответов аналитики API V4',
        v4TopApis: 'Не удалось получить топ API V4',
      },
      healthCheck: {
        banner:
          'Каждый API проверяется периодическим HTTP-запросом к эндпоинту health check. Бэкенд API получает запрос и отвечает, а служба проверки определяет, соответствует ли ответ ожидаемому.',
        filterEnabled: 'Показать только API с включённой проверкой работоспособности',
        reportTitle: 'Отчёт о проверке работоспособности API',
        loading: 'Загрузка...',
        allOperational: 'Все API работают штатно',
        oneInError: '1 API в состоянии ошибки (доступность HealthCheck <= 80%)',
        manyInError: '{count} API в состоянии ошибки (доступность HealthCheck <= 80%)',
        oneInWarning: '1 API в состоянии предупреждения (доступность HealthCheck <= 95%)',
        manyInWarning: '{count} API в состоянии предупреждения (доступность HealthCheck <= 95%)',
        searchLabel: 'Поиск API | name:"My api *" ownerName:admin',
        tableAria: 'Таблица API',
        availability: 'Доступность API',
        availabilitySeries: 'Доступность',
        notConfigured: 'Проверка работоспособности не настроена',
        viewAria: 'Кнопка просмотра проверки работоспособности API',
        viewTooltip: 'Просмотр проверки работоспособности API',
        noApis: 'Нет API для отображения.',
        showDataFor: 'Показать данные за',
        refresh: 'Обновить',
        hcAvailabilityTooltip: 'Доступность HealthCheck',
        outOfSync: 'API не синхронизирован',
        kubernetesOrigin: 'Источник Kubernetes',
        badge: {
          draft: 'Черновик',
          inReview: 'На проверке',
          needChanges: 'Требуются изменения',
        },
      },
    },

    tasks: {
      title: 'Мои задачи ({count})',
      empty: 'Нет задач для отображения.',
      loadError: 'Не удалось загрузить задачи',
      accept: 'Принять',
      reject: 'Отклонить',
      validate: 'Подтвердить',
      review: 'Проверить',
      makeChanges: 'Внести изменения',
      details: 'Подробнее',
      types: {
        subscription: 'Подписка',
        apiReview: 'Проверка API',
        userRegistration: 'Регистрация пользователя',
        promotion: 'Запрос на продвижение API',
      },
      ref: {
        api: 'API',
        apiProduct: 'API-продукт',
      },
      messages: {
        subscription:
          'Приложение <code>{appName}</code> запросило подписку на {refLabel} <code>{refName}</code> (план: {planName})',
        inReview: 'API <code>{apiName}</code> готов к проверке',
        requestForChanges: 'API <code>{apiName}</code> проверен, рецензент запросил изменения',
        requestForChangesWithComment:
          'API <code>{apiName}</code> проверен, рецензент запросил изменения: {comment}',
        userRegistration: 'Регистрацию пользователя <strong>{displayName}</strong> нужно подтвердить',
        promotion:
          '<strong>{author}</strong> запросил продвижение API <code>{apiName}</code> из окружения <strong>{sourceEnvironment}</strong> в окружение <strong>{targetEnvironment}</strong>',
      },
      promotionDetails: {
        update: 'Поскольку API уже продвигался в это окружение, принятие запроса обновит существующий API.',
        create: 'Принятие этого продвижения создаст новый API в указанном окружении.',
      },
      rejectDialog: {
        title: 'Отклонить запрос на продвижение',
        content: 'После отклонения этого продвижения вы не сможете принять его, пока автор не создаст новый запрос',
      },
      accepted: 'Продвижение API принято',
      rejected: 'Продвижение API отклонено',
      promoteDialog: {
        title: 'Продвинуть API',
        shardingTags: 'Шардинг-теги',
        shardingTagsBody: 'Шардинг-теги продвижения должны существовать в этом окружении.',
        update:
          'Поскольку API <code>{apiName}</code> уже продвигался в окружение <strong>{environment}</strong>, принятие запроса обновит его.',
        create: 'Принятие этого продвижения создаст новый API в окружении <strong>{environment}</strong>.',
      },
    },

    messages: {
      title: 'Отправить рассылку',
      banner: 'Отправьте одностороннее сообщение выбранным получателям, чтобы сообщить об изменениях или обновлениях.',
      channel: 'Канал',
      channelRequired: 'Укажите канал',
      recipients: 'Получатели',
      recipientsRequired: 'Укажите получателей',
      titleLabel: 'Заголовок',
      titleRequired: 'Укажите заголовок',
      httpHeaders: 'HTTP-заголовки',
      url: 'URL',
      urlRequired: 'Укажите URL',
      useSystemProxy: 'Использовать системный прокси',
      text: 'Текст',
      textRequired: 'Укажите текст',
      send: 'Отправить',
      channels: {
        portal: 'Уведомления портала',
        email: 'Email',
        http: 'HTTP POST-сообщение',
      },
      recipient: {
        apiSubscribers: 'Подписчики API',
        applicationRole: 'Участники с ролью {role} в приложениях, подписанных на этот API',
        environmentRole: 'Участники с ролью {role} в этом окружении',
      },
      success: {
        one: 'Сообщение отправлено {count} получателю',
        many: 'Сообщение отправлено {count} получателям',
      },
      error: 'Не удалось отправить сообщение',
      errorBecause: 'Не удалось отправить сообщение: {reason}',
    },
  },
} as const;

