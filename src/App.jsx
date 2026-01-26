import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Briefcase, MapPin, Calendar, Clock, CheckCircle, 
  XCircle, MessageCircle, CreditCard, LogOut, Search, Star, 
  Camera, Phone, Mail, Lock, ChevronRight, Settings, 
  Bell, Filter, ShieldCheck, Wallet, Scissors, LayoutDashboard
} from 'lucide-react';

// --- CONFIGURAÇÃO (SUBSTITUA PELOS SEUS DADOS) ---
const SUPABASE_URL = "https://vqpbbodhhyvwtfvrpgrk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGJib2RoaHl2d3RmdnJwZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE3NDksImV4cCI6MjA4NDc4Nzc0OX0.8Swb8y8YbzTtYuAEc9flAYyIGiYo5fNAqPQJvWqrZEs";
const API_URL = "https://salaodigital.onrender.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ESTILOS TAIWAND REUTILIZÁVEIS ---
const styles = {
  input: "w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-slate-700 shadow-inner",
  buttonPrimary: "w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2",
  card: "bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 p-6",
  badgeActive: "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1",
  badgeInactive: "bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1",
};

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('auth'); // auth, dashboard, profile_edit

  // --- LOGICA DE SESSÃO ---
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) await fetchProfile(session.user.id);
      } catch (err) {
        setError("Erro ao inicializar aplicativo.");
      } finally {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) await fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Erro profile:", error);
      return;
    }
    setProfile(data);
  };

  // --- LÓGICA DE PAGAMENTO (SEU BACKEND) ---
  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/criar-pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: session.user.id })
      });
      const data = await response.json();
      if (data.init_point) window.location.href = data.init_point;
    } catch (err) {
      alert("Falha ao conectar com o servidor de pagamento.");
    }
  };

  // --- RENDERS ---
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-blue-100">
      <Navbar session={session} profile={profile} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!session ? (
          <AuthModule fetchProfile={fetchProfile} />
        ) : (
          <>
            {profile?.role === 'profissional' ? (
              <ProfessionalModule profile={profile} onPay={handlePayment} />
            ) : (
              <ClientModule profile={profile} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <Scissors className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={24} />
      </div>
      <h2 className="mt-6 text-xl font-black italic text-slate-800 tracking-tighter">SALAO DIGITAL</h2>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <XCircle size={64} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold">{message}</h1>
      <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 font-bold">Tentar novamente</button>
    </div>
  );
}

function Navbar({ session, profile }) {
  return (
    <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-200/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl rotate-3 shadow-lg shadow-blue-200">
             <Scissors className="text-white transform -rotate-3" size={20} />
          </div>
          <span className="text-2xl font-black italic tracking-tighter bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-transparent">
            SALAO<span className="text-blue-600">DIGITAL</span>
          </span>
        </div>

        {session && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-black text-slate-400 uppercase leading-none">Bem-vindo</p>
              <p className="text-sm font-bold text-slate-800">{profile?.full_name?.split(' ')[0]}</p>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// --- MÓDULO DE AUTENTICAÇÃO (LOGIN / REGISTRO) ---

// --- MÓDULO DE LOGIN E CADASTRO CORRIGIDO ---
function AuthModule({ isRegistering, setIsRegistering }) {
  const [role, setRole] = useState('cliente');
  const [form, setForm] = useState({ email: '', password: '', nome: '', telefone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para evitar cliques múltiplos

  async function handleAuth(e) {
    e.preventDefault();
    setIsSubmitting(true); // Bloqueia o botão

    try {
      if (isRegistering) {
        const { data: auth, error: aErr } = await supabase.auth.signUp({ 
          email: form.email, 
          password: form.password 
        });

        if (aErr) throw aErr;

        const { error: dbError } = await supabase.from('usuarios').insert([
          { id: auth.user.id, full_name: form.nome, telefone: form.telefone, role: role }
        ]);
        
        if (dbError) throw dbError;
        alert("Sucesso! Verifique seu e-mail para confirmar a conta.");
      } else {
        const { error: lErr } = await supabase.auth.signInWithPassword({ 
          email: form.email, 
          password: form.password 
        });
        if (lErr) throw lErr;
      }
    } catch (err) {
      // TRATAMENTO DO LIMITE DE E-MAIL
      if (err.message.includes("rate limit exceeded")) {
        alert("⚠️ Limite de envios excedido: O sistema de segurança bloqueou novos cadastros temporariamente para este e-mail. Por favor, aguarde 15 minutos e tente novamente.");
      } else {
        alert(err.message);
      }
    } finally {
      setIsSubmitting(false); // Libera o botão
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
      <h2 className="text-3xl font-black text-center mb-2">{isRegistering ? 'Criar Conta' : 'Acessar'}</h2>
      <p className="text-center text-slate-400 text-sm mb-8 italic font-medium">O próximo nível do seu negócio.</p>

      <form onSubmit={handleAuth} className="space-y-4">
        {isRegistering && (
          <>
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
              <button type="button" onClick={() => setRole('cliente')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${role === 'cliente' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>CLIENTE</button>
              <button type="button" onClick={() => setRole('profissional')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${role === 'profissional' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>PROFISSIONAL</button>
            </div>
            <div className="relative"><User className="absolute left-4 top-3.5 text-slate-300" size={18}/><input required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none" placeholder="Nome Completo" onChange={e => setForm({...form, nome: e.target.value})}/></div>
            <div className="relative"><Phone className="absolute left-4 top-3.5 text-slate-300" size={18}/><input required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none" placeholder="WhatsApp" onChange={e => setForm({...form, telefone: e.target.value})}/></div>
          </>
        )}
        <div className="relative"><Mail className="absolute left-4 top-3.5 text-slate-300" size={18}/><input required type="email" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none" placeholder="E-mail" onChange={e => setForm({...form, email: e.target.value})}/></div>
        <div className="relative"><Lock className="absolute left-4 top-3.5 text-slate-300" size={18}/><input required type="password" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none" placeholder="Senha" onChange={e => setForm({...form, password: e.target.value})}/></div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg transition uppercase tracking-widest text-sm transform active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {isSubmitting ? 'Processando...' : (isRegistering ? 'Cadastrar Agora' : 'Entrar na Conta')}
        </button>
      </form>

      <p className="text-center mt-6 text-sm font-bold text-slate-400">
        {isRegistering ? 'Já tem conta?' : 'Novo aqui?'} 
        <button onClick={() => setIsRegistering(!isRegistering)} className="ml-2 text-blue-600 underline italic">
          {isRegistering ? 'Logar' : 'Registrar'}
        </button>
      </p>
    </div>
  );
}

// --- MÓDULO DO PROFISSIONAL ---

function ProfessionalModule({ profile, onPay }) {
  const [activeTab, setActiveTab] = useState('requests');

  // Verifica expiração
  const expiryDate = profile?.created_at ? new Date(new Date(profile.created_at).getTime() + 30*24*60*60*1000) : null;
  const isExpired = expiryDate ? new Date() > expiryDate : false;

  if (!profile?.plano_ativo || isExpired) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-[3.5rem] p-12 text-center shadow-2xl border-4 border-blue-50">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Wallet className="text-blue-600" size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Seu Perfil está Pausado</h2>
          <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto italic">
            "O sucesso não espera. Ative sua presença digital e receba novos clientes hoje mesmo."
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <ShieldCheck className="text-blue-600 mb-2" />
              <h4 className="font-black text-slate-800">Visibilidade Total</h4>
              <p className="text-xs text-slate-400">Seu perfil no topo das buscas locais por distância.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <MessageCircle className="text-blue-600 mb-2" />
              <h4 className="font-black text-slate-800">Direto no WhatsApp</h4>
              <p className="text-xs text-slate-400">Receba notificações e fale com clientes em um clique.</p>
            </div>
          </div>

          <button onClick={onPay} className={styles.buttonPrimary}>
            ATIVAR PLANO PREMIUM - R$ 29,90/mês
          </button>
          {isExpired && <p className="mt-4 text-red-500 font-bold text-sm">Sua assinatura expirou em {expiryDate?.toLocaleDateString()}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic">Dashboard</h1>
          <p className="text-slate-400 font-bold mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            PROFISSIONAL ATIVO • EXPIRA EM {expiryDate?.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white rounded-2xl font-black text-xs border border-slate-200 shadow-sm hover:bg-slate-50">HORÁRIOS</button>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-lg">CONFIGURAÇÕES</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Pedidos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Solicitações Recentes</h3>
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg text-xs font-black">2 PENDENTES</span>
          </div>

          {[1, 2].map((i) => (
            <div key={i} className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-100 rounded-[1.8rem] overflow-hidden group-hover:rotate-3 transition-transform">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">Gabriel Medeiros</h4>
                  <div className="flex items-center gap-3 text-sm text-slate-400 font-medium mt-1">
                    <span className="flex items-center gap-1"><Scissors size={14}/> Corte Degradê</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> Hoje às 16:30</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                  <CheckCircle size={24} />
                </button>
                <button className="flex-1 md:flex-none p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <XCircle size={24} />
                </button>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  className="flex-1 md:flex-none p-4 bg-blue-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg"
                >
                  <MessageCircle size={24} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Lado Direito: Perfil & Status */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 border-4 border-white/20 p-1 group-hover:rotate-6 transition-all duration-500">
                  <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200"} className="w-full h-full object-cover rounded-[2rem]" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-slate-900">
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="text-2xl font-black mb-1">{profile.full_name}</h3>
              <p className="text-blue-400 font-bold text-sm tracking-widest uppercase mb-6">Professional Barber</p>
              
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase">Nota</p>
                  <p className="text-xl font-black">4.9</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase">Fidelidade</p>
                  <p className="text-xl font-black">128</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <Settings size={18} className="text-blue-600" /> Agenda Semanal
            </h4>
            <div className="space-y-3">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                  <span className="font-bold text-slate-600">{day}</span>
                  <span className="text-xs font-black text-blue-600">09:00 - 19:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MÓDULO DO CLIENTE ---

function ClientModule({ profile }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Proximidade');

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-[4rem] bg-slate-900 overflow-hidden flex flex-col items-center justify-center px-6 text-center shadow-2xl">
        <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic">
            SEU ESTILO <br/><span className="text-blue-500">DIGITALIZADO.</span>
          </h1>
          <p className="text-slate-300 text-lg font-medium">Os melhores profissionais da sua região a um toque de distância.</p>
          
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
              className="w-full pl-16 pr-8 py-6 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 text-slate-900 outline-none text-lg font-medium"
              placeholder="Buscar por nome, serviço ou localização..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categorias & Filtros */}
      <section className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex gap-2">
          {['Todos', 'Barba', 'Cabelo', 'Coloração', 'Visagismo'].map(cat => (
            <button key={cat} className="px-6 py-3 bg-white border border-slate-100 rounded-full text-xs font-black text-slate-500 hover:border-blue-600 hover:text-blue-600 transition shadow-sm uppercase tracking-widest">{cat}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
          <Filter size={18} className="ml-3 text-slate-400" />
          <select 
            className="bg-transparent text-sm font-black text-slate-600 outline-none pr-4 py-2"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option>Proximidade</option>
            <option>Melhor Avaliados</option>
            <option>Menor Preço</option>
          </select>
        </div>
      </section>

      {/* Grid de Profissionais */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3, 4, 5, 6].map(barber => (
          <div key={barber} className="group bg-white rounded-[3.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
            <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6">
              <img 
                src={`https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?w=500`} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="font-black text-sm text-slate-900">4.9</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                A 0.5 KM
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">Classic Barber Shop</h4>
              <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                <MapPin size={14} className="text-blue-600" /> Av. Paulista, 1200 - SP
              </p>
              <div className="flex gap-2 py-4">
                <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 italic">Corte Americano</span>
                <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 italic">Barba</span>
              </div>
            </div>

            <button className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl group-hover:bg-blue-600 transition-colors">
              RESERVAR AGORA
            </button>
          </div>
        ))}
      </section>

      {/* Histórico Local (Nav Only) */}
      <section className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <Clock className="text-blue-600" /> Sua Jornada de Estilo
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map(hist => (
            <div key={hist} className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 opacity-60">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                 <Scissors size={20} className="text-slate-400" />
               </div>
               <div>
                 <p className="font-black text-slate-700">Corte & Barba</p>
                 <p className="text-xs text-slate-400">Há 2 semanas no Classic Shop</p>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-20 mt-20">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-black italic tracking-tighter text-blue-700 mb-4">SALAO.DIGITAL</h2>
          <p className="text-slate-400 font-medium max-w-sm">Elevando o padrão de atendimento para barbeiros e clientes em todo o Brasil. Tecnologia a serviço da beleza.</p>
        </div>
        <div>
          <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Plataforma</h4>
          <ul className="space-y-4 text-sm font-bold text-slate-400">
            <li className="hover:text-blue-600 cursor-pointer transition">Como funciona</li>
            <li className="hover:text-blue-600 cursor-pointer transition">Planos Pro</li>
            <li className="hover:text-blue-600 cursor-pointer transition">Suporte</li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Legal</h4>
          <ul className="space-y-4 text-sm font-bold text-slate-400">
            <li className="hover:text-blue-600 cursor-pointer transition">Termos de uso</li>
            <li className="hover:text-blue-600 cursor-pointer transition">Privacidade</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pt-20 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs font-bold text-slate-300">© 2026 Salao Digital Corp. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition cursor-pointer border border-slate-100 shadow-sm"><Settings size={18}/></div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition cursor-pointer border border-slate-100 shadow-sm"><ShieldCheck size={18}/></div>
        </div>
      </div>
    </footer>
  );
}