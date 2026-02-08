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
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://saladigital.onrender.com';

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

