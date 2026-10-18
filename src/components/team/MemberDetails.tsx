import type { TeamMember } from "@/lib/coaches";

function CheckList({ heading, items }: { heading: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="font-bold text-black mb-3">{heading}:</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-gray-700">
            <svg
              className="w-5 h-5 text-[#CB4538] flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Name, title, bio and credential lists. Jeffrey's block on /team and each
// coach's profile page both render through this so they stay identical.
export default function MemberDetails({
  member,
  headingLevel = "h2",
}: {
  member: TeamMember;
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <div>
      <Heading className="text-3xl md:text-4xl font-bold text-black mb-2">
        {member.name}
      </Heading>
      <p className="text-[#CB4538] font-semibold text-lg mb-2">{member.title}</p>
      <p className="text-gray-600 font-medium mb-6">{member.credentials}</p>

      <div className="text-gray-700 mb-8 text-lg leading-relaxed space-y-4">
        {member.bio.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {member.specialties.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-black mb-3">Specialties:</h3>
          <div className="flex flex-wrap gap-2">
            {member.specialties.map((specialty) => (
              <span
                key={specialty}
                className="bg-[#FFD140] text-black px-3 py-1 rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      <CheckList heading="Education" items={member.education} />
      <CheckList heading="Experience" items={member.experience} />
    </div>
  );
}
