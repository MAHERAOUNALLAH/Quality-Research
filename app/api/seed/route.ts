import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "1" || searchParams.get("force") === "true";

    const db = await getDb();
    const now = new Date();

    const teamCount = await db.collection("teamMembers").countDocuments();
    if (teamCount > 0 && !force) {
      return NextResponse.json({ message: "Already seeded. Use ?force=1 to re-seed." });
    }

    await Promise.all([
      db.collection("users").deleteMany({}),
      db.collection("categories").deleteMany({}),
      db.collection("articles").deleteMany({}),
      db.collection("events").deleteMany({}),
      db.collection("calls").deleteMany({}),
      db.collection("projects").deleteMany({}),
      db.collection("reports").deleteMany({}),
      db.collection("resources").deleteMany({}),
      db.collection("partners").deleteMany({}),
      db.collection("teamMembers").deleteMany({}),
    ]);

    const users = [
      { _id: new ObjectId(), email: "admin@qualityresearch.tn", passwordHash: "$2b$10$exampleHashedPasswordAdmin", role: "admin", fullName: "Administrateur Q&R", nom: "Admin", prenom: "Q&R", isActive: true, createdAt: now, updatedAt: now },
    ];
    await db.collection("users").insertMany(users);

    const categories = [
      { _id: new ObjectId(), nom: "Actualités", description: "Articles et nouvelles", createdAt: now, updatedAt: now },
      { _id: new ObjectId(), nom: "Événements", description: "Congrès et rencontres", createdAt: now, updatedAt: now },
      { _id: new ObjectId(), nom: "Recherche", description: "Projets de recherche", createdAt: now, updatedAt: now },
      { _id: new ObjectId(), nom: "Formation", description: "Formations et ateliers", createdAt: now, updatedAt: now },
      { _id: new ObjectId(), nom: "Hackathons", description: "Innovation en santé", createdAt: now, updatedAt: now },
    ];
    await db.collection("categories").insertMany(categories);

    const catId = (nom: string) => categories.find((c) => c.nom === nom)!._id;
    const adminId = users[0]._id;

    await db.collection("articles").insertMany([
      { _id: new ObjectId(), titre: "Lancement officiel de Quality & Research", contenu: "Quality & Research lance officiellement ses activités autour de l'excellence en santé, la recherche, la formation et l'innovation.\n\nNotre vision est de devenir un acteur de référence dans la promotion de la qualité des soins et du développement de la recherche scientifique en santé.", excerpt: "Découverte de la vision, de la mission et des priorités stratégiques de l'association.", image: "", categoryId: catId("Actualités"), authorId: adminId, published: true, publishedAt: new Date("2026-01-10T10:00:00.000Z"), createdAt: now, updatedAt: now },
      { _id: new ObjectId(), titre: "Retour sur le congrès national qualité en santé", contenu: "Le congrès national a réuni experts, universitaires et professionnels pour débattre des approches innovantes d'amélioration continue. Plus de 200 participants ont assisté à cet événement fondateur.\n\nLes travaux se sont articulés autour de trois grandes thématiques : la gouvernance hospitalière, la sécurité des patients et la recherche évaluative.", excerpt: "Un résumé des temps forts du congrès national sur la qualité en santé.", image: "", categoryId: catId("Événements"), authorId: adminId, published: true, publishedAt: new Date("2026-02-18T09:00:00.000Z"), createdAt: now, updatedAt: now },
      { _id: new ObjectId(), titre: "Pourquoi investir dans la recherche collaborative ?", contenu: "La recherche collaborative permet de fédérer les compétences, mutualiser les données et accélérer les résultats utiles au système de santé.\n\nDans un contexte de ressources limitées, la mise en réseau de chercheurs issus de différentes institutions permet non seulement d'optimiser les moyens, mais aussi d'enrichir les perspectives analytiques.", excerpt: "Les bénéfices d'une approche collaborative entre chercheurs, cliniciens et institutions.", image: "", categoryId: catId("Recherche"), authorId: adminId, published: true, publishedAt: new Date("2026-03-01T08:30:00.000Z"), createdAt: now, updatedAt: now },
    ]);

    await db.collection("events").insertMany([
      { _id: new ObjectId(), titre: "Congrès International Qualité & Recherche", description: "Un congrès dédié à l'excellence en santé, aux innovations méthodologiques et aux expériences terrain.\n\nLe programme comprend des conférences plénières, des ateliers pratiques, des sessions de communication orale et affichée.", date: new Date("2026-05-22T08:00:00.000Z"), lieu: "Tunis, Tunisie", image: "", categoryId: catId("Événements"), published: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), titre: "Hackathon Santé Digitale 2026", description: "48 heures de co-création autour des solutions numériques pour la santé publique et les parcours patients.\n\nDes équipes pluridisciplinaires travailleront ensemble pour concevoir des prototypes innovants.", date: new Date("2026-06-14T09:00:00.000Z"), lieu: "Sousse, Tunisie", image: "", categoryId: catId("Hackathons"), published: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), titre: "Journée Méthodologie de la Recherche", description: "Ateliers et conférences destinés aux étudiants, chercheurs et professionnels de santé souhaitant renforcer leurs compétences en méthodologie de recherche.", date: new Date("2026-04-18T08:30:00.000Z"), lieu: "Sfax, Tunisie", image: "", categoryId: catId("Formation"), published: true, createdAt: now, updatedAt: now },
    ]);

    await db.collection("calls").insertMany([
      { _id: new ObjectId(), title: "Appel à candidature – Jeunes chercheurs 2026", excerpt: "Programme d'accompagnement pour jeunes chercheurs.", content: "Cet appel vise à identifier et accompagner des jeunes chercheurs porteurs d'idées innovantes en qualité et recherche en santé.", type: "candidature", deadline: new Date("2026-05-01T23:59:59.000Z"), link: "", isOpen: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Appel à participation – Hackathon Santé 2026", excerpt: "Inscription ouverte pour les équipes étudiantes.", content: "L'appel à participation est ouvert aux étudiants, professionnels et porteurs de projets intéressés par l'innovation en santé.", type: "participation", deadline: new Date("2026-06-01T23:59:59.000Z"), link: "", isOpen: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Appel à communication – Congrès 2026", excerpt: "Soumission des résumés scientifiques.", content: "Les chercheurs peuvent soumettre leurs communications orales et affichées dans les thématiques du congrès.", type: "communication", deadline: new Date("2026-04-25T23:59:59.000Z"), link: "", isOpen: true, createdAt: now, updatedAt: now },
    ]);

    await db.collection("projects").insertMany([
      { _id: new ObjectId(), title: "Observatoire de la qualité en santé", description: "Projet structurant pour collecter, analyser et diffuser des indicateurs de qualité en santé.", excerpt: "Suivi d'indicateurs et tableaux de bord.", image: "", status: "active", startDate: new Date("2025-11-01"), endDate: null, members: ["Dr. Amina Ben Salah", "Pr. Hatem Gharbi"], createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Plateforme de formation continue en santé", description: "Développement d'une plateforme pour la diffusion de modules de formation continue.", excerpt: "Formation flexible pour les professionnels.", image: "", status: "planned", startDate: new Date("2026-02-01"), endDate: new Date("2026-12-31"), members: ["Cellule Formation"], createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Réseau francophone innovation & recherche", description: "Mise en réseau d'équipes de recherche et d'innovation en santé au niveau francophone.", excerpt: "Collaborations scientifiques et institutionnelles.", image: "", status: "active", startDate: new Date("2025-09-15"), endDate: null, members: ["Association Q&R", "Partenaires universitaires"], createdAt: now, updatedAt: now },
    ]);

    await db.collection("reports").insertMany([
      { _id: new ObjectId(), title: "Rapport d'activité 2025", content: "Synthèse des activités, congrès, projets, partenariats et résultats marquants de l'année 2025.", excerpt: "Bilan annuel 2025.", type: "activite", year: 2025, fileUrl: "", publishedAt: new Date("2026-01-15"), createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Rapport scientifique 2025", content: "Compilation des productions scientifiques, ateliers méthodologiques et travaux de recherche soutenus.", excerpt: "Résultats scientifiques 2025.", type: "scientifique", year: 2025, fileUrl: "", publishedAt: new Date("2026-01-20"), createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Rapport financier 2025", content: "Présentation des recettes, dépenses et équilibre financier de l'exercice 2025.", excerpt: "Bilan financier 2025.", type: "financier", year: 2025, fileUrl: "", publishedAt: new Date("2026-01-25"), createdAt: now, updatedAt: now },
    ]);

    await db.collection("resources").insertMany([
      { _id: new ObjectId(), title: "Guide de méthodologie de la recherche", category: "Recherche", type: "pdf", fileUrl: "/uploads/resources/guide-methodologie.pdf", externalUrl: "", size: "2.4 MB", published: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Template de protocole de recherche", category: "Outils", type: "docx", fileUrl: "/uploads/resources/template-protocole.docx", externalUrl: "", size: "350 KB", published: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), title: "Référentiel qualité en santé", category: "Qualité", type: "link", fileUrl: "", externalUrl: "https://qualityresearch.tn/resources/referentiel-qualite", size: "", published: true, createdAt: now, updatedAt: now },
    ]);

    await db.collection("partners").insertMany([
      { _id: new ObjectId(), name: "Université de Tunis El Manar", type: "Université", country: "Tunisie", logo: "", website: "https://www.utm.rnu.tn", order: 1, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), name: "Ministère de la Santé", type: "Institution", country: "Tunisie", logo: "", website: "https://www.santetunisie.rns.tn", order: 2, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), name: "OMS – Bureau Régional EMRO", type: "Organisation internationale", country: "Égypte", logo: "", website: "https://www.emro.who.int", order: 3, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), name: "Société Française de Santé Publique", type: "Scientifique", country: "France", logo: "", website: "https://www.sfsp.fr", order: 4, createdAt: now, updatedAt: now },
    ]);

    await db.collection("teamMembers").insertMany([
      { _id: new ObjectId(), name: "Dr. Amina Ben Salah", role: "Présidente", specialty: "Qualité des soins", bio: "Experte en qualité des soins et en pilotage de programmes d'amélioration continue. Médecin avec plus de 15 ans d'expérience dans les établissements hospitaliers publics.", photo: "", email: "amina@qualityresearch.tn", order: 1, active: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), name: "Pr. Hatem Gharbi", role: "Vice-Président", specialty: "Méthodologie de la recherche", bio: "Universitaire engagé dans la promotion de la recherche collaborative et de l'innovation en santé. Professeur des universités, auteur de nombreuses publications scientifiques.", photo: "", email: "hatem@qualityresearch.tn", order: 2, active: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), name: "Mme. Ines Jarraya", role: "Responsable Formation", specialty: "Pédagogie en santé", bio: "Coordonne les programmes de formation, ateliers et modules de montée en compétences.", photo: "", email: "ines@qualityresearch.tn", order: 3, active: true, createdAt: now, updatedAt: now },
      { _id: new ObjectId(), name: "Dr. Youssef Hamdi", role: "Trésorier", specialty: "Recherche clinique & Biostatistiques", bio: "Spécialiste en biostatistiques et épidémiologie clinique. Responsable de la gestion financière de l'association.", photo: "", email: "youssef@qualityresearch.tn", order: 4, active: true, createdAt: now, updatedAt: now },
    ]);

    return NextResponse.json({ ok: true, message: "Database seeded successfully!" });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ ok: false, error: "Failed to seed" }, { status: 500 });
  }
}
