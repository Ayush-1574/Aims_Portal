import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

export default function RegisterStudent({ email, onComplete, onBack }) {
  const [name, setName] = useState("");
  const [entryNo, setEntryNo] = useState("");
  const [gender, setGender] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name || !entryNo || !gender || !department) {
      setError("All fields are required");
      return;
    }

    // Pass structured data upward to AuthPage
    onComplete("student", {
      name,
      entryNo,
      gender,
      department,
    });
  };

  return (
    <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-white px-10 box-border">
      <button onClick={onBack} className="mb-6 text-black">← Back</button>

      <h1 className="text-3xl font-semibold mb-4">Student Registration</h1>
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
          placeholder="Entry Number"
          className="border p-2 w-full"
          value={entryNo}
          onChange={(e) => setEntryNo(e.target.value)}
          required
        />

        <select
          className="border p-2 w-full"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="" disabled>Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

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
