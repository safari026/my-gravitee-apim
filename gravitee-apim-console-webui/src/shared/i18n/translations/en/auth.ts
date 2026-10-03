export const enAuth = {
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
} as const;
