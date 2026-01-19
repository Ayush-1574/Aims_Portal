const [pendingInstructor, setPendingInstructor] = useState([]);
const [pendingAdvisor, setPendingAdvisor] = useState([]);
const [enrolled, setEnrolled] = useState({});


pendingInstructor = [
  {
    courseId: 1,
    studentId: 101,
    studentName: "Ayush",
    entryNo: "2023CSB018",
    department: "CSE"
  }
];

pendingAdvisor = [
  {
    courseId: 1,
    studentId: 101,
    studentName: "Ayush",
    entryNo: "2023CSB018",
    department: "CSE"
  }
];

enrolled = {
  1: [
    { studentId: 101, ... }
  ]
}
