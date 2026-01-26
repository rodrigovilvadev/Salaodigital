import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Briefcase, MapPin, Calendar, Clock, CheckCircle, 
  XCircle, MessageCircle, CreditCard, LogOut, Search, Star, Camera, Phone, Mail, Lock
} from 'lucide-react';

const supabase = createClient('SEU_SUPABASE_URL', 'SUA_ANON_KEY');
const API_URL = "https://salaodigital.onrender.com";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

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
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  }

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${API_URL}/criar-pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: session.user.id }) 
      });
      const data = await response.json();
      if (data.init_point) window.location.href = data.init_point;
    } catch (err) { alert("Erro ao gerar link de pagamento."); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 italic font-bold text-blue-600">SALAO DIGITAL...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <nav className="flex justify-between items-center px-8 py-5 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-black italic tracking-tighter text-blue-700">SALAO.DIGITAL</div>
        {session && (
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition">
            <LogOut size={18} /> Sair
          </button>
        )}
      </nav>

      {!session ? (
        <AuthForm isRegistering={isRegistering} setIsRegistering={setIsRegistering} />
      ) : (
        <div className="max-w-6xl mx-auto p-6">
          {profile?.role === 'profissional' ? (
            <ProDashboard profile={profile} onPay={handleCheckout} />
          ) : (
            <ClientDashboard profile={profile} />
          )}
        </div>
      )}
    </div>
  );
}

// --- FORMULÁRIO DE LOGIN / CADASTRO ---
function AuthForm({ isRegistering, setIsRegistering }) {
  const [formData, setFormData] = useState({ email: '', password: '', nome: '', telefone: '', role: 'cliente' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) return alert(authError.message);

      // Salva os dados adicionais na sua tabela 'usuarios'
      const { error: dbError } = await supabase.from('usuarios').insert([{
        id: authData.user.id,
        full_name: formData.nome,
        telefone: formData.telefone,
        role: formData.role,
        plano_ativo: false
      }]);

      if (dbError) alert("Erro ao salvar perfil: " + dbError.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) alert("Erro no login: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
      <h2 className="text-3xl font-black text-center mb-2">{isRegistering ? 'Criar Conta' : 'Entrar'}</h2>
      <p className="text-center text-slate-400 mb-8 text-sm">Preencha seus dados para continuar</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <>
            <div className="flex bg-slate-50 p-1 rounded-2xl mb-4">
              <button type="button" onClick={() => setFormData({...formData, role: 'cliente'})} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${formData.role === 'cliente' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>CLIENTE</button>
              <button type="button" onClick={() => setFormData({...formData, role: 'profissional'})} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${formData.role === 'profissional' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>PROFISSIONAL</button>
            </div>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-300" size={18}/>
              <input required placeholder="Nome Completo" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none" 
                onChange={e => setFormData({...formData, nome: e.target.value})}/>
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-slate-300" size={18}/>
              <input required placeholder="Telefone (WhatsApp)" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none"
                onChange={e => setFormData({...formData, telefone: e.target.value})}/>
            </div>
          </>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-slate-300" size={18}/>
          <input required type="email" placeholder="E-mail" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none"
            onChange={e => setFormData({...formData, email: e.target.value})}/>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-slate-300" size={18}/>
          <input required type="password" placeholder="Senha" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none"
            onChange={e => setFormData({...formData, password: e.target.value})}/>
        </div>
        
        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95">
          {isRegistering ? 'FINALIZAR CADASTRO' : 'ACESSAR CONTA'}
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm font-medium text-slate-400">
        {isRegistering ? 'Já tem conta?' : 'Não tem conta?'} 
        <span onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 cursor-pointer ml-1 font-bold underline">
          {isRegistering ? 'Faça login' : 'Cadastre-se'}
        </span>
      </p>
    </div>
  );
}

// --- DASHBOARD PROFISSIONAL ---
function ProDashboard({ profile, onPay }) {
  if (!profile?.plano_ativo) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-[3rem] border shadow-xl p-10">
        <CreditCard className="text-blue-600 mx-auto mb-6" size={48} />
        <h2 className="text-3xl font-black mb-4">Seu Perfil está Invisível</h2>
        <p className="text-slate-500 mb-8">Para aceitar solicitações e aparecer para clientes, ative sua assinatura mensal.</p>
        <button onClick={onPay} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition">
          ATIVAR AGORA - R$ 29,90
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black italic">Olá, {profile.full_name}</h1>
          <p className="text-green-600 text-sm font-bold flex items-center gap-1 mt-1">
            <CheckCircle size={14}/> Assinatura Premium Ativa
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase">Expira em</p>
          <p className="font-mono text-slate-700">25/02/2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar size={20} className="text-blue-600"/> Pedidos</h3>
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Cliente Exemplo</p>
              <p className="text-xs text-slate-400">Corte Social • 14:00</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white text-green-500 rounded-lg shadow-sm hover:bg-green-500 hover:text-white transition"><CheckCircle size={18}/></button>
              <a href={`https://wa.me/${profile.telefone}`} className="p-2 bg-green-500 text-white rounded-lg shadow-sm"><MessageCircle size={18}/></a>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Camera size={20} className="text-blue-600"/> Meu Perfil</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl border-4 border-white shadow-md flex items-center justify-center">
               <Camera size={24} className="text-slate-300"/>
            </div>
            <button className="text-sm font-bold text-blue-600 underline">Alterar Foto</button>
          </div>
          <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">Gerenciar Horários</button>
        </div>
      </div>
    </div>
  );
}

// --- DASHBOARD CLIENTE ---
function ClientDashboard({ profile }) {
  const [search, setSearch] = useState('');
  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-5xl font-black tracking-tighter italic">Olá, {profile?.full_name?.split(' ')[0]}!</h2>
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
          <input className="w-full py-6 pl-16 pr-6 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-50 border-none outline-none text-lg" 
            placeholder="Buscar por nome ou distância..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <section className="bg-slate-900 text-white p-10 rounded-[3rem]">
        <h3 className="text-xl font-bold mb-6">Histórico (Apenas Visual)</h3>
        <div className="space-y-4 opacity-60 italic">
          <div className="flex justify-between border-b border-white/10 pb-2"><span>Corte de Cabelo</span><span>Ontem</span></div>
          <div className="flex justify-between border-b border-white/10 pb-2"><span>Barba e Bigode</span><span>12 Jan</span></div>
        </div>
      </section>
    </div>
  );
}