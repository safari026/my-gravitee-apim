export const ruAuth = {
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
} as const;
