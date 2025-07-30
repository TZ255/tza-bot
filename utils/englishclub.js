const { sendMessageToAdmin } = require("./telegram");

const formatEnglishClub = async (wordObj) => {
    try {
        const { type, term, meaning, examples, challenge } = wordObj;

        if (!type || !term || !meaning || !examples || !challenge) {
            throw new Error('Missing required fields');
        }

        return `🌟 *${type.toUpperCase()} of the Day* 🌟  
*🗣️ "${term}"*

📘 *Meaning:*  
> ${meaning.english}

🇹🇿 *Swahili:*  
> ${meaning.swahili}

✍️ *Example Sentences:*

1). ${examples[0].en}
> 🇹🇿 ${examples[0].sw}

2). ${examples[1].en}
> 🇹🇿 ${examples[1].sw}

3). ${examples[2].en}
> 🇹🇿 ${examples[2].sw}


💬 *Challenge for Today:*  
> ${challenge.text}`;

    } catch (error) {
        console.error('Error sending message:', error);
        sendMessageToAdmin(`Error formatting English Club message: ${error.message}`);
        throw error;
    }
}

module.exports = { formatEnglishClub };