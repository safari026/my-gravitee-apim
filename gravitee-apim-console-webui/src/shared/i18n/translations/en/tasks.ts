export const enTasks = {
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
} as const;
