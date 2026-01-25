import { useState } from "react";
import { LogIn, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AuthEmailStep({ onSubmit, loading, error }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) onSubmit(email);
  };

  return (
    // Changed: Removed blurred background and border for a clean look
    <Card className="border-0 shadow-none bg-transparent">
      {/* Header Section */}
      <CardHeader className="text-center pb-6 px-0">
        {/* Changed: Professional blue circle icon instead of gradient box */}
        <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 ring-4 ring-white shadow-sm">
          <LogIn size={24} />
        </div>
        
        <CardTitle className="text-2xl font-bold text-slate-900">
          Welcome Back
        </CardTitle>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Enter your institutional email to access the AIMS Portal.
        </p>
      </CardHeader>

      <CardContent className="px-0">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              {/* Changed: White background with a professional blue focus ring */}
              <Input 
                type="email" 
                placeholder="e.g. student@iitrpr.ac.in" 
                className="pl-10 h-12 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm rounded-lg font-medium" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Changed: Solid slate button, added loading state */}
          <Button 
            type="submit" 
            className="w-full h-12 text-sm font-semibold bg-slate-900 hover:bg-slate-800 shadow-md transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                Continue <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}