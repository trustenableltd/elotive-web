import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password, isRegister = false) => {
  if (isRegister) {
    // Registration: min 6 chars
    return password.length >= 6;
  }
  // Login: just needs to not be empty
  return password.length > 0;
};

const getPasswordValidationError = (password) => {
  if (password.length === 0) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const EmailAuthDialog = ({ open, onOpenChange, onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Validate email
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }
    if (mode === 'register' && !validatePassword(password, true)) {
      setValidationError(getPasswordValidationError(password));
      return;
    }

    // Validate name for registration
    if (mode === 'register' && !name.trim()) {
      setValidationError('Name is required');
      return;
    }

    // All validations passed, submit
    onSubmit({ email: email.trim(), password, name: name.trim(), mode });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setValidationError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {mode === 'login' ? 'Sign in with Email' : 'Register with Email'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'login'
            ? 'Enter your email and password to sign in.'
            : 'Create an account to get started.'}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <Input
                placeholder="Full Name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setValidationError('');
                }}
                required
                disabled={loading}
              />
            </div>
          )}
          <div>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setValidationError('');
              }}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder={mode === 'register' ? 'Password (min. 6 characters)' : 'Password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setValidationError('');
              }}
              required
              disabled={loading}
            />
            {mode === 'register' && password?.length > 0 && password.length < 6 && (
              <p className="text-xs text-amber-600 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>
          
          {(validationError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">
                {validationError || error}
              </p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !email || !password || (mode === 'register' && !name)}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>
        <div className="text-xs text-center mt-4 border-t pt-4">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button 
                type="button" 
                className="text-primary font-semibold hover:underline" 
                onClick={() => handleModeChange('register')}
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                type="button" 
                className="text-primary font-semibold hover:underline" 
                onClick={() => handleModeChange('login')}
              >
                Sign in instead
              </button>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
