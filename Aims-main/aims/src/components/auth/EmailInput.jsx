import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

function EmailInput({ email, setEmail, handleSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // extra safety

    setIsSubmitting(true);

    try {
      await handleSubmit(e); // assuming handleSubmit can be async
    } finally {
      setIsSubmitting(false); // re-enable after submit finishes
    }
  };

  return (
    <div className="w-full flex flex-col justify-center bg-white px-8 md:px-16 box-border">
      
      {/* Logo Section */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
          <span className="text-2xl">🎓</span>
        </div>
      </div>

      <div className="max-w-md">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to AIMS</h1>
        <p className="text-gray-600 mb-8 text-base">
          Academic Information Management System. Enter your email to access your portal.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-semibold text-gray-800">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-12 px-4 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Sending OTP...
              </span>
            ) : (
              '📨 Send OTP'
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? Sign up during verification
          </p>
        </form>
      </div>
    </div>
  );
}

export default EmailInput;
