// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'test_secret_key';

mongoose.connect('mongodb://localhost:27017/usuarios', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log(err));

// Middleware de autenticación
const authenticateJWT = (req, res, next) => {
  
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Ruta de registro
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const nuevoUsuario = new User({ name, email, password });
    await nuevoUsuario.save();
    res.status(201).send('Usuario registrado');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(400).send(`Error al registrar usuario: ${error.message}`); 
  }
});

// Ruta de inicio de sesión
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).send('Usuario no encontrado');
    }
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(400).send('Contraseña incorrecta');
    }
    const token = jwt.sign({ id: usuario._id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(400).send(`Error al iniciar sesión: ${error.message}`);
  }
});

// Ruta para crear un nuevo ticket
app.post('/api/tickets/post', authenticateJWT, async (req, res) => {
  try {
    const { id, subject, priority, status, creationDate, description, lastUpdate, assignedTo, client, category, notes, isArchived } = req.body;
    const nuevoTicket = new Ticket({
      id,
      subject,
      priority,
      status,
      creationDate,
      description,
      lastUpdate,
      assignedTo,
      client,
      category,
      notes,
      isArchived
    });
    await nuevoTicket.save();
    res.status(201).json(nuevoTicket);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(400).send(`Error al crear ticket: ${error.message}`);
  }
});

// Nueva ruta para obtener todos los tickets
app.get('/api/tickets', authenticateJWT, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(400).send(`Error al obtener tickets: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
