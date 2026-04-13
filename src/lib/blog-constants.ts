export const categoryLabels: Record<string, string> = {
  nutrition: "Nutrition",
  training: "Training",
  wellness: "Wellness",
};

export const categoryDescriptions: Record<string, { intro: string; audience: string; cta: string }> = {
  training: {
    intro:
      "Practical training guides written by an ACE-certified personal trainer in San Jose with 12,000+ sessions of experience. Whether you're a desk worker dealing with back pain, a beginner looking to build functional strength, or a professional over 30 focused on longevity — these articles break down what actually works.",
    audience:
      "Written for busy South Bay professionals who want evidence-based training advice without the fluff. Every article draws from real client work in San Jose, Sunnyvale, Cupertino, and Mountain View.",
    cta: "Want a program built specifically for your body and goals?",
  },
  nutrition: {
    intro:
      "No-nonsense nutrition advice from a San Jose personal trainer who sees firsthand what works for busy professionals. These guides focus on sustainable eating strategies that fit real schedules — not crash diets or complicated meal plans that fall apart by Wednesday.",
    audience:
      "Built for Bay Area professionals who train hard but struggle to dial in their nutrition. Practical systems that clients in San Jose and the South Bay actually stick with.",
    cta: "Want personalized nutrition guidance alongside your training?",
  },
  wellness: {
    intro:
      "Wellness goes beyond reps and sets. These articles explore how personal training intersects with stress management, mental health, and long-term quality of life — especially for tech professionals in the Bay Area dealing with burnout, sedentary work, and high-pressure environments.",
    audience:
      "For South Bay professionals who understand that investing in physical health pays dividends for mental clarity, stress resilience, and career performance.",
    cta: "Ready to invest in your long-term health and well-being?",
  },
};
