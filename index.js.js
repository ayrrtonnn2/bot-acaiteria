import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ Verificação do webhook da Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verificado!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Recebendo mensagens do WhatsApp
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message && message.type === "text") {
    const from = message.from;
    const text = message.text.body;

    console.log("Mensagem recebida:", text);

    const resposta = await gerarRespostaIA(text);

    await enviarMensagemWhatsApp(from, resposta);
  }

  res.sendStatus(200);
});

// 💡 Função para gerar resposta com IA
async function gerarRespostaIA(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("Erro ao gerar resposta IA:", err);
    return "Desculpe, ocorreu um erro ao gerar sua resposta.";
  }
}

// 💬 Função para enviar mensagem de volta pelo WhatsApp
async function enviarMensagemWhatsApp(to, texto) {
  try {
    await axios.post(
      "https://graph.facebook.com/v17.0/829998453533782/messages",
      {
        messaging_product: "whatsapp",
        to,
        text: { body: texto }
      },
      {
        headers: {
          "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.response?.data || err);
  }
}

app.listen(process.env.PORT || 3000, () => {
  console.log("Bot rodando 🚀");
});
