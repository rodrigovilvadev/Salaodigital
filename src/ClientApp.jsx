const ClientApp = ({ user, barbers, onLogout, onBookingSubmit, appointments }) => {
  const [view, setView] = useState('home');
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({ service: null, barber: null, price: null, date: null, time: null });
  const [userCoords, setUserCoords] = useState(null);

  // Captura localização ao abrir agendamento
  useEffect(() => {
    if (view === 'booking' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Erro GPS:", err)
      );
    }
  }, [view]);

  // FILTRAGEM E ORDENAÇÃO POR DISTÂNCIA
  const processedBarbers = barbers
    .filter(b => b.is_visible)
    .map(b => ({
      ...b,
      distance: calculateDistance(userCoords?.lat, userCoords?.lng, b.latitude, b.longitude)
    }))
    .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999)); // Menor distância primeiro

  const handleFinish = () => {
    onBookingSubmit(bookingData);
    setView('success');
  };

  if (view === 'success') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white animate-in zoom-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Check size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Tudo certo!</h2>
      <p className="text-slate-500 mb-8">Seu agendamento foi enviado para o barbeiro.</p>
      <Button onClick={() => {setView('home'); setStep(1);}}>Voltar ao Início</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white p-4 flex justify-between items-center border-b shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
           {view !== 'home' && <button onClick={() => view === 'booking' && step > 1 ? setStep(step-1) : setView('home')}><ChevronLeft/></button>}
           <h1 className="font-black italic">SALÃO<span className="text-blue-600">DIGITAL</span></h1>
        </div>
        <button onClick={onLogout} className="text-red-500 font-bold text-xs flex items-center gap-1"><LogOut size={14}/> Sair</button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'home' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-4 italic">Olá, {user.name.split(' ')[0]}</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setView('booking')}>Agendar Agora</Button>
                </div>
              </div>
              <Scissors className="absolute -bottom-4 -right-4 text-white/5 rotate-12" size={120} />
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passo {step} de 3</span>
                <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className={`h-1 w-4 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`}/>)}
                </div>
             </div>

             {step === 1 && (
                <div className="animate-in slide-in-from-right">
                  <h3 className="font-bold text-lg mb-4">Escolha o serviço</h3>
                  <div className="grid gap-3">
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
                  <Button className="mt-6" onClick={() => setStep(2)} disabled={!bookingData.service}>Continuar</Button>
                </div>
             )}

             {step === 2 && (
                <div className="animate-in slide-in-from-right">
                  <h3 className="font-bold text-lg mb-2">Profissionais próximos</h3>
                  <p className="text-xs text-slate-400 mb-4">Ordenados por distância</p>
                  <div className="grid gap-3">
                    {processedBarbers.map(b => (
                      <Card key={b.id} selected={bookingData.barber?.id === b.id} onClick={() => setBookingData({...bookingData, barber: b, price: bookingData.service?.defaultPrice})}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                    {b.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold">{b.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Star size={8} fill="currentColor"/> 5.0
                                        </span>
                                        {b.distance !== null && (
                                            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                                                <MapPin size={8}/> {b.distance}km
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="font-black text-slate-900">R$ {bookingData.service?.defaultPrice}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Button className="mt-6" onClick={() => setStep(3)} disabled={!bookingData.barber}>Escolher Horário</Button>
                </div>
             )}

             {step === 3 && (
                <div className="animate-in slide-in-from-right">
                  <h3 className="font-bold text-lg mb-4">Data e Hora</h3>
                  <input type="date" className="w-full p-4 border-2 border-slate-100 rounded-2xl mb-4 font-bold" onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
                  
                  <div className="grid grid-cols-3 gap-2">
                    {GLOBAL_TIME_SLOTS.map(t => (
                      <button 
                        key={t} 
                        onClick={() => setBookingData({...bookingData, time: t})} 
                        className={`p-3 rounded-xl font-bold text-sm transition-all ${bookingData.time === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-100'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <Button className="mt-8" variant="success" onClick={handleFinish} disabled={!bookingData.time || !bookingData.date}>
                    Finalizar R$ {bookingData.price}
                  </Button>
                </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};