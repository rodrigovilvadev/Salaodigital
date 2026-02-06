import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import imgMao from './img/mao.jpg';
import imgMp from './img/mp.jpg';
import imgTes from './img/tes.jpg';
import { 
  Scissors, User, Calendar, MapPin, Star, CheckCircle2, LogOut, Bell, DollarSign, 

  ChevronLeft, ChevronRight, Check, Trash2, KeyRound, UserPlus, Eye, EyeOff, 

  CreditCard, Lock, Clock, CalendarDays, Sparkles, Palette, Briefcase, Edit3, 

  MessageCircle, Phone, XCircle, History, Loader2,

  Home, Plus, Camera // <--- ADICIONADOS AQUI

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
  // Verificação de segurança
  if (!bookingData.date || !bookingData.time) {
    alert("Por favor, selecione o dia e o horário.");
    return;
  }

  // Montamos o objeto final para o banco
  const payload = {
    ...bookingData,
    client: user.name, // Nome do cliente logado
    phone: user.phone  // O telefone que você salvou no Supabase em 'profiles'
  };

  // Chama a função do componente pai que faz o INSERT no Supabase
  onBookingSubmit(payload); 
  
  // Muda para a tela de sucesso
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
   {/* CARD DE BOAS-VINDAS */}
      <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-xl font-bold mb-4 italic">Olá, {user.name.split(' ')[0]}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView('booking')}>Novo Agendamento</Button>
          <Button variant="outline" className="text-white border-white/20" onClick={() => setView('history')}>Histórico</Button>
        </div>
      </div>

      {/* SEU CARROSSEL (AQUI ELE VOLTA A APARECER) */}
      <div className="mt-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Galeria</h3>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <div className="w-[280px] h-[200px] bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
            <img src={imgMao} alt="Mão" className="w-full h-full object-cover" />
          </div>
          <div className="w-[280px] h-[200px] bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
            <img src={imgMp} alt="Material" className="w-full h-full object-cover" />
          </div>
          <div className="w-[280px] h-[200px] bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
            <img src={imgTes} alt="Tesoura" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )}

  {/* --- TELA DE HISTÓRICO (FORA DA HOME) --- */}
  {view === 'history' && (
    <div className="space-y-4 animate-in slide-in-from-right">
      <button 
        onClick={() => setView('home')} 
        className="text-slate-400 font-bold text-sm mb-4 flex items-center gap-1"
      >
        ← Voltar
      </button>
      <h3 className="font-bold text-lg text-slate-900 mb-4">Meus Agendamentos</h3>
      
      {/* Lista de agendamentos (o filtro que corrigimos antes) */}
      {appointments.filter(a => String(a.client_id) === String(user.id)).length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
          Ainda não tem agendamentos.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments
            .filter(a => String(a.client_id) === String(user.id))
            .map(app => (
              <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="font-bold text-sm">{app.service_name}</p>
                <p className="text-xs text-slate-500">{app.date} às {app.time}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )}

        {view === 'booking' && (
          <div className="space-y-4 animate-in slide-in-from-right">
             <button onClick={() => setStep(step - 1)} className={`${step === 1 ? 'hidden' : 'block'} text-slate-400 font-bold text-sm mb-2`}>← Voltar</button>
            
            {/* PASSO 1: ESCOLHA DO SERVIÇO */}
            {step === 1 && (
                <>
                  <h3 className="font-bold text-lg mb-4">Escolha o Serviço</h3>
                  <div className="space-y-3">
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
                  </div>
                  <Button className="mt-4 w-full" onClick={() => setStep(2)} disabled={!bookingData.service}>Próximo</Button>
                </>
            )}

            {/* PASSO 2: ESCOLHA DO PROFISSIONAL (QUADRADINHOS) */}
            {step === 2 && (
                <>
                  <h3 className="font-bold text-lg mb-2">Escolha o Profissional</h3>
                  <p className="text-xs text-slate-400 mb-4">Mostrando preço para: <b>{bookingData.service?.name}</b></p>
                  
                  {processedBarbers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {processedBarbers.filter(b => b.my_services?.some(s => s.id === bookingData.service?.id)).map(b => {
                      
                        // Lógica para pegar o preço específico deste barbeiro para o serviço escolhido
                        const specificService = b.my_services?.find(s => s.id === bookingData.service?.id);
                        const displayPrice = specificService ? specificService.price : bookingData.service?.defaultPrice;

                        const isSelected = bookingData.barber?.id === b.id;

                        return (
                          <div 
                            key={b.id} 
                            onClick={() => setBookingData({...bookingData, barber: b, price: displayPrice})}
                            className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${isSelected ? 'border-slate-900 bg-slate-50' : 'border-white bg-white hover:border-slate-200'}`}
                          >
                            {/* Checkbox visual se selecionado */}
                            {isSelected && <div className="absolute top-2 right-2 w-3 h-3 bg-slate-900 rounded-full"></div>}

                           {/* Foto / Avatar - Priorizando Galeria */}
<div className="w-16 h-16 rounded-full bg-slate-200 mb-3 overflow-hidden border border-slate-100 shadow-inner">
  {(() => {
    // Pega a última foto do array de galeria, se existir
    const lastGalleryPhoto = b.photos && b.photos.length > 0 
      ? b.photos[b.photos.length - 1] 
      : null;
    
    // Define qual imagem mostrar (Prioridade: Galeria > Avatar > Nulo)
    const imageToShow = lastGalleryPhoto || b.avatar_url;

    return imageToShow ? (
      <img 
        src={imageToShow} 
        alt={b.name} 
        className="w-full h-full object-cover" 
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <User size={24}/>
      </div>
    );
  })()}
</div>
                            {/* Nome */}
                            <p className="font-bold text-slate-900 text-sm leading-tight mb-1 truncate w-full">{b.name}</p>

                            {/* --- NOVO: Endereço (Se existir) --- */}
                            {b.address && (
                                <p className="text-[9px] text-slate-500 leading-tight mb-1 line-clamp-2 px-1 w-full break-words">
                                    {b.address}
                                </p>
                            )}

                            {/* Distância */}
                            {b.distance !== null && (
                                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-2">
                                    <MapPin size={10}/> {b.distance} km
                                </p>
                            )}

                            {/* Preço do Serviço Escolhido */}
                            <div className="mt-auto pt-2 border-t border-slate-100 w-full">
                                <p className="text-green-600 font-black text-sm">R$ {displayPrice}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300">
                       <p className="text-slate-400">Nenhum profissional disponível na região.</p>
                    </div>
                  )}
                  <Button className="mt-6 w-full" onClick={() => setStep(3)} disabled={!bookingData.barber}>Próximo</Button>
                </>
            )}
{/* PASSO 3: DATA E HORA */}
{step === 3 && (
  <>
    <h3 className="font-bold text-lg mb-4">Data e Hora</h3>
    
    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Selecione um dia disponível</label>
    
    {/* Grade de Dias dinâmica baseada no que o barbeiro marcou */}
    <div className="grid grid-cols-7 gap-2 mb-6">
      {/* Dias da Semana (Cabeçalho) */}
      {['D','S','T','Q','Q','S','S'].map(d => (
        <div key={d} className="text-[10px] font-black text-slate-300 text-center py-1">{d}</div>
      ))}

      {/* Gerador de dias para Fevereiro/2026 */}
      {Array.from({ length: 28 }, (_, i) => {
        const dia = (i + 1).toString().padStart(2, '0');
        const dataFormatada = `2026-02-${dia}`;
        
        // SÓ PERMITE SE A DATA ESTIVER NO ARRAY available_dates DO BARBEIRO
        const isAvailable = bookingData.barber?.available_dates?.includes(dataFormatada);
        const isSelected = bookingData.date === dataFormatada;

        return (
          <button
            key={i}
            disabled={!isAvailable}
            onClick={() => setBookingData({...bookingData, date: dataFormatada, time: null})}
            className={`aspect-square flex flex-col items-center justify-center rounded-xl text-[11px] font-bold border transition-all
              ${isSelected 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                : isAvailable 
                  ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-400' 
                  : 'bg-slate-50 text-slate-200 border-transparent opacity-50 cursor-not-allowed'}`}
          >
            {i + 1}
            {isAvailable && !isSelected && <div className="w-1 h-1 bg-blue-500 rounded-full mt-0.5"></div>}
          </button>
        );
      })}
    </div>
    
    {/* SÓ MOSTRA OS HORÁRIOS SE O DIA ESTIVER SELECIONADO */}
    {bookingData.date ? (
      <>
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
          Horários para {bookingData.date.split('-').reverse().join('/')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {GLOBAL_TIME_SLOTS.map(t => {
            const isSlotAvailable = bookingData.barber?.available_slots?.includes(t) || !bookingData.barber?.available_slots?.length;
            
            return (
              <button 
                key={t} 
                disabled={!isSlotAvailable}
                onClick={() => setBookingData({...bookingData, time: t})} 
                className={`py-2 rounded-lg font-bold text-xs transition-all ${
                  bookingData.time === t ? 'bg-slate-900 text-white shadow-lg scale-105' : 
                  isSlotAvailable ? 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400' : 
                  'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </>
    ) : (
      <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
        <Calendar size={24} className="mx-auto text-slate-300 mb-2" />
        <p className="text-xs text-slate-400 font-bold">Selecione um dia acima primeiro</p>
      </div>
    )}

    {/* Resumo antes de confirmar */}
    {bookingData.time && bookingData.date && (
      <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 animate-in fade-in zoom-in duration-300">
        <p className="text-xs text-amber-600 font-bold uppercase mb-1">Resumo</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-900">{bookingData.service?.name}</span>
          <span className="font-bold text-slate-900">R$ {bookingData.price}</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Com {bookingData.barber?.name} às {bookingData.time}</p>
      </div>
    )}

    <Button 
  className="mt-6 w-full py-4 text-lg" 
  onClick={handleFinish} // <--- Certifique-se que o nome é handleFinish
  disabled={!bookingData.time || !bookingData.date}
>
  Confirmar Agendamento
</Button>
  </>
)}
          </div>
        )}
      </main>
    </div>
  );
};
// --- 5. BARBER DASHBOARD (Atualizado com Calendário) ---
const BarberDashboard = ({ user, appointments, onUpdateStatus, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isPaying, setIsPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [configDate, setConfigDate] = useState(new Date().toISOString().split('T')[0]);

  const myAppointments = appointments.filter(a => a.barberId === user.id && a.status !== 'rejected');
  const pending = myAppointments.filter(a => a.status === 'pending');
  const confirmed = myAppointments.filter(a => a.status === 'confirmed');
  const revenue = confirmed.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  // --- NOVA FUNÇÃO: TOGGLE DATA (Para o Calendário) ---
  const toggleDate = (date) => {
    const currentDates = user.available_dates || [];
    const newDates = currentDates.includes(date) 
      ? currentDates.filter(d => d !== date) 
      : [...currentDates, date].sort();
    
    // Utiliza sua função onUpdateProfile original
    onUpdateProfile({ ...user, available_dates: newDates });
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get('status');
    const paymentId = queryParams.get('payment_id');

    if (status === 'approved' && !user.plano_ativo) {
        alert('Pagamento confirmado! Bem-vindo ao plano Profissional.');
        onUpdateProfile({ ...user, plano_ativo: true, is_visible: true });
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'salaodigital.onrender.com';
      const response = await fetch(`${API_BASE_URL}/criar-pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          barberId: user.id,
          price: 29.90,
          title: "Plano Profissional Salao Digital"
        })
      });

      if (!response.ok) throw new Error("Erro ao gerar link de pagamento.");

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
         alert("Erro: Link de pagamento não retornado.");
      }
    } catch (error) {
      console.error("Erro de pagamento:", error);
      alert("Não foi possível conectar ao servidor de pagamento.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleToggleVisibility = () => {
    if (user.plano_ativo) {
      onUpdateProfile({ ...user, is_visible: !user.is_visible });
    } else if (!user.is_visible) {
      setShowPayModal(true);
    } else {
      onUpdateProfile({ ...user, is_visible: false });
    }
  };

  const toggleService = (serviceId, defaultPrice) => {
    const currentServices = user.my_services || [];
    const exists = currentServices.find(s => s.id === serviceId);
    let newServices = exists 
      ? currentServices.filter(s => s.id !== serviceId) 
      : [...currentServices, { id: serviceId, price: defaultPrice }];
    onUpdateProfile({ ...user, my_services: newServices });
  };

  const toggleSlot = (slot) => {
    const currentSlots = user.available_slots || [];
    const newSlots = currentSlots.includes(slot) 
      ? currentSlots.filter(s => s !== slot) 
      : [...currentSlots, slot].sort();
    onUpdateProfile({ ...user, available_slots: newSlots });
  };

  const updateServicePrice = (serviceId, newPrice) => {
    const newServices = (user.my_services || []).map(s => 
      s.id === serviceId ? { ...s, price: Number(newPrice) } : s
    );
    onUpdateProfile({ ...user, my_services: newServices });
  };
  const handleUploadPhoto = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Envia para o Storage
    const { error: uploadError } = await supabase.storage
      .from('barber-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Pega a URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('barber-photos')
      .getPublicUrl(filePath);

    // 3. Atualiza o perfil do barbeiro com a nova foto
    const currentPhotos = user.photos || [];
    onUpdateProfile({ ...user, photos: [...currentPhotos, publicUrl] });
    
    alert('Foto carregada com sucesso!');
  } catch (error) {
    alert('Erro ao carregar foto: ' + error.message);
  }
};


  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {showPayModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Ative seu Perfil</h2>
            <p className="text-slate-500 text-sm mb-6">Para ficar <b>Online</b> e receber agendamentos, é necessário assinar o plano profissional.</p>
            <div className="space-y-3">
              <button 
                className="w-full py-4 bg-green-500 text-white rounded-xl font-bold disabled:opacity-50" 
                onClick={handlePayment} 
                disabled={isPaying}
              >
                {isPaying ? "Carregando..." : "Pagar Mensalidade (R$ 29,90)"}
              </button>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 text-sm font-bold block w-full">Agora não</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900">Painel Profissional</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.is_visible ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <p className="text-xs text-slate-500 font-bold uppercase">{user.is_visible ? 'Online' : 'Offline'}</p>
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

           {/* Seção de Novas Solicitações */}
<section>
  <h3 className="font-bold text-slate-900 mb-4">Novas Solicitações</h3>
  {pending.length === 0 ? (
    <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
      Nenhum pedido pendente.
    </div>
  ) : (
    pending.map(app => (
      <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-slate-900">{app.client}</p>
            {/* Garantindo que a data apareça corretamente */}
            <p className="text-xs text-blue-600 font-bold">
              {app.time} - {app.date ? app.date.split('-').reverse().join('/') : 'Data não informada'}
            </p>
          </div>
          <p className="font-bold text-slate-900">R$ {app.price}</p>
        </div>

        <div className="flex gap-2">
          {/* Botão Aceitar com disparador de WhatsApp */}
          <button 
            onClick={() => {
    // 1. Atualiza o status no banco para 'confirmed'
    onUpdateStatus(app.id, 'confirmed');
    
    // 2. Prepara a data para a mensagem (Ex: 2026-02-10 -> 10/02/2026)
    const dataFormatada = app.date ? app.date.split('-').reverse().join('/') : 'a combinar';
    
    // 3. Monta a mensagem personalizada
    const mensagem = `Olá ${app.client}! Aqui é da barbearia. Seu agendamento para o dia *${dataFormatada}* às *${app.time}* foi *CONFIRMADO*! Te esperamos lá.`;
    onst [configDate, setConfigDate] = useState(new Date().toISOString().split('T')[0]);
    // 4. Pega o número da coluna 'phone' e limpa (deixa só números)
    // Usamos o opcional chaining ?. e toString() para evitar erros se o campo estiver nulo ou for numérico
    const fone = app.phone?.toString().replace(/\D/g, '');
    
    if (fone) {
      // Abre o WhatsApp com o DDI 55 (Brasil) + número limpo + mensagem
      const url = `https://api.whatsapp.com/send?phone=55${fone}&text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    } else {
      alert("Não foi possível encontrar o número (coluna 'phone') deste cliente no banco.");
    }
  }} 
  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
>
  <MessageCircle size={14} /> Aceitar e Avisar
</button>

          <button 
            onClick={() => onUpdateStatus(app.id, 'rejected')} 
            className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg text-xs font-bold"
          >
            Recusar
          </button>
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
              const userServiceData = user.my_services?.find(s => s.id === service.id);
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
                      <input 
                        type="number" 
                        value={userServiceData.price || ''} 
                        onChange={(e) => updateServicePrice(service.id, e.target.value)} 
                        className="w-20 text-right font-bold outline-none bg-transparent border-b border-transparent focus:border-slate-200"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {activeTab === 'config' && (
          <div className="space-y-6">
            
            {/* VISIBILIDADE DA LOJA */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Visibilidade da Loja</h3>
                  <p className="text-xs text-slate-500 mt-1">Aparecer para clientes na lista.</p>
                </div>
                <div onClick={handleToggleVisibility} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${user.is_visible ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.is_visible ? 'translate-x-6' : 'translate-x-0'}`}/>
                </div>
              </div>
            </div>

            {/* SEÇÃO DE CALENDÁRIO RETRÁTIL */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all">
              {/* Cabeçalho Clicável */}
              <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <CalendarDays size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-sm">Dias de Atendimento</h3>
                    <p className="text-[10px] text-slate-500">Selecione os dias disponíveis</p>
                  </div>
                </div>
                <ChevronRight 
                  size={18} 
                  className={`text-slate-400 transition-transform duration-300 ${showCalendar ? 'rotate-90' : ''}`} 
                />
              </button>

              {/* Conteúdo do Calendário */}
              {showCalendar && (
                <div className="p-5 pt-0 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-7 gap-1 mb-3 text-center text-[10px] font-black text-slate-300 uppercase tracking-wider">
                    {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="py-2">{d}</div>)}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }, (_, i) => {
                      const day = (i + 1).toString().padStart(2, '0');
                      const fullDate = `2026-02-${day}`; 
                      const isSelected = user.available_dates?.includes(fullDate);

                      return (
                        <button
                          key={i}
                          onClick={() => toggleDate(fullDate)}
                          className={`aspect-square flex items-center justify-center rounded-xl text-[11px] font-bold border transition-all
                            ${isSelected 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                    <p className="text-[9px] text-blue-700 font-medium text-center">
                      Os dias marcados em <b>preto</b> estarão visíveis para seus clientes agendarem.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SEUS HORÁRIOS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
                   <Clock size={18} className="text-blue-600" /> Seus Horários
                </h3>
                <div className="grid grid-cols-4 gap-2">
                {GLOBAL_TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => toggleSlot(slot)} className={`py-2 text-[10px] font-bold rounded-lg border ${user.available_slots?.includes(slot) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>
                        {slot}
                    </button>
                ))}
                </div>
            </div>

            {/* LOCALIZAÇÃO */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Home size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Localização</h3>
                  <p className="text-[10px] text-slate-500 truncate w-32">{user.address || 'Não definido'}</p>
                </div>
              </div>
              <button onClick={() => {
                const n = prompt("Endereço:", user.address || "");
                if (n !== null) onUpdateProfile({...user, address: n});
              }} className="p-2 bg-slate-100 rounded-full"><MapPin size={18}/></button>
            </div>

            {/* GALERIA DE FOTOS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-lg">Galeria</h3>
                <div className="relative">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-100">
                    <Plus size={16} /> Foto
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={handleUploadPhoto} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {user.photos?.map((url, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100">
                    <img src={url} className="w-full h-full object-cover" alt={`foto-${i}`} />
                  </div>
                ))}
              </div>
            </div>

          </div> 
        )}
        
      </main>
    </div>
  );
};
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

// --- FUNÇÃO DE CADASTRO (CORRIGIDO E COMPLETO) ---
  const handleRegister = async (name, phone, password) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        name, 
        phone, 
        password, 
        role: currentMode, 
        is_visible: false,
        has_access: false,
        my_services: [],
        available_slots: GLOBAL_TIME_SLOTS,
        // ADICIONADO: Inicia o array de datas vazio para o calendário funcionar
        available_dates: [], 
        avatar_url: '',
      }])
      .select()
      .single();

    if (error) {
      // Erro 23505 é o código do Postgres para "Unique Violation" (duplicidade)
      if (error.code === '23505') throw new Error('Este WhatsApp já está cadastrado!');
      throw new Error(error.message);
    }

    setUser(data);
  };
  // --- AGENDAMENTO NO BANCO (VERSÃO SINCRONIZADA COM A TABELA) ---
const handleBookingSubmit = async (data) => {
  const newBooking = {
    client_id: user.id,
    client_name: user.name,
    barber_id: data.barber.id,
    service_name: data.service.name,
    price: data.price,
    status: 'pending',
    
    // CORREÇÃO: Use os nomes EXATOS das colunas que aparecem na sua foto
    date: data.date,    // Antes era booking_date (por isso dava NULL)
    phone: data.phone,  // Adicionado para salvar o telefone no banco
    time: data.time     // Certifique-se que a coluna 'time' também existe
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
      // Mapeia para o estado local para o barbeiro ver na hora
      time: saved.time,
      date: saved.date,
      phone: saved.phone
    }]);
  } else {
    console.error("Erro detalhado:", error);
    alert("Erro ao agendar: " + (error?.message || "Erro de conexão"));
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