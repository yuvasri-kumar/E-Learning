const courses = [
  {
    "id": "1",
    "title": "React for Beginners",
    "category": "Web Development",
    "level": "Beginner",
    "instructor": "Anita Sharma",
    "duration": "6 hours",
    "lessons": 5,
    "price": 0,
    "rating": 4.7,
    "description": "Learn the fundamentals of React including components, props, state, and hooks by building real projects.",
    "image": "https://placehold.co/400x220?text=React+Basics",
    "syllabus": [
      "Introduction to React",
      "JSX & Components",
      "Props & State",
      "Handling Events",
      "React Hooks",
      "Final Project"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Introduction to React",
        "content": "React is a JavaScript library for building user interfaces. It lets you break a UI into small, reusable components and describe what the UI should look like for any given state, while React efficiently updates the DOM when that state changes."
      },
      {
        "id": "l2",
        "title": "JSX & Components",
        "content": "JSX is a syntax extension that lets you write HTML-like markup inside JavaScript. Components are functions (or classes) that return JSX, and can be composed together to build complex interfaces from small, reusable pieces."
      },
      {
        "id": "l3",
        "title": "Props & State",
        "content": "Props let a parent component pass data down to a child component, while state lets a component keep track of information that changes over time. Together they drive what a component renders and how it behaves."
      },
      {
        "id": "l4",
        "title": "Handling Events",
        "content": "React handles events like clicks, form submissions, and key presses using event handler props such as onClick and onChange. Handlers are regular JavaScript functions that update state and trigger a re-render."
      },
      {
        "id": "l5",
        "title": "React Hooks",
        "content": "Hooks such as useState, useEffect, and useMemo let function components manage state, run side effects, and optimize performance without needing class components. They are the foundation of modern React development."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "React Official Docs - Learn React",
        "type": "Article",
        "url": "https://react.dev/learn"
      },
      {
        "id": "m2",
        "title": "React Hooks Reference",
        "type": "Reference",
        "url": "https://react.dev/reference/react/hooks"
      },
      {
        "id": "m3",
        "title": "React Router Tutorial",
        "type": "Tutorial",
        "url": "https://reactrouter.com/en/main/start/tutorial"
      }
    ]
  },
  {
    "id": "2",
    "title": "Advanced JavaScript",
    "category": "Programming",
    "level": "Intermediate",
    "instructor": "Rahul Verma",
    "duration": "8 hours",
    "lessons": 5,
    "price": 499,
    "rating": 4.5,
    "description": "Deep dive into closures, async/await, prototypes, and modern ES6+ features used in production apps.",
    "image": "https://placehold.co/400x220?text=Advanced+JS",
    "syllabus": [
      "Closures & Scope",
      "Prototypes & Classes",
      "Async/Await",
      "Modules",
      "Design Patterns",
      "Capstone Project"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Closures & Scope",
        "content": "A closure is a function that remembers the variables from the scope it was created in, even after that outer scope has finished executing. Closures are the basis for patterns like private state and memoization."
      },
      {
        "id": "l2",
        "title": "Prototypes & Classes",
        "content": "JavaScript objects inherit properties and methods through the prototype chain. The class syntax provides a cleaner way to write constructor functions and prototype-based inheritance."
      },
      {
        "id": "l3",
        "title": "Async/Await",
        "content": "Async/await is syntax built on top of Promises that lets you write asynchronous code that reads like synchronous code, making it easier to handle operations like network requests without deeply nested callbacks."
      },
      {
        "id": "l4",
        "title": "Modules",
        "content": "ES6 modules let you split code into separate files and explicitly export and import the functionality you need, which keeps large applications organized and avoids polluting the global namespace."
      },
      {
        "id": "l5",
        "title": "Design Patterns",
        "content": "Common JavaScript design patterns such as the module pattern, observer pattern, and singleton help solve recurring problems in a consistent, maintainable way across a codebase."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "MDN - JavaScript Guide",
        "type": "Article",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
      },
      {
        "id": "m2",
        "title": "MDN - Using Promises",
        "type": "Reference",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises"
      },
      {
        "id": "m3",
        "title": "javascript.info - Closures",
        "type": "Tutorial",
        "url": "https://javascript.info/closure"
      }
    ]
  },
  {
    "id": "3",
    "title": "UI/UX Design Foundations",
    "category": "Design",
    "level": "Beginner",
    "instructor": "Meera Iyer",
    "duration": "5 hours",
    "lessons": 5,
    "price": 299,
    "rating": 4.8,
    "description": "Understand design thinking, wireframing, and prototyping to craft delightful user experiences.",
    "image": "https://placehold.co/400x220?text=UI%2FUX+Design",
    "syllabus": [
      "Design Thinking",
      "Wireframing",
      "Color & Typography",
      "Prototyping Tools",
      "Usability Testing"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Design Thinking",
        "content": "Design thinking is a human-centered approach to problem solving that moves through empathizing with users, defining problems, ideating solutions, prototyping, and testing."
      },
      {
        "id": "l2",
        "title": "Wireframing",
        "content": "Wireframes are simple, low-fidelity layouts that outline where content and functionality will sit on a screen, letting designers plan structure before investing in visual detail."
      },
      {
        "id": "l3",
        "title": "Color & Typography",
        "content": "Thoughtful color palettes and type choices affect readability, hierarchy, and the emotional tone of a product, and should be applied consistently across a design system."
      },
      {
        "id": "l4",
        "title": "Prototyping Tools",
        "content": "Prototyping tools let designers turn static screens into clickable, interactive flows so that ideas can be tested with real users before any code is written."
      },
      {
        "id": "l5",
        "title": "Usability Testing",
        "content": "Usability testing involves observing real users as they attempt tasks in a design, revealing friction points and opportunities to improve the experience before launch."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "Nielsen Norman Group - Design Thinking 101",
        "type": "Article",
        "url": "https://www.nngroup.com/articles/design-thinking/"
      },
      {
        "id": "m2",
        "title": "Laws of UX",
        "type": "Reference",
        "url": "https://lawsofux.com/"
      },
      {
        "id": "m3",
        "title": "Figma Learn",
        "type": "Tutorial",
        "url": "https://help.figma.com/hc/en-us"
      }
    ]
  },
  {
    "id": "4",
    "title": "Data Structures & Algorithms",
    "category": "Computer Science",
    "level": "Intermediate",
    "instructor": "Karthik Raja",
    "duration": "10 hours",
    "lessons": 5,
    "price": 699,
    "rating": 4.6,
    "description": "Master arrays, linked lists, trees, and graphs along with problem-solving strategies for interviews.",
    "image": "https://placehold.co/400x220?text=DSA",
    "syllabus": [
      "Arrays & Strings",
      "Linked Lists",
      "Trees & Graphs",
      "Sorting & Searching",
      "Dynamic Programming"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Arrays & Strings",
        "content": "Arrays store elements in contiguous memory and allow constant-time access by index, while strings are typically arrays of characters with their own set of common manipulation techniques."
      },
      {
        "id": "l2",
        "title": "Linked Lists",
        "content": "A linked list is a sequence of nodes where each node points to the next, allowing efficient insertion and removal at any position at the cost of slower random access."
      },
      {
        "id": "l3",
        "title": "Trees & Graphs",
        "content": "Trees are hierarchical structures with a root and child nodes, while graphs generalize this to arbitrary connections between nodes, enabling traversal algorithms like BFS and DFS."
      },
      {
        "id": "l4",
        "title": "Sorting & Searching",
        "content": "Sorting algorithms like merge sort and quicksort organize data efficiently, while searching algorithms like binary search rely on that order to quickly locate elements."
      },
      {
        "id": "l5",
        "title": "Dynamic Programming",
        "content": "Dynamic programming solves complex problems by breaking them into overlapping subproblems and storing their results, avoiding redundant work and improving efficiency."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "VisuAlgo - Visualising Data Structures",
        "type": "Tool",
        "url": "https://visualgo.net/en"
      },
      {
        "id": "m2",
        "title": "Big-O Cheat Sheet",
        "type": "Reference",
        "url": "https://www.bigocheatsheet.com/"
      },
      {
        "id": "m3",
        "title": "GeeksforGeeks - DSA Tutorial",
        "type": "Tutorial",
        "url": "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/"
      }
    ]
  },
  {
    "id": "5",
    "title": "Python for Data Science",
    "category": "Data Science",
    "level": "Beginner",
    "instructor": "Divya Menon",
    "duration": "7 hours",
    "lessons": 5,
    "price": 399,
    "rating": 4.9,
    "description": "Get started with Python, Pandas, and NumPy to analyze and visualize real-world datasets.",
    "image": "https://placehold.co/400x220?text=Python+for+DS",
    "syllabus": [
      "Python Basics",
      "NumPy & Pandas",
      "Data Cleaning",
      "Data Visualization",
      "Mini Project"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Python Basics",
        "content": "Python is a readable, general-purpose language with simple syntax for variables, loops, and functions, making it a popular first language for data analysis."
      },
      {
        "id": "l2",
        "title": "NumPy & Pandas",
        "content": "NumPy provides fast array operations for numerical computing, while Pandas builds on it to offer DataFrames for organizing and analyzing tabular data."
      },
      {
        "id": "l3",
        "title": "Data Cleaning",
        "content": "Real-world data often contains missing values, duplicates, and inconsistencies, so cleaning steps like handling nulls and standardizing formats are essential before analysis."
      },
      {
        "id": "l4",
        "title": "Data Visualization",
        "content": "Visualization libraries turn raw numbers into charts and plots, helping to spot trends, outliers, and relationships that would be hard to see in a table."
      },
      {
        "id": "l5",
        "title": "Mini Project",
        "content": "Applying the full workflow, from loading and cleaning a dataset to visualizing results, consolidates the skills needed to tackle an end-to-end data analysis task."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "Python Official Tutorial",
        "type": "Article",
        "url": "https://docs.python.org/3/tutorial/"
      },
      {
        "id": "m2",
        "title": "Pandas - 10 Minutes to pandas",
        "type": "Tutorial",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html"
      },
      {
        "id": "m3",
        "title": "NumPy - Absolute Beginners Guide",
        "type": "Reference",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html"
      }
    ]
  },
  {
    "id": "6",
    "title": "Cloud Computing Essentials",
    "category": "Cloud",
    "level": "Advanced",
    "instructor": "Suresh Nair",
    "duration": "9 hours",
    "lessons": 5,
    "price": 599,
    "rating": 4.4,
    "description": "Explore cloud architecture, deployment models, and hands-on labs using popular cloud platforms.",
    "image": "https://placehold.co/400x220?text=Cloud+Computing",
    "syllabus": [
      "Cloud Fundamentals",
      "Virtualization",
      "Storage & Networking",
      "Deployment Models",
      "Security Basics"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Cloud Fundamentals",
        "content": "Cloud computing delivers computing resources like servers, storage, and databases over the internet on demand, replacing the need to own and maintain physical hardware."
      },
      {
        "id": "l2",
        "title": "Virtualization",
        "content": "Virtualization lets a single physical machine run multiple isolated virtual machines, making it possible for cloud providers to share hardware efficiently across many customers."
      },
      {
        "id": "l3",
        "title": "Storage & Networking",
        "content": "Cloud platforms offer various storage types, from object storage to block storage, along with virtual networking components that connect and secure resources."
      },
      {
        "id": "l4",
        "title": "Deployment Models",
        "content": "Public, private, and hybrid cloud models offer different trade-offs between cost, control, and scalability, and choosing the right one depends on an organization's needs."
      },
      {
        "id": "l5",
        "title": "Security Basics",
        "content": "Cloud security relies on shared responsibility between provider and customer, covering areas like identity management, encryption, and network access controls."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "AWS - What is Cloud Computing?",
        "type": "Article",
        "url": "https://aws.amazon.com/what-is-cloud-computing/"
      },
      {
        "id": "m2",
        "title": "NIST Definition of Cloud Computing",
        "type": "Reference",
        "url": "https://csrc.nist.gov/pubs/sp/800/145/final"
      },
      {
        "id": "m3",
        "title": "Microsoft Learn - Cloud Concepts",
        "type": "Tutorial",
        "url": "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/"
      }
    ]
  },
  {
    "id": "7",
    "title": "Cybersecurity Fundamentals",
    "category": "Cyber Security",
    "level": "Beginner",
    "instructor": "Yuvasri Kumar",
    "duration": "6 hours",
    "lessons": 5,
    "price": 0,
    "rating": 4.8,
    "description": "Learn security principles, common threats, safe authentication, and practical defense techniques.",
    "image": "https://placehold.co/400x220?text=Cybersecurity+Fundamentals",
    "syllabus": [
      "Security Principles",
      "Common Threats",
      "Password Security",
      "Network Defense",
      "Security Best Practices"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Security Principles",
        "content": "Cybersecurity protects systems, networks, and data from unauthorized access and misuse."
      },
      {
        "id": "l2",
        "title": "Common Threats",
        "content": "Phishing, malware, and social engineering target users and systems in different ways."
      },
      {
        "id": "l3",
        "title": "Password Security",
        "content": "Use long unique passwords and multifactor authentication to reduce account compromise."
      },
      {
        "id": "l4",
        "title": "Network Defense",
        "content": "Firewalls and secure network configurations help control unwanted traffic."
      },
      {
        "id": "l5",
        "title": "Security Best Practices",
        "content": "Updates, backups, and least-privilege access reduce everyday security risk."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "CISA - Secure Our World",
        "type": "Article",
        "url": "https://www.cisa.gov/secure-our-world"
      },
      {
        "id": "m2",
        "title": "OWASP Top 10",
        "type": "Reference",
        "url": "https://owasp.org/www-project-top-ten/"
      }
    ]
  },
  {
    "id": "8",
    "title": "Database Management with SQL",
    "category": "Programming",
    "level": "Intermediate",
    "instructor": "Arun Prakash",
    "duration": "7 hours",
    "lessons": 5,
    "price": 399,
    "rating": 4.6,
    "description": "Practice relational database design, SQL queries, joins, aggregation, and transactions.",
    "image": "https://placehold.co/400x220?text=SQL+Database",
    "syllabus": [
      "Relational Databases",
      "SELECT Queries",
      "Joins and Relationships",
      "GROUP BY and Aggregates",
      "Transactions"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Relational Databases",
        "content": "Relational databases organize information into tables connected through keys."
      },
      {
        "id": "l2",
        "title": "SELECT Queries",
        "content": "SELECT retrieves rows and columns, while WHERE filters records to match conditions."
      },
      {
        "id": "l3",
        "title": "Joins and Relationships",
        "content": "Joins combine related rows from multiple tables using matching columns."
      },
      {
        "id": "l4",
        "title": "GROUP BY and Aggregates",
        "content": "GROUP BY groups rows so aggregate functions can summarize values."
      },
      {
        "id": "l5",
        "title": "Transactions",
        "content": "Transactions group database operations and help preserve consistent data."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "PostgreSQL Documentation",
        "type": "Reference",
        "url": "https://www.postgresql.org/docs/"
      },
      {
        "id": "m2",
        "title": "SQLBolt Lessons",
        "type": "Tutorial",
        "url": "https://sqlbolt.com/"
      }
    ]
  },
  {
    "id": "9",
    "title": "Introduction to Machine Learning",
    "category": "Data Science",
    "level": "Intermediate",
    "instructor": "Divya Menon",
    "duration": "8 hours",
    "lessons": 5,
    "price": 599,
    "rating": 4.7,
    "description": "Explore datasets, features, supervised learning, model evaluation, and responsible ML.",
    "image": "https://placehold.co/400x220?text=Machine+Learning",
    "syllabus": [
      "Machine Learning Basics",
      "Data Preparation",
      "Supervised Learning",
      "Model Evaluation",
      "Responsible ML"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Machine Learning Basics",
        "content": "Machine learning algorithms learn patterns from data to make predictions or decisions."
      },
      {
        "id": "l2",
        "title": "Data Preparation",
        "content": "Cleaning and transforming data helps models learn from consistent inputs."
      },
      {
        "id": "l3",
        "title": "Supervised Learning",
        "content": "Supervised learning uses labeled examples for tasks such as classification and regression."
      },
      {
        "id": "l4",
        "title": "Model Evaluation",
        "content": "Metrics and held-out test data help estimate how well a model generalizes."
      },
      {
        "id": "l5",
        "title": "Responsible ML",
        "content": "Check data quality, bias, privacy, and limitations before using a model."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "Google Machine Learning Crash Course",
        "type": "Course",
        "url": "https://developers.google.com/machine-learning/crash-course"
      },
      {
        "id": "m2",
        "title": "scikit-learn User Guide",
        "type": "Reference",
        "url": "https://scikit-learn.org/stable/user_guide.html"
      }
    ]
  },
  {
    "id": "10",
    "title": "DevOps and CI/CD Essentials",
    "category": "Cloud",
    "level": "Advanced",
    "instructor": "Suresh Nair",
    "duration": "9 hours",
    "lessons": 5,
    "price": 699,
    "rating": 4.5,
    "description": "Understand version control, automated testing, continuous integration, delivery, and deployment.",
    "image": "https://placehold.co/400x220?text=DevOps+CI%2FCD",
    "syllabus": [
      "DevOps Fundamentals",
      "Version Control",
      "Continuous Integration",
      "Automated Testing",
      "Deployment and Monitoring"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "DevOps Fundamentals",
        "content": "DevOps brings development and operations together through collaboration and automation."
      },
      {
        "id": "l2",
        "title": "Version Control",
        "content": "Version control records changes and supports collaboration through branches and reviews."
      },
      {
        "id": "l3",
        "title": "Continuous Integration",
        "content": "Continuous integration automatically builds and tests changes as they are integrated."
      },
      {
        "id": "l4",
        "title": "Automated Testing",
        "content": "Automated checks provide quick feedback and help prevent regressions."
      },
      {
        "id": "l5",
        "title": "Deployment and Monitoring",
        "content": "Deployment pipelines release changes consistently, while monitoring helps detect issues."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "GitHub Actions Documentation",
        "type": "Tutorial",
        "url": "https://docs.github.com/en/actions"
      },
      {
        "id": "m2",
        "title": "Google SRE Book",
        "type": "Reference",
        "url": "https://sre.google/sre-book/table-of-contents/"
      }
    ]
  },
  {
    "id": "11",
    "title": "Ethical Hacking Fundamentals",
    "category": "Cybersecurity",
    "level": "Beginner",
    "instructor": "Arun Prakash",
    "duration": "8 hours",
    "lessons": 5,
    "price": 0,
    "rating": 4.8,
    "description": "Learn ethical hacking foundations, reconnaissance, common vulnerabilities, and responsible security testing in authorized lab environments.",
    "image": "https://placehold.co/400x220?text=Ethical+Hacking",
    "syllabus": [
      "Ethical Hacking and Authorization",
      "Reconnaissance Basics",
      "Web Security Fundamentals",
      "Vulnerability Assessment",
      "Responsible Reporting"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Ethical Hacking and Authorization",
        "content": "Ethical hacking is authorized security testing performed within a clearly agreed scope. Always obtain permission, follow rules of engagement, and avoid testing systems you do not own or have permission to assess."
      },
      {
        "id": "l2",
        "title": "Reconnaissance Basics",
        "content": "Reconnaissance gathers publicly available information about an approved target. Document the scope and use safe, non-disruptive techniques during a learning exercise."
      },
      {
        "id": "l3",
        "title": "Web Security Fundamentals",
        "content": "Web applications should validate inputs, enforce access controls, protect sessions, and avoid exposing sensitive information in responses."
      },
      {
        "id": "l4",
        "title": "Vulnerability Assessment",
        "content": "A vulnerability assessment identifies and prioritizes weaknesses using approved tools and reproducible evidence. Confirm findings safely before reporting them."
      },
      {
        "id": "l5",
        "title": "Responsible Reporting",
        "content": "A good security report explains impact, evidence, reproduction steps, and mitigations while protecting confidential data and respecting the authorized scope."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "OWASP Web Security Testing Guide",
        "type": "Reference",
        "url": "https://owasp.org/www-project-web-security-testing-guide/"
      },
      {
        "id": "m2",
        "title": "PortSwigger Web Security Academy",
        "type": "Lab",
        "url": "https://portswigger.net/web-security"
      }
    ]
  },
  {
    "id": "12",
    "title": "Linux System Administration",
    "category": "Operating Systems",
    "level": "Intermediate",
    "instructor": "Priya Raman",
    "duration": "7 hours",
    "lessons": 5,
    "price": 299,
    "rating": 4.6,
    "description": "Practice Linux filesystems, users and permissions, process monitoring, service management, and system logs.",
    "image": "https://placehold.co/400x220?text=Linux+Administration",
    "syllabus": [
      "Linux Filesystem",
      "Users and Permissions",
      "Processes and Services",
      "Logs and Troubleshooting",
      "System Maintenance"
    ],
    "lessonList": [
      {
        "id": "l1",
        "title": "Linux Filesystem",
        "content": "The Linux filesystem organizes files beneath the root directory. Common locations include /home for user files, /etc for configuration, /var/log for logs, and /usr for installed software."
      },
      {
        "id": "l2",
        "title": "Users and Permissions",
        "content": "Linux permissions control read, write, and execute access for owners, groups, and others. Use least privilege and avoid granting unnecessary administrator access."
      },
      {
        "id": "l3",
        "title": "Processes and Services",
        "content": "Processes are running programs. Tools such as ps and top help inspect them, while systemctl is commonly used to inspect and manage system services."
      },
      {
        "id": "l4",
        "title": "Logs and Troubleshooting",
        "content": "System logs provide clues about service failures, authentication events, and system errors. Review logs carefully and protect sensitive information."
      },
      {
        "id": "l5",
        "title": "System Maintenance",
        "content": "Routine maintenance includes applying trusted updates, checking disk space, backing up important data, and reviewing access permissions."
      }
    ],
    "materials": [
      {
        "id": "m1",
        "title": "Ubuntu Server Guide",
        "type": "Reference",
        "url": "https://documentation.ubuntu.com/server/"
      },
      {
        "id": "m2",
        "title": "Linux man-pages project",
        "type": "Reference",
        "url": "https://www.kernel.org/doc/man-pages/"
      }
    ]
  }
];
export default courses;
