import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; 
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// --- CORREÇÃO 1: Nome exato da variável no Render ---
// Se no Render está SUPABASE_SERVICE_ROLE_KEY, aqui tem que ser igual.
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.VITE_MP_ACCESS_TOKEN 
});

app.use(express.static(path.join(__dirname, 'dist')));

// 1. Rota para Criar o Link de Pagamento
app.post('/criar-pagamento', async (req, res) => {
  const { barberId, telefone } = req.body; 
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{
          title: "Assinatura Plano Profissional - Salaodigital",
          quantity: 1,
          unit_price: 29.90,
          currency_id: 'BRL'
        }],
        metadata: { barber_id: barberId },
        
        // --- CORREÇÃO 2: A linha mágica que faz o retorno funcionar ---
        notification_url: "https://salaodigital.onrender.com/webhooks", 
        
        back_urls: {
          success: `https://salaodigital.app.br/`,
        },
        auto_return: "approved",
      }
    });

    // Registra no Supabase
    const { error: upsertError } = await supabase.from('usuarios').upsert({ 
      barber_id: barberId, 
      telefone: telefone,
      plano_ativo: false 
    }, { onConflict: 'barber_id' });

    if (upsertError) console.error("Erro ao registrar no Supabase:", upsertError);

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Erro ao gerar pagamento:", error); // Veja este log no Render se falhar
    res.status(500).json({ error: "Erro ao gerar link de pagamento" });
  }
});

// 2. Rota de Webhook
app.post('/webhooks', async (req, res) => {
  const { query, body } = req;
  const topic = query.topic || query.type || (body.data && 'payment');

  try {
    if (topic === 'payment') {
      const paymentId = query.id || (body.data && body.data.id);
      
      if (paymentId) {
          const payment = new Payment(client);
          const data = await payment.get({ id: paymentId });
    
          if (data.status === 'approved') {
            const barberId = data.metadata.barber_id;
    
            // ATUALIZA NO SUPABASE
            const { error: updateError } = await supabase
              .from('usuarios')
              .update({ plano_ativo: true })
              .eq('barber_id', barberId);
    
            if (updateError) {
              console.error("Erro Supabase:", updateError);
            } else {
              console.log(`✅ Sucesso! Plano ativado para: ${barberId}`);
            }
          }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro Webhook:", error);
    res.sendStatus(500);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor Live na porta ${PORT}`));