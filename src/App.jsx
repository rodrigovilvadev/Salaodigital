import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Briefcase, MapPin, Calendar, Clock, CheckCircle, 
  XCircle, MessageCircle, CreditCard, LogOut, Search, Menu 
} from 'lucide-react';

// Configuração Supabase (Substitua pelas suas chaves)
const supabase = createClient('https://vqpbbodhhyvwtfvrpgrk.supabase.co' , 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGJib2RoaHl2d3RmdnJwZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE3NDksImV4cCI6MjA4NDc4Nzc0OX0.8Swb8y8YbzTtYuAEc9flAYyIGiYo5fNAqPQJvWqrZEs');

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('home'); // home, dashboard, profile, search
  const [roleSelection, setRoleSelection] = useState(null);

  useEffect(() => {
    // Gerenciar Sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  }

  // --- COMPONENTES DE INTERFACE ---

  const Navbar = () => (
    <nav className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        ServiceFlow
      </h1>
      <div className="flex gap-4 items-center">
        {session ? (
          <>
            <button onClick={() => setView('dashboard')} className="text-gray-600 hover:text-blue-600">Painel</button>
            <button onClick={() => supabase.auth.signOut()} className="p-2 bg-gray-100 rounded-full"><LogOut size={20}/></button>
          </>
        ) : (
          <button onClick={() => setView('auth')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Entrar</button>
        )}
      </div>
    </nav>
  );

  // --- VISÃO DO CLIENTE ---
  const ClientDashboard = () => {
    const [search, setSearch] = useState('');
    const history = ["Corte de Cabelo - Jan", "Limpeza Facial - Dez"]; // Local state mock

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Encontrar Profissional</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
            <input 
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Pesquisar por nome ou proximidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <section>
          <h3 className="font-semibold text-gray-500 mb-4 uppercase tracking-wider text-sm">Histórico Recente</h3>
          <div className="space-y-3">
            {history.map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-100">
                <span className="font-medium">{item}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Concluído</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // --- VISÃO DO PROFISSIONAL ---
  const ProfessionalDashboard = () => {
    const isActive = profile?.is_active && new Date(profile.expiry_date) > new Date();

    if (!isActive) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
          <div className="p-4 bg-orange-50 rounded-full mb-4">
            <CreditCard size={48} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold">Perfil Inativo</h2>
          <p className="text-gray-600 mt-2 mb-6">Assine o plano para começar a receber solicitações de clientes.</p>
          <button 
            onClick={() => window.location.href = 'SUA_URL_MERCADO_PAGO'}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
          >
            Ativar Agora (Mercado Pago)
          </button>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="opacity-80 text-sm">Status da Assinatura</p>
              <h2 className="text-xl font-bold">Plano Premium Ativo</h2>
            </div>
            <div className="text-right">
              <p className="opacity-80 text-sm">Expira em</p>
              <p className="font-mono">{new Date(profile.expiry_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border p-6 rounded-2xl">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Calendar size={20}/> Agendamentos Pendentes</h3>
            {/* Exemplo de card de solicitação */}
            <div className="border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">João Silva</span>
                <span className="text-sm text-gray-500">14:00 - Hoje</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle size={16}/> Aceitar
                </button>
                <button className="p-2 border rounded-lg text-red-500"><XCircle size={18}/></button>
              </div>
              <a href="https://wa.me/5511999999999" className="block text-center text-sm text-green-600 font-semibold underline">
                Conversar no WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-white border p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Configurações</h3>
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border-b">Editar Foto de Perfil</button>
            <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border-b">Gerenciar Horários Disponíveis</button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER PRINCIPAL ---
  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      
      {!session ? (
        <main className="max-w-md mx-auto mt-20 p-8 border rounded-3xl shadow-xl">
          <h2 className="text-3xl font-black mb-6 text-center">Comece agora</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setRoleSelection('client')}
              className={`p-4 border-2 rounded-2xl flex flex-col items-center transition ${roleSelection === 'client' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}
            >
              <User size={32} className={roleSelection === 'client' ? 'text-blue-600' : 'text-gray-400'}/>
              <span className="mt-2 font-bold">Cliente</span>
            </button>
            <button 
              onClick={() => setRoleSelection('pro')}
              className={`p-4 border-2 rounded-2xl flex flex-col items-center transition ${roleSelection === 'pro' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}
            >
              <Briefcase size={32} className={roleSelection === 'pro' ? 'text-blue-600' : 'text-gray-400'}/>
              <span className="mt-2 font-bold">Profissional</span>
            </button>
          </div>
          
          <button 
            disabled={!roleSelection}
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Continuar com Google
          </button>
        </main>
      ) : (
        <main>
          {profile?.role === 'pro' ? <ProfessionalDashboard /> : <ClientDashboard />}
        </main>
      )}
    </div>
  );
}