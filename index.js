// index.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "meu_token_123";
const WHATSAPP_TOKEN = "EAASppqZAY2DEBP05w5cXRcNZBGifroxZCAdhxGfvPE3LTIR0Y68pZCJhzedPl7aHzMyECZAUhxBeDgBdz7nuzHg1awHrqvPEh5Mad41qlyZCuqwZBzlBoe4fUOnaR5Tdz33HadJcpmVoF9geHRNghfTKFYFSvAWSGUG85ZBZAwy6lmG1J5ZAi5n9o5787LNDQq9CoTCFBl1ZAl6zNk8p6j8rDZBVVnKgz8tmOCWCMtuuXX3VSX7vW0OWLapDUjZB3tfVwcuQZCCuRy3ya1abgP6RiNFZAJv91IdsZB8kJN6IHa2WYQZDZD";
const PHONE_ID = "829998453533782";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  console.log("Mensagem recebida:", JSON.stringify(req.body, null, 2));

  if (req.body.entry) {
    const message = req.body.entry[0]?.changes[0]?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;

    if (from && text) {
      await sendMessage(from, `Você disse: ${text}`);
    }
  }

  res.sendStatus(200);
});

async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    text: { body: message },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("Resposta do envio:", data);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Servidor rodando na porta ${port}`));
