import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Briefcase, MapPin, Calendar, Clock, CheckCircle, 
  XCircle, MessageCircle, CreditCard, LogOut, Search, Star, 
  Camera, Phone, Mail, Lock, ChevronRight, Scissors 
} from 'lucide-react';

// --- CONFIGURAÇÃO ---
const supabaseUrl = 'https://vqpbbodhhyvwtfvrpgrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGJib2RoaHl2d3RmdnJwZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE3NDksImV4cCI6MjA4NDc4Nzc0OX0.8Swb8y8YbzTtYuAEc9flAYyIGiYo5fNAqPQJvWqrZEs';
const API_URL = "https://salaodigital.onrender.com";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Monitora Sessão e Perfil
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) getProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) getProfile(session.user.id);
      else { 
        setProfile(null); 
        setLoading(false); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getProfile(userId) {
    try {
      const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    } catch (err) { 
      console.error("Erro ao buscar perfil:", err); 
    } finally {
      setLoading(false);
    }
  }

  const handlePayment = async () => {
    try {
      const res = await fetch(`${API_URL}/criar-pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: session.user.id })
      });
      const data = await res.json();
      if (data.init_point) window.location.href = data.init_point;
    } catch (err) { 
      alert("Erro ao conectar com o servidor de pagamento."); 
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900">
      <div className="text-center text-white font-black animate-pulse">CARREGANDO...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 font-sans selection:bg-blue-100">
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg"><Scissors className="text-white" size={18}/></div>
            <h1 className="text-xl font-black italic tracking-tighter">SALAO<span className="text-blue-600">DIGITAL</span></h1>
          </div>
          {session && (
            <button onClick={() => supabase.auth.signOut()} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {!session ? (
          <AuthModule 
            isRegistering={isRegistering} 
            setIsRegistering={setIsRegistering} 
            getProfile={getProfile} 
          />
        ) : (
          profile?.role === 'barbeiro' || profile?.role === 'profissional' ? (
            <ProDashboard profile={profile} onPay={handlePayment} />
          ) : (
            <ClientDashboard profile={profile} />
          )
        )}
      </main>
    </div>
  );
}

// --- MÓDULO DE AUTENTICAÇÃO ---
function AuthModule({ isRegistering, setIsRegistering, getProfile }) {
  const [role, setRole] = useState('cliente');
  const [form, setForm] = useState({ email: '', password: '', nome: '', telefone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email: form.email, 
          password: form.password 
        });
        if (authError) throw authError;

        if (authData?.user) {
          const { error: dbError } = await supabase.from('usuarios').insert([{
            id: authData.user.id,
            full_name: form.nome,
            telefone: form.telefone,
            role: role,
            plano_ativo: false
          }]);
          if (dbError) throw dbError;
          getProfile(authData.user.id);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: form.email, 
          password: form.password 
        });
        if (error) throw error;
      }
    } catch (err) {
      alert(err.message.includes("rate limit") ? "Muitas tentativas. Aguarde 15 min." : err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800">{isRegistering ? 'Criar Conta' : 'Acessar'}</h2>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {isRegistering && (
          <>
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button type="button" onClick={() => setRole('cliente')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${role === 'cliente' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>CLIENTE</button>
              <button type="button" onClick={() => setRole('profissional')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${role === 'profissional' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>PROFISSIONAL</button>
            </div>
            <div className="relative">
              <User className="absolute left-4 top-3 text-slate-300" size={18}/>
              <input required className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome Completo" onChange={e => setForm({...form, nome: e.target.value})}/>
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-3 text-slate-300" size={18}/>
              <input required className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="WhatsApp" onChange={e => setForm({...form, telefone: e.target.value})}/>
            </div>
          </>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-3 text-slate-300" size={18}/>
          <input required type="email" className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="E-mail" onChange={e => setForm({...form, email: e.target.value})}/>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-3 text-slate-300" size={18}/>
          <input required type="password" className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Senha" onChange={e => setForm({...form, password: e.target.value})}/>
        </div>
        
        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-blue-600 transition uppercase tracking-widest text-sm disabled:opacity-50">
          {isSubmitting ? 'AGUARDE...' : (isRegistering ? 'CONFIRMAR CADASTRO' : 'ENTRAR AGORA')}
        </button>
      </form>

      <div className="text-center mt-6">
        <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-black underline italic text-sm">
          {isRegistering ? 'Já tem conta? Login' : 'Novo por aqui? Criar Conta Grátis'}
        </button>
      </div>
    </div>
  );
}

// --- PAINEL PROFISSIONAL ---
function ProDashboard({ profile, onPay }) {
  if (!profile?.plano_ativo) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-blue-50">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><CreditCard size={32}/></div>
        <h2 className="text-3xl font-black mb-4">Perfil Offline</h2>
        <p className="text-slate-500 mb-8 italic text-lg">"Seu talento merece ser visto. Ative seu plano e comece a faturar."</p>
        <button onClick={onPay} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:shadow-blue-200 transition-all text-lg">ATIVAR PLANO PREMIUM (R$ 29,90)</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic text-slate-800">Olá, {profile.full_name}!</h1>
          <p className="text-green-600 font-bold flex items-center gap-2 mt-1"><CheckCircle size={16}/> Assinatura Ativa</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center bg-slate-50 px-6 py-3 rounded-2xl"><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Avaliação</p><p className="font-black text-xl italic text-blue-600">4.9</p></div>
          <div className="text-center bg-slate-50 px-6 py-3 rounded-2xl"><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Agendas</p><p className="font-black text-xl italic text-blue-600">12</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2 px-2 text-slate-700 uppercase tracking-widest text-sm"><Clock size={18}/> Solicitações do Dia</h3>
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center text-slate-400">
             <Calendar className="mx-auto mb-2 opacity-20" size={40} />
             <p>Nenhum agendamento para hoje.</p>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white">
          <h3 className="font-black mb-6 text-blue-400 uppercase tracking-widest text-xs">Configuração Rápida</h3>
          <div className="space-y-4">
            <button className="w-full flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition"><span className="text-sm font-bold italic">Gerenciar Horários</span><ChevronRight size={18}/></button>
            <button className="w-full flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition"><span className="text-sm font-bold italic">Alterar Foto de Capa</span><Camera size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PAINEL CLIENTE ---
function ClientDashboard({ profile }) {
  const [search, setSearch] = useState('');
  return (
    <div className="space-y-12 py-6 animate-in slide-in-from-bottom-5 duration-700">
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <h2 className="text-6xl font-black italic tracking-tighter text-slate-900 leading-none">Onde você vai <span className="text-blue-600">cortar hoje?</span></h2>
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition" />
          <input className="w-full py-6 pl-16 pr-8 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 border-none outline-none text-lg placeholder:italic" placeholder="Nome da barbearia..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500">
            <div className="h-48 bg-slate-200 relative">
              <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500" className="w-full h-full object-cover" alt="barbearia" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400"/> 4.8</div>
            </div>
            <div className="p-8">
              <h4 className="text-2xl font-black italic mb-2 text-slate-800">Studio Barber Premium</h4>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2 mb-6"><MapPin size={14} className="text-blue-600"/> Apenas 1.2km de distância</p>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition shadow-lg uppercase tracking-widest text-xs">Agendar Agora</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}