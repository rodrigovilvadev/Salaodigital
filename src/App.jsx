import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Calendar, MapPin, Star, 
  CheckCircle2, LogOut, Bell, DollarSign, 
  ChevronLeft, ChevronRight, Check, Trash2, KeyRound, UserPlus,
  Eye, EyeOff, CreditCard, Lock, Clock, CalendarDays,
  Sparkles, Palette, Briefcase, Edit3, MessageCircle, Phone, XCircle, History
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



