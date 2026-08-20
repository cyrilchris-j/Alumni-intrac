import { useState } from 'react';
import { Building2, Shield, Lock, Bell, Save, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminSettings = () => {
  const [collegeName, setCollegeName] = useState('PSG College of Technology');
  const [adminEmail, setAdminEmail] = useState('admin@psgtech.edu');
  const [supportPhone, setSupportPhone] = useState('+91 422 2572177');
  const [domainRestriction, setDomainRestriction] = useState('@psgtech.edu');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">College Administration Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Configure institutional details, verification policies, and portal branding.
        </p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={18} />
          <span>College portal settings saved successfully!</span>
        </div>
      )}

      <div className="w-full space-y-4">
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-border p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-text-primary">Institution Profile</h2>
              <p className="text-xs text-text-secondary">College information displayed across the platform</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <Input
              label="College Name"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Admin Contact Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <Input
                label="Support Helpline"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
              />
            </div>
            <Input
              label="Official Domain Whitelist"
              placeholder="e.g. @college.edu"
              value={domainRestriction}
              onChange={(e) => setDomainRestriction(e.target.value)}
              hint="Students signing up with this email suffix can be automatically pre-verified."
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" leftIcon={Save}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
