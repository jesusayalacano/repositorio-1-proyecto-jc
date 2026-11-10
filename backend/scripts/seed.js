const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const fs = require('node:fs/promises');
const mongoose = require('mongoose');
const { conectarDB } = require('../src/db');
const Producto = require('../src/models/Producto');

const ARCHIVO_PRODUCTOS = path.join(__dirname, '..', 'data', 'productos.json');
const ACTUALIZAR = process.argv.includes('--force');

async function seed() {
  await conectarDB();
  await Producto.init();

  const contenido = await fs.readFile(ARCHIVO_PRODUCTOS, 'utf8');
  const productos = JSON.parse(contenido);

  if (!Array.isArray(productos) || productos.length === 0) {
    throw new Error('No hay productos para cargar');
  }

  const operaciones = productos.map((producto) => {
    const datos = {
      ...producto,
      creadoEn: producto.creadoEn ? new Date(producto.creadoEn) : new Date(),
    };

    return {
      updateOne: {
        filter: { id: producto.id },
        update: ACTUALIZAR ? { $set: datos } : { $setOnInsert: datos },
        upsert: true,
      },
    };
  });

  const resultado = await Producto.bulkWrite(operaciones);

  console.log(`Productos en el archivo: ${productos.length}`);
  console.log(`Productos insertados: ${resultado.upsertedCount}`);
  console.log(`Productos actualizados: ${resultado.modifiedCount}`);
  console.log(`Productos que ya existían: ${productos.length - resultado.upsertedCount}`);

  const totalEnBase = await Producto.countDocuments();
  console.log(`Total en MongoDB: ${totalEnBase}`);
}

seed()
  .catch((error) => {
    console.error('Error al cargar los productos:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
