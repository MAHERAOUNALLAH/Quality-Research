"use client";

import { useState, useEffect } from "react";
import "./admin.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get role from cookie
    const userRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user-role="))
      ?.split("=")[1];
    setRole(userRole || "");

    async function loadDashboardData() {
      try {
        const [msgRes, userRes] = await Promise.all([
          fetch("/api/contact"),
          userRole === "superadmin" ? fetch("/api/admin/users") : Promise.resolve(null),
        ]);

        if (msgRes.ok) setMessages(await msgRes.json());
        if (userRes && userRes.ok) setUsers(await userRes.json());
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    if (!confirm(`Changer le grade en ${newRole} ?`)) return;

    const res = await fetch("/api/admin/promote", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole }),
    });

    if (res.ok) {
      alert("Grade mis à jour !");
      window.location.reload();
    }
  };

  if (loading) return <div className="admin-loading">Chargement du Dashboard...</div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Quality Research</h2>
          <span>{role === "superadmin" ? "👑 Super Admin" : "🛡️ Admin"}</span>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab("overview")} className={activeTab === "overview" ? "active" : ""}>📊 Stats</button>
          <button onClick={() => setActiveTab("messages")} className={activeTab === "messages" ? "active" : ""}>✉️ Messages</button>
          {role === "superadmin" && (
            <button onClick={() => setActiveTab("users")} className={activeTab === "users" ? "active" : ""}>👥 Gérer les Admins</button>
          )}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1>{activeTab === "users" ? "Contrôle des Accès" : "Tableau de Bord"}</h1>
          <div className="admin-profile">Jawher Berez</div>
        </header>

        <section className="admin-content">
          {activeTab === "overview" && (
            <div className="stats-grid">
              <div className="stat-box"><h3>{messages.length}</h3><p>Messages Reçus</p></div>
              <div className="stat-box"><h3>{users.length}</h3><p>Utilisateurs</p></div>
              <div className="stat-box"><h3>En Ligne</h3><p>1</p></div>
            </div>
          )}

          {activeTab === "messages" && (
            <table className="admin-table">
              <thead><tr><th>Expéditeur</th><th>Sujet</th><th>Action</th></tr></thead>
              <tbody>
                {messages.map((m: any) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{m.subject}</td>
                    <td><button className="view-btn">Ouvrir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "users" && (
            <table className="admin-table">
              <thead><tr><th>Email</th><th>Niveau</th><th>Action</th></tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id}>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                    <td>
                      {u.role !== "superadmin" && (
                        <select onChange={(e) => handleRoleUpdate(u._id, e.target.value)} defaultValue={u.role}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}