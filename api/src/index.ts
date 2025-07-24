import express, { json, urlencoded, Request } from "express";
import cors from "cors";
import productsRoutes from "./routes/products/index.js";
import authRoutes from "./routes/auth/index.js";
import ordersRoutes from "./routes/orders/index.js";
import stripeRoutes from "./routes/stripe/index.js";

import serverless from "serverless-http";

const port = 3001;
const app = express();

// Configurar CORS para desarrollo local
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://127.0.0.1:8082",
      "http://localhost:8081", //recuerda que si quieres usar Expo Go en el celular, debes usar la IP local de tu computadora
      "http://192.168.1.124:8081", // Reemplaza con tu IP local real (usa: ip route get 1.1.1.1 | awk '{print $7}' | head -n1)
    ], // Expo dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(urlencoded({ extended: false }));
app.use(
  json({
    verify: (req: Request, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/products", productsRoutes);
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/stripe", stripeRoutes);

if (process.env.NODE_ENV === "dev") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export const handler = serverless(app);
