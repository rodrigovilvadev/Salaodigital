import express from 'express';
import cors from 'cors';
import path from 'path'; // Adicione isto
import { fileURLToPath } from 'url'; // Adicione isto
import 'dotenv/config'; 
import { MercadoPagoConfig, Preference } from 'mercadopago';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// 1. Servir os ficheiros estáticos da pasta 'dist' (o seu front-end)
app.use(express.static(path.join(__dirname, 'dist')));

const CLIENT_URL = process.env.CLIENT_URL || 'https://salaodigital.app.br';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.VITE_MP_ACCESS_TOKEN 
});

// Rota de Pagamento
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
    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Erro MP:", error);
    res.status(500).json({ error: "Erro ao criar link" });
  }
});

// 2. Rota para garantir que qualquer outra página carregue o front-end (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor e Front-end a rodar na porta ${PORT}`);
});