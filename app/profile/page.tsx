"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, CheckCircle, AlertCircle, ChevronRight, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('public'); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    bio: "",
    profileImage: ""
  });

  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  // CHARGEMENT DES DONNÉES (Via ton API /api/auth/me)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (data.ok && data.user) {
          setUserData({
            username: data.user.fullName || data.user.username || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
            profileImage: data.user.profileImage || ""
          });
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // MISE À JOUR PROFIL (Plus besoin de currentEmail dans le body)
  const handleUpdatePublic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          bio: userData.bio,
          profileImage: userData.profileImage
        }),
      });

      const data = await res.json();
      if (res.ok || data.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      } else {
        setMessage({ type: 'error', text: data.message || data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  // MISE À JOUR SÉCURITÉ (Plus besoin d'email dans le body)
  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldPassword: passwords.old, 
          newPassword: passwords.new 
        }),
      });

      const data = await res.json();
      if (res.ok || data.ok) {
        setMessage({ type: 'success', text: data.message || "Mot de passe modifié !" });
        setPasswords({ old: '', new: '', confirm: '' });
      } else {
        setMessage({ type: 'error', text: data.message || data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-12">
        
        <aside className="w-full md:w-72 flex flex-col gap-2">
          <h2 className="text-black font-black text-2xl px-4 mb-6 uppercase tracking-tighter">Paramètres</h2>
          
          <button 
            onClick={() => {setActiveTab('public'); setMessage({type:'', text:''})}}
            className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 font-bold ${activeTab === 'public' ? 'bg-[#10a37f] text-white shadow-xl shadow-green-100' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
          >
            <div className="flex items-center gap-4"><User size={22}/> Profil Public</div>
            <ChevronRight size={18}/>
          </button>

          <button 
            onClick={() => {setActiveTab('security'); setMessage({type:'', text:''})}}
            className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 font-bold ${activeTab === 'security' ? 'bg-[#10a37f] text-white shadow-xl shadow-green-100' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
          >
            <div className="flex items-center gap-4"><Lock size={22}/> Sécurité</div>
            <ChevronRight size={18}/>
          </button>
        </aside>

        <main className="flex-1">
          {message.text && (
            <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 border animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
              <p className="font-semibold">{message.text}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-[45px] p-8 md:p-12 border border-gray-100 shadow-sm">
            {activeTab === 'public' ? (
              <form onSubmit={handleUpdatePublic} className="space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-white rounded-[35px] overflow-hidden border-4 border-white shadow-2xl transition-transform group-hover:scale-105">
                      {userData.profileImage ? (
                        <img src={userData.profileImage} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#10a37f] font-black text-4xl bg-green-50">
                          {userData.username?.charAt(0).toUpperCase() || "M"}
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-black text-white p-3 rounded-2xl cursor-pointer hover:bg-[#10a37f] transition-all shadow-xl">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-3xl font-black text-black tracking-tight">Mon Profil</h1>
                    <p className="text-gray-500 font-medium mt-1">Mettez à jour vos informations publiques</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-black uppercase ml-1">Nom Complet</label>
                    <input 
                      type="text" 
                      value={userData.username} 
                      onChange={(e)=>setUserData({...userData, username: e.target.value})} 
                      className="w-full p-5 bg-white border-2 border-gray-100 rounded-3xl focus:border-[#10a37f] focus:ring-0 outline-none transition-all font-medium text-black"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-black uppercase ml-1">Adresse Email</label>
                    <input 
                      type="email" 
                      value={userData.email} 
                      onChange={(e)=>setUserData({...userData, email: e.target.value})} 
                      className="w-full p-5 bg-white border-2 border-gray-100 rounded-3xl focus:border-[#10a37f] focus:ring-0 outline-none transition-all font-medium text-black"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-black uppercase ml-1">Bio / Description</label>
                  <textarea 
                    rows={4} 
                    value={userData.bio} 
                    onChange={(e)=>setUserData({...userData, bio: e.target.value})} 
                    placeholder="Dites-en un peu plus sur vous..."
                    className="w-full p-5 bg-white border-2 border-gray-100 rounded-3xl focus:border-[#10a37f] focus:ring-0 outline-none transition-all font-medium text-black resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#10a37f] text-white px-10 py-5 rounded-[25px] font-black hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-green-100 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={22}/>}
                  {loading ? "Chargement..." : "Enregistrer le profil"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpdateSecurity} className="space-y-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-black text-white rounded-3xl">
                    <Lock size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-black tracking-tight">Sécurité</h1>
                    <p className="text-gray-500 font-medium">Gérez la protection de votre compte</p>
                  </div>
                </div>

                <div className="max-w-md space-y-8">
                  <div className="space-y-3 p-6 bg-red-50/50 rounded-3xl border border-red-100">
                    <label className="text-xs font-black text-red-600 uppercase ml-1">Ancien mot de passe obligatoire</label>
                    <input 
                      type="password" 
                      required 
                      value={passwords.old} 
                      onChange={(e)=>setPasswords({...passwords, old: e.target.value})} 
                      placeholder="Tapez votre mot de passe actuel"
                      className="w-full p-5 bg-white border-2 border-red-100 rounded-2xl focus:border-red-500 outline-none transition-all font-medium text-black"
                    />
                  </div>

                  <div className="space-y-6 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-black uppercase ml-1">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        required 
                        value={passwords.new} 
                        onChange={(e)=>setPasswords({...passwords, new: e.target.value})} 
                        placeholder="Nouveau mot de passe"
                        className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-[#10a37f] outline-none transition-all font-medium text-black"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-black uppercase ml-1">Confirmer le mot de passe</label>
                      <input 
                        type="password" 
                        required 
                        value={passwords.confirm} 
                        onChange={(e)=>setPasswords({...passwords, confirm: e.target.value})} 
                        placeholder="Répétez le mot de passe"
                        className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-[#10a37f] outline-none transition-all font-medium text-black"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-black text-white px-10 py-5 rounded-[25px] font-black hover:bg-[#10a37f] transition-all flex items-center gap-3 shadow-2xl shadow-gray-200 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Lock size={22}/>}
                  {loading ? "Vérification..." : "Mettre à jour la sécurité"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}