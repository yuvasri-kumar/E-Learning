const courses = [
  {
    id: "1",
    title: "React for Beginners",
    category: "Web Development",
    level: "Beginner",
    instructor: "Anita Sharma",
    duration: "6 hours",
    lessons: 5,
    price: 0,
    rating: 4.7,
    description:
      "Learn the fundamentals of React including components, props, state, and hooks by building real projects.",
    image: "https://placehold.co/400x220?text=React+Basics",
    syllabus: [
      "Introduction to React",
      "JSX & Components",
      "Props & State",
      "Handling Events",
      "React Hooks",
      "Final Project"
    ],
    lessonList: [
      {
        id: "l1",
        title: "Introduction to React",
        content:
          "React is a JavaScript library for building user interfaces. It lets you break a UI into small, reusable components and describe what the UI should look like for any given state, while React efficiently updates the DOM when that state changes."
      },
      {
        id: "l2",
        title: "JSX & Components",
        content:
          "JSX is a syntax extension that lets you write HTML-like markup inside JavaScript. Components are functions (or classes) that return JSX, and can be composed together to build complex interfaces from small, reusable pieces."
      },
      {
        id: "l3",
        title: "Props & State",
        content:
          "Props let a parent component pass data down to a child component, while state lets a component keep track of information that changes over time. Together they drive what a component renders and how it behaves."
      },
      {
        id: "l4",
        title: "Handling Events",
        content:
          "React handles events like clicks, form submissions, and key presses using event handler props such as onClick and onChange. Handlers are regular JavaScript functions that update state and trigger a re-render."
      },
      {
        id: "l5",
        title: "React Hooks",
        content:
          "Hooks such as useState, useEffect, and useMemo let function components manage state, run side effects, and optimize performance without needing class components. They are the foundation of modern React development."
      }
    ]
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    category: "Programming",
    level: "Intermediate",
    instructor: "Rahul Verma",
    duration: "8 hours",
    lessons: 5,
    price: 499,
    rating: 4.5,
    description:
      "Deep dive into closures, async/await, prototypes, and modern ES6+ features used in production apps.",
    image: "https://placehold.co/400x220?text=Advanced+JS",
    syllabus: [
      "Closures & Scope",
      "Prototypes & Classes",
      "Async/Await",
      "Modules",
      "Design Patterns",
      "Capstone Project"
    ],
    lessonList: [
      {
        id: "l1",
        title: "Closures & Scope",
        content:
          "A closure is a function that remembers the variables from the scope it was created in, even after that outer scope has finished executing. Closures are the basis for patterns like private state and memoization."
      },
      {
        id: "l2",
        title: "Prototypes & Classes",
        content:
          "JavaScript objects inherit properties and methods through the prototype chain. The class syntax provides a cleaner way to write constructor functions and prototype-based inheritance."
      },
      {
        id: "l3",
        title: "Async/Await",
        content:
          "Async/await is syntax built on top of Promises that lets you write asynchronous code that reads like synchronous code, making it easier to handle operations like network requests without deeply nested callbacks."
      },
      {
        id: "l4",
        title: "Modules",
        content:
          "ES6 modules let you split code into separate files and explicitly export and import the functionality you need, which keeps large applications organized and avoids polluting the global namespace."
      },
      {
        id: "l5",
        title: "Design Patterns",
        content:
          "Common JavaScript design patterns such as the module pattern, observer pattern, and singleton help solve recurring problems in a consistent, maintainable way across a codebase."
      }
    ]
  },
  {
    id: "3",
    title: "UI/UX Design Foundations",
    category: "Design",
    level: "Beginner",
    instructor: "Meera Iyer",
    duration: "5 hours",
    lessons: 5,
    price: 299,
    rating: 4.8,
    description:
      "Understand design thinking, wireframing, and prototyping to craft delightful user experiences.",
    image: "https://placehold.co/400x220?text=UI%2FUX+Design",
    syllabus: [
      "Design Thinking",
      "Wireframing",
      "Color & Typography",
      "Prototyping Tools",
      "Usability Testing"
    ],
    lessonList: [
      {
        id: "l1",
        title: "Design Thinking",
        content:
          "Design thinking is a human-centered approach to problem solving that moves through empathizing with users, defining problems, ideating solutions, prototyping, and testing."
      },
      {
        id: "l2",
        title: "Wireframing",
        content:
          "Wireframes are simple, low-fidelity layouts that outline where content and functionality will sit on a screen, letting designers plan structure before investing in visual detail."
      },
      {
        id: "l3",
        title: "Color & Typography",
        content:
          "Thoughtful color palettes and type choices affect readability, hierarchy, and the emotional tone of a product, and should be applied consistently across a design system."
      },
      {
        id: "l4",
        title: "Prototyping Tools",
        content:
          "Prototyping tools let designers turn static screens into clickable, interactive flows so that ideas can be tested with real users before any code is written."
      },
      {
        id: "l5",
        title: "Usability Testing",
        content:
          "Usability testing involves observing real users as they attempt tasks in a design, revealing friction points and opportunities to improve the experience before launch."
      }
    ]
  },
  {
    id: "4",
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    level: "Intermediate",
    instructor: "Karthik Raja",
    duration: "10 hours",
    lessons: 5,
    price: 699,
    rating: 4.6,
    description:
      "Master arrays, linked lists, trees, and graphs along with problem-solving strategies for interviews.",
    image: "https://placehold.co/400x220?text=DSA",
    syllabus: [
      "Arrays & Strings",
      "Linked Lists",
      "Trees & Graphs",
      "Sorting & Searching",
      "Dynamic Programming"
    ],
    lessonList: [
      {
        id: "l1",
        title: "Arrays & Strings",
        content:
          "Arrays store elements in contiguous memory and allow constant-time access by index, while strings are typically arrays of characters with their own set of common manipulation techniques."
      },
      {
        id: "l2",
        title: "Linked Lists",
        content:
          "A linked list is a sequence of nodes where each node points to the next, allowing efficient insertion and removal at any position at the cost of slower random access."
      },
      {
        id: "l3",
        title: "Trees & Graphs",
        content:
          "Trees are hierarchical structures with a root and child nodes, while graphs generalize this to arbitrary connections between nodes, enabling traversal algorithms like BFS and DFS."
      },
      {
        id: "l4",
        title: "Sorting & Searching",
        content:
          "Sorting algorithms like merge sort and quicksort organize data efficiently, while searching algorithms like binary search rely on that order to quickly locate elements."
      },
      {
        id: "l5",
        title: "Dynamic Programming",
        content:
          "Dynamic programming solves complex problems by breaking them into overlapping subproblems and storing their results, avoiding redundant work and improving efficiency."
      }
    ]
  },
  {
    id: "5",
    title: "Python for Data Science",
    category: "Data Science",
    level: "Beginner",
    instructor: "Divya Menon",
    duration: "7 hours",
    lessons: 5,
    price: 399,
    rating: 4.9,
    description:
      "Get started with Python, Pandas, and NumPy to analyze and visualize real-world datasets.",
    image: "https://placehold.co/400x220?text=Python+for+DS",
    syllabus: [
      "Python Basics",
      "NumPy & Pandas",
      "Data Cleaning",
      "Data Visualization",
      "Mini Project"
    ],
    lessonList: [
      {
        id: "l1",
        title: "Python Basics",
        content:
          "Python is a readable, general-purpose language with simple syntax for variables, loops, and functions, making it a popular first language for data analysis."
      },
      {
        id: "l2",
        title: "NumPy & Pandas",
        content:
          "NumPy provides fast array operations for numerical computing, while Pandas builds on it to offer DataFrames for organizing and analyzing tabular data."
      },
      {
        id: "l3",
        title: "Data Cleaning",
        content:
          "Real-world data often contains missing values, duplicates, and inconsistencies, so cleaning steps like handling nulls and standardizing formats are essential before analysis."
      },
      {
        id: "l4",
        title: "Data Visualization",
        content:
          "Visualization libraries turn raw numbers into charts and plots, helping to spot trends, outliers, and relationships that would be hard to see in a table."
      },
      {
        id: "l5",
        title: "Mini Project",
        content:
          "Applying the full workflow, from loading and cleaning a dataset to visualizing results, consolidates the skills needed to tackle an end-to-end data analysis task."
      }
    ]
  },
  {
    id: "6",
    title: "Cloud Computing Essentials",
    category: "Cloud",
    level: "Advanced",
    instructor: "Suresh Nair",
    duration: "9 hours",
    lessons: 5,
    price: 599,
    rating: 4.4,
    description:
      "Explore cloud architecture, deployment models, and hands-on labs using popular cloud platforms.",
    image: "https://placehold.co/400x220?text=Cloud+Computing",
    syllabus: [
      "Cloud Fundamentals",
      "Virtualization",
      "Storage & Networking",
      "Deployment Models",
      "Security Basics"
    ],
    lessonList: [
      {
        id: "l1",
        title: "Cloud Fundamentals",
        content:
          "Cloud computing delivers computing resources like servers, storage, and databases over the internet on demand, replacing the need to own and maintain physical hardware."
      },
      {
        id: "l2",
        title: "Virtualization",
        content:
          "Virtualization lets a single physical machine run multiple isolated virtual machines, making it possible for cloud providers to share hardware efficiently across many customers."
      },
      {
        id: "l3",
        title: "Storage & Networking",
        content:
          "Cloud platforms offer various storage types, from object storage to block storage, along with virtual networking components that connect and secure resources."
      },
      {
        id: "l4",
        title: "Deployment Models",
        content:
          "Public, private, and hybrid cloud models offer different trade-offs between cost, control, and scalability, and choosing the right one depends on an organization's needs."
      },
      {
        id: "l5",
        title: "Security Basics",
        content:
          "Cloud security relies on shared responsibility between provider and customer, covering areas like identity management, encryption, and network access controls."
      }
    ]
  }
];

export default courses;
