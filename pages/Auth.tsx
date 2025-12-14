
import React, { useState } from 'react';
import { useAuth } from '../contexts';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';
import { Shield, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  type: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2FA State
  const [requires2fa, setRequires2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (type === 'login') {
        const result = await login(email, password, twoFactorCode);
        if (result && result.requires2fa) {
            setRequires2fa(true);
            setIsLoading(false);
            return; // Stop here, wait for user to enter code
        }
      } else {
        await register(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm transition-colors duration-300"></div>
      
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
           <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-2xl shadow-brand-500/25">
                <Shield size={28} strokeWidth={2.5} />
              </div>
            </Link>
        </div>
        
        <Card className="p-8 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {requires2fa ? 'Two-Factor Authentication' : type === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {requires2fa 
                ? 'Enter the 6-digit code from your authenticator app.'
                : type === 'login' 
                    ? 'Enter your credentials to access your dashboard.' 
                    : 'Start your journey to digital privacy today.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!requires2fa && (
                <>
                    <Input
                    label="Email address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    />
                    
                    <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    {type === 'login' && (
                        <div className="flex justify-end">
                        <a href="#" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300">Forgot password?</a>
                        </div>
                    )}
                    </div>
                </>
            )}

            {requires2fa && (
                <div className="space-y-1">
                     <Input
                        label="Verification Code"
                        type="text"
                        required
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="000 000"
                        className="text-center text-xl tracking-widest"
                        autoFocus
                        maxLength={6}
                    />
                </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              isLoading={isLoading}
            >
              {requires2fa ? 'Verify' : type === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {!requires2fa && (
             <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {type === 'login' ? (
                <>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300">
                    Sign up
                    </Link>
                </>
                ) : (
                <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300">
                    Log in
                    </Link>
                </>
                )}
            </div>
          )}
          
          {type === 'login' && !requires2fa && (
             <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
               <p className="text-xs text-slate-400 dark:text-slate-500">Demo Credentials: any email / "password"</p>
             </div>
          )}
        </Card>
      </div>
    </div>
  );
};
