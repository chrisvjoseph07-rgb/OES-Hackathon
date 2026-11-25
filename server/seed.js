const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seedData(force = false) {
  const existingUsers = db.find('users');
  if (existingUsers.length > 0 && !force) {
    console.log('Database already contains data. Skipping seed.');
    return;
  }

  console.log('Seeding fresh database with comprehensive demo data...');

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Clear existing
  const store = db.getStore();
  store.users = [];
  store.departments = [];
  store.courses = [];
  store.sections = [];
  store.subjects = [];
  store.exams = [];
  store.questions = [];
  store.attempts = [];
  store.notifications = [];
  store.activityLogs = [];

  // 1. Departments
  const cseDept = db.create('departments', {
    name: 'Computer Science & Engineering',
    code: 'CSE',
    hodName: 'Dr. Alan Turing',
    description: 'Department of Computer Science & Engineering'
  });

  const eceDept = db.create('departments', {
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    hodName: 'Dr. Claude Shannon',
    description: 'Department of Electronics & Communication'
  });

  const meDept = db.create('departments', {
    name: 'Mechanical Engineering',
    code: 'ME',
    hodName: 'Dr. James Watt',
    description: 'Department of Mechanical Engineering'
  });

  // 2. Courses
  const btechCse = db.create('courses', {
    name: 'B.Tech Computer Science',
    code: 'BT-CSE',
    departmentId: cseDept._id,
    departmentName: cseDept.name,
    durationYears: 4,
    totalSemesters: 8
  });

  const btechEce = db.create('courses', {
    name: 'B.Tech Electronics & Communication',
    code: 'BT-ECE',
    departmentId: eceDept._id,
    departmentName: eceDept.name,
    durationYears: 4,
    totalSemesters: 8
  });

  const btechMe = db.create('courses', {
    name: 'B.Tech Mechanical Engineering',
    code: 'BT-ME',
    departmentId: meDept._id,
    departmentName: meDept.name,
    durationYears: 4,
    totalSemesters: 8
  });

  // 3. Sections
  const secCseA = db.create('sections', {
    name: 'CSE-A',
    courseId: btechCse._id,
    courseName: btechCse.name,
    departmentName: cseDept.name,
    year: '2nd Year',
    semester: '4th Semester',
    capacity: 60,
    roomNumber: 'Lab-301'
  });

  const secCseB = db.create('sections', {
    name: 'CSE-B',
    courseId: btechCse._id,
    courseName: btechCse.name,
    departmentName: cseDept.name,
    year: '2nd Year',
    semester: '4th Semester',
    capacity: 60,
    roomNumber: 'Lab-302'
  });

  const secEceA = db.create('sections', {
    name: 'ECE-A',
    courseId: btechEce._id,
    courseName: btechEce.name,
    departmentName: eceDept.name,
    year: '2nd Year',
    semester: '4th Semester',
    capacity: 60,
    roomNumber: 'Hall-201'
  });

  const secMeA = db.create('sections', {
    name: 'ME-A',
    courseId: btechMe._id,
    courseName: btechMe.name,
    departmentName: meDept.name,
    year: '2nd Year',
    semester: '4th Semester',
    capacity: 60,
    roomNumber: 'Workshop-1'
  });

  // 4. Subjects
  const subOS = db.create('subjects', {
    name: 'Operating Systems',
    code: 'CS401',
    departmentName: cseDept.name,
    credits: 4
  });

  const subDSA = db.create('subjects', {
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    departmentName: cseDept.name,
    credits: 4
  });

  const subDBMS = db.create('subjects', {
    name: 'Database Management Systems',
    code: 'CS402',
    departmentName: cseDept.name,
    credits: 3
  });

  const subCN = db.create('subjects', {
    name: 'Computer Networks',
    code: 'CS403',
    departmentName: cseDept.name,
    credits: 4
  });

  const subDE = db.create('subjects', {
    name: 'Digital Electronics',
    code: 'EC401',
    departmentName: eceDept.name,
    credits: 3
  });

  const subThermo = db.create('subjects', {
    name: 'Thermodynamics',
    code: 'ME401',
    departmentName: meDept.name,
    credits: 4
  });

  // 5. Users: Admin
  const adminUser = db.create('users', {
    fullName: 'Chief Administrator',
    email: 'admin@examora.com',
    password: hashedPassword,
    role: 'admin',
    phone: '+1 555-0100',
    department: 'Administration',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  // 6. Users: Faculty (5 members)
  const faculty1 = db.create('users', {
    fullName: 'Dr. Sarah Jenkins',
    email: 'faculty@examora.com',
    password: hashedPassword,
    role: 'faculty',
    phone: '+1 555-0201',
    facultyId: 'FAC-1001',
    department: cseDept.name,
    designation: 'Associate Professor',
    assignedSubjects: [subOS.name, subCN.name],
    assignedSections: ['CSE-A', 'CSE-B'],
    assignedCourses: [btechCse.name],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  });

  const faculty2 = db.create('users', {
    fullName: 'Prof. Robert Chen',
    email: 'chen@examora.com',
    password: hashedPassword,
    role: 'faculty',
    phone: '+1 555-0202',
    facultyId: 'FAC-1002',
    department: cseDept.name,
    designation: 'Assistant Professor',
    assignedSubjects: [subDSA.name, subDBMS.name],
    assignedSections: ['CSE-A', 'CSE-B'],
    assignedCourses: [btechCse.name],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  });

  const faculty3 = db.create('users', {
    fullName: 'Dr. Anita Sharma',
    email: 'sharma@examora.com',
    password: hashedPassword,
    role: 'faculty',
    phone: '+1 555-0203',
    facultyId: 'FAC-1003',
    department: eceDept.name,
    designation: 'Professor',
    assignedSubjects: [subDE.name],
    assignedSections: ['ECE-A'],
    assignedCourses: [btechEce.name],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  });

  const faculty4 = db.create('users', {
    fullName: 'Prof. David Miller',
    email: 'miller@examora.com',
    password: hashedPassword,
    role: 'faculty',
    phone: '+1 555-0204',
    facultyId: 'FAC-1004',
    department: meDept.name,
    designation: 'Assistant Professor',
    assignedSubjects: [subThermo.name],
    assignedSections: ['ME-A'],
    assignedCourses: [btechMe.name],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  });

  const faculty5 = db.create('users', {
    fullName: 'Dr. Priya Patel',
    email: 'patel@examora.com',
    password: hashedPassword,
    role: 'faculty',
    phone: '+1 555-0205',
    facultyId: 'FAC-1005',
    department: cseDept.name,
    designation: 'Associate Professor',
    assignedSubjects: [subDBMS.name],
    assignedSections: ['CSE-A'],
    assignedCourses: [btechCse.name],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  });

  // 7. Users: Students (32 students)
  const studentNames = [
    { name: 'Alex Morgan', email: 'student@examora.com', roll: 'CS202401', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Sophia Hayes', email: 'sophia.h@examora.com', roll: 'CS202402', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Liam Davies', email: 'liam.d@examora.com', roll: 'CS202403', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Emma Wilson', email: 'emma.w@examora.com', roll: 'CS202404', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Noah Taylor', email: 'noah.t@examora.com', roll: 'CS202405', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Olivia Martinez', email: 'olivia.m@examora.com', roll: 'CS202406', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Ethan Thomas', email: 'ethan.t@examora.com', roll: 'CS202407', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Ava Jackson', email: 'ava.j@examora.com', roll: 'CS202408', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Lucas White', email: 'lucas.w@examora.com', roll: 'CS202409', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },
    { name: 'Mia Harris', email: 'mia.h@examora.com', roll: 'CS202410', sec: 'CSE-A', dept: cseDept.name, course: btechCse.name },

    { name: 'Benjamin Clark', email: 'ben.c@examora.com', roll: 'CS202411', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },
    { name: 'Charlotte Lewis', email: 'charlotte.l@examora.com', roll: 'CS202412', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },
    { name: 'Elijah Robinson', email: 'elijah.r@examora.com', roll: 'CS202413', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },
    { name: 'Amelia Walker', email: 'amelia.w@examora.com', roll: 'CS202414', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },
    { name: 'James Perez', email: 'james.p@examora.com', roll: 'CS202415', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },
    { name: 'Harper Hall', email: 'harper.h@examora.com', roll: 'CS202416', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },
    { name: 'Alexander Young', email: 'alex.y@examora.com', roll: 'CS202417', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },
    { name: 'Evelyn Allen', email: 'evelyn.a@examora.com', roll: 'CS202418', sec: 'CSE-B', dept: cseDept.name, course: btechCse.name },

    { name: 'Henry Sanchez', email: 'henry.s@examora.com', roll: 'EC202401', sec: 'ECE-A', dept: eceDept.name, course: btechEce.name },
    { name: 'Abigail Wright', email: 'abigail.w@examora.com', roll: 'EC202402', sec: 'ECE-A', dept: eceDept.name, course: btechEce.name },
    { name: 'Sebastian King', email: 'seb.k@examora.com', roll: 'EC202403', sec: 'ECE-A', dept: eceDept.name, course: btechEce.name },
    { name: 'Emily Scott', email: 'emily.s@examora.com', roll: 'EC202404', sec: 'ECE-A', dept: eceDept.name, course: btechEce.name },
    { name: 'Jack Green', email: 'jack.g@examora.com', roll: 'EC202405', sec: 'ECE-A', dept: eceDept.name, course: btechEce.name },
    { name: 'Ella Adams', email: 'ella.a@examora.com', roll: 'EC202406', sec: 'ECE-A', dept: eceDept.name, course: btechEce.name },
    { name: 'Daniel Baker', email: 'daniel.b@examora.com', roll: 'EC202407', sec: 'ECE-A', dept: eceDept.name, course: btechEce.name },

    { name: 'Samuel Nelson', email: 'sam.n@examora.com', roll: 'ME202401', sec: 'ME-A', dept: meDept.name, course: btechMe.name },
    { name: 'Chloe Carter', email: 'chloe.c@examora.com', roll: 'ME202402', sec: 'ME-A', dept: meDept.name, course: btechMe.name },
    { name: 'Matthew Mitchell', email: 'matt.m@examora.com', roll: 'ME202403', sec: 'ME-A', dept: meDept.name, course: btechMe.name },
    { name: 'Scarlett Roberts', email: 'scarlett.r@examora.com', roll: 'ME202404', sec: 'ME-A', dept: meDept.name, course: btechMe.name },
    { name: 'David Turner', email: 'david.t@examora.com', roll: 'ME202405', sec: 'ME-A', dept: meDept.name, course: btechMe.name },
    { name: 'Grace Phillips', email: 'grace.p@examora.com', roll: 'ME202406', sec: 'ME-A', dept: meDept.name, course: btechMe.name },
    { name: 'Joseph Campbell', email: 'joseph.c@examora.com', roll: 'ME202407', sec: 'ME-A', dept: meDept.name, course: btechMe.name }
  ];

  const createdStudents = [];
  for (const s of studentNames) {
    const student = db.create('users', {
      fullName: s.name,
      email: s.email,
      password: hashedPassword,
      role: 'student',
      phone: `+1 555-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: s.roll,
      rollNumber: s.roll,
      department: s.dept,
      course: s.course,
      year: '2nd Year',
      semester: '4th Semester',
      section: s.sec,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.roll}`
    });
    createdStudents.push(student);
  }

  // 8. Questions (52 Questions across subjects)
  const questionsData = [
    // Operating Systems questions (10 questions)
    {
      subject: subOS.name,
      topic: 'Process Management',
      difficulty: 'Easy',
      type: 'mcq',
      marks: 2,
      questionText: 'What is the primary role of an operating system kernel?',
      options: [
        { id: 'opt_1', text: 'To act as the core interface between hardware and software processes' },
        { id: 'opt_2', text: 'To compile high-level programming code into assembly' },
        { id: 'opt_3', text: 'To provide a visual graphic user interface directly' },
        { id: 'opt_4', text: 'To encrypt hard disk drives by default' }
      ],
      correctAnswer: 'opt_1',
      explanation: 'The kernel is the core component of an OS that manages system resources and communications between hardware and software components.',
      negativeMarks: 0.5
    },
    {
      subject: subOS.name,
      topic: 'CPU Scheduling',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'Which CPU scheduling algorithm may lead to starvation of processes with longer burst times?',
      options: [
        { id: 'opt_1', text: 'Round Robin (RR)' },
        { id: 'opt_2', text: 'Shortest Job Next / SJF' },
        { id: 'opt_3', text: 'First-Come First-Served (FCFS)' },
        { id: 'opt_4', text: 'Multilevel Feedback Queue' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'Shortest Job First (SJF) can cause starvation if short processes keep arriving, delaying long processes indefinitely.',
      negativeMarks: 0.5
    },
    {
      subject: subOS.name,
      topic: 'Deadlocks',
      difficulty: 'Hard',
      type: 'multiple_select',
      marks: 3,
      questionText: 'Which of the following are necessary conditions for a deadlock to occur? (Select all that apply)',
      options: [
        { id: 'opt_1', text: 'Mutual Exclusion' },
        { id: 'opt_2', text: 'Hold and Wait' },
        { id: 'opt_3', text: 'Preemption Allowed' },
        { id: 'opt_4', text: 'Circular Wait' }
      ],
      correctAnswer: ['opt_1', 'opt_2', 'opt_4'],
      explanation: "Coffman's 4 conditions: Mutual exclusion, Hold & wait, No preemption, and Circular wait.",
      negativeMarks: 0.5
    },
    {
      subject: subOS.name,
      topic: 'Memory Management',
      difficulty: 'Easy',
      type: 'true_false',
      marks: 1,
      questionText: 'Virtual memory allows an execution of processes that may not be completely in physical memory.',
      options: [
        { id: 'opt_1', text: 'True' },
        { id: 'opt_2', text: 'False' }
      ],
      correctAnswer: 'opt_1',
      explanation: 'Virtual memory separates user logical memory from physical memory, enabling execution of partially loaded processes.',
      negativeMarks: 0.25
    },
    {
      subject: subOS.name,
      topic: 'Virtual Memory',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'What is "Belady\'s Anomaly" in operating systems?',
      options: [
        { id: 'opt_1', text: 'CPU utilization decreases when more processes are added' },
        { id: 'opt_2', text: 'Page fault rate increases as number of allocated page frames increases' },
        { id: 'opt_3', text: 'Disk access times double during heavy fragmentation' },
        { id: 'opt_4', text: 'Deadlocks cannot be resolved by terminating a single process' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'Beladys anomaly is the phenomenon in which increasing the number of page frames results in an increase in the number of page faults for certain memory access patterns (commonly in FIFO).',
      negativeMarks: 0.5
    },
    {
      subject: subOS.name,
      topic: 'Inter-process Communication',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'A binary semaphore initialized to 1 can be used to achieve:',
      options: [
        { id: 'opt_1', text: 'Mutual Exclusion in critical section' },
        { id: 'opt_2', text: 'Clock Synchronization' },
        { id: 'opt_3', text: 'Infinite Buffer Sharing' },
        { id: 'opt_4', text: 'Round Robin Balancing' }
      ],
      correctAnswer: 'opt_1',
      explanation: 'A binary semaphore has values 0 or 1 and behaves like a mutex to ensure only one thread or process enters the critical section.',
      negativeMarks: 0.5
    },
    {
      subject: subOS.name,
      topic: 'Process States',
      difficulty: 'Easy',
      type: 'short_answer',
      marks: 2,
      questionText: 'What is the term for a process that has completed execution but still has an entry in the process table?',
      options: [],
      correctAnswer: 'Zombie',
      explanation: 'A zombie process or defunct process is a process that has finished execution via exit() but whose entry remains in the process table to report status to the parent.',
      negativeMarks: 0
    },
    {
      subject: subOS.name,
      topic: 'File Systems',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'In Unix-like systems, which data structure contains metadata about a file except its name and actual content?',
      options: [
        { id: 'opt_1', text: 'Superblock' },
        { id: 'opt_2', text: 'Inode' },
        { id: 'opt_3', text: 'Directory Table' },
        { id: 'opt_4', text: 'Page Table' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'An inode (index node) stores attributes and disk block locations of file system objects.',
      negativeMarks: 0.5
    },
    {
      subject: subOS.name,
      topic: 'Threading',
      difficulty: 'Easy',
      type: 'true_false',
      marks: 1,
      questionText: 'Threads within the same process share the same heap memory and global variables.',
      options: [
        { id: 'opt_1', text: 'True' },
        { id: 'opt_2', text: 'False' }
      ],
      correctAnswer: 'opt_1',
      explanation: 'Threads share the text segment, data segment, and OS resources, but maintain private stacks and program counters.',
      negativeMarks: 0.25
    },
    {
      subject: subOS.name,
      topic: 'Architecture',
      difficulty: 'Hard',
      type: 'descriptive',
      marks: 5,
      questionText: 'Explain the difference between Monolithic Kernels and Microkernels, citing advantages and trade-offs of each architecture.',
      options: [],
      correctAnswer: '',
      explanation: 'Monolithic kernels run all OS services (file system, VFS, drivers, IPC) in kernel space for high performance, whereas microkernels run only essential primitives (IPC, low-level memory, scheduling) in kernel space and move other services to user space for fault tolerance and modularity.',
      negativeMarks: 0
    },

    // Data Structures & Algorithms (10 questions)
    {
      subject: subDSA.name,
      topic: 'Time Complexity',
      difficulty: 'Easy',
      type: 'mcq',
      marks: 2,
      questionText: 'What is the worst-case time complexity of QuickSort?',
      options: [
        { id: 'opt_1', text: 'O(N log N)' },
        { id: 'opt_2', text: 'O(N^2)' },
        { id: 'opt_3', text: 'O(log N)' },
        { id: 'opt_4', text: 'O(N)' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'QuickSort exhibits O(N^2) in the worst case when the chosen pivot is repeatedly the smallest or largest element.',
      negativeMarks: 0.5
    },
    {
      subject: subDSA.name,
      topic: 'Trees',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'In an AVL tree, what is the maximum allowed difference between the heights of left and right subtrees of any node?',
      options: [
        { id: 'opt_1', text: '0' },
        { id: 'opt_2', text: '1' },
        { id: 'opt_3', text: '2' },
        { id: 'opt_4', text: 'log N' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'An AVL tree is a self-balancing BST where the balance factor (height(left) - height(right)) must be in {-1, 0, 1}.',
      negativeMarks: 0.5
    },
    {
      subject: subDSA.name,
      topic: 'Graphs',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'Which algorithm is used to find the shortest path from a single source in a graph with non-negative edge weights?',
      options: [
        { id: 'opt_1', text: 'Kruskal\'s Algorithm' },
        { id: 'opt_2', text: 'Prim\'s Algorithm' },
        { id: 'opt_3', text: 'Dijkstra\'s Algorithm' },
        { id: 'opt_4', text: 'Floyd-Warshall Algorithm' }
      ],
      correctAnswer: 'opt_3',
      explanation: 'Dijkstras algorithm finds shortest paths from a single source vertex to all other vertices in graphs with non-negative edge weights.',
      negativeMarks: 0.5
    },
    {
      subject: subDSA.name,
      topic: 'Stacks & Queues',
      difficulty: 'Easy',
      type: 'true_false',
      marks: 1,
      questionText: 'A Queue follows the Last In First Out (LIFO) principle.',
      options: [
        { id: 'opt_1', text: 'True' },
        { id: 'opt_2', text: 'False' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'A Queue follows First In First Out (FIFO). Stacks follow LIFO.',
      negativeMarks: 0.25
    },
    {
      subject: subDSA.name,
      topic: 'Hashing',
      difficulty: 'Hard',
      type: 'multiple_select',
      marks: 3,
      questionText: 'Which of the following are collision resolution techniques in hash tables?',
      options: [
        { id: 'opt_1', text: 'Separate Chaining' },
        { id: 'opt_2', text: 'Linear Probing' },
        { id: 'opt_3', text: 'Quadratic Probing' },
        { id: 'opt_4', text: 'Huffman Encoding' }
      ],
      correctAnswer: ['opt_1', 'opt_2', 'opt_3'],
      explanation: 'Separate chaining, linear probing, quadratic probing, and double hashing are collision resolution techniques. Huffman is for data compression.',
      negativeMarks: 0.5
    },
    {
      subject: subDSA.name,
      topic: 'Sorting',
      difficulty: 'Easy',
      type: 'short_answer',
      marks: 2,
      questionText: 'Which divide-and-conquer sorting algorithm guarantees O(N log N) time complexity in all cases (worst, average, best)?',
      options: [],
      correctAnswer: 'Merge Sort',
      explanation: 'Merge Sort always takes O(N log N) time because it splits the array in half and takes linear time to merge.',
      negativeMarks: 0
    },

    // Database Management Systems (8 questions)
    {
      subject: subDBMS.name,
      topic: 'ACID Properties',
      difficulty: 'Easy',
      type: 'mcq',
      marks: 2,
      questionText: 'What does the "I" in ACID properties of transactions stand for?',
      options: [
        { id: 'opt_1', text: 'Integrity' },
        { id: 'opt_2', text: 'Isolation' },
        { id: 'opt_3', text: 'Independence' },
        { id: 'opt_4', text: 'Iteration' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
      negativeMarks: 0.5
    },
    {
      subject: subDBMS.name,
      topic: 'Normalization',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'A relation is in 3NF if it is in 2NF and there is no:',
      options: [
        { id: 'opt_1', text: 'Multivalued dependency' },
        { id: 'opt_2', text: 'Transitive dependency of non-prime attributes on candidate keys' },
        { id: 'opt_3', text: 'Partial dependency' },
        { id: 'opt_4', text: 'Join dependency' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'Third Normal Form (3NF) requires 2NF and no transitive dependency where X -> Y and Y -> Z for non-prime attributes.',
      negativeMarks: 0.5
    },
    {
      subject: subDBMS.name,
      topic: 'Indexing',
      difficulty: 'Hard',
      type: 'true_false',
      marks: 1,
      questionText: 'A table in a relational database can have multiple Clustered Indexes.',
      options: [
        { id: 'opt_1', text: 'True' },
        { id: 'opt_2', text: 'False' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'Because a clustered index determines the physical storage order of the rows, there can be only one clustered index per table.',
      negativeMarks: 0.25
    },
    {
      subject: subDBMS.name,
      topic: 'SQL Joins',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'Which SQL JOIN returns all rows from the left table and matched rows from the right table, filling nulls where no match exists?',
      options: [
        { id: 'opt_1', text: 'INNER JOIN' },
        { id: 'opt_2', text: 'LEFT OUTER JOIN' },
        { id: 'opt_3', text: 'RIGHT OUTER JOIN' },
        { id: 'opt_4', text: 'CROSS JOIN' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'LEFT JOIN returns all records from left table and matching rows from right table, defaulting missing values to NULL.',
      negativeMarks: 0.5
    },

    // Computer Networks (8 questions)
    {
      subject: subCN.name,
      topic: 'OSI Model',
      difficulty: 'Easy',
      type: 'mcq',
      marks: 2,
      questionText: 'Which layer of the OSI model is responsible for reliable process-to-process packet delivery and flow control?',
      options: [
        { id: 'opt_1', text: 'Network Layer' },
        { id: 'opt_2', text: 'Transport Layer' },
        { id: 'opt_3', text: 'Data Link Layer' },
        { id: 'opt_4', text: 'Session Layer' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'The Transport layer (Layer 4) provides end-to-end communication services for applications, including connection-oriented data stream support, reliability, flow control, and multiplexing.',
      negativeMarks: 0.5
    },
    {
      subject: subCN.name,
      topic: 'Protocols',
      difficulty: 'Medium',
      type: 'multiple_select',
      marks: 3,
      questionText: 'Which of the following protocols operate over UDP by default?',
      options: [
        { id: 'opt_1', text: 'DNS' },
        { id: 'opt_2', text: 'DHCP' },
        { id: 'opt_3', text: 'HTTP/1.1' },
        { id: 'opt_4', text: 'TFTP' }
      ],
      correctAnswer: ['opt_1', 'opt_2', 'opt_4'],
      explanation: 'DNS queries, DHCP, and TFTP use UDP. HTTP/1.1 runs over TCP.',
      negativeMarks: 0.5
    },
    {
      subject: subCN.name,
      topic: 'IP Addressing',
      difficulty: 'Easy',
      type: 'true_false',
      marks: 1,
      questionText: 'IPv6 addresses are 128 bits in length.',
      options: [
        { id: 'opt_1', text: 'True' },
        { id: 'opt_2', text: 'False' }
      ],
      correctAnswer: 'opt_1',
      explanation: 'IPv6 addresses are 128-bit (16-byte) addresses, written in 8 groups of 4 hexadecimal digits.',
      negativeMarks: 0.25
    },

    // Digital Electronics (6 questions)
    {
      subject: subDE.name,
      topic: 'Logic Gates',
      difficulty: 'Easy',
      type: 'mcq',
      marks: 2,
      questionText: 'Which logic gate produces a HIGH output only when both of its inputs are different?',
      options: [
        { id: 'opt_1', text: 'AND' },
        { id: 'opt_2', text: 'XOR' },
        { id: 'opt_3', text: 'NOR' },
        { id: 'opt_4', text: 'XNOR' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'Exclusive-OR (XOR) gives true output if and only if one input is true and the other false.',
      negativeMarks: 0.5
    },
    {
      subject: subDE.name,
      topic: 'Flip-Flops',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'What is the condition called when J=1 and K=1 in a JK Flip-Flop, causing output toggle at each clock pulse?',
      options: [
        { id: 'opt_1', text: 'Race Around Condition' },
        { id: 'opt_2', text: 'Toggle Mode' },
        { id: 'opt_3', text: 'Hold Mode' },
        { id: 'opt_4', text: 'Reset Mode' }
      ],
      correctAnswer: 'opt_2',
      explanation: 'When both J and K are high, the output toggles with each active clock transition.',
      negativeMarks: 0.5
    },

    // Thermodynamics (6 questions)
    {
      subject: subThermo.name,
      topic: 'Laws of Thermodynamics',
      difficulty: 'Easy',
      type: 'mcq',
      marks: 2,
      questionText: 'Which law of thermodynamics defines the concept of temperature and thermal equilibrium?',
      options: [
        { id: 'opt_1', text: 'Zeroth Law' },
        { id: 'opt_2', text: 'First Law' },
        { id: 'opt_3', text: 'Second Law' },
        { id: 'opt_4', text: 'Third Law' }
      ],
      correctAnswer: 'opt_1',
      explanation: 'The Zeroth law states that if two systems are in thermal equilibrium with a third system, they are in thermal equilibrium with each other, defining temperature.',
      negativeMarks: 0.5
    },
    {
      subject: subThermo.name,
      topic: 'Carnot Cycle',
      difficulty: 'Medium',
      type: 'mcq',
      marks: 2,
      questionText: 'The efficiency of a reversible Carnot engine operating between temperatures Th and Tc is:',
      options: [
        { id: 'opt_1', text: '1 - (Tc / Th)' },
        { id: 'opt_2', text: '1 - (Th / Tc)' },
        { id: 'opt_3', text: 'Tc / Th' },
        { id: 'opt_4', text: '(Th + Tc) / Th' }
      ],
      correctAnswer: 'opt_1',
      explanation: 'Carnot efficiency eta = 1 - Tc / Th, where temperatures are in Kelvin.',
      negativeMarks: 0.5
    }
  ];

  const createdQuestions = [];
  for (const q of questionsData) {
    const question = db.create('questions', {
      ...q,
      createdBy: faculty1._id,
      createdByName: faculty1.fullName
    });
    createdQuestions.push(question);
  }

  // 9. Exams (5 Exams with different states & section assignments)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const startTimePast = new Date(now.getTime() - 2 * 60 * 60 * 1000).toTimeString().substring(0, 5);
  const endTimeFuture = new Date(now.getTime() + 10 * 60 * 60 * 1000).toTimeString().substring(0, 5);

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const osQuestions = createdQuestions.filter(q => q.subject === subOS.name);
  const dsaQuestions = createdQuestions.filter(q => q.subject === subDSA.name);
  const dbmsQuestions = createdQuestions.filter(q => q.subject === subDBMS.name);
  const cnQuestions = createdQuestions.filter(q => q.subject === subCN.name);
  const deQuestions = createdQuestions.filter(q => q.subject === subDE.name);

  // Exam 1: Active Exam for CSE-A (Internal Assessment 1 - Operating Systems)
  const exam1 = db.create('exams', {
    title: 'Internal Assessment 1: Operating Systems',
    description: 'First internal continuous evaluation exam covering Process Management, Deadlocks, Scheduling and Memory Management.',
    department: cseDept.name,
    course: btechCse.name,
    year: '2nd Year',
    semester: '4th Semester',
    subject: subOS.name,
    sections: ['CSE-A'],
    examType: 'Internal Examination',
    examDate: todayStr,
    startTime: startTimePast,
    endTime: endTimeFuture,
    duration: 30, // 30 minutes
    totalMarks: 20,
    passingMarks: 8,
    numberOfQuestions: osQuestions.length,
    questions: osQuestions.map(q => q._id),
    instructions: '1. All objective questions carry negative marks for incorrect answers.\n2. Do not refresh browser or exit full-screen.\n3. The exam will automatically submit when time expires.\n4. Ensure you click Submit Exam before time runs out.',
    negativeMarking: true,
    negativeMarksPerWrongAnswer: 0.5,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowReview: true,
    allowBackNavigation: true,
    resultVisibility: true,
    status: 'Active',
    createdBy: faculty1._id,
    createdByName: faculty1.fullName,
    enrolledStudentsCount: createdStudents.filter(s => s.section === 'CSE-A').length
  });

  // Exam 2: Scheduled / Upcoming Exam (Mid-Term Examination - Data Structures)
  const exam2 = db.create('exams', {
    title: 'Mid-Term Examination: Data Structures & Algorithms',
    description: 'Comprehensive mid-term examination covering Trees, Graphs, Sorting algorithms, Complexity analysis.',
    department: cseDept.name,
    course: btechCse.name,
    year: '2nd Year',
    semester: '4th Semester',
    subject: subDSA.name,
    sections: ['CSE-A', 'CSE-B'],
    examType: 'Mid-Term Examination',
    examDate: tomorrowStr,
    startTime: '10:00',
    endTime: '12:00',
    duration: 60,
    totalMarks: 50,
    passingMarks: 20,
    numberOfQuestions: dsaQuestions.length,
    questions: dsaQuestions.map(q => q._id),
    instructions: '1. Calculators are strictly prohibited.\n2. Attempt all mandatory sections.',
    negativeMarking: false,
    negativeMarksPerWrongAnswer: 0,
    shuffleQuestions: false,
    shuffleOptions: false,
    allowReview: true,
    allowBackNavigation: true,
    resultVisibility: false,
    status: 'Scheduled',
    createdBy: faculty2._id,
    createdByName: faculty2.fullName,
    enrolledStudentsCount: createdStudents.filter(s => ['CSE-A', 'CSE-B'].includes(s.section)).length
  });

  // Exam 3: Completed Exam (Quiz 1 - Database Systems) with published results!
  const exam3 = db.create('exams', {
    title: 'Quiz 1: Database Management Systems',
    description: 'Weekly assessment quiz covering relational models, ACID properties and Normalization.',
    department: cseDept.name,
    course: btechCse.name,
    year: '2nd Year',
    semester: '4th Semester',
    subject: subDBMS.name,
    sections: ['CSE-A'],
    examType: 'Quiz',
    examDate: '2026-11-20',
    startTime: '14:00',
    endTime: '15:00',
    duration: 20,
    totalMarks: 10,
    passingMarks: 4,
    numberOfQuestions: dbmsQuestions.length,
    questions: dbmsQuestions.map(q => q._id),
    instructions: 'Timed quiz for DBMS concept check.',
    negativeMarking: true,
    negativeMarksPerWrongAnswer: 0.5,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowReview: true,
    allowBackNavigation: true,
    resultVisibility: true,
    status: 'Completed',
    createdBy: faculty2._id,
    createdByName: faculty2.fullName,
    enrolledStudentsCount: 10
  });

  // Exam 4: Active Practice Test (Computer Networks)
  const exam4 = db.create('exams', {
    title: 'Practice Test: Computer Networks Fundamentals',
    description: 'Self-paced practice assessment for OSI model and networking protocols.',
    department: cseDept.name,
    course: btechCse.name,
    year: '2nd Year',
    semester: '4th Semester',
    subject: subCN.name,
    sections: ['CSE-A', 'CSE-B'],
    examType: 'Practice Test',
    examDate: todayStr,
    startTime: '08:00',
    endTime: '23:59',
    duration: 30,
    totalMarks: 15,
    passingMarks: 6,
    numberOfQuestions: cnQuestions.length,
    questions: cnQuestions.map(q => q._id),
    instructions: 'Open practice test. Can be attempted for revision.',
    negativeMarking: false,
    negativeMarksPerWrongAnswer: 0,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowReview: true,
    allowBackNavigation: true,
    resultVisibility: true,
    status: 'Active',
    createdBy: faculty1._id,
    createdByName: faculty1.fullName,
    enrolledStudentsCount: 18
  });

  // Exam 5: Draft Exam (Semester Exam - Digital Electronics)
  const exam5 = db.create('exams', {
    title: 'Semester End Examination: Digital Electronics',
    description: 'Final semester examination for ECE students.',
    department: eceDept.name,
    course: btechEce.name,
    year: '2nd Year',
    semester: '4th Semester',
    subject: subDE.name,
    sections: ['ECE-A'],
    examType: 'Semester Examination',
    examDate: '2026-12-15',
    startTime: '09:00',
    endTime: '12:00',
    duration: 180,
    totalMarks: 100,
    passingMarks: 40,
    numberOfQuestions: deQuestions.length,
    questions: deQuestions.map(q => q._id),
    instructions: 'Final official semester exam.',
    negativeMarking: false,
    negativeMarksPerWrongAnswer: 0,
    shuffleQuestions: false,
    shuffleOptions: false,
    allowReview: true,
    allowBackNavigation: true,
    resultVisibility: false,
    status: 'Draft',
    createdBy: faculty3._id,
    createdByName: faculty3.fullName,
    enrolledStudentsCount: 7
  });

  // 10. Seed Completed Exam Attempts & Results for Exam 3 (Quiz 1: DBMS)
  // Alex Morgan (the demo student) and classmates
  const cseAStudents = createdStudents.filter(s => s.section === 'CSE-A');
  for (let i = 0; i < cseAStudents.length; i++) {
    const student = cseAStudents[i];
    const isAlex = student.email === 'student@examora.com';
    const score = isAlex ? 8.5 : Math.max(3, Math.min(10, Math.floor(Math.random() * 8) + 3));
    const passed = score >= 4;

    db.create('attempts', {
      examId: exam3._id,
      examTitle: exam3.title,
      subject: exam3.subject,
      studentId: student._id,
      studentName: student.fullName,
      studentEmail: student.email,
      studentRoll: student.studentId,
      department: student.department,
      section: student.section,
      totalMarks: 10,
      marksObtained: score,
      percentage: Math.round((score / 10) * 100),
      passed,
      status: 'submitted',
      startedAt: '2026-11-20T14:02:00.000Z',
      submittedAt: '2026-11-20T14:18:00.000Z',
      timeTakenMinutes: 16,
      answers: {
        // Sample answered questions
      },
      evaluationBreakdown: {
        correctCount: score >= 6 ? 3 : 2,
        wrongCount: score >= 6 ? 1 : 2,
        unansweredCount: 0
      },
      facultyFeedback: isAlex ? 'Excellent performance in normalization and ACID concepts!' : 'Satisfactory result. Review indexing.'
    });
  }

  // 11. Initial Notifications
  db.create('notifications', {
    title: 'Welcome to EXAMORA!',
    message: 'The academic examination management portal is live. Check your dashboard for scheduled exams.',
    type: 'announcement',
    targetRole: 'all',
    createdAt: new Date().toISOString()
  });

  db.create('notifications', {
    title: 'Internal Assessment 1 Live Now',
    message: 'Operating Systems Internal Assessment 1 is currently active for section CSE-A. Complete before the deadline.',
    type: 'exam_active',
    targetRole: 'student',
    targetSection: 'CSE-A',
    createdAt: new Date().toISOString()
  });

  db.create('notifications', {
    title: 'Mid-Term Exam Schedule Published',
    message: 'Data Structures & Algorithms mid-term exam is scheduled for tomorrow at 10:00 AM.',
    type: 'exam_scheduled',
    targetRole: 'student',
    targetSection: 'CSE-A',
    createdAt: new Date().toISOString()
  });

  console.log('Database seeded successfully with all required demo records!');
}

module.exports = seedData;
