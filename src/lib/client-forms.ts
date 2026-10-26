// The text clients sign on /waiver and /agreement. The page renders it and the
// signed PDF is built from this same copy on the server, so what someone saw
// is exactly what their PDF says — the browser never sends the text back.
//
// Bump `version` whenever the wording changes. It is printed on every signed
// PDF, so a waiver that's challenged later can be matched to the exact text
// that person agreed to.

export type ClientFormId = "waiver" | "agreement";

export interface ClientFormSection {
  heading?: string;
  // Each entry is a paragraph, or a bolded rule followed by its detail.
  paragraphs: (string | { rule: string; detail: string })[];
}

export interface ClientFormDefinition {
  id: ClientFormId;
  version: string;
  title: string;
  // Used for the PDF filename in Drive, e.g. "2026-10-26 Waiver.pdf".
  shortName: string;
  intro: string;
  // Whether the form collects emergency contact details.
  collectsContactDetails: boolean;
  sections: ClientFormSection[];
  agreement: string;
}

const PARTIES =
  "Sun Functional Movement LLC (and Sun Functional Movement LLC's affiliates, related entities, representatives, independent contractors, agents, assigns and successors)";

export const CLIENT_FORMS: Record<ClientFormId, ClientFormDefinition> = {
  waiver: {
    id: "waiver",
    version: "waiver-2026-10-26",
    title: "Health & Fitness Liability Waiver",
    shortName: "Waiver",
    intro:
      "Please fill this out before your first session. It takes about two minutes, and you'll get a signed copy by email.",
    collectsContactDetails: true,
    sections: [
      {
        paragraphs: [
          `I am voluntarily participating in personal training sessions and assigned programs with ${PARTIES}. I recognize that the personal training sessions and assigned programs require physical exertion that may be strenuous at times and may cause physical injury. I am fully aware of the risks and hazards involved.`,
          "I understand that it is my responsibility to consult with a physician prior to and regarding my participation in personal training sessions, assigned programs, and use of equipment. I represent and warrant that I have no medical condition that would prevent my participation in the personal training sessions and assigned programs.",
          "I agree to assume full responsibility for any risks, injuries, or damage known or unknown which I may incur as a result of participating in the personal training sessions, assigned programs, or use of equipment. Such injuries may include, but are not limited to, heart attacks, muscle strains, muscle pulls, muscle tears, broken bones, shin splints, heat prostration, injuries to knees, injuries to back, injuries to foot, or any other illness or soreness, including death.",
          `I knowingly and voluntarily and expressly waive any claim I may have against ${PARTIES} for injury or damages that I may sustain as a result of participating in the personal training sessions, assigned programs, or use of equipment. I, my heirs or representatives forever release, waive, discharge and covenant not to sue ${PARTIES} for any injury or death caused by their negligence or other acts.`,
          "I understand that misuse of equipment may result in injury. I have read the above waiver and release of liability and fully understand its contents. I voluntarily agree to the terms and conditions stated above.",
        ],
      },
    ],
    agreement:
      "I have read this waiver and release of liability, I understand it, and I agree to it.",
  },
  agreement: {
    id: "agreement",
    version: "agreement-2026-10-26",
    title: "Cancellation and Refund Policy",
    shortName: "Client Agreement",
    intro:
      "Welcome aboard. Please read and sign our cancellation and refund policy. You'll get a signed copy by email.",
    collectsContactDetails: false,
    sections: [
      {
        paragraphs: [
          {
            rule: "24 hour notice is required for cancellations.",
            detail:
              "A 24 hour cancellation notice is required or the session will be lost without makeup.",
          },
          {
            rule: "Notice is required if the client will be more than 20 minutes late.",
            detail:
              "After this time the personal trainer may leave the premises and the client will forfeit the session.",
          },
          {
            rule: "Packages will expire after 1 year.",
            detail:
              "All session packages expire precisely one (1) year from the date of purchase. Any unused sessions remaining after the 1-year expiration date will be forfeited and are non-refundable.",
          },
          {
            rule: "No refunds shall be issued after the first session has been used.",
            detail:
              "All purchases are final. A refund will be issued if the client cannot continue due to medical reasons. The client will submit a letter from their doctor clearly stating exercise restrictions prior to any refund being given. Refunds are not provided under any other circumstances.",
          },
        ],
      },
    ],
    agreement:
      "I have read the cancellation and refund policy, I understand it, and I agree to it.",
  },
};
