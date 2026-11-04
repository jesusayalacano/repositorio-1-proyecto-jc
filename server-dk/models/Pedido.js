const mongoose = require('mongoose');
const { ESTADOS_PEDIDO } = require('../constantes');

const clienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    telefono: {
      type: String,
      default: '',
      trim: true,
    },
    direccion: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    productoId: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    cliente: {
      type: clienteSchema,
      required: true,
    },
    items: {
      type: [itemSchema],
      required: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    moneda: {
      type: String,
      default: 'COP',
    },
    estado: {
      type: String,
      enum: ESTADOS_PEDIDO,
      default: 'pendiente',
    },
    creadoEn: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model('Pedido', pedidoSchema);
