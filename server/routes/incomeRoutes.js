const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const { protect } = require('../middlewares/authMiddleware'); 

router.post('/', protect, incomeController.addIncome);
router.get('/', protect, incomeController.getIncomes);
router.get('/monthly', protect, incomeController.getMonthlyIncome);
router.delete('/:id', protect, incomeController.deleteIncome);

module.exports = router;