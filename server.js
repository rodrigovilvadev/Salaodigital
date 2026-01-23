import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import { MercadoPagoConfig, Preference } from 'mercadopago';

const app = express();
app.use(express.json());
app.use(cors());

// 1. Definição da URL do seu site (para onde o cliente volta após pagar)
const CLIENT_URL = process.env.CLIENT_URL || 'https://salaodigital.app.br';

// Configura o Mercado Pago com seu Token real
// IMPORTANTE: Certifique-se de que a variável VITE_MP_ACCESS_TOKEN está no painel do Render
const client = new MercadoPagoConfig({ 
  accessToken: process.env.VITE_MP_ACCESS_TOKEN 
});

// 2. Rota Raiz (Resolve o erro "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Servidor SalãoDigital está online e funcionando 🚀');
});

app.post('/criar-pagamento', async (req, res) => {
  const { barberId } = req.body;
  
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{
          id: String(barberId),
          title: "Assinatura Plano Profissional - Salaodigital",
          quantity: 1,
          unit_price: 29.90,
          currency_id: 'BRL'
        }],
        back_urls: {
          success: `${CLIENT_URL}/?status=approved`,
          failure: `${CLIENT_URL}/?status=failed`,
        },
        auto_return: "approved",
      }
    });

    // Envia o link oficial (init_point) gerado na hora
    res.json({ init_point: result.init_point });
    
  } catch (error) {
    console.error("Erro MP:", error);
    res.status(500).json({ error: "Erro ao criar link" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});