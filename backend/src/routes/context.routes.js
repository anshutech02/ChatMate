const express = require('express');
const router = express.Router();
const { getPresets, parseFile, upload } = require('../controllers/context.controller');
const { authUser } = require('../middlewares/auth.middleware');

const handleUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error.',
                error: err.message || 'File upload error.'
            });
        }
        next();
    });
};

router.get('/presets', getPresets);
router.post('/parse-file', authUser, handleUpload, parseFile);

module.exports = router;
