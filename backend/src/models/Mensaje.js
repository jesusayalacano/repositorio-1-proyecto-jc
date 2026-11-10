const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema(
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
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
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

module.exports = mongoose.model('Mensaje', mensajeSchema);
