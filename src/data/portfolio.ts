export const navLinks = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;

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
  period: string;
  highlights: string[];
};

export const experience: ExperienceEntry[] = [
  {
    company: "Techgencia Private Limited",
    period: "Sep 2023 – Feb 2025",
    highlights: [
      "Built soccer league application using Angular",
      "Improved LCP by 20%",
      "Built Node.js services for Firebase and Stripe",
      "Reduced API latency by 30% using Redis",
      "Configured MongoDB replica sets",
      "Dockerized applications",
      "Designed Kafka event-driven architecture",
    ],
  },
  {
    company: "NeST Digital",
    period: "Aug 2022 – Aug 2023",
    highlights: [
      "Migrated legacy desktop app to Angular web app",
      "Built NestJS backend APIs",
      "Integrated Stripe and Kafka",
      "Designed responsive Angular applications",
    ],
  },
];

export type Project = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  architecture: string[];
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
      "React frontend",
      "Node microservices backend",
      "AWS EC2 deployment",
      "Kafka",
      "Redis caching",
      "Docker",
      "Microservices Architecture",
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

export const contact = {
  email: "abhishekn4454@gmail.com",
  phone: "+91 7559896375",
};

export const social = {
  github: "https://github.com/itsmeabhishekn",
  linkedin: "https://linkedin.com/in/abhishekncode/",
};
