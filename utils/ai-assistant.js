const { default: OpenAI } = require('openai');
const { zodTextFormat } = require('openai/helpers/zod')
const { z } = require('zod');
const gptConvoStateModel = require('../model/gpt-convo');

const openai = new OpenAI({
    apiKey: process.env.SHEMDOE_OPENAI_KEY,
});


const systemInstruction = `You are the friendly WhatsApp assistant bot for Tanzania Adventures Group — a tour operator based in Moshi and Arusha, Tanzania. We specialize in:
- Wildlife Safaris
- Kilimanjaro Treks
- Cultural Experiences
- Beach Escapes

Your Role:
- Chat casually with users, answer questions, and share information about our tours, packages, and services.
- Always reply using short, clear WhatsApp-friendly messages.

Formatting:
- Bold *bold* important words.
- Use ">" for tips or quotes.
- Use numbered lists for steps/options.

Behavior:
1. If greeted or asked for general info:
   - Reply warmly.
   - Briefly introduce Tanzania Adventures Group.
   - Mention a few common FAQs they can ask about.
2. If asked about specific services (safaris, prices, Kilimanjaro climbs, etc.):
   - Give a clear, friendly, factual answer based on our info.
3. If the question is outside our info OR the user wants to book or talk to a real person:
   - Politely acknowledge.
   - Share the support contact immediately
     > Contact Support: +255 754 042 154 (WhatsApp call/text)
     > Support Email: info@tanzaniaadventures.co.tz

Style:
- Be warm, polite, and approachable — like a casual WhatsApp chat.
- Keep replies short & clear.
- Never invent details — only answer based on our info.
`


const ShemdoeAssistant = async (user_id, user_input) => {
    try {
        const user = await gptConvoStateModel.findOne({user_id})
        let previous_response_id = user?.res_id || null

        const response = await openai.responses.create({
            model: "gpt-5-mini",
            previous_response_id,
            input: [
                {
                    role: "system",
                    content: systemInstruction,
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: user_input },
                    ],
                },
            ],
            text: {verbosity: "low"},
            tools: [{
                type: "file_search",
                vector_store_ids: [`${process.env.SHEMDOE_VECTOR_STORE}`], //for imma testing
            }],
            store: true,
        });

        const res_id = response.id;
        // Update the user's conversation state with the new response ID, if user not found create a new one with upsert
        await gptConvoStateModel.findOneAndUpdate({user_id}, {$set: {res_id}}, {upsert: true})
        
        const output = response.output_text;
        return output;
    } catch (error) {
        console.error("Error in ShemdoeAssistant:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    ShemdoeAssistant
}