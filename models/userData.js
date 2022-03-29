const mongoose = require('mongoose');

const userDb = new mongoose.Schema({
  id: { type: String, required: false },
  username: { type: String, required: false },
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
  last_message_id: { type: String, required: false },
  last_mentioned_message_id: { type: String, required: false },
  scores_quiz: { type: Number, default: 0 },
  roles: { type: Array, default: [] },
  pending_wfh: { type: Boolean, require: false },
  last_bot_message_id: { type: String, required: false },
  deactive: { type: Boolean },
  roles_discord: { type: Array, default: [] },
  botPing: { type: Boolean, default: false },
});

module.exports = mongoose.model('komu_user', userDb);
