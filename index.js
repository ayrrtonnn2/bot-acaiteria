// index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "meu_token_123";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("GET /webhook", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // responder apenas o challenge (texto cru)
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Forbidden");
});

app.post("/webhook", (req, res) => {
  console.log("POST /webhook payload:", JSON.stringify(req.body, null, 2));
  // sempre retorne 200 OK para a Meta
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
