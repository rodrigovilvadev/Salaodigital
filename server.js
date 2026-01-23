import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import { MercadoPagoConfig, Preference } from 'mercadopago';

const app = express();
app.use(express.json());
app.use(cors());

// Configura o Mercado Pago com seu Token real
const client = new MercadoPagoConfig({ 
  accessToken: process.env.VITE_MP_ACCESS_TOKEN 
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

});