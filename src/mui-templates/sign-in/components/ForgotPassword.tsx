import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement).value;

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        {success ? (
          <Alert severity="success">
            Password reset email sent! Check your inbox.
          </Alert>
        ) : (
          <>
            <DialogContentText>
              Enter your account&apos;s email address, and we&apos;ll send you a link to
              reset your password.
            </DialogContentText>
            {error && <Alert severity="error">{error}</Alert>}
            <OutlinedInput
              autoFocus
              required
              margin="dense"
              id="email"
              name="email"
              label="Email address"
              placeholder="Email address"
              type="email"
              fullWidth
              disabled={loading}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleDialogClose} disabled={loading}>{success ? 'Close' : 'Cancel'}</Button>
        {!success && (
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Continue'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}