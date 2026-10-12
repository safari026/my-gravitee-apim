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
      noMethod: 'No login method available. Please contact your administrator.',
      failed: 'Login failed! Check username and password.',
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

  confirmPassword: 'Confirm password',
  confirmPasswordRequired: 'Confirm password is required.',
  passwordNotMatch: 'Password and confirm password must be the same.',
  contactAdmin: 'Contact your administrator if the problem persists.',
  token: {
    invalid: 'Invalid registration token!',
    expired: 'Your registration token has expired!',
  },

  signUpConfirm: {
    title: 'Confirm your account',
    success: 'Account confirmed',
    accountConfirmed: 'Your account has been confirmed.',
    confirmError: 'An error occurred while confirming your account.',
  },

  resetPassword: {
    title: 'Reset password',
    submit: 'Reset password',
    success: 'Password successfully reset.',
    passwordReset: 'Your password has been reset.',
    resetError: 'An error occurred while resetting your password.',
  },
} as const;
