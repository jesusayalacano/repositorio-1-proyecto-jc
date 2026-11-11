const mongoose = require('mongoose');
const { TIPOS_PERSONALIZACION, ESTADOS_PERSONALIZACION } = require('../constantes');

const personalizacionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tipo: {
      type: String,
      required: true,
      enum: TIPOS_PERSONALIZACION,
    },
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
      required: true,
      trim: true,
    },
    talla: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    detalle: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40,
    },
    notas: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    imagen: {
      type: String,
      default: null,
    },
    estado: {
      type: String,
      enum: ESTADOS_PERSONALIZACION,
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
    collection: 'personalizaciones',
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Personalizacion', personalizacionSchema);
