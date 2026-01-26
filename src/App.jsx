import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Calendar, MapPin, Star, 
  CheckCircle2, LogOut, Bell, DollarSign, 
  ChevronLeft, ChevronRight, Check, Trash2, KeyRound, UserPlus,
  Eye, EyeOff, CreditCard, Lock, Clock, CalendarDays,
  Sparkles, Palette, Briefcase, Edit3, MessageCircle, Phone, XCircle, History
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO ÚNICA ---
const supabaseUrl = 'https://vqpbbodhhyvwtfvrpgrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGJib2RoaHl2d3RmdnJwZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE3NDksImV4cCI6MjA4NDc4Nzc0OX0.8Swb8y8YbzTtYuAEc9flAYyIGiYo5fNAqPQJvWqrZEs';

// Declare apenas UMA vez
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONSTANTES ---
const MASTER_SERVICES = [
  { id: 1, name: 'Corte Degradê', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/> },
  { id: 2, name: 'Barba Terapia', defaultPrice: 40, duration: '30min', icon: <User size={20}/> },
  { id: 3, name: 'Combo Completo', defaultPrice: 80, duration: '1h 15min', icon: <Star size={20}/> },
];

const GLOBAL_TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// --- COMPONENTES DE UI ---
const Button = ({ children, onClick, variant = 'primary', disabled, className = "" }) => {
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-black",
    secondary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-900",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E]",
    danger: "bg-red-50 text-red-500 hover:bg-red-100"
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick} 
      className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- TELA INICIAL ---
const WelcomeScreen = ({ onSelectMode }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
      <Scissors size={40} className="text-white" />
    </div>
    <h1 className="text-4xl font-black text-white italic mb-2">SALÃO<span className="text-blue-500">DIGITAL</span></h1>
    <p className="text-slate-400 mb-10">Agendamentos rápidos e profissionais.</p>
    <div className="w-full max-w-xs space-y-4">
      <Button variant="secondary" onClick={() => onSelectMode('client')}>Sou Cliente</Button>
      <Button variant="outline" className="text-white border-white/20" onClick={() => onSelectMode('barber')}>Sou Profissional</Button>
    </div>
  </div>
);

// --- APP PRINCIPAL ---
export default function App() {
  const [currentMode, setCurrentMode] = useState(null); // 'client' ou 'barber'
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth'); // 'auth', 'dashboard'
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar Barbeiros Ativos
  useEffect(() => {
    const fetchBarbers = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('tipo', 'barber')
        .eq('plano_ativo', true);
      if (data) setBarbers(data);
    };
    fetchBarbers();
  }, []);

  // Lógica de Login
  const handleLogin = async (phone, password) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('telefone', phone)
      .eq('senha', password)
      .single();

    if (data) {
      setUser(data);
      setView('dashboard');
    } else {
      alert("Telefone ou senha incorretos.");
    }
    setLoading(false);
  };

  // Lógica de Registro
  const handleRegister = async (name, phone, password) => {
    setLoading(true);
    const newUser = {
      nome: name,
      telefone: phone,
      senha: password,
      tipo: currentMode,
      plano_ativo: false,
      foto: 'https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=400',
      available_slots: GLOBAL_TIME_SLOTS,
      my_services: MASTER_SERVICES.map(s => ({ ...s, price: s.defaultPrice }))
    };

    const { error } = await supabase.from('usuarios').insert([newUser]);
    
    if (!error) {
      setUser(newUser);
      setView('dashboard');
    } else {
      alert("Erro ao cadastrar. Verifique se o número já existe.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setCurrentMode(null);
  };

  // --- RENDERIZAÇÃO DE TELAS ---
  if (!currentMode) return <WelcomeScreen onSelectMode={setCurrentMode} />;

  if (view === 'auth') return (
    <AuthScreen 
      userType={currentMode} 
      onBack={() => setCurrentMode(null)} 
      onLogin={handleLogin} 
      onRegister={handleRegister}
      loading={loading}
    />
  );

  return currentMode === 'barber' ? (
    <BarberDashboard 
      user={user} 
      appointments={appointments} 
      setAppointments={setAppointments}
      onLogout={handleLogout} 
    />
  ) : (
    <ClientDashboard 
      user={user} 
      barbers={barbers} 
      appointments={appointments}
      setAppointments={setAppointments}
      onLogout={handleLogout} 
    />
  );
}

// --- SUB-COMPONENTES (DASHBOARDS) ---

const AuthScreen = ({ userType, onBack, onLogin, onRegister, loading }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm"><ChevronLeft/></button>
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
        <div className="space-y-4">
          {!isLogin && (
            <input placeholder="Nome" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setName(e.target.value)} />
          )}
          <input placeholder="Telefone" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setPhone(e.target.value)} />
          <input type="password" placeholder="Senha" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setPassword(e.target.value)} />
          <Button onClick={() => isLogin ? onLogin(phone, password) : onRegister(name, phone, password)} disabled={loading}>
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </Button>
          <button className="w-full text-blue-600 font-bold" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BarberDashboard = ({ user, appointments, setAppointments, onLogout }) => {
  const [activeTab, setActiveTab] = useState('pedidos');

  const handlePayment = async () => {
    // Aqui chama o seu backend que você configurou
    const res = await fetch('https://salaodigital-api.onrender.com/criar-pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barberId: user.telefone, telefone: user.telefone })
    });
    const data = await res.json();
    if (data.init_point) window.location.href = data.init_point;
  };

  const handleAction = (id, status, clientPhone) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (status === 'confirmado') {
      window.open(`https://wa.me/55${clientPhone}?text=Olá, seu agendamento foi confirmado!`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* TRAVA DE PAGAMENTO */}
      {!user.plano_ativo && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl max-w-xs">
            <Lock className="mx-auto mb-4 text-amber-500" size={48} />
            <h2 className="text-xl font-bold mb-2">Perfil Inativo</h2>
            <p className="text-slate-500 mb-6">Pague a mensalidade para aparecer para os clientes.</p>
            <Button variant="secondary" onClick={handlePayment}>Pagar R$ 29,90</Button>
          </div>
        </div>
      )}

      <header className="bg-white p-6 border-b flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Olá, {user.nome}</h1>
          <p className="text-xs text-green-500 font-bold uppercase">Plano Ativo</p>
        </div>
        <button onClick={onLogout} className="text-slate-400"><LogOut/></button>
      </header>

      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <Button variant={activeTab === 'pedidos' ? 'primary' : 'outline'} onClick={() => setActiveTab('pedidos')}>Pedidos</Button>
          <Button variant={activeTab === 'config' ? 'primary' : 'outline'} onClick={() => setActiveTab('config')}>Configurações</Button>
        </div>

        {activeTab === 'pedidos' ? (
          <div className="space-y-4">
             {appointments.filter(a => a.barberPhone === user.telefone).map(app => (
               <div key={app.id} className="bg-white p-4 rounded-2xl shadow-sm border">
                  <p className="font-bold">{app.clientName}</p>
                  <p className="text-sm text-slate-500">{app.service} - {app.time}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" className="py-2" onClick={() => handleAction(app.id, 'confirmado', app.clientPhone)}>Aceitar</Button>
                    <Button variant="danger" className="py-2" onClick={() => handleAction(app.id, 'recusado')}>Recusar</Button>
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl text-center">
             <p className="text-slate-500">Escolha seus horários e serviços aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ClientDashboard = ({ user, barbers, appointments, setAppointments, onLogout }) => {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);

  const filteredBarbers = barbers.filter(b => 
    b.nome.toLowerCase().includes(search.toLowerCase())
  );

  const makeBooking = (barber) => {
    const newBooking = {
      id: Date.now(),
      clientName: user.nome,
      clientPhone: user.telefone,
      barberPhone: barber.telefone,
      service: 'Corte',
      time: '14:00',
      status: 'pendente'
    };
    setAppointments(prev => [...prev, newBooking]);
    setHistory(prev => [newBooking, ...prev]);
    alert("Solicitação enviada!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold italic">SALAO<span className="text-blue-600">DIGITAL</span></h1>
        <button onClick={onLogout}><LogOut size={20}/></button>
      </div>

      <div className="mb-8">
        <input 
          placeholder="Buscar barbeiro pelo nome..." 
          className="w-full p-4 rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-bold mb-4 flex items-center gap-2"><Scissors size={18}/> Profissionais</h2>
          <div className="grid gap-4">
            {filteredBarbers.map(b => (
              <div key={b.telefone} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <img src={b.foto} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-bold">{b.nome}</p>
                  <p className="text-xs text-slate-500">Aberto hoje</p>
                </div>
                <Button variant="secondary" className="w-24 py-2" onClick={() => makeBooking(b)}>Agendar</Button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold mb-4 flex items-center gap-2"><History size={18}/> Seu Histórico</h2>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="text-sm p-3 bg-white rounded-xl flex justify-between">
                <span>{h.service}</span>
                <span className="font-bold text-blue-600">{h.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};