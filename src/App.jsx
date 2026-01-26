import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Briefcase, MapPin, Calendar, Clock, CheckCircle, 
  XCircle, MessageCircle, CreditCard, LogOut, Search, Star, Camera, ExternalLink 
} from 'lucide-react';

// Ajuste com suas credenciais do projeto
const supabase = createClient('https://vqpbbodhhyvwtfvrpgrk.supabase.co' , 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGJib2RoaHl2d3RmdnJwZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE3NDksImV4cCI6MjA4NDc4Nzc0OX0.8Swb8y8YbzTtYuAEc9flAYyIGiYo5fNAqPQJvWqrZEs');
const API_URL = "https://salaodigital.onrender.com"// URL do seu back-end

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [roleSelection, setRoleSelection] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  }

  // Função para lidar com o pagamento usando seu Back-end
  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/criar-pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: session.user.id }) // barber_id para o seu webhook
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redireciona para o checkout do MP
      }
    } catch (err) {
      alert("Erro ao iniciar pagamento. Tente novamente.");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Navbar Minimalista */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tighter text-blue-600">SALAO<span className="text-slate-400">DIGITAL</span></h1>
          {session && (
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition">
              <LogOut size={18}/> Sair
            </button>
          )}
        </div>
      </nav>

      {!session ? (
        <AuthScreen onSelectRole={setRoleSelection} role={roleSelection} />
      ) : (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {profile?.role === 'profissional' ? (
            <ProDashboard profile={profile} onPay={handlePayment} />
          ) : (
            <ClientDashboard />
          )}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES ---

function AuthScreen({ onSelectRole, role }) {
  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800">Seja bem-vindo</h2>
        <p className="text-slate-500 mt-2">Escolha como deseja usar a plataforma</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <RoleCard 
          active={role === 'cliente'} 
          onClick={() => onSelectRole('cliente')}
          icon={<User size={28}/>} 
          label="Sou Cliente" 
        />
        <RoleCard 
          active={role === 'profissional'} 
          onClick={() => onSelectRole('profissional')}
          icon={<Briefcase size={28}/>} 
          label="Sou Profissional" 
        />
      </div>

      <button 
        disabled={!role}
        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
      >
        Entrar com Google
      </button>
    </div>
  );
}

function RoleCard({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
        active ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'
      }`}
    >
      {icon}
      <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
    </button>
  );
}

function ProDashboard({ profile, onPay }) {
  const [activeTab, setActiveTab] = useState('pedidos');

  // Verifica se o plano está ativo baseado no seu back-end
  if (!profile?.plano_ativo) {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl text-center border border-slate-100">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">Ative seu Perfil</h2>
        <p className="text-slate-500 mt-4 mb-8">Para aparecer para clientes e gerenciar sua agenda, você precisa de uma assinatura ativa.</p>
        <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left">
          <div className="flex justify-between mb-2"><span>Plano Mensal</span> <span className="font-bold text-blue-600">R$ 29,90</span></div>
          <div className="text-xs text-slate-400 italic font-medium">Acesso total + Gestão de WhatsApp</div>
        </div>
        <button onClick={onPay} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
          Pagar com Mercado Pago
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Painel do Profissional</h2>
          <div className="flex items-center gap-2 mt-2 text-green-600 font-semibold text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Assinatura Ativa
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition">Horários</button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md">Novo Serviço</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-700">
            <Clock size={22} className="text-blue-500"/> Solicitações Pendentes
          </h3>
          {[1, 2].map(req => (
            <div key={req} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-200 rounded-2xl overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?u=${req}`} alt="avatar" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">Ricardo Lima</h4>
                  <p className="text-sm text-slate-500">Corte Social • Hoje às 15:30</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition">
                  <CheckCircle size={20}/>
                </button>
                <button className="flex-1 md:flex-none p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition">
                  <XCircle size={20}/>
                </button>
                <a href="https://wa.me/5500000000000" target="_blank" className="flex-1 md:flex-none p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition">
                  <MessageCircle size={20}/>
                </a>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden mb-4 ring-4 ring-blue-50 group-hover:ring-blue-100 transition">
                <img src={profile?.avatar_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-6 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white">
                <Camera size={16}/>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{profile?.full_name || 'Profissional'}</h3>
            <p className="text-slate-400 text-sm mt-1">Cabelo & Barba</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ClientDashboard() {
  const [search, setSearch] = useState('');
  
  return (
    <div className="space-y-8">
      <header className="max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-5xl font-black text-slate-800 tracking-tighter italic">O que vamos fazer hoje?</h2>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={24}/>
          <input 
            className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[2rem] shadow-xl shadow-blue-50 focus:ring-2 focus:ring-blue-600 outline-none text-lg placeholder:text-slate-300"
            placeholder="Nome do profissional ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-700">Destaques próximos a você</h3>
          <button className="text-blue-600 font-bold text-sm">Ver todos</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(item => (
            <div key={item} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="h-48 rounded-[1.5rem] bg-slate-200 mb-4 overflow-hidden relative">
                <img src={`https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300&h=300`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
                  <Star size={14} className="fill-yellow-400 text-yellow-400"/> 4.9
                </div>
              </div>
              <h4 className="font-bold text-lg text-slate-800">Barbearia Don Corleone</h4>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <MapPin size={14}/> <span>A 1.2km de distância</span>
              </div>
              <button className="w-full mt-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                Agendar Agora
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Histórico Simplificado (Apenas Nav/UI conforme solicitado) */}
      <section className="bg-slate-900 text-white p-8 rounded-[3rem] mt-16">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Clock size={20} className="text-blue-400"/> Histórico de Visitas
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b border-white/10 italic">
            <span>Corte Americano - Barber Shop X</span>
            <span className="text-slate-400 text-sm">12 Jan 2024</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/10 italic">
            <span>Barba - Studio Hair</span>
            <span className="text-slate-400 text-sm">05 Dez 2023</span>
          </div>
        </div>
      </section>
    </div>
  );
}