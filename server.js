import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; 
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Aumenta o limite do body caso o MP mande algo grande, e força JSON
const app = express();
app.use(express.json()); // Essencial para receber notificações do Mercado Pago
app.use(cors());

// Conexão ÚNICA com o Supabase
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
  
  // URL DO SEU BACKEND (Troque isso pela sua URL de produção do Render/Railway)
  // Exemplo: 'https://api-salaodigital.onrender.com/webhooks'
  const MEU_WEBHOOK = 'https://salaodigital.onrender.com//webhooks'; 

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
        // O MP converte tudo em metadata para snake_case (barber_id)
        metadata: { 
            barber_id: barberId,
            telefone: telefone 
        },
        back_urls: {
          success: `https://salaodigital.app.br/sucesso`,
          failure: `https://salaodigital.app.br/erro`,
          pending: `https://salaodigital.app.br/pendente`,
        },
        auto_return: "approved",
        // CORREÇÃO CRUCIAL: Diz ao MP onde notificar explicitamente
        notification_url: MEU_WEBHOOK 
      }
    });

    // Registra intenção no Supabase (Plano inativo até confirmar)
    const { error: upsertError } = await supabase.from('usuarios').upsert({ 
      barber_id: barberId, 
      telefone: telefone,
      plano_ativo: false 
    }, { onConflict: 'barber_id' });

    if (upsertError) console.error("Erro ao registrar no Supabase:", upsertError);

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Erro ao gerar pagamento:", error);
    res.status(500).json({ error: "Erro ao gerar link de pagamento" });
  }
});

// 2. Rota de Webhook CORRIGIDA
app.post('/webhooks', async (req, res) => {
  const { query, body } = req;

  // Log para você ver o que está chegando (útil para debug)
  console.log("🔔 Webhook recebido:", JSON.stringify(body || query));

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
        // A URL abaixo deve ser a sua URL pública do Render
        notification_url: "https://salaodigital.app.br/webhooks", 
        back_urls: {
          success: "https://salaodigital.app.br/sucesso",
        },
        auto_return: "approved",
      }
    });

    // Registra o interesse inicial no Supabase
    await supabase.from('usuarios').upsert({
      barber_id: barberId,
      telefone: telefone,
      plano_ativo: false
    }, { onConflict: 'barber_id' });

    res.json({ id: result.id, init_point: result.init_point });

  } catch (error) {
    console.error("Erro ao gerar pagamento:", error);
    res.status(500).json({ error: "Erro ao gerar link de pagamento" });
  }
});

// 2. Rota de Webhook: O Mercado Pago avisa aqui quando o status muda
app.post('/webhooks', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;

  // Responda 200 imediatamente para o Mercado Pago não reenviar o aviso
  res.sendStatus(200);

  if (topic === 'payment') {
    const paymentId = query.id || query['data.id'];
    
    try {
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      if (data.status === 'approved') {
        const barberId = data.metadata.barber_id;
        
        // Atualiza o plano no Supabase
        await supabase
          .from('usuarios')
          .update({ plano_ativo: true })
          .eq('barber_id', barberId);
          
        console.log(`Pagamento aprovado para o barbeiro: ${barberId}`);
      }
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
    }
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));