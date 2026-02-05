'use client';

import { useState, useEffect } from 'react';

interface SettingsData {
  freeTrialsEnabled: boolean;
  pricing: {
    sixMonths: number;
    twelveMonths: number;
  };
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!settings) {
    return <div className="text-red-400">Failed to load settings</div>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-white mb-8">System Settings</h2>

      <div className="space-y-8">
        {/* Free Trials Setting */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Free Trials</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.freeTrialsEnabled}
              onChange={(e) =>
                setSettings({ ...settings, freeTrialsEnabled: e.target.checked })
              }
              className="w-6 h-6 cursor-pointer"
            />
            <span className="text-white">Enable free trials for new users</span>
          </label>
          <p className="text-slate-400 text-sm mt-2">
            When enabled, new users will receive 5 free trials automatically.
          </p>
        </div>

        {/* Pricing Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Pricing Plans</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">6-Month Plan Price (₹)</label>
              <input
                type="number"
                value={settings.pricing.sixMonths / 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      sixMonths: parseFloat(e.target.value) * 100,
                    },
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-white mb-2">12-Month Plan Price (₹)</label>
              <input
                type="number"
                value={settings.pricing.twelveMonths / 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricing: {
                      ...settings.pricing,
                      twelveMonths: parseFloat(e.target.value) * 100,
                    },
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveSettings}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg transition font-semibold"
          >
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center text-green-400">
              <span>✓ Settings saved successfully</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
