import { useState } from 'react';
import { Lock, Bell, Shield, UserX, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { resetPassword } from '../../firebase/auth';

const StudentSettings = () => {
  const { currentUser } = useAuth();
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [msgNotifs, setMsgNotifs] = useState(true);

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setLoadingReset(true);
    try {
      await resetPassword(currentUser.email);
      setPasswordResetSent(true);
    } catch (e) {
      alert(e.message || 'Failed to send password reset email.');
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">Account Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your password, security, and notification preferences.
        </p>
      </div>

      <div className="w-full space-y-4">
        {/* Security & Password */}
        <div className="bg-white rounded-xl border border-border p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-text-primary">Password & Authentication</h2>
              <p className="text-xs text-text-secondary">Manage your password recovery options</p>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-sm text-text-secondary mb-3 leading-relaxed">
              We can send a secure password reset link to your registered email: <strong>{currentUser?.email}</strong>
            </p>

            {passwordResetSent ? (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
                <CheckCircle size={18} />
                <span>Password reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                loading={loadingReset}
                onClick={handlePasswordReset}
              >
                Send Password Reset Email
              </Button>
            )}
          </div>
        </div>

        {/* Notifications Preferences */}
        <div className="bg-white rounded-xl border border-border p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-text-primary">Notification Preferences</h2>
              <p className="text-xs text-text-secondary">Control which alerts and updates you receive</p>
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <p className="text-sm font-medium text-text-primary">Email Notifications</p>
                <p className="text-xs text-text-secondary">Receive daily digests of new opportunities and connection updates</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <p className="text-sm font-medium text-text-primary">Direct Message Alerts</p>
                <p className="text-xs text-text-secondary">Get notified when alumni send you a message or accept mentorship</p>
              </div>
              <input
                type="checkbox"
                checked={msgNotifs}
                onChange={(e) => setMsgNotifs(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;
