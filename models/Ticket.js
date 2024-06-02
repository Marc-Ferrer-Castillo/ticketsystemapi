// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  lastUpdate: { type: Date, default: Date.now },
  assignedTo: { type: String },
  client: { type: String, required: true },
  category: { type: String, required: true },
  notes: { type: String },
  isArchived: { type: Boolean, default: false }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;