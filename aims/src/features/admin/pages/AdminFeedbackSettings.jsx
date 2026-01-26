import { useEffect, useState } from "react";
import {
  getFeedbackStatus,
  setFeedbackStatus,
  getFeedbackSession,
  setFeedbackSession,
  fetchGlobalData
} from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Power, Calendar, Save, Loader2, AlertCircle } from "lucide-react";

export default function AdminFeedbackSettings() {
  const [active, setActive] = useState(false);
  const [session, setSession] = useState("");
  const [availableSessions, setAvailableSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* -------- Load Data -------- */
  const loadData = async () => {
    try {
      const [statusRes, sessionRes, globalSessions] = await Promise.all([
        getFeedbackStatus(),
        getFeedbackSession(),
        fetchGlobalData("SESSION").catch(() => ({ items: [] }))
      ]);

      setActive(statusRes.active);
      setSession(sessionRes.session || "");
      
      const dbSessions = globalSessions.items?.map(s => s.value) || [];
      setAvailableSessions(dbSessions.length > 0 ? dbSessions : ["2026-I", "2025-II", "2025-I"]);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* -------- Save Settings -------- */
  const saveSettings = async () => {
    if (active && !session) {
      toast.error("Please select a session before enabling feedback.");
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        setFeedbackStatus(active),
        setFeedbackSession(session)
      ]);
      toast.success("System settings updated successfully");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback Configuration</h1>
          <p className="text-slate-500">Manage global feedback access and target academic sessions.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-lg overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-6">
          <CardTitle className="text-lg font-bold text-slate-800">System Controls</CardTitle>
          <CardDescription>Configure the availability of the student feedback portal.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          
          {/* 1. STATUS CARD */}
          <div className={`
            relative overflow-hidden rounded-2xl border transition-all duration-300
            ${active 
                ? "bg-emerald-50/50 border-emerald-200" 
                : "bg-slate-50 border-slate-200"
            }
          `}>
             <div className="p-5 flex items-center justify-between">
                <div className="flex items-start gap-4">
                   <div className={`p-3 rounded-full ${active ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                      <Power size={24} />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900 text-lg">Feedback Portal</h3>
                      <p className="text-sm text-slate-500 mt-1 max-w-[280px]">
                        {active 
                          ? "Portal is currently LIVE. Students can submit forms." 
                          : "Portal is CLOSED. Students cannot access forms."}
                      </p>
                   </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                   <Badge 
                      variant={active ? "default" : "secondary"} 
                      className={`uppercase tracking-wider font-bold px-3 py-1 ${active ? "bg-emerald-600" : "bg-slate-400 text-white"}`}
                   >
                      {active ? "Active" : "Disabled"}
                   </Badge>
                   
                   {/* FIXED TOGGLE BUTTON */}
                   <Switch
                      checked={active}
                      onCheckedChange={setActive}
                      className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-200 h-[24px] w-[44px] cursor-pointer transition-colors ease-in-out duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 mr-1"
                    />
                </div>
             </div>
             
             {/* Progress bar effect at bottom */}
             {active && <div className="h-1.5 w-full bg-emerald-500/20"><div className="h-full bg-emerald-500 w-full animate-pulse"></div></div>}
          </div>

          <div className="h-px bg-slate-100" />

          {/* 2. Session Selector */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-slate-400"/> Target Session
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-2">
                  <Select value={session} onValueChange={setSession} disabled={!active && !session}>
                    <SelectTrigger className="h-11 border-slate-200 bg-white">
                      <SelectValue placeholder="Select Academic Session" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSessions.map((s) => (
                        <SelectItem key={s} value={s} className="font-medium">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="flex gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-slate-600">
              <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p>Ensuring the correct session prevents students from submitting feedback for outdated or future courses.</p>
            </div>
          </div>

        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium">
            Changes require saving to take effect.
          </span>
          <Button 
            onClick={saveSettings} 
            disabled={saving} 
            className="bg-slate-900 hover:bg-slate-800 text-white gap-2 pl-4 pr-5 shadow-md transition-all active:scale-95"
            size="lg"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving Changes..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}