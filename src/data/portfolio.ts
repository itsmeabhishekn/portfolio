export const navLinks = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;

export const site = {
  name: "Abhishek N",
  role: "Backend Engineer",
  headline: "I design and ship reliable backend systems for product teams.",
  location: "India",
  availability: "Open to work",
  url: "https://abhishekn.dev",
  resumeHref: "/Abhishe_N_SDE.pdf",
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    items: ["JavaScript", "TypeScript", "Python", "Java"],
  },
  {
    title: "Frontend",
    items: ["Angular", "React", "Bootstrap"],
  },
  {
    title: "Backend",
    items: ["Node.js", "NestJS", "Express.js", "Spring Boot"],
  },
  {
    title: "Databases",
    items: ["MongoDB", "Redis"],
  },
  {
    title: "Infrastructure",
    items: ["Docker", "Kafka", "Git", "Linux", "Postman"],
  },
];

export type ExperienceEntry = {
  company: string;
  role?: string;
  location?: string;
  period: string;
  highlights: string[];
};

export const experience: ExperienceEntry[] = [
  {
    company: "ISPG",
    role: "Full Stack Developer",
    location: "Kerala, India",
    period: "May 2025 – Feb 2026",
    highlights: [
      "Implemented JWT authentication and payment gateway integration to improve login reliability and transaction stability",
      "Built and maintained the CRM backend with Odoo ERP integration, cutting manual updates by ~25%",
      "Introduced Redis caching and query optimization, reducing database query times by 15–20%",
      "Automated recurring work with cron jobs and notification services to improve operational reliability",
    ],
  },
  {
    company: "Techgencia Private Limited",
    period: "Sep 2023 – Feb 2025",
    highlights: [
      "Reduced API latency ~30% with Redis caching on high-traffic paths",
      "Designed Kafka-based event flows between services",
      "Shipped Node.js integrations for Firebase and Stripe payments",
      "Improved LCP ~20% on an Angular soccer league application",
      "Configured MongoDB replica sets and Dockerized services for deployment",
    ],
  },
  {
    company: "NeST Digital",
    period: "Aug 2022 – Aug 2023",
    highlights: [
      "Migrated a legacy desktop application to an Angular web app",
      "Built NestJS APIs with Stripe and Kafka integrations",
      "Delivered responsive Angular interfaces for production workflows",
    ],
  },
];

export type Project = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  architecture: string[];
  href?: string;
};

export const featuredProjects: Project[] = [
  {
    id: "dms",
    title: "Delivery Management System",
    summary:
      "End-to-end logistics platform with decoupled services, resilient messaging, and aggressive caching at the edge of the domain.",
    stack: [
      "React",
      "Node.js",
      "Microservices",
      "AWS EC2",
      "Kafka",
      "Redis",
      "Docker",
    ],
    architecture: [
      "React frontend with Node microservices",
      "Kafka for event-driven coordination",
      "Redis caching and Dockerized deploy on AWS EC2",
    ],
  },
];

export type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
};

export const education: EducationEntry[] = [
  {
    id: "mca",
    degree: "Masters of Computer Application (MCA)",
    institution: "SCMS School of Engineering and Technology (SSET)",
  },
  {
    id: "bca",
    degree: "Bachelor of Computer Application (BCA)",
    institution:
      "St. Joseph's College Devagiri (Autonomous), Devagiri Calicut",
  },
  {
    id: "dca",
    degree: "Diploma in Computer Applications (DCA)",
    institution: "G-TEC PERAMBRA",
  },
];

export const about = {
  body: "I'm Abhishek N, a backend engineer in India focused on Node.js, NestJS, and distributed systems. I care about reliability, clear service boundaries, and APIs that stay calm under load — from Kafka event flows to Redis caching and production deploys. Open to backend roles, platform work, and selected freelance systems projects.",
  stats: [
    { value: "3+", label: "Years experience" },
    { value: "3", label: "Product companies" },
    { value: "Backend", label: "Primary focus" },
  ],
};

export const contact = {
  email: "codebyabhishekn@gmail.com",
  phone: "+91 **********",
  blurb:
    "Open to backend and platform roles. If you are building systems that need careful architecture, let's talk.",
};

export const social = {
  github: "https://github.com/itsmeabhishekn",
  linkedin: "https://linkedin.com/in/abhishekncode/",
};
