// Everyone on the team. Each one gets a card on /team and a full profile at
// /team/<slug>, so their name searches can land on their own page.
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
  sameAs?: string[];
};

export const coaches: Coach[] = [
  {
    slug: "jeffrey-sun",
    name: "Jeffrey Sun",
    title: "Founder / Head Coach",
    highlight: "13,000+ sessions · ACE-certified · B.S. Human Biology",
    description:
      "Jeffrey Sun is the founder and head coach of Sun Functional Movement in San Jose. ACE-certified personal trainer with a B.S. in Human Biology, 13,000+ sessions coached, and a background as an EMT and athletic trainer.",
    credentials: "ACE Certified Personal Trainer | B.S. Human Biology",
    bio: "As a certified personal trainer with a degree in Human Biology, Jeffrey specializes in helping busy professionals build bodies that last. His approach is rooted in physiology and focused on health longevity - not crash diets or unsustainable programs. With his background as an EMT and athletic trainer, he understands the body at a deeper level.",
    specialties: [
      "Mobility & Flexibility",
      "Movement Pattern Correction",
      "Transition from Therapy to Training",
      "Hypertrophy",
      "Athletic Performance",
      "Functional Strength",
    ],
    education: [
      "B.S. Human Biology - UC Santa Cruz",
      "ACE Certified Personal Trainer",
      "Division III Athletic Training Internship",
      "CPR/AED Certified",
    ],
    experience: [
      "13,000+ training sessions delivered",
      "7+ years of professional training",
      "Former Youth Gymnastics and Soccer Coach",
      "Former Emergency Medical Technician",
    ],
    image: "/images/jeffrey-sun-studio.jpg",
    alumniOf: "UC Santa Cruz",
    degree: "B.S. Human Biology",
    certification: "ACE Certified Personal Trainer",
    sameAs: [
      "https://www.instagram.com/jeffsunfitness/",
      "https://www.linkedin.com/company/sun-functional-movement",
    ],
  },
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
    image: "/images/crystal-sun-studio.jpg",
    alumniOf: "UC Davis",
    degree: "B.S. Neurobiology, Physiology & Behavior",
    certification: "CrossFit Level 1 Trainer (CF-L1)",
  },
  {
    slug: "robert-zaharia",
    name: "Robert Zaharia",
    title: "Coach",
    highlight: "17+ years coaching · FRC Mobility Specialist · Australia-trained",
    description:
      "Robert Zaharia is a coach at Sun Functional Movement in San Jose. 17+ years as a personal trainer and strength and conditioning coach in Australia and Ireland, and an FRC Mobility Specialist.",
    credentials: "FRC Mobility Specialist (FRCms) | Certificate III & IV in Fitness",
    bio: "Robert brings over 17 years of experience as a personal trainer and strength and conditioning coach. Originally from Australia, he has coached in Australia and Ireland, including running his own personal training business, before bringing his experience to California.\n\nHis approach combines strength training, mobility, calisthenics and movement focused training to help clients become stronger, move better and build confidence.",
    specialties: [
      "Strength Training",
      "Strength & Conditioning",
      "Mobility",
      "Calisthenics",
      "Movement Training",
    ],
    education: [
      "Certificate III & IV in Fitness — Australian Institute of Fitness",
      "FRC Mobility Specialist (FRCms)",
      "Nutrition & Health — Wageningen University & Research",
    ],
    experience: [
      "17+ years Personal Training and Strength Coaching",
      "One to One and Group Fitness Coaching",
      "Strength and Conditioning, Mobility, Calisthenics and Movement Training",
    ],
    image: "/images/robert-zaharia.jpg",
    certification: "FRC Mobility Specialist (FRCms)",
  },
  {
    slug: "alan-morett",
    name: "Alan Morett",
    title: "Coach",
    highlight: "NASM-CPT · B.S. Kinesiology, SJSU · Stanford Athletics alum",
    description:
      "Alan Morett is a coach at Sun Functional Movement in San Jose. NASM Certified Personal Trainer with a B.S. in Kinesiology from San Jose State, and a background supporting Stanford Athletics and the San Francisco 49ers.",
    credentials: "NASM Certified Personal Trainer | B.S. Kinesiology — San Jose State University",
    bio: "Alan came to coaching from the operations side of elite sport. Before he started training clients, he spent two years with Stanford Athletics, running team fuel stations and hydration testing alongside the sports nutrition staff and helping coordinate travel and matchdays for Stanford Men's Soccer. Before that he worked locker room and stadium operations for the San Francisco 49ers. Watching how high-level athletes are prepared, fueled and supported day to day shaped how he thinks about training: consistency and the small details are what make progress last.\n\nAlan holds a B.S. in Kinesiology from San Jose State and is a NASM Certified Personal Trainer. He also coaches at the Lockheed Martin fitness center in Sunnyvale, where he writes individual strength and cardio programs, runs movement and fitness assessments, and leads group classes including Core, TBC and Tabata. He's currently working toward his Movement Training Specialist certification.\n\nHis sessions are organized, encouraging and built around where you are today, whether you're new to the gym or getting back into a routine.",
    specialties: [
      "Strength Training",
      "Conditioning",
      "Core Training",
      "Movement Assessment",
      "Beginner-Friendly Training",
      "Group Fitness",
    ],
    education: [
      "B.S. Kinesiology — San Jose State University",
      "NASM Certified Personal Trainer (NASM-CPT)",
      "Red Cross CPR & AED Certified",
    ],
    experience: [
      "Personal Trainer & Group Exercise Instructor — Lockheed Martin / Health Fitness",
      "Sports Nutrition Fuel Station Assistant — Stanford Athletics",
      "Operations Assistant — Stanford Men's Soccer",
      "Locker Room & Stadium Operations — San Francisco 49ers",
    ],
    image: "/images/alan-morett.jpg",
    alumniOf: "San Jose State University",
    degree: "B.S. Kinesiology",
    certification: "NASM Certified Personal Trainer (NASM-CPT)",
  },
];

export function getCoach(slug: string): Coach | undefined {
  return coaches.find((c) => c.slug === slug);
}
