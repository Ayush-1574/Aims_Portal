import RegisterStudentForm from "./RegisterStudent";
import RegisterInstructorForm from "./RegisterInstructor";

export default function Register({ email, roleHint, onComplete, onBack }) {

  // frontend role resolution based on backend hint
  const role = roleHint || "student";

  const handleSubmit = (data) => {
    // pass role + form data up to AuthPage
    onComplete(role, data);
  };

  if (role === "student") {
    return (
      <RegisterStudentForm
        email={email}
        onComplete={handleSubmit}
        onBack={onBack}
      />
    );
  }

  return (
    <RegisterInstructorForm
      email={email}
      onComplete={handleSubmit}
      onBack={onBack}
    />
  );
}
