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
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      close: 'Close',

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
    },
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      close: 'Закрыть',

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
    },
  },
} as const;
