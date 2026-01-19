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
    <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-white px-8 md:px-16 lg:px-24 box-border">
      
      {/* Logo */}
      <div className="mb-10 flex justify-start">
        <img
          src="/header-logo.png"
          alt="Logo"
          className="w-16 h-16 object-contain"
        />
      </div>

      <div className="max-w-sm">
        <h1 className="text-4xl font-semibold mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-8">
          Please enter your email to continue
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default EmailInput;
