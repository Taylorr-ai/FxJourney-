// Public browser configuration. The Supabase publishable key is designed for client use;
// never put a service-role key in this file.
const SUPABASE_URL = 'https://meonvcedvvedvnvyhtzv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_iuLNzl7IlX11NZi-0XbmYg_VtE0pZAK';

(() => {
  const authView = document.querySelector('#authView');
  const signedInView = document.querySelector('#signedInView');
  const message = document.querySelector('#message');
  const form = document.querySelector('#authForm');
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');
  const submitButton = document.querySelector('#submitButton');
  const resetButton = document.querySelector('#resetButton');
  const loginTab = document.querySelector('#loginTab');
  const signupTab = document.querySelector('#signupTab');
  const clientFactory = window.supabase?.createClient;

  if (!clientFactory) {
    message.textContent = 'Could not load the authentication client. Check your connection and reload.';
    message.classList.add('error');
    return;
  }

  const client = clientFactory(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  let mode = 'login';

  function setMessage(text, kind = '') {
    message.textContent = text;
    message.className = `message${kind ? ` ${kind}` : ''}`;
  }

  function setMode(nextMode) {
    mode = nextMode;
    const signup = mode === 'signup';
    loginTab.setAttribute('aria-selected', String(!signup));
    signupTab.setAttribute('aria-selected', String(signup));
    submitButton.textContent = signup ? 'Create account' : 'Sign in';
    passwordInput.autocomplete = signup ? 'new-password' : 'current-password';
    resetButton.classList.toggle('hidden', signup);
    setMessage('');
  }

  function showSignedIn(email) {
    authView.classList.add('hidden');
    signedInView.classList.remove('hidden');
    document.querySelector('#signedInMessage').textContent = `Signed in as ${email || 'your account'}.`;
  }

  loginTab.addEventListener('click', () => setMode('login'));
  signupTab.addEventListener('click', () => setMode('signup'));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (password.length < 8) {
      setMessage('Your password must be at least 8 characters long.', 'error');
      passwordInput.focus();
      return;
    }

    submitButton.disabled = true;
    setMessage(mode === 'signup' ? 'Creating your account…' : 'Signing in…');
    try {
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) showSignedIn(data.user?.email);
        else setMessage('Account created. Check your email to confirm your address, then sign in.', 'success');
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showSignedIn(data.user?.email);
      }
    } catch (error) {
      setMessage(error?.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  resetButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
      setMessage('Enter your email address first, then choose Forgot password.', 'error');
      emailInput.focus();
      return;
    }
    resetButton.disabled = true;
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`
      });
      if (error) throw error;
      setMessage('If an account exists for that address, a password reset email has been sent.', 'success');
    } catch (error) {
      setMessage(error?.message || 'Could not request a password reset.', 'error');
    } finally {
      resetButton.disabled = false;
    }
  });

  document.querySelector('#signOutButton').addEventListener('click', async () => {
    const { error } = await client.auth.signOut();
    if (error) setMessage(error.message, 'error');
    signedInView.classList.add('hidden');
    authView.classList.remove('hidden');
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) setMessage(error.message, 'error');
    if (data.session) showSignedIn(data.session.user.email);
  });
})();
