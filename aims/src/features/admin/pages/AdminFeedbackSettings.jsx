import { useEffect, useState } from "react";
import {
  getFeedbackStatus,
  setFeedbackStatus,
  getFeedbackSession,
  setFeedbackSession
} from "@/features/admin/api.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminFeedbackSettings() {
  const [active, setActive] = useState(false);
  const [session, setSession] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sessions = [
    "2023-24-I",
    "2023-24-II",
    "2024-25-I",
    "2026-I",
    "2025-I"
  ];

  /* -------- Load current settings -------- */
  const loadData = async () => {
    try {
      const statusRes = await getFeedbackStatus();
      const sessionRes = await getFeedbackSession();

      setActive(statusRes.active);
      setSession(sessionRes.session || "");
    } catch {
      toast.error("Failed to load feedback settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------- Save settings -------- */
  const saveSettings = async () => {
    setSaving(true);
    try {
      await setFeedbackStatus(active);
      await setFeedbackSession(session);
      toast.success("Feedback settings updated");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Feedback Settings</h1>
        <p className="text-gray-500">
          Control when and for which session student feedback is enabled.
        </p>
      </div>

      {/* Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Enable Feedback</p>
              <p className="text-sm text-gray-500">
                Students can submit feedback only when enabled
              </p>
            </div>
           <button
  onClick={() => setActive(!active)}
  className="px-4 py-2 border rounded"
>
  {active ? "ON" : "OFF"}
</button>

          </div>

          {/* Session Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Active Feedback Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 px-3"
              disabled={!active}
            >
              <option value="">Select session</option>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Feedback will be collected only for this session
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving || (active && !session)}
              isLoading={saving}
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}