import express from "express";
import { engine } from "express-handlebars";
import http from "http";
import { Server as IOServer } from "socket.io";
import { messageRepository } from "./src/db/messages.js";
import { productosRepository } from "./src/db/productos.js";

const app = express();
const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

app.engine("handlebars", engine());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "handlebars");

app.set("views", "./src/views");

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/message-center", (req, res) => {
  res.render("message-center");
});

app.get("/productos", async(req, res) => {
  try {
    const productos = await productosRepository.getAll();
  res.render("productos", { productos, tieneProductos: productos.length > 0 });
} catch (err) {
  res.send.status(404);
}
});
app.get("/messages", async (req, res) => {
  try {
    const messages = await messageRepository.getAll();
    res.render("messages", { messages, hasMessages: messages.length > 0 });
  } catch (err) {
    res.send.status(404);
  }
});

const PORT = process.env.PORT || 8080;

const initServer = async () => {
  const server = httpServer.listen(PORT, async () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`);
  });

  io.on("connection", async (socket) => {
    console.log("Usuario conectado");
    
    const productos = await productosRepository.getAll();
    socket.emit("productos", productos);

    const messages = await messageRepository.getAll();
    socket.emit("messages", messages);

    socket.on("new-product", async (data) => {
      await productosRepository.save(data);
      const productos = await messageRepository.getAll();
      io.sockets.emit("productos", productos);
    });
    
    socket.on("new-message", async (data) => {
      await messageRepository.save(data);
      const messages = await messageRepository.getAll();
      io.sockets.emit("messages", messages);
    });
  });
};

const bootstrap = async () => {
  await messageRepository.createTable();
  await productosRepository.createTable();

  await initServer();
}

bootstrap();