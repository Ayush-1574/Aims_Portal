export default function NotFound({ email, onRegister, onBack }) {
  return (
    <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-white px-10 box-border">

      <h1 className="text-2xl font-semibold mb-4">User Not Found</h1>

      <p className="text-gray-600 mb-6">
        This email <span className="font-medium">{email}</span> is not registered in the portal.
      </p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onRegister}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Register
        </button>

        <button
          onClick={onBack}
          className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

    </div>
  );
}
