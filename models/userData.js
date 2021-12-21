const mongoose = require('mongoose');


const userdb = new mongoose.Schema({
     id: {type: String, required: true },
     username: { type: String, required: true },
     discriminator: { type: String, required: false },
     avatar: { type: String, required: false },
     bot: { type: Boolean, required: false },
     system: { type: Boolean, required: false },
     mfa_enabled: { type: Boolean, required: false },
     banner: { type: String, required: false },
     accent_color: { type: String, required: false },
     locale: { type: String, required: false },
     verified: { type: Boolean, required: false },
     email: { type: String, required: false },
     flags: { type: Number, required: false },
     premium_type: { type: Number, required: false },
     public_flags: { type: Number, required: false },
})
const userData = module.exports = mongoose.model('komu_user', userdb)