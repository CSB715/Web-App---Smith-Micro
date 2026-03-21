import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import ForgotPassword from './components/ForgotPassword';
import AppTheme from '../shared-theme/AppTheme';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthInstance, getDb } from '../../utils/firestore';
import { useNavigate } from 'react-router';
import {
  doc,
  getDoc,
  type DocumentData,
} from "firebase/firestore";

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // this stops the reload

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    signInWithEmailAndPassword(getAuthInstance(), email?.toString()!, password?.toString()!).then(() => {
      //get the user document from firebase and check if they are an admin, if so navigate to the admin dashboard, otherwise navigate to the main page
      const db = getDb();
      const auth = getAuthInstance();

      const userDocRef = doc(db, "Users", auth.currentUser!.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as DocumentData;
          if (userData.isAdmin) {
            console.log("user is an admin");
            navigate("/admin-dashboard", {replace: true}); // navigate to admin dashboard if user is an admin
          }
        }
      
      }).catch((error) => {
        console.error("Error fetching user data: ", error);
        navigate("/");
      });

      navigate("/"); // navigate to main page after sign in
    });
  }

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Typography
          component="h1"
          variant="h1" 
          id="Sign-In-title" 
          sx={{ 
            fontSize: "2rem",
            letterSpacing: "-0.02em",
            mb: 2,
            fontWeight: "bold",
            color: "#01579b",
            alignSelf: "center",
            textAlign: "center",
          }}
        >
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <ForgotPassword open={open} handleClose={handleClose}/>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Sign in
          </Button>
          <Link
            component="button"
            type="button"
            onClick={handleClickOpen}
            variant="body2"
            sx={{ alignSelf: 'center' }}
          >
            Forgot your password?
          </Link>
        </Box>
        <Divider>or</Divider>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up/"
              variant="body2"
              sx={{ alignSelf: 'center', fontStyle: 'italic' }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </SignInContainer>
    </AppTheme>
  );
}

