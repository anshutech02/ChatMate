const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({})


/**
 * Generate an AI response with optional system instruction.
 * @param {Array} content - The chat contents array (ltm + stm)
 * @param {string} systemInstruction - Optional system prompt for context mode
 */
async function generateResponse(content, systemInstruction = '') {
    const config = systemInstruction
        ? { systemInstruction }
        : {}

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: content,
        config
    })

    return response.text
}


async function generateVector(content) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: content,
        config: {
            outputDimensionality: 1024
        }
    })

    return response.embeddings[ 0 ].values
}


module.exports = {
    generateResponse,
    generateVector
}