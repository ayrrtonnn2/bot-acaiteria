import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// Token de verificação do Webhook
const VERIFY_TOKEN = "verify_token_bot";

// Token da API do WhatsApp (substitua pelo seu do Meta)
const WHATSAPP_TOKEN = "COLE_SEU_TOKEN_DE_ACESSO_AQUI";

// ✅ Endpoint de verificação do Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// ✅ Endpoint para receber mensagens do WhatsApp
app.post("/webhook", async (req, res) => {
  console.log("Mensagem recebida:", JSON.stringify(req.body, null, 2));

  if (req.body.object) {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from; // número do cliente
      const text = message.text?.body?.toLowerCase() || "";

      // Exemplo simples de resposta:
      let reply = "Olá! 👋 Sou o bot da açaíteria! 🍧";

      if (text.includes("cardápio") || text.includes("menu")) {
        reply = "Nosso cardápio 🍓: \n1️⃣ Açaí 300ml - R$12\n2️⃣ Açaí 500ml - R$16\n3️⃣ Açaí 700ml - R$20";
      } else if (text.includes("horário") || text.includes("funciona")) {
        reply = "🕒 Funcionamos todos os dias das 10h às 22h!";
      } else if (text.includes("local") || text.includes("onde")) {
        reply = "📍 Estamos na Av. Principal, 123 - Centro 🍇";
      }

      await sendMessage(from, reply);
    }
  }

  res.sendStatus(200);
});

// ✅ Função para enviar mensagens de texto
async function sendMessage(to, text) {
  await fetch("https://graph.facebook.com/v20.0/YOUR_PHONE_NUMBER_ID/messages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    }),
  });
}

app.listen(3000, () => console.log("🚀 Servidor rodando na porta 3000"));
