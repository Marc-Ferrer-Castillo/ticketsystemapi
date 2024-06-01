const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/usuarios', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log(err));

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
    res.status(200).send('Inicio de sesión exitoso');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(400).send(`Error al iniciar sesión: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
