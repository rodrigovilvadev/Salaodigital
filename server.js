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
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

const client = new MercadoPagoConfig({ 
  accessToken: process.env.VITE_MP_ACCESS_TOKEN 
});

app.use(express.static(path.join(__dirname, 'dist')));

app.post('/criar-pagamento', async (req, res) => {
  const { barberId } = req.body; 
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
        notification_url: "https://salaodigital.onrender.com/webhooks", 
        back_urls: { success: "https://salaodigital.app.br/" },
        auto_return: "approved",
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar link" });
  }
});

app.post('/webhooks', async (req, res) => {
  const { query, body } = req;
  const topic = query.topic || query.type || (body.data && 'payment');

  try {
    if (topic === 'payment') {
      const paymentId = query.id || (body.data && body.data.id);
      
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      if (data.status === 'approved') {
        const barberId = data.metadata.barber_id;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ plano_ativo: true })
          .eq('id', barberId);

        if (updateError) {
          console.error("Erro ao ativar plano no Supabase:", updateError);
        } else {
          console.log(`Sucesso: Plano ativado para o barbeiro ${barberId}`);
        }
      }
    }
    res.sendStatus(200); 
  } catch (error) {
    console.error("Erro processando Webhook:", error);
    res.sendStatus(500);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor Live na porta ${PORT}`));