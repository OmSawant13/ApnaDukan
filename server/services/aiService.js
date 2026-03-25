const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Classifies a product into a smart category based on its name and category name.
 * Returns one of: 'daily', 'snacks', 'cooking', 'household', 'baby', 'other'
 */
async function classifyProduct(productName, categoryName) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            Act as a grocery store catalog manager. 
            Classify the following product into EXACTLY ONE of these categories:
            - "daily": Dairy, milk, bread, eggs, breakfast essentials, fresh morning items.
            - "snacks": Biscuits, chips, namkeen, cold drinks, tea, coffee, chocolates, instant noodles (maggi).
            - "cooking": Spices, rice, flour (atta), pulses (dal), oil, ghee, sugar, salt.
            - "household": Cleaning supplies, detergents, soaps, floor cleaners, toilet cleaners.
            - "baby": Diapers, baby food, baby wipes, baby care.
            - "other": Anything else that doesn't fit clearly.

            Product Name: "${productName}"
            Category Name: "${categoryName}"

            Respond with ONLY the lowercase category name (e.g., "daily" or "snacks"). No explanation, no extra text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().toLowerCase();

        // Validate response
        const validCategories = ['daily', 'snacks', 'cooking', 'household', 'baby', 'other'];
        if (validCategories.includes(text)) {
            return text;
        }

        console.warn(`AI returned invalid category: "${text}". Defaulting to "other".`);
        return 'other';
    } catch (error) {
        console.error("AI Classification Error:", error);
        return 'other'; // Fallback
    }
}

/**
 * Translates a list of strings into the target language.
 * targetLanguage can be: 'hi' (Hindi), 'mr' (Marathi), 'hg' (Hinglish)
 */
async function translateText(texts, targetLanguage) {
    if (!texts || texts.length === 0) return [];
    if (targetLanguage === 'en') return texts;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const langMap = {
            'hi': 'Hindi',
            'mr': 'Marathi',
            'hg': 'Hinglish (Hindi written in English script, e.g., "Doodh" for Milk)'
        };

        const targetLangName = langMap[targetLanguage] || 'English';

        const prompt = `
            Act as a professional translator for a grocery shopping app.
            Translate the following list of product names or categories into ${targetLangName}.
            
            Rules:
            1. Maintain the same list order.
            2. Return ONLY the translated strings separated by a newline.
            3. Do not add any numbering, explanations, or extra text.
            4. If it is "Hinglish", use common colloquial terms used in Indian households (e.g., "Sabzi" for Vegetables, "Chawal" for Rice).

            List to translate:
            ${texts.join('\n')}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedContent = response.text().trim();

        // Split by newline and clean up
        const translatedList = translatedContent.split('\n').map(t => t.trim().replace(/^\d+\.\s*/, ''));

        // Fallback check: if length mismatch, return original
        if (translatedList.length !== texts.length) {
            console.warn(`Translation length mismatch for ${targetLanguage}. Expected ${texts.length}, got ${translatedList.length}`);
            return texts;
        }

        return translatedList;
    } catch (error) {
        console.error(`AI Translation Error (${targetLanguage}):`, error);
        return texts; // Fallback to English
    }
}

module.exports = { classifyProduct, translateText };
