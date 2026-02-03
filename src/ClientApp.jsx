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

// --- COMPONENTE PRINCIPAL (ORQUESTRADOR) ---
