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

// Aumenta o limite do body caso o MP mande algo grande, e força JSON
app.use(express.json()); 
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
  const MEU_WEBHOOK = 'https://SUA-URL-DO-BACKEND-AQUI.com/webhooks'; 

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
    // O Mercado Pago envia o ID de duas formas:
    // 1. Na query string: ?id=123&topic=payment
    // 2. No body: { action: 'payment.created', data: { id: '123' } }
    
    let paymentId = query.id || query['data.id'] || (body.data && body.data.id);
    let topic = query.topic || (body.type) || (body.action);

    // Se for apenas teste de validação do MP, responda OK e ignore
    if (body.action === 'test.created') {
        console.log("Teste de webhook recebido.");
        return res.status(200).send("OK");
    }

    // Se temos um ID de pagamento, vamos consultar o status real
    if (paymentId && (topic === 'payment' || body.type === 'payment' || body.action === 'payment.updated')) {
      
      console.log(`Verificando pagamento ID: ${paymentId}...`);
      
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      console.log(`Status do pagamento ${paymentId}: ${data.status}`);

      if (data.status === 'approved') {
        // Pega o ID do barbeiro que salvamos no metadata
        const barberId = data.metadata.barber_id; 

        if (barberId) {
            // ATUALIZA NO SUPABASE
            const { error: updateError } = await supabase
              .from('usuarios')
              .update({ plano_ativo: true })
              .eq('barber_id', barberId);

            if (updateError) {
              console.error("❌ Erro ao ativar plano no banco:", updateError);
            } else {
              console.log(`✅ SUCESSO: Plano ativado para barbeiro ${barberId}`);
            }
        } else {
            console.warn("⚠️ Pagamento aprovado, mas sem barber_id no metadata.");
        }
      }
    }

    // SEMPRE retorne 200, caso contrário o MP fica reenviando infinitamente
    res.status(200).send("OK");
    
  } catch (error) {
    console.error("❌ Erro processando Webhook:", error);
    // Mesmo com erro, responda 200 para não travar a fila do MP, mas logue o erro.
    res.status(200).send("Error logged");
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));