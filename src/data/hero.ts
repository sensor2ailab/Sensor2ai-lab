// Hero carousel content. Photos are public Unsplash images standing in for real
// lab photography; swap the URLs (and the featured project) later.

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  lead: string;
  emphasis: string;
  note: string;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`;

export const heroSlides: HeroSlide[] = [
  {
    id: "sensing",
    image: img("photo-1581091226825-a6a2a5aee158"),
    alt: "Researchers working with sensing hardware in the lab",
    lead: "Sensing the",
    emphasis: "physical world.",
    note: "We build low-power sensors and on-device intelligence that weave computing quietly into everyday environments.",
  },
  {
    id: "edge",
    image: img("photo-1518770660439-4636190af475"),
    alt: "Close-up of a circuit board",
    lead: "Intelligence at",
    emphasis: "the edge.",
    note: "Our AIoT systems learn directly on-device, keeping data private, responsive, and local by design.",
  },
  {
    id: "human",
    image: img("photo-1531746790731-6c087fecd65a"),
    alt: "A person interacting with a wearable interface",
    lead: "Human-centered",
    emphasis: "by design.",
    note: "From wearables to ambient interfaces, we keep people at the center of the systems we build.",
  },
  {
    id: "team",
    image: img("photo-1522071820081-009f0129c71c"),
    alt: "A team collaborating around a table",
    lead: "Built by students,",
    emphasis: "for impact.",
    note: "A growing team at IIT Patna working across systems, machine learning, and human-computer interaction.",
  },
];

export const heroFeatured = {
  eyebrow: "Featured Project",
  name: "SensePod",
  image: img("photo-1581093588401-fbb62a02f120"),
  href: "/projects/sensepod",
};
