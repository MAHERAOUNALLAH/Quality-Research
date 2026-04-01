import AdminJsonCrudPage from "../_components/AdminJsonCrudPage";

export default function AdminReportsPage() {
  return (
    <AdminJsonCrudPage
      resource="reports"
      title="Reports"
      starter={{
        title: "New report",
        excerpt: "Short summary",
        content: "Main report content",
        fileUrl: "",
      }}
    />
  );
}
