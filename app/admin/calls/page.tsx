import AdminJsonCrudPage from "../_components/AdminJsonCrudPage";

export default function AdminCallsPage() {
  return (
    <AdminJsonCrudPage
      resource="calls"
      title="Calls"
      starter={{
        title: "New call",
        excerpt: "Short summary",
        content: "Eligibility, dates, and details",
        deadline: new Date().toISOString().slice(0, 10),
      }}
    />
  );
}
