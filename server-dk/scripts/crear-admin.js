const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { conectarDB } = require('../db');
const Usuario = require('../models/Usuario');

function argumento(nombre) {
  const prefijo = `--${nombre}=`;
  const encontrado = process.argv.find((valor) => valor.startsWith(prefijo));
  return encontrado ? encontrado.slice(prefijo.length) : '';
}

async function crearAdmin() {
  const email = String(argumento('email') || process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const password = String(argumento('password') || process.env.ADMIN_PASSWORD || '');
  const nombre = String(argumento('nombre') || process.env.ADMIN_NOMBRE || 'Administrador Dunk Labs');

  if (!email || !email.includes('@')) {
    throw new Error('Falta ADMIN_EMAIL (o --email=correo@dominio.com)');
  }

  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres (ADMIN_PASSWORD o --password=...)');
  }

  await conectarDB();
  await Usuario.init();

  const passwordHash = await bcrypt.hash(password, 10);
  const existente = await Usuario.findOne({ email });

  if (existente) {
    existente.nombre = nombre;
    existente.passwordHash = passwordHash;
    existente.rol = 'admin';
    existente.activo = true;
    await existente.save();
    console.log(`Usuario admin actualizado: ${email}`);
  } else {
    await Usuario.create({ email, nombre, passwordHash, rol: 'admin', activo: true });
    console.log(`Usuario admin creado: ${email}`);
  }
}

crearAdmin()
  .catch((error) => {
    console.error('No se pudo crear el usuario admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
