import { useAuth } from "@/context/AuthContext";

export default function UserDetailsCard() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  const getDetailsByRole = () => {
    switch (user.role) {
      case "student":
        return [
          { label: "Entry No.", value: user.entry_no || "N/A", icon: "🆔" },
          { label: "Department", value: user.department || "N/A", icon: "🏛️" },
          { label: "Year", value: user.year || "N/A", icon: "📅" },
          { label: "Semester", value: user.semester || "N/A", icon: "📚" }
        ];
      case "faculty_advisor":
        return [
          { label: "Department", value: user.advisor_department || "N/A", icon: "🏛️" },
          { label: "Year", value: user.advisor_year || "N/A", icon: "📅" }
        ];
      case "instructor":
        return [
          { label: "Role", value: "Course Instructor", icon: "👨‍🏫" },
          { label: "Status", value: "Active", icon: "✅" }
        ];
      case "admin":
        return [
          { label: "Role", value: "Administrator", icon: "⚙️" },
          { label: "Status", value: "Active", icon: "✅" }
        ];
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case "student":
        return {
          gradient: "from-blue-500 to-blue-600",
          light: "bg-blue-50",
          text: "text-blue-900",
          badge: "bg-blue-100 text-blue-700",
          border: "border-blue-200"
        };
      case "faculty_advisor":
        return {
          gradient: "from-cyan-500 to-cyan-600",
          light: "bg-cyan-50",
          text: "text-cyan-900",
          badge: "bg-cyan-100 text-cyan-700",
          border: "border-cyan-200"
        };
      case "instructor":
        return {
          gradient: "from-purple-500 to-purple-600",
          light: "bg-purple-50",
          text: "text-purple-900",
          badge: "bg-purple-100 text-purple-700",
          border: "border-purple-200"
        };
      case "admin":
        return {
          gradient: "from-emerald-500 to-emerald-600",
          light: "bg-emerald-50",
          text: "text-emerald-900",
          badge: "bg-emerald-100 text-emerald-700",
          border: "border-emerald-200"
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-600",
          light: "bg-gray-50",
          text: "text-gray-900",
          badge: "bg-gray-100 text-gray-700",
          border: "border-gray-200"
        };
    }
  };

  const getRoleLabel = () => {
    const labels = {
      student: "Student",
      faculty_advisor: "Faculty Advisor",
      instructor: "Instructor",
      admin: "Administrator"
    };
    return labels[user.role] || "User";
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case "student":
        return "👨‍🎓";
      case "faculty_advisor":
        return "👨‍🏫";
      case "instructor":
        return "📚";
      case "admin":
        return "⚙️";
      default:
        return "👤";
    }
  };

  const colors = getRoleColor();
  const details = getDetailsByRole();

  return (
    <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl p-8 text-white shadow-lg mb-6 overflow-hidden relative`}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 opacity-10 text-8xl -mt-4 -mr-4">{getRoleIcon()}</div>

      <div className="relative z-10">
        {/* Header section with icon, name, and role badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl filter drop-shadow-lg">{getRoleIcon()}</div>
            <div>
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge} bg-white/20 text-white`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Email section */}
        <div className="mb-6 pb-6 border-b border-white/20">
          <p className="text-sm text-white/80 font-medium">Email</p>
          <p className="text-white/90 break-all">{user.email}</p>
        </div>

        {/* Role-specific details grid */}
        {details.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {details.map((detail, idx) => (
              <div key={idx} className="bg-white/15 hover:bg-white/25 transition-all rounded-xl p-4 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{detail.icon}</span>
                  <p className="text-xs text-white/80 font-semibold uppercase tracking-wide">{detail.label}</p>
                </div>
                <p className="text-lg font-bold text-white">{detail.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
