// Central site config. Placeholder content for an IIT Patna Research, kept in
// one place so real details can be swapped in later without touching components.

export const site = {
  name: "Sensor2AI Labs",
  shortName: "Sensor2AI Labs",
  institute: "Indian Institute of Technology Patna",
  instituteShort: "IIT Patna",
  description:
    "Sensor2AI Labs at IIT Patna, exploring ubiquitous computing, AIoT, and human-computer interaction.",
  department: "Department of Computer Science and Engineering",
  tagline: "Weaving computing quietly into everyday environments.",
  url: "https://sensor2ai-labs.example.iitp.ac.in",
  // Placeholder principal investigator, replace with real faculty details later.
  pi: {
    name: "Dr. Ananya Verma",
    role: "Principal Investigator, Assistant Professor",
  },
  // Placeholder contact, replace before launch.
  email: "sensor2ailab@gmail.com",
  location: "Bihta, Patna, Bihar 801106, India",
  social: {
    scholar: "https://scholar.google.com/",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
  },
  admissionsUrl: "https://www.iitp.ac.in/",
  // Flip to false to hide the top hiring banner site-wide.
  hiring: {
    live: true,
    message: "We are hiring across Research staff, PhD, and postdoc roles.",
    cta: "See open positions",
    href: "/join#urgent-hiring",
  },
} as const;
