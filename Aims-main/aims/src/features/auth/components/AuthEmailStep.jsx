import { useState } from "react";
import { LogIn, Mail, ArrowRight } from "lucide-react";
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
    <Card className="border-white/40 shadow-2xl backdrop-blur-xl bg-white/80">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
          <LogIn size={32} />
        </div>
        <CardTitle className="text-3xl font-bold text-slate-800">
          Welcome Back
        </CardTitle>
        <p className="text-slate-500 mt-2 text-sm">
          Enter your institutional email to access the AIMS Portal.
        </p>
      </CardHeader>

      <CardContent className="p-8 pt-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-3 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-600">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <Input 
                type="email" 
                placeholder="e.g. student@university.edu" 
                className="pl-10 h-12 bg-slate-50 border-slate-200" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-base" 
            isLoading={loading}
          >
            Continue <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}