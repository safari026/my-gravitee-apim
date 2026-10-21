export const ruTasks = {
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
} as const;
