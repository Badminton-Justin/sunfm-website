// Photos of the Parkmoor Ave studio, shared by the home page section, /start
// and the city pages. Alt text names the place so it also reads for local search.

export type StudioPhoto = {
  src: string;
  alt: string;
};

export const studioPhotos = {
  trainingFloor: {
    src: "/images/studio/training-floor.jpg",
    alt: "Training floor at Sun Functional Movement in San Jose with squat racks and cable machines",
  },
  frontDesk: {
    src: "/images/studio/front-desk.jpg",
    alt: "Front desk and SunFM logo wall at the San Jose studio",
  },
  pullUpRig: {
    src: "/images/studio/pull-up-rig.jpg",
    alt: "Pull-up rig on the training floor at the SunFM studio in San Jose",
  },
  barbellRack: {
    src: "/images/studio/barbell-rack.jpg",
    alt: "Barbell rack and red power rack at the SunFM studio",
  },
  turfLane: {
    src: "/images/studio/turf-lane.jpg",
    alt: "Turf lane on the training floor at the SunFM studio in San Jose",
  },
} satisfies Record<string, StudioPhoto>;

export const STUDIO_MAPS_URL = "https://maps.app.goo.gl/LjyryqUBDdHvsxom6";
