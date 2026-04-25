export type EventItem = {
  id: number;
  title: string;
  subtitle?: string;
  date: string;
  location?: string;
  image: string;
  link: string;
  category?: string;
};

export const events: EventItem[] = [
  {
    id: 1,
    title: "Congrès 2026",
    date: "15 Mars 2026",
    location: "Tunis",
    image: "/events/congres.png",
    link: "/news/events/congres-2026",
    category: "Congrès",
  },
  {
    id: 2,
    title: "Hackathon Santé",
    date: "22 Avril 2026",
    location: "Sousse",
    image: "/events/hakathon.png",
    link: "/news/events/hackathon-sante",
    category: "Événement",
  },
];
