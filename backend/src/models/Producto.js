const mongoose = require('mongoose');
const { CATEGORIAS } = require('../constantes');

const productoSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    descripcion: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    categoria: {
      type: String,
      required: true,
      enum: {
        values: CATEGORIAS,
        message: 'Categoría inválida',
      },
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    imagen: {
      type: String,
      default: '',
      trim: true,
    },
    etiqueta: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40,
    },
    creadoEn: {
      type: Date,
      default: Date.now,
    },
    actualizadoEn: {
      type: Date,
    },
  },
  {
    id: false,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Producto', productoSchema);
