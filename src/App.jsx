import React, { useState, useEffect, useMemo } from 'react';

import { createClient } from '@supabase/supabase-js';
import imgMao from './img/mao.jpg';
import imgMp from './img/mp.jpg';
import imgTes from './img/tes.jpg';

// 2. Remova o useMemo desta lista abaixo
import { 
  Scissors, User, Calendar, MapPin, Star, CheckCircle2, LogOut, Bell, DollarSign, 
  ChevronLeft, ChevronRight, Check, Trash2, KeyRound, UserPlus, Eye, EyeOff, 
  CreditCard, Lock, Clock, CalendarDays, Sparkles, Palette, Briefcase, Edit3, 
  MessageCircle, Phone, XCircle, History, Loader2,
  Home, Plus, Camera,
  CheckCircle, ArrowLeft 
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
 { id: 7, name: 'Nail design', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'nail' },
  { id: 8, name: 'Manicure/Pedicure', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'foot' },
  { id: 9, name: 'Limpeza facial', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'face' },
  { id: 10, name: 'Massagem e drenagem', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'dren' },
  { id: 11, name: 'Designer sobrancelha', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'desig' },
  { id: 12, name: 'Lash design', defaultPrice: 50, duration: '45min', icon: <Scissors size={20}/>, category: 'lash' },
];

const GLOBAL_TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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

 useEffect(() => {
  const interval = setInterval(() => {
    // Chame aqui as funções que buscam dados do banco
    fetchBarbers(); 
    fetchAppointments();
    console.log("Dados atualizados silenciosamente!");
  }, 30000); // 30 segu

  // Limpa o intervalo se o componente for desmontado para evitar vazamento de memória
  return () => clearInterval(interval);
}, []);

  // Captura localização ao entrar no fluxo de agendamento
 const processedBarbers = useMemo(() => {
  return (barbers || [])
    .filter(b => b.is_visible)
    .map(b => {
      // Chamada da função de cálculo que está no topo do App.js
      const dist = calculateDistance(
        userCoords?.lat, 
        userCoords?.lng, 
        b.latitude, 
        b.longitude
      );
      
      return {
        ...b,
        distance: dist
      };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}, [barbers, userCoords]);

const handleFinish = async () => {
  try {
    // 1. Verificações preventivas com alertas claros
    if (!bookingData.date || !bookingData.time) {
      alert("Por favor, selecione o dia e o horário antes de confirmar.");
      return;
    }

    // 2. Criamos o payload com segurança (usando ?. e ||)
    // Se o user.id não existir, ele não vai travar o código, vai apenas avisar
    const payload = {
      date: bookingData.date,
      time: bookingData.time,
      // Aqui usamos ?. para evitar o erro de "undefined"
      barber_id: bookingData.barber?.id, 
      client_id: user?.id || null, 
      client_name: user?.name || "Cliente",
      phone: user?.phone || "Sem telefone",
      service_name: bookingData.service?.name || "Serviço",
      price: Number(bookingData.price) || 0,
      status: 'pending'
    };

    // 3. Verificação final do ID do barbeiro (essencial para chegar nele)
    if (!payload.barber_id) {
      alert("Erro: O profissional selecionado não foi encontrado. Tente selecioná-lo novamente.");
      return;
    }

    console.log("Enviando horário para o banco...", payload);

    // 4. Chamada para o banco
    const { error } = await supabase
      .from('appointments')
      .insert([payload]);

    if (error) throw error;

    // 5. Se deu tudo certo
    setView('success');

  } catch (error) {
    console.error("Erro real ao salvar no banco:", error);
    alert("Falha ao agendar: " + error.message);
  }
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
        className="text-slate-400 font-bold text-sm mb-4 flex items-center gap-1 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar
      </button>
      <h3 className="font-bold text-lg text-slate-900 mb-4">Meus Agendamentos</h3>
      
      {/* Lista de agendamentos filtrada e segura contra erros */}
      {(appointments || []).filter(a => String(a.client_id) === String(user.id)).length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
          Ainda não tem agendamentos.
        </div>
      ) : (
        <div className="space-y-3">
          {(appointments || [])
            .filter(a => String(a.client_id) === String(user.id))
            .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
            .map(app => (
              <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{app.service_name}</p>
                    
                    {/* Nome do Profissional */}
                    <p className="text-[10px] text-blue-600 font-bold uppercase">
                      Profissional: {app.barber_name || "Barbeiro"}
                    </p>

                    {/* Data e Hora protegidos contra erro de split */}
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {app.date ? app.date.split('-').reverse().join('/') : '--/--/--'} às {app.time || '--:--'}
                    </p>
                  </div>
                </div>

                {/* Botão de Cancelar */}
                <button 
                  onClick={() => {
                    if(window.confirm("Deseja cancelar este agendamento?")) {
                      onUpdateStatus(app.id, 'rejected');
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
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
                {processedBarbers
                  .filter(b => b.my_services?.some(s => s.id === bookingData.service?.id))
                  // Ordena do mais perto para o mais longe
                  .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
                  .map((b, index) => {
                    const specificService = b.my_services?.find(s => s.id === bookingData.service?.id);
                    const displayPrice = specificService ? specificService.price : bookingData.service?.defaultPrice;
                    const isSelected = bookingData.barber?.id === b.id;

                    return (
                      <div 
                        key={b.id} 
                        onClick={() => setBookingData({...bookingData, barber: b, price: displayPrice})}
                        className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${
                          isSelected ? 'border-slate-900 bg-slate-50' : 'border-white bg-white hover:border-slate-200'
                        }`}
                      >
                        {/* Badge de "Mais Próximo" */}
                        {index === 0 && b.distance !== null && (
                          <div className="absolute -top-2 bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                            Mais Próximo
                          </div>
                        )}

                        {isSelected && <div className="absolute top-2 right-2 w-3 h-3 bg-slate-900 rounded-full"></div>}

                        {/* Foto / Avatar */}
                        <div className="w-16 h-16 rounded-full bg-slate-200 mb-3 overflow-hidden border border-slate-100 shadow-inner">
                          {(() => {
                            const lastGalleryPhoto = b.photos && b.photos.length > 0 ? b.photos[b.photos.length - 1] : null;
                            const imageToShow = lastGalleryPhoto || b.avatar_url;
                            return imageToShow ? (
                              <img src={imageToShow} alt={b.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User size={24}/>
                              </div>
                            );
                          })()}
                        </div>

                        <p className="font-bold text-slate-900 text-sm leading-tight mb-1 truncate w-full">{b.name}</p>

                        {/* Bloco de Localização Unificado */}
                        <div className="flex flex-col items-center gap-0.5 mb-2 w-full">
                          {b.address && (
                            <p className="text-[9px] text-slate-500 leading-tight line-clamp-1 px-1 w-full break-words">
                              {b.address}
                            </p>
                          )}

                          {b.distance !== null && (
                            <p className={`text-[10px] flex items-center justify-center gap-1 ${index === 0 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                              <MapPin size={10}/> {b.distance.toFixed(1)} km
                            </p>
                          )}
                        </div>

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
            
            {/* Grade de Dias dinâmica */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['D','S','T','Q','Q','S','S'].map(d => (
                <div key={d} className="text-[10px] font-black text-slate-300 text-center py-1">{d}</div>
              ))}

              {Array.from({ length: 28 }, (_, i) => {
                const dia = (i + 1).toString().padStart(2, '0');
                const dataFormatada = `2026-02-${dia}`;
                
                // Verifica se o dia existe no objeto available_slots do barbeiro
                const daySlots = bookingData.barber?.available_slots?.[dataFormatada] || [];
                const isAvailable = daySlots.length > 0;
                const isSelected = bookingData.date === dataFormatada;

                return (
                  <button
                    key={i}
                    disabled={!isAvailable}
                    // Reseta o time para null ao trocar de data
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
            
            {bookingData.date ? (
              <>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Horários para {bookingData.date.split('-').reverse().join('/')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {GLOBAL_TIME_SLOTS.map(t => {
                    // Verifica se o horário específico está dentro do array daquela data
                    const isSlotAvailable = bookingData.barber?.available_slots?.[bookingData.date]?.includes(t);
                    
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
              onClick={handleFinish} 
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
const BarberDashboard = ({ user, appointments, onUpdateStatus, onLogout, onUpdateProfile, supabase }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isPaying, setIsPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedDateConfig, setSelectedDateConfig] = useState(new Date().toISOString().split('T')[0]);

  // --- LÓGICA DE FILTRAGEM (O CORAÇÃO DO DASHBOARD) ---
  
  // 1. Criamos a variável myAppointments (que estava faltando no seu erro)
  const myAppointments = (appointments || []).filter(a => 
    String(a.barber_id || a.barberId) === String(user.id) && a.status !== 'rejected'
  );

  // 2. Filtra os que acabaram de chegar
  const pending = myAppointments.filter(a => a.status === 'pending');

  // 3. Ordena os pendentes por data e hora corretamente
  pending.sort((a, b) => {
    const dataA = new Date(`${a.date}T${a.time}`);
    const dataB = new Date(`${b.date}T${b.time}`);
    return dataA - dataB;
  });

  // 4. Filtra os confirmados e calcula o faturamento total
  const confirmed = myAppointments.filter(a => a.status === 'confirmed');
  const revenue = confirmed.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  // --- LÓGICA DE INTERVALO E INIT ---
  useEffect(() => {
    const interval = setInterval(() => {
      // fetchAppointments(); // Descomente se tiver a função disponível no escopo pai ou passe via props
      console.log("Sincronizando dados...");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get('status');
    if (status === 'approved' && !user.plano_ativo) {
        alert('Pagamento confirmado! Bem-vindo ao plano Profissional.');
        onUpdateProfile({ ...user, plano_ativo: true, is_visible: true });
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user.plano_ativo, onUpdateProfile, user]);

  // --- LÓGICA DE CALENDÁRIO & HORÁRIOS ESPECÍFICOS ---
  
  // 1. Alternar se o dia está "Aberto" ou "Fechado" na agenda geral
  const toggleDateAvailability = (date) => {
    const currentDates = user.available_dates || [];
    let newDates;
    
    if (currentDates.includes(date)) {
        newDates = currentDates.filter(d => d !== date); // Remove data
    } else {
        newDates = [...currentDates, date].sort(); // Adiciona data
    }
    
    // Se ativou o dia e ele não tem horários definidos, inicializa com todos ou vazio
    const currentSchedule = user.schedule || {};
    if (!currentSchedule[date] && newDates.includes(date)) {
        // Opcional: Pré-preencher com alguns horários padrão se quiser
        // currentSchedule[date] = ['09:00', '10:00', ...];
    }

    onUpdateProfile({ ...user, available_dates: newDates, schedule: currentSchedule });
    setSelectedDateConfig(date); // Seleciona o dia clicado para editar logo em seguida
  };

  // 2. Alternar horários DENTRO de uma data específica
 const toggleSlotForDate = async (date, slot) => {
  // 1. Obtém o estado atual ou um objeto vazio
  const currentSlots = user.available_slots || {};
  const slotsForDay = currentSlots[date] || [];

  let newSlots;

  // 2. Lógica de Adicionar/Remover
  if (slotsForDay.includes(slot)) {
    // Se o horário já existe, remove (filtra)
    newSlots = slotsForDay.filter(s => s !== slot);
  } else {
    // Se não existe, adiciona e ordena
    newSlots = [...slotsForDay, slot].sort();
  }

  // 3. Monta o objeto final
  // Se o dia ficar vazio (newSlots.length === 0), opcionalmente você pode deletar a chave do dia
  const updatedAvailableSlots = {
    ...currentSlots,
    [date]: newSlots
  };

  // 4. Atualização Visual Imediata (State local)
  onUpdateProfile({ 
    ...user, 
    available_slots: updatedAvailableSlots 
  });

  // 5. Persistência no Banco de Dados
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ available_slots: updatedAvailableSlots })
      .eq('id', user.id);

    if (error) throw error;
  } catch (err) {
    console.error("Erro ao salvar no Supabase:", err.message);
    // Caso falhe, você pode recarregar os dados ou avisar o usuário
  }
};

  // --- OUTRAS FUNÇÕES ---
  const handlePayment = async () => {
    setIsPaying(true);
    try {
      // Simulação da lógica de pagamento
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'salaodigital.onrender.com';
      const response = await fetch(`${API_BASE_URL}/criar-pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: user.id, price: 29.90, title: "Plano Profissional" })
      });
      if (!response.ok) throw new Error("Erro API");
      const data = await response.json();
      if (data.init_point) window.location.href = data.init_point;
      else alert("Erro ao gerar link.");
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar ao pagamento.");
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

  const updateServicePrice = (serviceId, newPrice) => {
    const newServices = (user.my_services || []).map(s => 
      s.id === serviceId ? { ...s, price: Number(newPrice) } : s
    );
    onUpdateProfile({ ...user, my_services: newServices });
  };

  // --- UPLOAD DE FOTO (AVATAR) ---
  const handleUploadPhoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload Supabase (assumindo que 'barber-photos' é público)
      const { error: uploadError } = await supabase.storage
        .from('barber-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('barber-photos')
        .getPublicUrl(filePath);

      // Atualiza avatar_url no perfil
      onUpdateProfile({ ...user, avatar_url: publicUrl });
      alert('Foto de perfil atualizada!');
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar foto. Verifique conexão.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* --- MODAL PAGAMENTO --- */}
      {showPayModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Ative seu Perfil</h2>
            <p className="text-slate-500 text-sm mb-6">Para ficar <b>Online</b>, assine o plano profissional.</p>
            <div className="space-y-3">
              <button 
                className="w-full py-4 bg-green-500 text-white rounded-xl font-bold disabled:opacity-50" 
                onClick={handlePayment} 
                disabled={isPaying}
              >
                {isPaying ? "Processando..." : "Assinar (R$ 29,90/mês)"}
              </button>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 text-sm font-bold block w-full">Agora não</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             {/* Avatar Pequeno no Header */}
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-full h-full p-2 text-slate-400" />
                )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Painel Pro</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${user.is_visible ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{user.is_visible ? 'Online' : 'Offline'}</p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={18}/>
          </button>
        </div>
      </header>

      {/* --- MENU TABS --- */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto bg-white border-b border-slate-100 sticky top-[80px] z-10">
        <button onClick={() => setActiveTab('home')} className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-50'}`}>Início</button>
        <button onClick={() => setActiveTab('services')} className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-50'}`}>Serviços</button>
        <button onClick={() => setActiveTab('config')} className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-50'}`}>Perfil & Agenda</button>
      </div>

      <main className="p-6 max-w-md mx-auto">
        
       {/* === ABA HOME === */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg shadow-slate-200">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Faturamento (Confirmado)</p>
                <p className="text-2xl font-black tracking-tight">R$ {revenue}</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Agendamentos</p>
                <div className="flex gap-2 items-baseline">
                    <p className="text-2xl font-black text-slate-900">{confirmed.length}</p>
                    <span className="text-xs text-orange-500 font-bold">({pending.length} pendentes)</span>
                </div>
              </div>
            </div>

            <section>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                Solicitações Pendentes
                {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pending.length}</span>}
              </h3>
              
              {pending.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 text-sm font-medium">Nenhum pedido pendente por enquanto.</p>
                </div>
              ) : (
                pending.map(app => (
                  <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{app.client}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">
                          {app.service?.name || 'Serviço'}
                        </p>
                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                            <Clock size={12} />
                            <p className="text-xs font-bold">
                            {/* CORREÇÃO: Exibição segura da data e hora */}
                            {app.time || '00:00'} - {app.date ? app.date.split('-').reverse().join('/') : 'Data n/a'}
                            </p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg">R$ {app.price}</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
  onClick={() => {
    // 1. Atualiza o status no banco de dados (Tabela Appointments)
    onUpdateStatus(app.id, 'confirmed');
    
    // 2. REMOVE O HORÁRIO DA AGENDA (Tabela Profiles/User State)
    // Isso impede que outros clientes vejam esse horário como disponível
    if (app.date && app.time) {
      toggleSlotForDate(app.date, app.time);
    }
    
    // 3. Formatação para o WhatsApp
    const dataFmt = app.date ? app.date.split('-').reverse().join('/') : 'data';
    const horaFmt = app.time || 'horário';
    const servicoFmt = app.service_name || 'serviço';
    
    const mensagem = `Olá ${app.client}! 👋%0A%0A` +
                     `Seu agendamento foi *CONFIRMADO*! ✅%0A%0A` +
                     `📌 *${servicoFmt}*%0A` +
                     `📅 ${dataFmt} às ${horaFmt}%0A` +
                     `💰 R$ ${app.price}%0A%0A` +
                     `Te esperamos lá! 💈`;
    
    const fone = app.phone?.toString().replace(/\D/g, '');
    if (fone) {
      window.open(`https://api.whatsapp.com/send?phone=55${fone}&text=${mensagem}`, '_blank');
    }
  }} 
  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
>
  <CheckCircle size={16} /> Aceitar e Fechar Horário
</button>

                      <button 
                        onClick={() => onUpdateStatus(app.id, 'rejected')} 
                        className="w-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}

        {/* === ABA SERVIÇOS === */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl mb-4">
                <p className="text-xs text-blue-700 font-medium">Selecione os serviços que você oferece e defina seu preço.</p>
            </div>
            {MASTER_SERVICES.map(service => {
              const userServiceData = user.my_services?.find(s => s.id === service.id);
              const isActive = !!userServiceData;
              return (
                <div key={service.id} className={`p-4 rounded-2xl border-2 transition-all ${isActive ? 'border-slate-900 bg-white shadow-md' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleService(service.id, service.defaultPrice)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>{service.icon}</div>
                      <div>
                        <p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{service.name}</p>
                        <p className="text-[10px] text-slate-400">{service.duration}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                        {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between animate-in slide-in-from-top-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Preço (R$)</span>
                      <input 
                        type="number" 
                        value={userServiceData.price || ''} 
                        onChange={(e) => updateServicePrice(service.id, e.target.value)} 
                        className="w-24 text-right font-black text-lg outline-none bg-slate-50 rounded-md px-2 py-1 focus:ring-2 ring-slate-200"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* === ABA CONFIGURAÇÕES (Perfil & Agenda) === */}
        {activeTab === 'config' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Seção 1: Dados do Perfil */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
                
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User size={18} className="text-slate-400"/> Dados da Barbearia
                </h3>

                {/* Avatar Uploader */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-lg">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                            <Camera size={16} />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Toque na câmera para alterar</p>
                </div>

                {/* Campos de Texto */}
               <div className="space-y-4">
    {/* Endereço */}
    <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Endereço Completo</label>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-3 rounded-xl border border-slate-200 focus-within:border-slate-900 transition-colors">
            <MapPin size={16} className="text-slate-400" />
            <input 
                type="text" 
                value={user.address || ''} 
                onChange={(e) => onUpdateProfile({ ...user, address: e.target.value })}
                placeholder="Ex: Rua das Flores, 123" 
                className="bg-transparent outline-none w-full text-sm font-medium text-slate-900"
            />
        </div>
    </div>

    {/* Botão de Coordenadas GPS */}
    <div className="grid grid-cols-1 gap-2">
        <button 
            type="button"
            onClick={() => {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        onUpdateProfile({ 
                            ...user, 
                            latitude: pos.coords.latitude, 
                            longitude: pos.coords.longitude 
                        });
                        alert("Localização capturada!");
                    });
                }
            }}
            className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase border border-blue-100 hover:bg-blue-100 transition-all"
        >
            <MapPin size={14} /> Marcar minha localização atual
        </button>
        
        {/* Mostra as coordenadas se existirem */}
        {user.latitude && (
            <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[9px] text-slate-400 text-center">
                    LAT: {user.latitude.toFixed(5)}
                </div>
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[9px] text-slate-400 text-center">
                    LONG: {user.longitude.toFixed(5)}
                </div>
            </div>
        )}
    </div>
</div>

                {/* Visibilidade Switch */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Loja Visível</h3>
                    <p className="text-[10px] text-slate-500">Aparecer na lista de busca</p>
                  </div>
                  <div onClick={handleToggleVisibility} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${user.is_visible ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${user.is_visible ? 'translate-x-6' : 'translate-x-0'}`}/>
                  </div>
                </div>
            </section>
 {/* Seção 2: Agenda Avançada */}
            <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Header Calendário */}
                <div 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="p-5 flex items-center justify-between bg-slate-50 cursor-pointer border-b border-slate-100"
                >
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                        <CalendarDays size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Gerenciar Agenda</h3>
                        <p className="text-[10px] text-slate-500">Toque no dia para definir horários</p>
                    </div>
                    </div>
                    <ChevronRight size={18} className={`text-slate-400 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
                </div>

                {showCalendar && (
                    <div className="p-5">
                    {/* Grid do Calendário */}
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-black text-slate-300 uppercase">
                        {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="py-1">{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-6">
                        {Array.from({ length: 30 }, (_, i) => {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = String(now.getMonth() + 1).padStart(2, '0');
                            const day = String(i + 1).padStart(2, '0');
                            const fullDate = `${year}-${month}-${day}`;
                            
                            const isAvailable = user.available_slots && user.available_slots[fullDate];
                            const isSelected = selectedDateConfig === fullDate;
                            const hasSlots = user.available_slots?.[fullDate]?.length > 0;

                            return (
                                <button
                                key={i}
                                onClick={() => setSelectedDateConfig(fullDate)}
                                className={`
                                    relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold border transition-all
                                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 z-10' : ''}
                                    ${isAvailable 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                        : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}
                                `}
                                >
                                {i + 1}
                                {isAvailable && (
                                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${hasSlots ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Área de Configuração do Dia Selecionado */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-900 text-sm">
                                Horários para <span className="text-blue-600">{selectedDateConfig.split('-').reverse().join('/')}</span>
                            </h4>
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                                {user.available_slots?.[selectedDateConfig] ? 'Dia Ativo' : 'Dia Fechado'}
                            </span>
                        </div>

                        {!user.available_slots?.[selectedDateConfig] ? (
                            <div className="text-center py-6">
                                <p className="text-xs text-slate-400 mb-2">Nenhum horário definido.</p>
                                <button 
                                    onClick={() => toggleSlotForDate(selectedDateConfig, "09:00")}
                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
                                >
                                    Abrir Agenda
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {GLOBAL_TIME_SLOTS.map(slot => (
                                    <button 
                                        key={slot} 
                                        onClick={() => toggleSlotForDate(selectedDateConfig, slot)} 
                                        className={`
                                            py-2 text-[10px] font-bold rounded-lg border transition-all
                                            ${user.available_slots?.[selectedDateConfig]?.includes(slot)
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                                : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}
                                        `}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-4 text-center">
                            Toque nos horários para adicionar ou remover.
                        </p>
                    </div>
                    </div>
                )}
            </section>
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
      // 1. Busca barbeiros visíveis
      const { data: bData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'barber')
        .eq('is_visible', true);
        
      if (bData) setBarbers(bData);

      if (!user) return;

      // 2. Busca Agendamentos (onde o usuário é o cliente OU o barbeiro)
      const { data: aData } = await supabase
        .from('appointments')
        .select('*')
        .or(`client_id.eq.${user.id},barber_id.eq.${user.id}`);
      
      if (aData) {
        // CORREÇÃO DOS CAMPOS AQUI:
        const formatted = aData.map(a => ({
          ...a,
          client: a.client_name,
          service: a.service_name,
          // Mudamos de a.booking_time para a.time para bater com o banco
          time: a.time, 
          // Mudamos de a.booking_date para a.date para bater com o banco
          date: a.date, 
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
    barber_name: data.barber.name, // <-- ADICIONE ISSO para o cliente saber com quem marcou
    service_name: data.service.name,
    price: data.price,
    status: 'pending',
    date: data.date,
    phone: data.phone,
    time: data.time
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
      barber_name: saved.barber_name, // Mantém o nome no estado local
      time: saved.time,
      date: saved.date,
      phone: saved.phone
    }]);
    alert("Agendamento realizado!"); // Feedback para o cliente
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
  try {
    // 1. Filtramos apenas as colunas que existem no seu banco (conforme seus prints)
    // Removemos o 'id' do corpo do objeto, pois ele vai apenas no .eq()
   const dataToSave = {
      address: updatedUser.address,
      latitude: updatedUser.latitude,   
      longitude: updatedUser.longitude, 
      avatar_url: updatedUser.avatar_url,
      is_visible: updatedUser.is_visible,
      plano_ativo: updatedUser.plano_ativo,
      my_services: updatedUser.my_services,
      available_dates: updatedUser.available_dates,
      available_slots: updatedUser.available_slots 
    };

    // 2. Enviamos para o Supabase
    const { error } = await supabase
      .from('profiles')
      .update(dataToSave)
      .eq('id', updatedUser.id);

    if (error) throw error;

    // 3. ATENÇÃO AQUI: Usamos setUser para atualizar o estado local do barbeiro
    // Não usamos onUpdateProfile aqui porque estamos dentro do componente que define o estado.
    setUser(updatedUser);
    
    console.log("Perfil atualizado com sucesso!");
  } catch (error) {
    console.error("Erro completo:", error);
    alert("Erro ao salvar no banco: " + error.message);
  }
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
    onUpdateStatus={handleUpdateStatus} 
    onUpdateProfile={handleUpdateProfile}
    MASTER_SERVICES={MASTER_SERVICES} 
    GLOBAL_TIME_SLOTS={GLOBAL_TIME_SLOTS} 
    supabase={supabase} // <--- ADICIONE ESTA LINHA AQUI
  />
) : (
    <ClientApp 
      user={user} 
      barbers={barbers} 
      appointments={appointments} 
      onLogout={() => { setUser(null); setCurrentMode(null); }}
      onBookingSubmit={handleBookingSubmit}
      onUpdateStatus={handleUpdateStatus} // <--- ADICIONE ESTA LINHA AQUI
    />
  );
}