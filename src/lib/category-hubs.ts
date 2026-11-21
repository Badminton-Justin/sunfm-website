// Hub content for the /training, /nutrition and /wellness category pages.
//
// Why this exists: the 2026-11-18 SEO audit found Google had crawled all
// three category pages and declined to index them ("Crawled - currently not
// indexed"). They were a heading, two sentences and a grid of cards, so they
// gave Google no reason to index them or to follow them to the posts — and
// 28 posts sat in "Discovered - currently not indexed". Each hub now explains
// how its posts fit together and links every post from a topical group, so
// related posts reinforce each other instead of competing.
//
// When you publish a post, add its slug to the group it belongs in.
// Slugs that don't match a post are dropped at build time with a warning,
// and any post not listed here still appears in the "All articles" grid.

export interface HubSection {
  heading: string;
  blurb: string;
  slugs: string[];
}

export interface CategoryHub {
  metaTitle: string;
  metaDescription: string;
  /** Extra paragraphs after the category intro: how to use this hub. */
  guide: string[];
  sections: HubSection[];
}

export const categoryHubs: Record<string, CategoryHub> = {
  training: {
    metaTitle: "Strength Training Guides and At-Home Self-Tests - SunFM",
    metaDescription:
      "Self-tests you can score at home, guides to desk-worker aches and common injuries, and programming advice for lifters over 30, from a San Jose trainer.",
    guide: [
      "Most of these articles are built around a test before any exercise advice. A test gives you a number to beat, tells you which problem you actually have, and stops you from fixing something that isn't broken. Two people with the same sore knee can need completely different plans, and a couple of minutes of testing is usually what separates them.",
      "If you're new here, start with the self-tests for the area that bothers you, then use the programming guides to build those fixes into a normal training week. If something hurts, the pain and injury section helps you work out whether to train through it, train around it, or get it looked at first. None of it replaces a diagnosis from a doctor or physical therapist.",
    ],
    sections: [
      {
        heading: "At-home mobility self-tests",
        blurb:
          "Range-of-motion checks for each joint, with pass and fail lines and the drills to use if you come up short. Start with whichever area feels stiffest.",
        slugs: [
          "ankle-mobility-test-at-home",
          "hip-mobility-test-at-home",
          "hamstring-flexibility-test-at-home",
          "lumbar-spine-mobility-test-at-home",
          "thoracic-spine-mobility-test-at-home",
          "shoulder-mobility-test-at-home",
          "foot-arch-test-at-home-flat-feet-or-high-arches",
          "posture-self-check-at-home",
          "hypermobility-test-at-home-beighton-score-for-lifters",
        ],
      },
      {
        heading: "Strength, power and fitness self-tests",
        blurb:
          "The numbers that track how well you're aging: strength, power, balance, aerobic fitness, and getting up off the floor. Retest every eight to twelve weeks to see whether your training is working.",
        slugs: [
          "push-up-test-at-home-what-your-number-means-after-40",
          "grip-strength-test-at-home-build-after-40",
          "muscle-power-test-at-home-after-40",
          "sitting-rising-test-at-home",
          "balance-test-at-home-single-leg-checks-over-40",
          "cardio-fitness-test-at-home-after-40",
          "core-stability-test-at-home",
          "glute-activation-test-at-home-dead-butt-syndrome",
          "sarcopenia-self-test-at-home-am-i-losing-muscle-after-50",
        ],
      },
      {
        heading: "Desk-worker aches and moving more during the workday",
        blurb:
          "Eight hours of sitting tends to show up in the same few places: neck, shoulders, low back, hips and knees. These pieces trace each ache to its upstream cause and fit the fixes into a working day.",
        slugs: [
          "neck-pain-when-sitting-at-a-desk",
          "shoulder-impingement-for-desk-workers-self-check",
          "si-joint-pain-when-sitting-at-a-desk-self-test",
          "knee-pain-when-sitting-at-a-desk",
          "buttock-pain-when-sitting-hamstring-tendon-or-piriformis-self-test",
          "standing-desk-back-pain-self-check",
          "functional-movement-exercises-for-desk-workers",
          "exercise-snacks-for-desk-workers",
          "resistance-band-routine-desk-workers-no-equipment",
          "does-a-walking-pad-count-as-exercise",
        ],
      },
      {
        heading: "Pain and injury: work out what's going on",
        blurb:
          "Tendon pain, joint pain and old injuries that never quite settled. Each guide helps you tell similar-feeling problems apart and shows what the research supports for loading them back up.",
        slugs: [
          "injury-vs-soreness-when-to-train-through-pain-over-30",
          "achilles-pain-in-the-morning-self-test-after-40",
          "plantar-fasciitis-self-test-morning-heel-pain-at-home",
          "hip-pain-lying-on-side-gluteal-tendinopathy-self-test",
          "knee-pain-hiking-downhill-descent-capacity-tests",
          "back-pain-from-lifting-your-toddler-capacity-tests",
          "frozen-shoulder-vs-shoulder-impingement-self-check",
          "tennis-elbow-vs-golfers-elbow-self-test",
          "wrist-pain-during-push-ups-and-planks-self-test",
          "training-around-a-chronic-injury-that-never-fully-healed",
          "personal-trainer-for-injury-recovery-bridge-from-physical-therapy",
        ],
      },
      {
        heading: "Arthritis, bone density and training after 50",
        blurb:
          "What lifting can and can't do for worn joints and thinning bone, read against the actual trials rather than the usual advice to take it easy.",
        slugs: [
          "strength-training-with-knee-osteoarthritis-after-50",
          "strength-training-with-hip-osteoarthritis-self-test-after-50",
          "exercises-for-bone-density-after-40",
          "weighted-vest-walking-after-40-what-it-does-and-how-heavy",
        ],
      },
      {
        heading: "Programming, technique and getting back into it",
        blurb:
          "How often to train, how hard to push, when to back off, and how to set up the big lifts, plus plans for coming back to the gym, to running, or to your sport after time away.",
        slugs: [
          "strength-training-for-longevity-beginners-guide-over-30",
          "how-often-should-you-strength-train-after-30",
          "how-hard-should-you-be-training-rpe-self-test-after-30",
          "how-long-to-see-results-strength-training-after-40",
          "mobility-vs-strength-training-why-you-need-both",
          "how-to-warm-up-before-lifting",
          "how-to-breathe-during-heavy-lifts",
          "deadlift-setup-for-over-30",
          "dumbbell-home-strength-program-after-40",
          "when-to-take-a-deload-week",
          "what-to-do-on-rest-days-strength-training",
          "how-to-return-to-strength-training-after-a-break",
          "return-to-running-after-40-readiness-tests",
          "pickleball-tennis-golf-injury-prevention-return-to-sport-after-40",
        ],
      },
    ],
  },
  nutrition: {
    metaTitle: "Nutrition for Lifters Over 40 - SunFM Blog",
    metaDescription:
      "Protein targets, losing fat without losing muscle, creatine, hydration and meal prep for busy professionals who strength train, from a San Jose trainer.",
    guide: [
      "Training builds the signal and food decides how much of it you keep. These guides stick to the few nutrition decisions that actually change results for people who lift: enough protein, a deficit that doesn't eat into muscle, and the handful of supplements with real evidence behind them.",
      "Each one gives you specific numbers and a way to check whether they're working for you, rather than a meal plan to follow. If you have a medical condition or take medication that affects diet, check changes with your doctor first.",
    ],
    sections: [
      {
        heading: "Protein, body composition and supplements",
        blurb:
          "How much protein to eat, why the scale stalls, how to tell whether creatine is doing anything for you, and how to keep muscle on a GLP-1.",
        slugs: [
          "protein-intake-for-muscle-after-40",
          "lose-fat-without-losing-muscle-after-40",
          "creatine-after-40-what-it-does-and-how-to-tell-if-its-working",
          "strength-training-on-glp-1-after-40-how-to-keep-your-muscle",
        ],
      },
      {
        heading: "Fueling a busy training week",
        blurb:
          "The practical side: food that survives a packed calendar, and what to drink around your sessions.",
        slugs: [
          "meal-prep-for-busy-professionals",
          "hydration-and-electrolytes-for-strength-training-after-40",
        ],
      },
    ],
  },
  wellness: {
    metaTitle: "Recovery, Sleep and Stress for Lifters - SunFM Blog",
    metaDescription:
      "How sleep, alcohol, stress and recovery tools affect strength training after 30, and when to change your training around them. From a San Jose trainer.",
    guide: [
      "What happens outside the gym decides how much of your training sticks. Poor sleep, a hard week at work or a couple of drinks can each change how well you recover, and the fix is usually adjusting the training rather than skipping it.",
      "These guides look at what the research says each factor costs you, and give you a simple way to decide when a week calls for training as planned, training lighter, or resting.",
    ],
    sections: [
      {
        heading: "Recovery: sleep, alcohol and recovery tools",
        blurb:
          "What actually speeds recovery after 40, what slows it, and how to time cold plunges and saunas so they help.",
        slugs: [
          "sleep-and-muscle-recovery-for-strength-training-over-30",
          "alcohol-and-muscle-recovery-after-40",
          "recovery-tools-cold-plunge-sauna-massage-gun-after-40",
        ],
      },
      {
        heading: "Stress and training",
        blurb:
          "How to read a stressful week and adjust your training to it, and why lifting can be one of the better ways to manage stress.",
        slugs: [
          "when-work-stress-should-change-how-you-train",
          "personal-training-for-stress-relief-bay-area",
        ],
      },
    ],
  },
};
