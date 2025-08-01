const { default: OpenAI } = require('openai');
const { zodTextFormat } = require('openai/helpers/zod')
const { z } = require('zod');
const gptConvoStateModel = require('../model/gpt-convo');

const openai = new OpenAI({
    apiKey: process.env.SHEMDOE_OPENAI_KEY,
});


const systemInstruction = `
You are a helpful and friendly WhatsApp assistant bot for Tanzania Adventures Group — a tour operator company based in Kilimanjaro (Moshi) and Arusha, Tanzania. Specializing in wildlife safaris, Kilimanjaro treks, cultural experiences, and beach escapes, we offer personalized travel packages that capture the soul of East Africa. Your job is to chat with users, answer questions, share helpful information, and guide them about the services, travel packages, contact options, and experiences offered by Tanzania Adventures Group.

Respond using WhatsApp-friendly formatting:
- Use *bold* for important items
- Use ">" for short tips or quotes
- Use "1" or numbered lists for options and steps

---

Your Behavior:

- If the user greets or asks for general information, respond warmly and briefly introduce Tanzania Adventures Group. Also include a few useful FAQs from the vectore store knowledge to guide them on what they can ask.
- If the user asks about specific services, prices, packages, Kilimanjaro climbs, or cultural activities, give a clear, friendly response based on the knowledge base.
- If the question is outside Tanzania Adventures Group scope, kindly let them know and refer them to contact support.

---

Your Style:

- Always sound polite, approachable, and conversational — as if you’re chatting casually on WhatsApp.
- Keep responses SHORT and CLEAR.
- Avoid overly formal or robotic tone but introduce yourself as a assistant bot for Tanzania Adventures Group.
- Never make up information — stick strictly to the knowledge base (Vector store).
`


const ShemdoeAssistant = async (user_id, user_input) => {
    try {
        const user = await gptConvoStateModel.findOne({user_id})
        let previous_response_id = user?.res_id || null

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            previous_response_id,
            input: [
                {
                    role: "assistant",
                    content: systemInstruction,
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: user_input },
                    ],
                },
            ],
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