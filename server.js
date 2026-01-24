import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; 
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'; // Adicionado Payment
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com o Supabase usando as chaves do Render
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
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
        metadata: { barber_id: barberId }, // Importante: guarda o ID para o Webhook ler depois
        back_urls: {
          success: `https://salaodigital.app.br/?status=approved`,
        },
        auto_return: "approved",
      }
    });

    // Salva o início da tentativa no Supabase
    await supabase.from('usuarios').upsert({ 
      barber_id: barberId, 
      telefone: telefone,
      plano_ativo: false 
    }, { onConflict: 'barber_id' });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao gerar link de pagamento" });
  }
});

// 2. Rota de Webhook: O Mercado Pago avisa aqui quando o status muda
app.post('/webhooks', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;

  try {
    if (topic === 'payment') {
      const paymentId = query.id || (req.body.data && req.body.data.id);
      
      // Consultar o status do pagamento no Mercado Pago
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      if (data.status === 'approved') {
        const barberId = data.metadata.barber_id;

        // Atualiza o plano no Supabase para ATIVO
        const { error } = await supabase
          .from('usuarios')
          .update({ plano_ativo: true })
          .eq('barber_id', barberId);

        if (error) console.error("Erro ao atualizar Supabase:", error);
        else console.log(`Sucesso: Plano ativado para o barbeiro ${barberId}`);
      }
    }
    res.sendStatus(200); // Sempre responda 200 para o Mercado Pago parar de enviar
  } catch (error) {
    console.error("Erro no Webhook:", error);
    res.sendStatus(500);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));