const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const convoSchema = new Schema({
    user_id: { type: String, required: true },
    res_id: { type: String },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1h' }
    }
}, { strict: false, timestamps: false });

const ohymy = mongoose.connection.useDb('scraping');
const gptConvoStateModel = ohymy.model('GPT-CONVO', convoSchema);
module.exports = gptConvoStateModel;