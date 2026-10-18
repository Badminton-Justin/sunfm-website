// Coaches other than Jeffrey. Each one gets a card on /team and a full
// profile at /team/<slug>, so their name searches can land on their own page.
// Order here is the order the cards appear on /team.

export type TeamMember = {
  name: string;
  title: string;
  credentials: string;
  bio: string;
  specialties: string[];
  education: string[];
  experience: string[];
  image: string;
};

export type Coach = TeamMember & {
  slug: string;
  // One line under the name on the /team card.
  highlight: string;
  // Meta description for the profile page.
  description: string;
  alumniOf?: string;
  degree?: string;
  certification?: string;
};

export const coaches: Coach[] = [
  {
    slug: "crystal-sun",
    name: "Crystal Sun",
    title: "Coach",
    highlight: "Former competitive gymnast · UC Davis neurobiology · CF-L1",
    description:
      "Crystal Sun is a coach at Sun Functional Movement in San Jose. UC Davis Neurobiology, Physiology & Behavior grad and CrossFit Level 1 Trainer with a competitive gymnastics background.",
    credentials: "B.S. Neurobiology, Physiology & Behavior — UC Davis | CF-L1 Trainer",
    bio: "My journey into fitness began through competitive gymnastics, and my degree in Neurobiology, Physiology, and Behavior from UC Davis gives me a strong foundation in how the body and mind work together. I apply that science practically — building programs that support physical progress and overall well-being, not just short-term results.\n\nHaving trained in a Division I athletic performance program and earned my CrossFit Level 1 Trainer credential, I understand what it takes to build for performance, resilience, and long-term health. Whether you're just starting out, returning after time away, or pushing your performance further, my goal is to create an environment where you feel supported and challenged.",
    specialties: [
      "Functional Strength",
      "Mobility & Flexibility",
      "Athletic Performance",
      "Mind-Body Connection",
      "Beginner-Friendly Training",
      "Stress Management & Well-Being",
    ],
    education: [
      "B.S. Neurobiology, Physiology & Behavior — UC Davis",
      "CrossFit Level 1 Trainer (CF-L1)",
      "Division I Athletic Performance Program",
      "Competitive Gymnastics Background",
    ],
    experience: [
      "Clients of all ages and fitness levels",
      "Strength & conditioning under Division I coaches",
      "Background in competitive gymnastics",
    ],
    image: "/images/Crystal_Hero.jpg",
    alumniOf: "UC Davis",
    degree: "B.S. Neurobiology, Physiology & Behavior",
    certification: "CrossFit Level 1 Trainer (CF-L1)",
  },
];

export function getCoach(slug: string): Coach | undefined {
  return coaches.find((c) => c.slug === slug);
}
