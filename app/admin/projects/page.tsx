import AdminJsonCrudPage from "../_components/AdminJsonCrudPage";

export default function AdminProjectsPage() {
  return (
    <AdminJsonCrudPage
      resource="projects"
      title="Projects"
      starter={{
        title: "New project",
        excerpt: "Short summary",
        content: "Longer content",
        image: "/logo1.png",
      }}
    />
  );
}
