const express = require('express');
const router = express.Router();
const { translateText } = require('../services/aiService');

/**
 * @route POST /api/translate
 * @desc Translates a list of strings into a target language
 */
router.post('/', async (req, res) => {
    const { texts, targetLanguage } = req.body;

    if (!texts || !Array.isArray(texts)) {
        return res.status(400).json({ error: 'texts must be an array of strings' });
    }

    if (!targetLanguage) {
        return res.status(400).json({ error: 'targetLanguage is required' });
    }

    try {
        const translations = await translateText(texts, targetLanguage);
        res.json({ translations });
    } catch (error) {
        console.error('Translation Route Error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

module.exports = router;
