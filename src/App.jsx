import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Importe do arquivo que corrigimos
import { 
  Scissors, User, Calendar, MapPin, Star, CheckCircle2, 
  LogOut, Bell, DollarSign, ChevronLeft, ChevronRight, 
  Check, Trash2, KeyRound, UserPlus, Eye, EyeOff, 
  CreditCard, Lock, Clock, CalendarDays, Sparkles, 
  Palette, Briefcase, Edit3, MessageCircle, Phone, 
  XCircle, History 
} from 'lucide-react';



// --- CONSTANTES E DADOS MOCKADOS ---

const MASTER_SERVICES = [
  { id: 1, name: 'Corte Degradê', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'hair' },
  { id: 2, name: 'Barba Terapia', defaultPrice: 40, duration: '30min', icon: <User size={20}/>, category: 'beard' },
  { id: 3, name: 'Combo Completo', defaultPrice: 80, duration: '1h 15min', icon: <Star size={20}/>, category: 'combo' },
  { id: 4, name: 'Luzes / Platinado', defaultPrice: 120, duration: '2h', icon: <Sparkles size={20}/>, category: 'chemical' },
  { id: 5, name: 'Pintar / Tintura', defaultPrice: 90, duration: '1h', icon: <Palette size={20}/>, category: 'chemical' },
  { id: 6, name: 'Design Sobrancelhas', defaultPrice: 35, duration: '30min', icon: <Eye size={20}/>, category: 'eyebrow' },
];

const GLOBAL_TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const INITIAL_BARBERS = [
  { 
    id: 101, 
    name: 'Ricardo', 
    phone: '11999990001', 
    password: '123', 
    role: 'Barber Master', 
    photo: 'https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=400', 
    rating: 5.0, 
    distance: 1.2,
    hasAccess: true, 
    isVisible: true, 
    availableSlots: ['09:00', '10:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    myServices: [{ id: 1, price: 60 }, { id: 2, price: 40 }, { id: 3, price: 90 }] 
  },
  { 
    id: 102, 
    name: 'André', 
    phone: '11999990002',
    password: '123',
    role: 'Pro Barber', 
    photo: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400', 
    rating: 4.8, 
    distance: 4.5,
    hasAccess: true, 
    isVisible: true,
    availableSlots: ['13:00', '14:00', '15:00', '16:00', '17:00'],
    myServices: [{ id: 1, price: 45 }, { id: 2, price: 35 }]
  }
];

const INITIAL_CLIENTS = [
  {
    id: 201,
    name: 'Carlos Cliente',
    phone: '11999998888',
    password: '123',
    photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400'
  }
];

// --- COMPONENTES UI REUTILIZÁVEIS ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/20",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-lg shadow-green-500/20",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, selected, onClick, className = "" }) => (
  <div 
    onClick={onClick}
    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${selected ? 'border-blue-600 bg-blue-50/50' : 'border-transparent bg-white shadow-sm hover:border-slate-200'} ${className}`}
  >
    {selected && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle2 size={18} fill="currentColor" className="text-white"/></div>}
    {children}
  </div>
);

// --- TELAS DO SISTEMA ---

const WelcomeScreen = ({ onSelectMode }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 rotate-3 hover:rotate-6 transition-transform">
      <Scissors size={40} className="text-white" />
    </div>
    <h1 className="text-4xl font-black text-white italic mb-2 tracking-tighter">SALÃO<span className="text-blue-500">DIGITAL</span></h1>
    <p className="text-slate-400 mb-10 max-w-xs">Agendamentos online simplificados.</p>
    
    <div className="w-full max-w-xs space-y-3">
      <Button variant="secondary" onClick={() => onSelectMode('client')}>Sou Cliente</Button>
      <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20" onClick={() => onSelectMode('barber')}>Sou Profissional</Button>
    </div>
  </div>
);

const AuthScreen = ({ userType, onBack, onLogin, onRegister }) => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (mode === 'login') onLogin(phone, password);
    else onRegister(name, phone, password);
  };

  const isFormValid = mode === 'login' ? (phone && password) : (name && phone && password);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-900">
        <ChevronLeft size={24} />
      </button>

      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">
          {userType === 'barber' ? 'Área Profissional' : 'Área do Cliente'}
        </h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          {mode === 'login' ? 'Entre com seu telefone' : 'Crie sua conta gratuitamente'}
        </p>

        <div className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={20}/>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"/>
              </div>
            </div>
          )}
           
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">WhatsApp / Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-slate-400" size={20}/>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="(11) 99999-9999" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={20}/>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"/>
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={!isFormValid}>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</Button>
          <div className="text-center mt-4">
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setName(''); setPhone(''); setPassword(''); }} className="text-blue-600 font-bold text-sm hover:underline mt-1">
              {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD DO BARBEIRO ---

const BarberDashboard = ({ user, appointments, onUpdateStatus, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isPaying, setIsPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Verifica se o usuário retornou do Mercado Pago com sucesso
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get('status');
    const paymentId = queryParams.get('payment_id');

    if (status === 'approved' && !user.hasAccess) {
        // Atualiza o perfil para pago se detectar o parâmetro na URL
        alert('Pagamento confirmado! Bem-vindo ao plano Profissional.');
        onUpdateProfile({ ...user, hasAccess: true, isVisible: true });
        
        // Limpa a URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      // URL base do seu backend (ajuste conforme necessário)
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';

      const response = await fetch(`${API_BASE_URL}/criar-pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          barberId: user.id,
          price: 29.90,
          title: "Plano Profissional SalaoDigital"
        })
      });

      if (!response.ok) {
         throw new Error("Erro ao gerar link de pagamento.");
      }

      const data = await response.json();
      if (data.init_point) {
        // Redireciona para o Mercado Pago
        window.location.href = data.init_point;
      } else {
         alert("Erro: Link de pagamento não retornado.");
      }
    } catch (error) {
      console.error("Erro de pagamento:", error);
      alert("Não foi possível conectar ao servidor de pagamento. Verifique se o server.js está rodando.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleToggleVisibility = () => {
    if (!user.hasAccess && !user.isVisible) {
      setShowPayModal(true);
    } else {
      onUpdateProfile({ ...user, isVisible: !user.isVisible });
    }
  };

  const toggleService = (serviceId, defaultPrice) => {
    const currentServices = user.myServices || [];
    const exists = currentServices.find(s => s.id === serviceId);
    let newServices = exists 
      ? currentServices.filter(s => s.id !== serviceId) 
      : [...currentServices, { id: serviceId, price: defaultPrice }];
    onUpdateProfile({ ...user, myServices: newServices });
  };

  const updateServicePrice = (serviceId, newPrice) => {
    const newServices = (user.myServices || []).map(s => 
      s.id === serviceId ? { ...s, price: Number(newPrice) } : s
    );
    onUpdateProfile({ ...user, myServices: newServices });
  };

  const toggleSlot = (slot) => {
    const currentSlots = user.availableSlots || [];
    const newSlots = currentSlots.includes(slot) 
      ? currentSlots.filter(s => s !== slot) 
      : [...currentSlots, slot].sort();
    onUpdateProfile({ ...user, availableSlots: newSlots });
  };

  const myAppointments = appointments.filter(a => a.barberId === user.id && a.status !== 'cancelled');
  const pending = myAppointments.filter(a => a.status === 'pending');
  const confirmed = myAppointments.filter(a => a.status === 'confirmed');
  const revenue = confirmed.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* MODAL DE PAGAMENTO SOBREPOSTO */}
      {showPayModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Ative seu Perfil</h2>
            <p className="text-slate-500 text-sm mb-6">Para ficar <b>Online</b> e receber agendamentos, é necessário assinar o plano profissional.</p>
            <div className="space-y-3">
              <Button variant="success" className="w-full py-4" onClick={handlePayment} disabled={isPaying}>
                {isPaying ? "Carregando..." : "Pagar Mensalidade (R$ 29,90)"}
              </Button>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 text-sm font-bold">Agora não</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900">Painel Profissional</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.isVisible ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <p className="text-xs text-slate-500 font-bold uppercase">{user.isVisible ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500"><LogOut size={18}/></button>
        </div>
      </header>

      <div className="px-6 py-4 flex gap-2 overflow-x-auto bg-white border-b border-slate-100">
        <button onClick={() => setActiveTab('home')} className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Início</button>
        <button onClick={() => setActiveTab('services')} className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Serviços</button>
        <button onClick={() => setActiveTab('config')} className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Ajustes</button>
      </div>

      <main className="p-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white p-5 rounded-2xl">
                <p className="text-slate-400 text-[10px] font-bold uppercase">Ganhos</p>
                <p className="text-xl font-bold">R$ {revenue}</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl">
                <p className="text-slate-400 text-[10px] font-bold uppercase">Pendentes</p>
                <p className="text-xl font-bold text-slate-900">{pending.length}</p>
              </div>
            </div>

            <section>
              <h3 className="font-bold text-slate-900 mb-4">Novas Solicitações</h3>
              {pending.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">Nenhum pedido pendente.</div>
              ) : (
                pending.map(app => (
                  <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold">{app.client}</p>
                        <p className="text-xs text-blue-600 font-bold">{app.time} - {app.date.split('-').reverse().join('/')}</p>
                      </div>
                      <p className="font-bold">R$ {app.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onUpdateStatus(app.id, 'confirmed')} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold">Aceitar</button>
                      <button onClick={() => onUpdateStatus(app.id, 'rejected')} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg text-xs font-bold">Recusar</button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-3">
            {MASTER_SERVICES.map(service => {
              const userServiceData = user.myServices?.find(s => s.id === service.id);
              const isActive = !!userServiceData;
              return (
                <div key={service.id} className={`p-4 rounded-2xl border-2 transition-all ${isActive ? 'border-slate-900 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleService(service.id, service.defaultPrice)}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>{service.icon}</div>
                      <div>
                        <p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{service.name}</p>
                        <p className="text-[10px] text-slate-400">{service.duration}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${isActive ? 'bg-green-500 border-green-500' : 'border-slate-300'}`} />
                  </div>
                  {isActive && (
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">PREÇO (R$)</span>
                      <input type="number" value={userServiceData.price} onChange={(e) => updateServicePrice(service.id, e.target.value)} className="w-20 text-right font-bold outline-none"/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Visibilidade da Loja</h3>
                  <p className="text-xs text-slate-500 mt-1">Aparecer para clientes na lista.</p>
                </div>
                <div onClick={handleToggleVisibility} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${user.isVisible ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.isVisible ? 'translate-x-6' : 'translate-x-0'}`}/>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 text-sm">Seus Horários</h3>
                <div className="grid grid-cols-4 gap-2">
                {GLOBAL_TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => toggleSlot(slot)} className={`py-2 text-[10px] font-bold rounded-lg border ${user.availableSlots?.includes(slot) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>
                        {slot}
                    </button>
                ))}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- APP DO CLIENTE ---

const ClientApp = ({ user, barbers, onLogout, onBookingSubmit, appointments, onCancelBooking }) => {
  const [view, setView] = useState('home');
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({ service: null, barber: null, price: null, date: null, time: null });

  const availableBarbers = barbers.filter(b => {
    // Só mostra barbeiros que pagaram e estão visíveis
    const isPaying = b.hasAccess === true;
    const isOnline = b.isVisible === true;
    const hasService = bookingData.service ? b.myServices?.some(s => s.id === bookingData.service.id) : true;
    return isPaying && isOnline && hasService;
  });

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);
  
  const submitBooking = () => {
    onBookingSubmit({
        ...bookingData,
        clientPhone: user.phone
    });
    setView('success');
  };

  const resetFlow = () => {
    setBookingData({ service: null, barber: null, price: null, date: null, time: null });
    setStep(1);
    setView('home');
  };

  const getOccupiedSlots = (barberId, date) => {
    return appointments
      .filter(app => app.barberId === barberId && app.date === date && app.status !== 'cancelled')
      .map(app => app.time);
  };

  const getBarberPrice = (barber) => {
      if (!bookingData.service) return 0;
      const serviceData = barber.myServices.find(s => s.id === bookingData.service.id);
      return serviceData ? serviceData.price : 0;
  };

  const myActiveAppointments = appointments.filter(a => a.clientPhone === user.phone && a.status !== 'cancelled');

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30">
          <Check size={40} className="text-white" strokeWidth={4} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h2>
        <p className="text-slate-500 mb-8 max-w-xs">
            Agendamento confirmado. Valor a pagar no local: <span className="font-bold text-slate-900">R$ {bookingData.price}</span>.
        </p>
        <Button onClick={resetFlow} variant="primary">Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-2">
          {view === 'booking' && step > 1 ? (
            <button onClick={handlePrevStep} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20}/></button>
          ) : view === 'booking' || view === 'appointments' ? (
             <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20}/></button>
          ) : (
             <div className="w-9 h-9"></div> 
          )}
          <h1 className="font-black text-lg italic tracking-tight">SALÃO<span className="text-blue-600">DIGITAL</span></h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={onLogout} className="text-xs font-bold text-slate-400 hover:text-red-500">Sair</button>
            <img src={user.photo} className="w-9 h-9 rounded-full border border-slate-200" alt="Avatar"/>
        </div>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'home' && (
            <div className="animate-in slide-in-from-bottom-4">
              <div className="bg-slate-900 rounded-3xl p-6 text-white mb-8 shadow-xl relative overflow-hidden">
                 <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Olá, {user.name.split(' ')[0]}</h2>
                    <p className="text-slate-400 text-sm mb-6">Visual novo hoje?</p>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setView('booking'); setStep(1); }}>Agendar Novo</Button>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setView('appointments')}>Meus Horários</Button>
                    </div>
                 </div>
                 <Scissors className="absolute -bottom-4 -right-4 text-white/5 rotate-12" size={120} />
              </div>

              <h3 className="font-bold text-slate-800 mb-4">Serviços Populares</h3>
              <div className="space-y-3">
                 {MASTER_SERVICES.slice(0,3).map(s => (
                   <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                       <div className="p-3 bg-slate-50 text-slate-900 rounded-lg">{s.icon}</div>
                       <div className="flex-1">
                           <p className="font-bold text-slate-900">{s.name}</p>
                           <p className="text-xs text-slate-500">{s.duration}</p>
                       </div>
                       <p className="font-bold text-slate-400 text-xs">A partir de R$ {s.defaultPrice}</p>
                   </div>
                 ))}
              </div>
            </div>
        )}

        {view === 'appointments' && (
            <div className="animate-in slide-in-from-right-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Meus Agendamentos</h2>
                {myActiveAppointments.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                        <Calendar className="mx-auto mb-2 opacity-20" size={32}/>
                        <p className="text-sm">Nenhum agendamento futuro.</p>
                    </div>
                ) : (
                    myActiveAppointments.map(app => (
                        <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className={`absolute top-0 left-0 w-1 h-full ${app.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                             <div className="flex justify-between items-start mb-4 pl-2">
                                <div>
                                    <h3 className="font-bold text-slate-900">{app.service}</h3>
                                    <p className="text-sm text-slate-500">com {barbers.find(b => b.id === app.barberId)?.name}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-slate-700 text-sm font-medium mb-4 pl-2">
                                <CalendarDays size={16} className="text-blue-500"/>
                                {app.date.split('-').reverse().join('/')} às {app.time}
                             </div>
                             <Button variant="danger" className="py-2 text-sm" onClick={() => onCancelBooking(app.id)}>
                                 <Trash2 size={16} /> Cancelar Agendamento
                             </Button>
                        </div>
                    ))
                )}
            </div>
        )}

        {view === 'booking' && (
          <div className="animate-in slide-in-from-right-8">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Qual o serviço?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {MASTER_SERVICES.map(s => (
                    <Card key={s.id} selected={bookingData.service?.id === s.id} onClick={() => setBookingData({...bookingData, service: s})}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${bookingData.service?.id === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{s.icon}</div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.duration}</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300"/>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="pt-4"><Button onClick={handleNextStep} disabled={!bookingData.service}>Continuar</Button></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Escolha o Profissional</h2>
                <div className="grid grid-cols-1 gap-3">
                  {availableBarbers.map(barber => {
                      const price = getBarberPrice(barber);
                      return (
                         <Card key={barber.id} selected={bookingData.barber?.id === barber.id} onClick={() => setBookingData({...bookingData, barber: barber, price: price})}>
                           <div className="flex items-center gap-4">
                             <img src={barber.photo} className="w-12 h-12 rounded-full object-cover border border-slate-200" alt={barber.name}/>
                             <div className="flex-1">
                               <p className="font-bold text-slate-900">{barber.name}</p>
                               <div className="flex items-center gap-2">
                                 <span className="text-xs text-slate-500 flex items-center gap-1"><Star size={10} fill="currentColor" className="text-yellow-400"/> {barber.rating}</span>
                                 <span className="text-xs text-slate-400">• {barber.distance}km</span>
                               </div>
                             </div>
                             <div className="text-right">
                                 <p className="font-black text-slate-900">R$ {price}</p>
                             </div>
                           </div>
                         </Card>
                      )
                  })}
                  {availableBarbers.length === 0 && (
                      <div className="text-center p-8 text-slate-500">Nenhum profissional disponível para este serviço no momento.</div>
                  )}
                </div>
                <div className="pt-4"><Button onClick={handleNextStep} disabled={!bookingData.barber}>Continuar</Button></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                 <h2 className="text-2xl font-bold text-slate-900">Data e Hora</h2>
                 <input type="date" className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 mb-4" onChange={(e) => setBookingData({...bookingData, date: e.target.value})}/>
                 
                 {bookingData.date && (
                    <div className="grid grid-cols-4 gap-2 animate-in fade-in">
                       {GLOBAL_TIME_SLOTS.map(slot => {
                           const occupied = getOccupiedSlots(bookingData.barber.id, bookingData.date);
                           const isOccupied = occupied.includes(slot);
                           const isAvailable = bookingData.barber.availableSlots.includes(slot);
                           
                           if(!isAvailable) return null;

                           return (
                               <button 
                                key={slot} 
                                disabled={isOccupied}
                                onClick={() => setBookingData({...bookingData, time: slot})}
                                className={`py-3 text-sm font-bold rounded-xl border transition-all ${
                                    isOccupied 
                                    ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed decoration-slice line-through' 
                                    : bookingData.time === slot 
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                }`}
                               >
                                   {slot}
                               </button>
                           )
                       })}
                    </div>
                 )}
                 <div className="pt-4"><Button onClick={handleNextStep} disabled={!bookingData.date || !bookingData.time}>Continuar</Button></div>
              </div>
            )}

            {step === 4 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900">Confirmar</h2>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500">Serviço</span>
                            <span className="font-bold text-slate-900">{bookingData.service?.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500">Profissional</span>
                            <span className="font-bold text-slate-900">{bookingData.barber?.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500">Data e Hora</span>
                            <span className="font-bold text-slate-900">{bookingData.date.split('-').reverse().join('/')} às {bookingData.time}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500">Total</span>
                            <span className="text-2xl font-black text-slate-900">R$ {bookingData.price}</span>
                        </div>
                    </div>
                    <Button onClick={submitBooking} variant="success">Confirmar Agendamento</Button>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (ORQUESTRADOR) -
export default function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'client' ou 'barber'
  
  // --- NOVO: Carregar usuário do Banco de Dados ao iniciar ---
  useEffect(() => {
    const sessionUser = localStorage.getItem('usuario_logado');
    if (sessionUser) {
      const parsedUser = JSON.parse(sessionUser);
      // Busca dados atualizados do Supabase (para checar se o plano foi ativo)
      const fetchUser = async () => {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('barber_id', parsedUser.barber_id || parsedUser.id)
          .single();

        if (data) {
          setUser({ ...parsedUser, ...data, hasAccess: data.plano_ativo });
          setUserType(data.tipo || 'barber');
        }
      };
      fetchUser();
    }
  }, []);

  // --- Função de Registro Atualizada ---
  const handleRegister = async (name, phone, password) => {
    const barberId = `barber_${Date.now()}`;
    
    // 1. Salva no Supabase imediatamente
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        { 
          barber_id: barberId, 
          telefone: phone, 
          nome: name, 
          plano_ativo: false,
          tipo: userType 
        }
      ]);

    if (!error) {
      const newUser = { id: barberId, name, phone, hasAccess: false };
      setUser(newUser);
      localStorage.setItem('usuario_logado', JSON.stringify(newUser));
    } else {
      alert("Erro ao criar conta no banco de dados.");
    }
  };

  // ... restante do seu código (WelcomeScreen, AuthScreen, etc)
}