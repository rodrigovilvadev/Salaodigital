import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Calendar, MapPin, Star, CheckCircle2, LogOut, Bell, DollarSign, 
  ChevronLeft, ChevronRight, Check, Trash2, KeyRound, UserPlus, Eye, EyeOff, 
  CreditCard, Lock, Clock, CalendarDays, Sparkles, Palette, Briefcase, Edit3, 
  MessageCircle, Phone, XCircle, History 
} from 'lucide-react';

// --- 1. CONSTANTES E MOCKS ---
const MASTER_SERVICES = [
  { id: 1, name: 'Corte Degradê', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'hair' },
  { id: 2, name: 'Barba Terapia', defaultPrice: 40, duration: '30min', icon: <User size={20}/>, category: 'beard' },
  { id: 3, name: 'Combo Completo', defaultPrice: 80, duration: '1h 15min', icon: <Star size={20}/>, category: 'combo' },
  { id: 4, name: 'Luzes / Platinado', defaultPrice: 120, duration: '2h', icon: <Sparkles size={20}/>, category: 'chemical' },
  { id: 6, name: 'Design Sobrancelhas', defaultPrice: 35, duration: '30min', icon: <Eye size={20}/>, category: 'eyebrow' },
];

const GLOBAL_TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const INITIAL_BARBERS = [
  { 
    id: 101, name: 'Ricardo', phone: '11999990001', password: '123', role: 'Barber Master', 
    photo: 'https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=400', 
    rating: 5.0, distance: 1.2, hasAccess: true, isVisible: true,
    availableSlots: ['09:00', '10:00', '14:00', '15:00'],
    myServices: [{ id: 1, price: 60 }, { id: 2, price: 40 }] 
  }
];

const INITIAL_CLIENTS = [{ id: 201, name: 'Carlos Cliente', phone: '11999998888', password: '123', photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400' }];

// --- 2. COMPONENTES DE UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-black shadow-lg",
    secondary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-900",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, selected, onClick, className = "" }) => (
  <div onClick={onClick} className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${selected ? 'border-blue-600 bg-blue-50/50' : 'border-transparent bg-white shadow-sm hover:border-slate-200'} ${className}`}>
    {selected && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle2 size={18} fill="currentColor" className="text-white"/></div>}
    {children}
  </div>
);

// --- 3. TELAS (WELCOME E AUTH) ---
const WelcomeScreen = ({ onSelectMode }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 rotate-3"><Scissors size={40} className="text-white" /></div>
    <h1 className="text-4xl font-black text-white italic mb-2 tracking-tighter">SALÃO<span className="text-blue-500">DIGITAL</span></h1>
    <div className="w-full max-w-xs space-y-3 mt-10">
      <Button variant="secondary" onClick={() => onSelectMode('client')}>Sou Cliente</Button>
      <Button variant="outline" className="text-slate-300 border-white/10" onClick={() => onSelectMode('barber')}>Sou Profissional</Button>
    </div>
  </div>
);

const AuthScreen = ({ userType, onBack, onLogin, onRegister }) => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm"><ChevronLeft size={24} /></button>
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black text-center mb-6">{userType === 'barber' ? 'Área Profissional' : 'Área do Cliente'}</h2>
        <div className="space-y-4">
          {mode === 'register' && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Completo" className="w-full p-3 bg-slate-50 border rounded-xl" />}
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp" className="w-full p-3 bg-slate-50 border rounded-xl" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full p-3 bg-slate-50 border rounded-xl" />
          <Button onClick={() => mode === 'login' ? onLogin(phone, password) : onRegister(name, phone, password)}>
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </Button>
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-blue-600 font-bold text-sm">
            {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. DASHBOARD CLIENTE ---
const ClientApp = ({ user, barbers, onLogout, onBookingSubmit, appointments, onCancelBooking }) => {
  const [view, setView] = useState('home');
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({ service: null, barber: null, price: null, date: null, time: null });

  const activeBarbers = barbers.filter(b => b.hasAccess && b.isVisible);

  const handleFinish = () => {
    onBookingSubmit(bookingData);
    setView('success');
  };

  if (view === 'success') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
      <Check size={60} className="text-green-500 mb-4" />
      <h2 className="text-2xl font-bold mb-8">Agendamento Realizado!</h2>
      <Button onClick={() => {setView('home'); setStep(1);}}>Voltar ao Início</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white p-4 flex justify-between items-center border-b">
        <h1 className="font-black italic">SALÃO<span className="text-blue-600">DIGITAL</span></h1>
        <button onClick={onLogout} className="text-red-500 font-bold text-xs">Sair</button>
      </header>
      
      <main className="p-6 max-w-md mx-auto">
        {view === 'home' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl text-white">
              <h2 className="text-xl font-bold mb-4">Olá, {user.name}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setView('booking')}>Novo Agendamento</Button>
                <Button variant="outline" className="text-white border-white/20" onClick={() => setView('history')}>Meus Horários</Button>
              </div>
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="space-y-4">
            {step === 1 && (
              <>
                <h3 className="font-bold text-lg">Escolha o serviço:</h3>
                {MASTER_SERVICES.map(s => (
                  <Card key={s.id} selected={bookingData.service?.id === s.id} onClick={() => setBookingData({...bookingData, service: s})}>
                    <p className="font-bold">{s.name}</p>
                  </Card>
                ))}
                <Button onClick={() => setStep(2)} disabled={!bookingData.service}>Próximo</Button>
              </>
            )}
            {step === 2 && (
              <>
                <h3 className="font-bold text-lg">Escolha o Barbeiro:</h3>
                {activeBarbers.map(b => (
                  <Card key={b.id} selected={bookingData.barber?.id === b.id} onClick={() => setBookingData({...bookingData, barber: b, price: b.myServices.find(ms => ms.id === bookingData.service.id)?.price || bookingData.service.defaultPrice})}>
                    <p className="font-bold">{b.name}</p>
                  </Card>
                ))}
                <Button onClick={() => setStep(3)} disabled={!bookingData.barber}>Próximo</Button>
              </>
            )}
            {step === 3 && (
              <>
                <input type="date" className="w-full p-3 border rounded-xl" onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {GLOBAL_TIME_SLOTS.map(t => (
                    <button key={t} onClick={() => setBookingData({...bookingData, time: t})} className={`p-2 border rounded-lg ${bookingData.time === t ? 'bg-black text-white' : 'bg-white'}`}>{t}</button>
                  ))}
                </div>
                <Button className="mt-6" onClick={handleFinish} disabled={!bookingData.time || !bookingData.date}>Confirmar R$ {bookingData.price}</Button>
              </>
            )}
          </div>
        )}

        {view === 'history' && (
            <div className="space-y-3">
                <button onClick={() => setView('home')} className="mb-4 text-blue-600 font-bold flex items-center gap-1"><ChevronLeft size={16}/> Voltar</button>
                {appointments.filter(a => a.clientPhone === user.phone).map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl border">
                        <p className="font-bold">{a.service}</p>
                        <p className="text-sm text-slate-500">{a.date} às {a.time}</p>
                        <p className={`text-xs font-bold uppercase ${a.status === 'confirmed' ? 'text-green-600' : 'text-orange-500'}`}>{a.status}</p>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

// --- 5. DASHBOARD BARBEIRO ---
const BarberDashboard = ({ user, appointments, onUpdateStatus, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('home');
  
  const myApps = appointments.filter(a => a.barberId === user.id);
  const pending = myApps.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="font-black">Painel Profissional</h2>
          <p className="text-xs text-green-500 font-bold">● {user.isVisible ? 'ONLINE' : 'OFFLINE'}</p>
        </div>
        <button onClick={onLogout} className="p-2 bg-slate-100 rounded-full"><LogOut size={18}/></button>
      </header>

      <div className="flex bg-white border-b">
        <button onClick={() => setActiveTab('home')} className={`flex-1 p-4 font-bold ${activeTab === 'home' ? 'border-b-2 border-black' : ''}`}>Agenda</button>
        <button onClick={() => setActiveTab('config')} className={`flex-1 p-4 font-bold ${activeTab === 'config' ? 'border-b-2 border-black' : ''}`}>Config</button>
      </div>

      <main className="p-6">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <h3 className="font-bold">Pendentes ({pending.length})</h3>
            {pending.map(app => (
              <div key={app.id} className="bg-white p-4 rounded-2xl shadow-sm border">
                <p className="font-bold">{app.client}</p>
                <p className="text-sm">{app.service} - {app.time}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => onUpdateStatus(app.id, 'confirmed')} className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-bold">Aceitar</button>
                  <button onClick={() => onUpdateStatus(app.id, 'cancelled')} className="flex-1 bg-slate-100 py-2 rounded-lg text-xs font-bold">Recusar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'config' && (
            <div className="bg-white p-6 rounded-2xl border">
                <div className="flex justify-between items-center">
                    <span className="font-bold">Visibilidade</span>
                    <button onClick={() => onUpdateProfile({...user, isVisible: !user.isVisible})} className={`w-12 h-6 rounded-full relative transition-colors ${user.isVisible ? 'bg-green-500' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.isVisible ? 'right-1' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

// --- 6. ORQUESTRADOR PRINCIPAL (IMPORTANTE: EXPORT DEFAULT) ---
export default function App() {
  const [currentMode, setCurrentMode] = useState(null);
  const [user, setUser] = useState(null);

  const [barbers, setBarbers] = useState(() => JSON.parse(localStorage.getItem('barbers')) || INITIAL_BARBERS);
  const [clients, setClients] = useState(() => JSON.parse(localStorage.getItem('clients')) || INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState(() => JSON.parse(localStorage.getItem('appointments')) || []);

  useEffect(() => {
    localStorage.setItem('barbers', JSON.stringify(barbers));
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [barbers, clients, appointments]);

  const handleLogin = (phone, password) => {
    const list = currentMode === 'barber' ? barbers : clients;
    const found = list.find(u => u.phone === phone && u.password === password);
    found ? setUser(found) : alert('Erro no login');
  };

  const handleRegister = (name, phone, password) => {
    const newUser = { 
        id: Date.now(), name, phone, password, 
        photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        ...(currentMode === 'barber' ? { hasAccess: true, isVisible: true, myServices: [{id: 1, price: 50}], availableSlots: GLOBAL_TIME_SLOTS } : {})
    };
    currentMode === 'barber' ? setBarbers([...barbers, newUser]) : setClients([...clients, newUser]);
    setUser(newUser);
  };

  if (!currentMode) return <WelcomeScreen onSelectMode={setCurrentMode} />;
  if (!user) return <AuthScreen userType={currentMode} onBack={() => setCurrentMode(null)} onLogin={handleLogin} onRegister={handleRegister} />;

  return currentMode === 'barber' ? (
    <BarberDashboard user={user} appointments={appointments} onLogout={() => {setUser(null); setCurrentMode(null);}} 
      onUpdateStatus={(id, status) => setAppointments(appointments.map(a => a.id === id ? {...a, status} : a))}
      onUpdateProfile={(u) => { setUser(u); setBarbers(barbers.map(b => b.id === u.id ? u : b)); }}
    />
  ) : (
    <ClientApp user={user} barbers={barbers} appointments={appointments} onLogout={() => {setUser(null); setCurrentMode(null);}}
      onBookingSubmit={(data) => setAppointments([...appointments, { ...data, id: Date.now(), client: user.name, clientPhone: user.phone, status: 'pending', service: data.service.name, barberId: data.barber.id }])}
    />
  );
}