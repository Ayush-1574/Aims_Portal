import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

export default function RegisterInstructor({ email, onComplete, onBack }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name || !department) {
      setError("All fields are required");
      return;
    }

    // send both role and data correctly for backend signup
    onComplete("instructor", {
      name,
      department,
    });
  };

  return (
    <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-white px-10 box-border">
      <button onClick={onBack} className="mb-6 text-black">← Back</button>

      <h1 className="text-3xl font-semibold mb-4">Instructor Registration</h1>
      <p className="text-gray-600 mb-6">{email}</p>

      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          type="text"
          placeholder="Name"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          placeholder="Department (e.g. CSE)"
          className="border p-2 w-full"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />

        {error && <p className="text-red-600">{error}</p>}

        <Button type="submit" className="w-full bg-black text-white">
          Register
        </Button>
      </form>
    </div>
  );
}
