const express = require('express');
const router = express.Router();
const deletedVariantController = require('../controllers/deletedVariant.controller');
const auth = require('../middleware/auth');

// Get deleted variants for a specific product
router.get('/product/:productId', auth, deletedVariantController.getDeletedVariantsForProduct);

// Get all deleted variants (admin only)
router.get('/all', auth, deletedVariantController.getAllDeletedVariants);

// Get specific deleted variant info for order display
router.get('/info/:productId/:color/:size', deletedVariantController.getDeletedVariantInfo);

module.exports = router;
