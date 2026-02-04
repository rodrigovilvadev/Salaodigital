import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Scissors, User, Calendar, MapPin, Star, CheckCircle2, LogOut, Bell, DollarSign, 
  ChevronLeft, ChevronRight, Check, Trash2, KeyRound, UserPlus, Eye, EyeOff, 
  CreditCard, Lock, Clock, CalendarDays, Sparkles, Palette, Briefcase, Edit3, 
  MessageCircle, Phone, XCircle, History, Loader2
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
const supabaseUrl = 'https://tqyqcviddzspyvyfcuqy.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeXFjdmlkZHpzcHl2eWZjdXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTEzNTAsImV4cCI6MjA4NTcyNzM1MH0.6z3DQb1HlVNp7Sxtyf45Q3XCFlxPTft6wltNBHVKiwI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. CONSTANTES E UTILITÁRIOS ---
const MASTER_SERVICES = [
  { id: 1, name: 'Corte Degradê', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'hair' },
  { id: 2, name: 'Barba Terapia', defaultPrice: 40, duration: '30min', icon: <User size={20}/>, category: 'beard' },
  { id: 3, name: 'Combo Completo', defaultPrice: 80, duration: '1h 15min', icon: <Star size={20}/>, category: 'combo' },
  { id: 4, name: 'Luzes / Platinado', defaultPrice: 120, duration: '2h', icon: <Sparkles size={20}/>, category: 'chemical' },
  { id: 6, name: 'Design Sobrancelhas', defaultPrice: 35, duration: '30min', icon: <Eye size={20}/>, category: 'eyebrow' },
];

const GLOBAL_TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

// Função para calcular distância (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); 
};

// --- 2. COMPONENTES DE UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled, loading }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-black shadow-lg",
    secondary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-900",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}>
      {loading ? <Loader2 className="animate-spin" size={20}/> : children}
    </button>
  );
};

const Card = ({ children, selected, onClick }) => (
  <div onClick={onClick} className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${selected ? 'border-blue-600 bg-blue-50/50' : 'border-transparent bg-white shadow-sm hover:border-slate-200'}`}>
    {selected && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle2 size={18} fill="currentColor" className="text-white"/></div>}
    {children}
  </div>
);

// --- 3. TELAS DE ACESSO ---
const WelcomeScreen = ({ onSelectMode }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 shadow-2xl shadow-blue-900/50">
        <Scissors size={40} className="text-white" />
    </div>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
        if (mode === 'login') await onLogin(phone, password);
        else await onRegister(name, phone, password);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm"><ChevronLeft size={24} /></button>
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black text-center mb-2">{userType === 'barber' ? 'Área Profissional' : 'Área do Cliente'}</h2>
        <p className="text-center text-slate-400 mb-6 text-sm">{mode === 'login' ? 'Faça login para continuar' : 'Crie sua conta agora'}</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-lg">{error}</div>}

        <div className="space-y-4">
          {mode === 'register' && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Completo" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" />}
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp (DDD + Número)" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" />
          
          <Button onClick={handleSubmit} loading={loading}>
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </Button>
          
          <button onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setError('')}} className="w-full text-blue-600 font-bold text-sm">
            {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. CLIENT APP (Com Geolocalização) ---
const ClientApp = ({ user, barbers, onLogout, onBookingSubmit, appointments }) => {
  const [view, setView] = useState('home');
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({ service: null, barber: null, price: null, date: null, time: null });
  const [userCoords, setUserCoords] = useState(null);

  // Captura localização ao entrar no fluxo de agendamento
  useEffect(() => {
    if (view === 'booking' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Sem GPS")
      );
    }
  }, [view]);

  // Filtra e ordena barbeiros por distância
  const processedBarbers = barbers
    .filter(b => b.is_visible)
    .map(b => ({
      ...b,
      distance: calculateDistance(userCoords?.lat, userCoords?.lng, b.latitude, b.longitude)
    }))
    .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
    });

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
      <header className="bg-white p-4 flex justify-between items-center border-b shadow-sm sticky top-0 z-20">
        <h1 className="font-black italic">SALÃO<span className="text-blue-600">DIGITAL</span></h1>
        <button onClick={onLogout} className="text-red-500 font-bold text-xs flex items-center gap-1"><LogOut size={14}/> Sair</button>
      </header>
      <main className="p-6 max-w-md mx-auto">
        {view === 'home' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
              <h2 className="text-xl font-bold mb-4 italic">Olá, {user.name.split(' ')[0]}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setView('booking')}>Novo Agendamento</Button>
                <Button variant="outline" className="text-white border-white/20" onClick={() => setView('history')}>Histórico</Button>
              </div>
            </div>
          </div>
        )}
        {view === 'booking' && (
          <div className="space-y-4 animate-in slide-in-from-right">
             <button onClick={() => setStep(step - 1)} className={`${step === 1 ? 'hidden' : 'block'} text-slate-400 font-bold text-sm mb-2`}>← Voltar</button>
             
             {step === 1 && (
               <>
                 <h3 className="font-bold text-lg mb-4">Escolha o Serviço</h3>
                 {MASTER_SERVICES.map(s => (
                   <Card key={s.id} selected={bookingData.service?.id === s.id} onClick={() => setBookingData({...bookingData, service: s})}>
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-100 rounded-lg">{s.icon}</div>
                         <div>
                             <p className="font-bold">{s.name}</p>
                             <p className="text-xs text-slate-400">{s.duration}</p>
                         </div>
                     </div>
                   </Card>
                 ))}
                 <Button className="mt-4" onClick={() => setStep(2)} disabled={!bookingData.service}>Próximo</Button>
               </>
             )}

             {step === 2 && (
               <>
                 <h3 className="font-bold text-lg mb-2">Escolha o Profissional</h3>
                 <p className="text-xs text-slate-400 mb-4">Ordenado por proximidade</p>
                 {processedBarbers.length > 0 ? processedBarbers.map(b => (
                   <Card key={b.id} selected={bookingData.barber?.id === b.id} onClick={() => setBookingData({...bookingData, barber: b, price: bookingData.service?.defaultPrice})}>
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold">{b.name}</p>
                            {b.distance !== null && (
                                <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                                    <MapPin size={10}/> {b.distance} km
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">Disponível</p>
                     </div>
                   </Card>
                 )) : <p className="text-slate-400">Nenhum profissional disponível.</p>}
                 <Button className="mt-4" onClick={() => setStep(3)} disabled={!bookingData.barber}>Próximo</Button>
               </>
             )}

             {step === 3 && (
               <>
                 <h3 className="font-bold text-lg mb-4">Data e Hora</h3>
                 <input type="date" className="w-full p-3 border rounded-xl mb-4" onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
                 <div className="grid grid-cols-3 gap-2">
                   {GLOBAL_TIME_SLOTS.map(t => (
                     <button key={t} onClick={() => setBookingData({...bookingData, time: t})} className={`p-2 border rounded-lg font-bold text-xs ${bookingData.time === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{t}</button>
                   ))}
                 </div>
                 <Button className="mt-6" onClick={handleFinish} disabled={!bookingData.time || !bookingData.date}>Finalizar Agendamento</Button>
               </>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- 5. BARBER DASHBOARD (Mantido igual) ---
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
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'salaodigital.onrender.com';

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
/// --- 6. ORQUESTRADOR PRINCIPAL ---
export default function App() {
  const [currentMode, setCurrentMode] = useState(null); 
  const [user, setUser] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // --- BUSCA DADOS DO BANCO ---
  useEffect(() => {
    const fetchData = async () => {
      // 1. Sempre busca barbeiros visíveis para a lista
      const { data: bData } = await supabase.from('profiles').select('*').eq('role', 'barber').eq('is_visible', true);
      if (bData) setBarbers(bData);

      if (!user) return;

      // 2. Busca Agendamentos vinculados ao usuário logado
      const { data: aData } = await supabase
        .from('appointments')
        .select('*')
        .or(`client_id.eq.${user.id},barber_id.eq.${user.id}`);
      
      if (aData) {
        const formatted = aData.map(a => ({
          ...a,
          client: a.client_name,
          service: a.service_name,
          time: a.booking_time,
          barberId: a.barber_id
        }));
        setAppointments(formatted);
      }
    };
    fetchData();
  }, [user]);

  // --- FUNÇÃO DE LOGIN (CORRIGIDO) ---
  const handleLogin = async (phone, password) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .eq('password', password)
      .eq('role', currentMode)
      .single();

    if (error || !data) throw new Error('Telefone ou senha incorretos.');
    setUser(data);
  };

  // --- FUNÇÃO DE CADASTRO (CORRIGIDO) ---
  const handleRegister = async (name, phone, password) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ 
      name, 
      phone, 
      password, 
      role: currentMode, 
      is_visible: false, // Começa offline até configurar e pagar
      has_access: false, // Precisa pagar para ativar
      my_services: [],   // Inicia vazio
      available_slots: GLOBAL_TIME_SLOTS, // Inicia com todos e ele remove os que não quer
      avatar_url: ''      // Campo para a foto
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Este WhatsApp já está cadastrado!');
    throw new Error(error.message);
  }
  setUser(data);
};

  // --- AGENDAMENTO NO BANCO (CORRIGIDO) ---
  const handleBookingSubmit = async (data) => {
    const newBooking = {
      client_id: user.id,
      client_name: user.name,
      barber_id: data.barber.id,
      service_name: data.service.name,
      booking_date: data.date,
      booking_time: data.time,
      price: data.price,
      status: 'pending'
    };

    const { data: saved, error } = await supabase
      .from('appointments')
      .insert([newBooking])
      .select()
      .single();

    if (!error && saved) {
      setAppointments(prev => [...prev, {
        ...saved,
        client: saved.client_name,
        service: saved.service_name,
        barberId: saved.barber_id,
        time: saved.booking_time
      }]);
    } else {
      alert("Erro ao agendar: " + error.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleUpdateProfile = async (updatedUser) => {
    const { error } = await supabase.from('profiles').update(updatedUser).eq('id', updatedUser.id);
    if (!error) setUser(updatedUser);
  };

  // --- RENDERIZAÇÃO ---
  if (!currentMode) return <WelcomeScreen onSelectMode={setCurrentMode} />;

  if (!user) return (
    <AuthScreen 
      userType={currentMode} 
      onBack={() => setCurrentMode(null)} 
      onLogin={handleLogin} 
      onRegister={handleRegister} 
    />
  );

  return currentMode === 'barber' ? (
  <BarberDashboard 
    user={user} 
    appointments={appointments} 
    onLogout={() => { setUser(null); setCurrentMode(null); }} 
    onUpdateStatus={handleUpdateStatus} // Aqui você vai adicionar a lógica de WhatsApp no Dashboard
    onUpdateProfile={handleUpdateProfile}
    MASTER_SERVICES={MASTER_SERVICES} // Passa os serviços globais para ele escolher
    GLOBAL_TIME_SLOTS={GLOBAL_TIME_SLOTS} // Passa os horários globais para ele escolher
  />
  ) : (
    <ClientApp 
      user={user} 
      barbers={barbers} 
      appointments={appointments} 
      onLogout={() => { setUser(null); setCurrentMode(null); }}
      onBookingSubmit={handleBookingSubmit}
    />
  );
}