import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Link2, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '../../firebase/auth';
import { formatFirebaseError } from '../../utils/formatters';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Link2 size={20} className="text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-text-primary">AlumLink</span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Reset your password</h1>
          <p className="text-text-secondary mt-1 text-sm">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Check your email</h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn-primary btn-md inline-flex items-center gap-2 rounded-lg">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@college.edu"
                  leftIcon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
