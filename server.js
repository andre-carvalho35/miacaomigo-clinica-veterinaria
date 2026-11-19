require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");

const server = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());

// Servir o frontend da clínica
server.use(express.static(path.join(__dirname, "frontend")));

// Rotas API da clínica e adoção
try {
  const customersRouter = require("./backend/routes/customersRoutes.js");
  const authRouter = require("./backend/routes/authRoutes.js");
  const consultasRouter = require("./backend/routes/consultasRoutes.js");
  const clinicaRouter = require("./backend/routes/clinicaRoutes.js");
  const errorHandling = require("./backend/middlewares/errorHandler.js");

  server.use("/api", customersRouter);
  server.use("/api/auth", authRouter);
  server.use("/api/consultas", consultasRouter);
  server.use("/api/clinica", clinicaRouter);
  server.use(errorHandling);
} catch (err) {
  console.warn("Erro ao carregar API/BD:", err.message);
}

// Garantir que o site abre em /
server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Servidor a correr em ${url}`);
  exec(`open ${url}`);
});