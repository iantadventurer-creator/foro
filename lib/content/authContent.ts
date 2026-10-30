// Textos de las pantallas de acceso: iniciar sesión y registrarse.

export const authContent = {
  es: {
    back: '← Volver a la comunidad',
    email: 'Correo electrónico',
    password: 'Contraseña',
    login: {
      tagline: 'Inicia sesión para publicar tus fotos LEGO y dar me gusta.',
      submit: 'Iniciar sesión',
      noAccount: '¿No tienes una cuenta?',
      signUp: 'Regístrate',
    },
    signup: {
      tagline: 'Regístrate para publicar tus fotos LEGO y ver las de otros fans.',
      fullName: 'Nombre completo',
      username: 'Nombre de usuario',
      usernameInvalid: 'Usa de 3 a 30 letras minúsculas, números, puntos o guiones bajos.',
      usernameChecking: 'Comprobando…',
      usernameAvailable: 'Nombre de usuario disponible.',
      usernameTaken: 'Ese nombre de usuario ya está en uso.',
      passwordHint: 'Mínimo 6 caracteres.',
      submit: 'Registrarte',
      terms: 'Al registrarte aceptas compartir tus fotos en la comunidad de IanTBuild.',
      hasAccount: '¿Tienes una cuenta?',
      signIn: 'Inicia sesión',
      emailTaken: 'Este correo ya está registrado.',
      doneTitle: '¡Cuenta creada!',
      doneDesc: 'Te enviamos un correo para confirmar tu cuenta. Revísalo y luego inicia sesión.',
      goLogin: 'Ir a iniciar sesión',
    },
  },
  en: {
    back: '← Back to community',
    email: 'Email',
    password: 'Password',
    login: {
      tagline: 'Log in to post your LEGO photos and give likes.',
      submit: 'Log in',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
    },
    signup: {
      tagline: 'Sign up to post your LEGO photos and see other fans’ work.',
      fullName: 'Full name',
      username: 'Username',
      usernameInvalid: 'Use 3 to 30 lowercase letters, numbers, dots or underscores.',
      usernameChecking: 'Checking…',
      usernameAvailable: 'Username available.',
      usernameTaken: 'That username is already taken.',
      passwordHint: 'At least 6 characters.',
      submit: 'Sign up',
      terms: 'By signing up you agree to share your photos in the IanTBuild community.',
      hasAccount: 'Have an account?',
      signIn: 'Log in',
      emailTaken: 'This email is already registered.',
      doneTitle: 'Account created!',
      doneDesc: 'We sent you an email to confirm your account. Check it, then log in.',
      goLogin: 'Go to log in',
    },
  },
};

export type AuthContent = (typeof authContent)['es'];
