/**
 * SEED SCRIPT — Quality & Research
 *
 * Usage:
 *   npx ts-node --project tsconfig.json -e "require('./scripts/seed.ts')"
 *
 * OR use the API route: GET /api/seed?force=true
 *
 * This script seeds all collections using the project's MongoClient directly.
 * It uses deleteMany first (clean slate) then insertMany.
 */

import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

if (!uri) throw new Error("Missing MONGODB_URI in .env.local");
if (!dbName) throw new Error("Missing MONGODB_DB in .env.local");

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const now = new Date();

  console.log("🧹 Cleaning collections...");
  await Promise.all([
    db.collection("users").deleteMany({}),
    db.collection("categories").deleteMany({}),
    db.collection("articles").deleteMany({}),
    db.collection("events").deleteMany({}),
    db.collection("calls").deleteMany({}),
    db.collection("projects").deleteMany({}),
    db.collection("reports").deleteMany({}),
    db.collection("messages").deleteMany({}),
    db.collection("formations").deleteMany({}),
    db.collection("resources").deleteMany({}),
    db.collection("partners").deleteMany({}),
    db.collection("teamMembers").deleteMany({}),
  ]);

  // ── USERS ──────────────────────────────────────────────
  console.log("👤 Seeding users...");
  const users = [
    {
      _id: new ObjectId(),
      email: "admin@qualityresearch.tn",
      passwordHash: "$2b$10$exampleHashedPasswordAdmin",
      role: "admin",
      fullName: "Administrateur Q&R",
      nom: "Admin",
      prenom: "Q&R",
      telephone: "+21620000000",
      institution: "Quality & Research",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      email: "editor@qualityresearch.tn",
      passwordHash: "$2b$10$exampleHashedPasswordEditor",
      role: "editor",
      fullName: "Éditeur Q&R",
      nom: "Editeur",
      prenom: "Equipe",
      telephone: "+21621111111",
      institution: "Quality & Research",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      email: "member@qualityresearch.tn",
      passwordHash: "$2b$10$exampleHashedPasswordMember",
      role: "member",
      fullName: "Membre Association",
      nom: "Membre",
      prenom: "Association",
      telephone: "+21622222222",
      institution: "Université de Tunis",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.collection("users").insertMany(users);

  // ── CATEGORIES ─────────────────────────────────────────
  console.log("📂 Seeding categories...");
  const categories = [
    { _id: new ObjectId(), nom: "Actualités", description: "Articles et nouvelles de l'association", createdAt: now, updatedAt: now },
    { _id: new ObjectId(), nom: "Événements", description: "Congrès, journées scientifiques et rencontres", createdAt: now, updatedAt: now },
    { _id: new ObjectId(), nom: "Recherche", description: "Projets, publications et initiatives de recherche", createdAt: now, updatedAt: now },
    { _id: new ObjectId(), nom: "Formation", description: "Formations, ateliers et modules pédagogiques", createdAt: now, updatedAt: now },
    { _id: new ObjectId(), nom: "Hackathons", description: "Hackathons et innovation en santé", createdAt: now, updatedAt: now },
  ];
  await db.collection("categories").insertMany(categories);

  const catByNom = (nom: string) => categories.find((c) => c.nom === nom)!;
  const adminUser = users[0];
  const editorUser = users[1];

  // ── ARTICLES ───────────────────────────────────────────
  console.log("📰 Seeding articles...");
  await db.collection("articles").insertMany([
    {
      _id: new ObjectId(),
      titre: "Lancement officiel de Quality & Research",
      contenu: "Quality & Research lance officiellement ses activités autour de l'excellence en santé, la recherche, la formation et l'innovation. Cette association rassemble des professionnels de santé, chercheurs et gestionnaires engagés dans l'amélioration continue du système de santé tunisien.\n\nNotre vision est de devenir un acteur de référence dans la promotion de la qualité des soins et du développement de la recherche scientifique en santé. Nos axes stratégiques couvrent la formation continue, les congrès scientifiques, les projets de recherche collaborative et le développement d'outils et ressources pédagogiques.",
      excerpt: "Découverte de la vision, de la mission et des priorités stratégiques de l'association.",
      image: "/uploads/articles/launch.jpg",
      categoryId: catByNom("Actualités")._id,
      authorId: adminUser._id,
      published: true,
      publishedAt: new Date("2026-01-10T10:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      titre: "Retour sur le congrès national qualité en santé",
      contenu: "Le congrès national a réuni experts, universitaires et professionnels pour débattre des approches innovantes d'amélioration continue. Plus de 200 participants ont assisté à cet événement fondateur qui a permis de poser les bases d'un réseau national dédié à la qualité en santé.\n\nLes travaux se sont articulés autour de trois grandes thématiques : la gouvernance hospitalière, la sécurité des patients et la recherche évaluative. Des communications scientifiques de haut niveau ont été présentées, démontrant la dynamique de recherche en cours dans notre pays.",
      excerpt: "Un résumé des temps forts du congrès national sur la qualité en santé.",
      image: "/uploads/articles/congres.jpg",
      categoryId: catByNom("Événements")._id,
      authorId: editorUser._id,
      published: true,
      publishedAt: new Date("2026-02-18T09:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      titre: "Pourquoi investir dans la recherche collaborative ?",
      contenu: "La recherche collaborative permet de fédérer les compétences, mutualiser les données et accélérer les résultats utiles au système de santé. Elle favorise également l'émergence de nouvelles approches méthodologiques adaptées aux réalités locales.\n\nDans un contexte de ressources limitées, la mise en réseau de chercheurs issus de différentes institutions permet non seulement d'optimiser les moyens, mais aussi d'enrichir les perspectives analytiques. Les études multicentriques et les méta-analyses collaboratives offrent une robustesse statistique que les travaux isolés ne peuvent atteindre.",
      excerpt: "Les bénéfices d'une approche collaborative entre chercheurs, cliniciens et institutions.",
      image: "/uploads/articles/research.jpg",
      categoryId: catByNom("Recherche")._id,
      authorId: editorUser._id,
      published: true,
      publishedAt: new Date("2026-03-01T08:30:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── EVENTS ─────────────────────────────────────────────
  console.log("📅 Seeding events...");
  await db.collection("events").insertMany([
    {
      _id: new ObjectId(),
      titre: "Congrès International Qualité & Recherche",
      description: "Un congrès dédié à l'excellence en santé, aux innovations méthodologiques et aux expériences terrain. Experts nationaux et internationaux se réunissent pour partager les meilleures pratiques en qualité des soins, sécurité des patients et recherche clinique.\n\nLe programme comprend des conférences plénières, des ateliers pratiques, des sessions de communication orale et affichée, ainsi que des tables rondes thématiques. La participation est ouverte aux professionnels de santé, chercheurs, étudiants et gestionnaires.",
      date: new Date("2026-05-22T08:00:00.000Z"),
      lieu: "Tunis, Tunisie",
      image: "/uploads/events/congress-2026.jpg",
      categoryId: catByNom("Événements")._id,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      titre: "Hackathon Santé Digitale 2026",
      description: "48 heures de co-création autour des solutions numériques pour la santé publique et les parcours patients. Des équipes pluridisciplinaires composées de développeurs, médecins, designers et entrepreneurs travailleront ensemble pour concevoir des prototypes innovants.\n\nLes projets seront évalués selon leur faisabilité technique, leur impact sur la santé publique et leur potentiel de déploiement. Les trois équipes finalistes remporteront un accompagnement au développement et une mise en relation avec des partenaires investisseurs.",
      date: new Date("2026-06-14T09:00:00.000Z"),
      lieu: "Sousse, Tunisie",
      image: "/uploads/events/hackathon-2026.jpg",
      categoryId: catByNom("Hackathons")._id,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      titre: "Journée Méthodologie de la Recherche",
      description: "Ateliers et conférences destinés aux étudiants, chercheurs et professionnels de santé souhaitant renforcer leurs compétences en méthodologie de recherche. Au programme : conception de protocoles, analyse statistique, rédaction scientifique et publication.",
      date: new Date("2026-04-18T08:30:00.000Z"),
      lieu: "Sfax, Tunisie",
      image: "/uploads/events/methodology-day.jpg",
      categoryId: catByNom("Formation")._id,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── CALLS ──────────────────────────────────────────────
  console.log("📣 Seeding calls...");
  await db.collection("calls").insertMany([
    {
      _id: new ObjectId(),
      title: "Appel à candidature – Jeunes chercheurs 2026",
      excerpt: "Programme d'accompagnement pour jeunes chercheurs dans le domaine de la santé.",
      content: "Cet appel vise à identifier et accompagner des jeunes chercheurs porteurs d'idées innovantes en qualité et recherche en santé. Les candidats sélectionnés bénéficieront d'un mentorat personnalisé, d'un accès aux ressources de l'association et d'une opportunité de présenter leurs travaux lors du congrès annuel.",
      type: "candidature",
      deadline: new Date("2026-05-01T23:59:59.000Z"),
      link: "https://qualityresearch.tn/calls/jeunes-chercheurs-2026",
      isOpen: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Appel à participation – Hackathon Santé 2026",
      excerpt: "Inscription ouverte pour les équipes étudiantes, chercheurs et développeurs.",
      content: "L'appel à participation est ouvert aux étudiants, professionnels et porteurs de projets intéressés par l'innovation en santé. Les équipes de 3 à 5 membres doivent s'inscrire avant la date limite en soumettant un formulaire de candidature et une brève présentation de leur idée de projet.",
      type: "participation",
      deadline: new Date("2026-06-01T23:59:59.000Z"),
      link: "https://qualityresearch.tn/calls/hackathon-sante-2026",
      isOpen: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Appel à communication – Congrès 2026",
      excerpt: "Soumission des résumés scientifiques pour le congrès annuel.",
      content: "Les chercheurs peuvent soumettre leurs communications orales et affichées dans les thématiques du congrès. Les résumés doivent être rédigés en français, ne pas dépasser 300 mots et suivre le format IMRaD. Le comité scientifique évaluera les soumissions selon les critères d'originalité, de rigueur méthodologique et de pertinence thématique.",
      type: "communication",
      deadline: new Date("2026-04-25T23:59:59.000Z"),
      link: "https://qualityresearch.tn/calls/congres-2026",
      isOpen: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── PROJECTS ───────────────────────────────────────────
  console.log("🔬 Seeding projects...");
  await db.collection("projects").insertMany([
    {
      _id: new ObjectId(),
      title: "Observatoire de la qualité en santé",
      description: "Projet structurant pour collecter, analyser et diffuser des indicateurs de qualité en santé. L'observatoire développe des tableaux de bord interactifs permettant aux décideurs de suivre en temps réel les indicateurs clés de performance des établissements de santé.",
      excerpt: "Suivi d'indicateurs, tableaux de bord et appui à la décision.",
      image: "/uploads/projects/observatory.jpg",
      status: "active",
      startDate: new Date("2025-11-01T00:00:00.000Z"),
      endDate: null,
      members: ["Dr. Amina Ben Salah", "Pr. Hatem Gharbi", "Équipe Quality & Research"],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Plateforme de formation continue en santé",
      description: "Développement d'une plateforme numérique pour la diffusion de modules de formation continue et d'ateliers pratiques destinés aux professionnels de santé. La plateforme intégrera des outils d'évaluation des compétences et de suivi de progression.",
      excerpt: "Une offre de formation flexible pour les professionnels et étudiants.",
      image: "/uploads/projects/training-platform.jpg",
      status: "planned",
      startDate: new Date("2026-02-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      members: ["Cellule Formation", "Experts pédagogiques", "Développeurs partenaires"],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Réseau francophone innovation & recherche",
      description: "Mise en réseau d'équipes de recherche et d'innovation en santé au niveau francophone. Ce projet vise à établir des collaborations scientifiques durables entre institutions tunisiennes et partenaires francophones pour des projets de recherche conjoints.",
      excerpt: "Développer des collaborations scientifiques et institutionnelles.",
      image: "/uploads/projects/francophone-network.jpg",
      status: "active",
      startDate: new Date("2025-09-15T00:00:00.000Z"),
      endDate: null,
      members: ["Partenaires universitaires", "Association Q&R", "Institutions internationales"],
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── REPORTS ────────────────────────────────────────────
  console.log("📊 Seeding reports...");
  await db.collection("reports").insertMany([
    {
      _id: new ObjectId(),
      title: "Rapport d'activité 2025",
      content: "Synthèse des activités, congrès, projets, partenariats et résultats marquants de l'année 2025.",
      excerpt: "Bilan annuel des activités de l'association pour 2025.",
      type: "activite",
      year: 2025,
      fileUrl: "/uploads/reports/rapport-activite-2025.pdf",
      publishedAt: new Date("2026-01-15T00:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Rapport scientifique 2025",
      content: "Compilation des productions scientifiques, ateliers méthodologiques et travaux de recherche soutenus.",
      excerpt: "Résumé des résultats scientifiques et des publications.",
      type: "scientifique",
      year: 2025,
      fileUrl: "/uploads/reports/rapport-scientifique-2025.pdf",
      publishedAt: new Date("2026-01-20T00:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Rapport financier 2025",
      content: "Présentation des recettes, dépenses et équilibre financier de l'association sur l'exercice 2025.",
      excerpt: "État financier annuel de l'association.",
      type: "financier",
      year: 2025,
      fileUrl: "/uploads/reports/rapport-financier-2025.pdf",
      publishedAt: new Date("2026-01-25T00:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── MESSAGES ───────────────────────────────────────────
  console.log("✉️  Seeding messages...");
  await db.collection("messages").insertMany([
    {
      _id: new ObjectId(),
      name: "Mohamed Trabelsi",
      email: "mohamed.trabelsi@example.com",
      subject: "Demande d'information sur le congrès",
      message: "Bonjour, je souhaite obtenir plus d'informations sur les modalités d'inscription au congrès 2026.",
      read: false,
      createdAt: now,
    },
    {
      _id: new ObjectId(),
      name: "Sarra Ben Ali",
      email: "sarra.benali@example.com",
      subject: "Partenariat institutionnel",
      message: "Nous souhaitons explorer un partenariat avec votre association autour de la formation continue.",
      read: true,
      createdAt: now,
    },
    {
      _id: new ObjectId(),
      name: "Youssef Jaziri",
      email: "youssef.jaziri@example.com",
      subject: "Appel à candidature",
      message: "Je voudrais savoir si les étudiants en master peuvent participer à l'appel à candidature jeunes chercheurs.",
      read: false,
      createdAt: now,
    },
  ]);

  // ── FORMATIONS ─────────────────────────────────────────
  console.log("🎓 Seeding formations...");
  await db.collection("formations").insertMany([
    {
      _id: new ObjectId(),
      title: "Introduction à la méthodologie de la recherche",
      description: "Formation de base sur les concepts, outils et étapes clés de la recherche scientifique en santé.",
      duration: "12 heures",
      level: "Débutant",
      format: "Hybride",
      image: "/uploads/formations/research-methodology.jpg",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Audit qualité en milieu hospitalier",
      description: "Formation pratique dédiée aux démarches d'audit, d'évaluation et d'amélioration continue.",
      duration: "16 heures",
      level: "Intermédiaire",
      format: "Présentiel",
      image: "/uploads/formations/hospital-audit.jpg",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Rédaction scientifique et publication",
      description: "Accompagnement à la rédaction d'articles scientifiques et à la préparation de manuscrits pour publication.",
      duration: "10 heures",
      level: "Avancé",
      format: "En ligne",
      image: "/uploads/formations/scientific-writing.jpg",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── RESOURCES ──────────────────────────────────────────
  console.log("📚 Seeding resources...");
  await db.collection("resources").insertMany([
    {
      _id: new ObjectId(),
      title: "Guide de méthodologie de la recherche",
      category: "Recherche",
      type: "pdf",
      fileUrl: "/uploads/resources/guide-methodologie.pdf",
      externalUrl: "",
      size: "2.4 MB",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Template de protocole de recherche",
      category: "Outils",
      type: "docx",
      fileUrl: "/uploads/resources/template-protocole.docx",
      externalUrl: "",
      size: "350 KB",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      title: "Référentiel qualité en santé",
      category: "Qualité",
      type: "link",
      fileUrl: "",
      externalUrl: "https://qualityresearch.tn/resources/referentiel-qualite",
      size: "",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── PARTNERS ───────────────────────────────────────────
  console.log("🤝 Seeding partners...");
  await db.collection("partners").insertMany([
    {
      _id: new ObjectId(),
      name: "Université de Tunis El Manar",
      type: "Université",
      country: "Tunisie",
      logo: "/uploads/partners/utm.png",
      website: "https://www.utm.rnu.tn",
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: "Ministère de la Santé",
      type: "Institution",
      country: "Tunisie",
      logo: "/uploads/partners/ministere-sante.png",
      website: "https://www.santetunisie.rns.tn",
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: "OMS – Bureau Régional EMRO",
      type: "Organisation internationale",
      country: "Égypte",
      logo: "/uploads/partners/oms.png",
      website: "https://www.emro.who.int",
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: "Société Française de Santé Publique",
      type: "Scientifique",
      country: "France",
      logo: "/uploads/partners/sfsp.png",
      website: "https://www.sfsp.fr",
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ── TEAM MEMBERS ───────────────────────────────────────
  console.log("👥 Seeding team members...");
  await db.collection("teamMembers").insertMany([
    {
      _id: new ObjectId(),
      name: "Dr. Amina Ben Salah",
      role: "Présidente",
      specialty: "Qualité des soins",
      bio: "Experte en qualité des soins et en pilotage de programmes d'amélioration continue. Médecin avec plus de 15 ans d'expérience dans les établissements hospitaliers publics.",
      photo: "/uploads/team/amina-ben-salah.jpg",
      email: "amina@qualityresearch.tn",
      order: 1,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: "Pr. Hatem Gharbi",
      role: "Vice-Président",
      specialty: "Méthodologie de la recherche",
      bio: "Universitaire engagé dans la promotion de la recherche collaborative et de l'innovation en santé. Professeur des universités, auteur de nombreuses publications scientifiques.",
      photo: "/uploads/team/hatem-gharbi.jpg",
      email: "hatem@qualityresearch.tn",
      order: 2,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: "Mme. Ines Jarraya",
      role: "Responsable Formation",
      specialty: "Pédagogie en santé",
      bio: "Coordonne les programmes de formation, ateliers et modules de montée en compétences. Spécialiste en ingénierie pédagogique appliquée aux métiers de la santé.",
      photo: "/uploads/team/ines-jarraya.jpg",
      email: "ines@qualityresearch.tn",
      order: 3,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: "Dr. Youssef Hamdi",
      role: "Trésorier",
      specialty: "Recherche clinique & Biostatistiques",
      bio: "Spécialiste en biostatistiques et épidémiologie clinique. Responsable de la gestion financière de l'association et coordinateur des projets de recherche quantitative.",
      photo: "/uploads/team/youssef-hamdi.jpg",
      email: "youssef@qualityresearch.tn",
      order: 4,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("\n✅ Seed completed successfully!");
  console.log({
    users: users.length,
    categories: categories.length,
    articles: 3,
    events: 3,
    calls: 3,
    projects: 3,
    reports: 3,
    messages: 3,
    formations: 3,
    resources: 3,
    partners: 4,
    teamMembers: 4,
  });

  await client.close();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
