type TeamMember = {
  _id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  photo: string;
  email: string;
  order: number;
  active: boolean;
};

async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/team`, { cache: "no-store" });
    const data = await res.json();
    const list: TeamMember[] = Array.isArray(data) ? data : data.items || [];
    return list.filter((m) => m.active !== false);
  } catch {
    return [];
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">À propos</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 md:text-5xl">Notre équipe</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Une équipe pluridisciplinaire de professionnels engagés pour la promotion de la qualité
            et de la recherche en santé.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        {team.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lightgreen">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Équipe non disponible</h3>
            <p className="mt-1 text-sm text-gray-500">Les membres de l'équipe apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member._id}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/30 text-center"
              >
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="mx-auto mb-4 h-20 w-20 rounded-full object-cover ring-2 ring-lightgreen"
                  />
                ) : (
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-lightgreen text-primary font-bold text-2xl">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-primary font-medium text-sm mt-1">{member.role}</p>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{member.specialty}</p>
                {member.bio && (
                  <p className="mt-3 text-gray-600 text-xs leading-relaxed line-clamp-3 border-t border-gray-50 pt-3">
                    {member.bio}
                  </p>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="mt-3 inline-block text-xs text-primary hover:underline"
                  >
                    {member.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
