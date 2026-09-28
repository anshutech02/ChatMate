const multer = require('multer');
const pdfParseModule = require('pdf-parse');
const { getPresetList } = require('../services/context.service');

// Store file in memory (no disk) so we can parse on the fly
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        const isPdf = file.mimetype === 'application/pdf' || 
                      file.mimetype === 'application/x-pdf' || 
                      file.originalname?.toLowerCase().endsWith('.pdf');
        const isTxt = file.mimetype?.startsWith('text/') || 
                      file.mimetype === 'application/octet-stream' ||
                      file.originalname?.toLowerCase().endsWith('.txt');

        if (isPdf || isTxt) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF (.pdf) and TXT (.txt) files are allowed.'));
        }
    }
});

/**
 * Extract text from PDF buffer supporting both pdf-parse v1 and v2+
 */
async function extractTextFromPdf(buffer) {
    if (typeof pdfParseModule === 'function') {
        const data = await pdfParseModule(buffer);
        return data.text || '';
    } else if (pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({ data: buffer });
        const result = await parser.getText();
        return result.text || '';
    } else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
        const data = await pdfParseModule.default(buffer);
        return data.text || '';
    } else {
        throw new Error('Unsupported pdf-parse module format');
    }
}

/**
 * GET /api/context/presets
 * Returns the list of available preset contexts.
 */
async function getPresets(req, res) {
    try {
        const presets = getPresetList();
        res.json({ success: true, presets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, error: error.message });
    }
}


/**
 * POST /api/context/parse-file
 * Accepts a PDF or TXT file, extracts and returns the text content.
 */
async function parseFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.', error: 'No file uploaded.' });
        }

        let extractedText = '';
        const isPdf = req.file.mimetype === 'application/pdf' || 
                      req.file.mimetype === 'application/x-pdf' || 
                      req.file.originalname?.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            extractedText = await extractTextFromPdf(req.file.buffer);
        } else {
            // Plain text
            extractedText = req.file.buffer.toString('utf-8');
        }

        // Trim to a safe size (max ~8000 chars to not overload the context window)
        const trimmed = (extractedText || '').trim().slice(0, 8000);

        res.json({
            success: true,
            text: trimmed,
            originalLength: (extractedText || '').length,
            truncated: (extractedText || '').length > 8000
        });

    } catch (error) {
        console.error('Context parseFile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to extract text from document.',
            error: error.message
        });
    }
}


module.exports = { getPresets, parseFile, upload };
