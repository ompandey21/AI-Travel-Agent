    const express = require('express');
const router = express.Router();
const { addExpense, settleExpense, getSettlements, getTripExpenses, getUserBalance, confirmSettlement } = require('../controllers/expenseSplitterController');
const auth = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { addExpenseSchema, settleExpenseSchema } = require('../../validations/expenseValidator');

router.post('/add-expense/:tripId', auth, validate(addExpenseSchema), addExpense);
router.get('/get-settlement/:tripId', auth, getSettlements);
router.post('/settle-expense/:tripId', auth, validate(settleExpenseSchema), settleExpense);
router.post('/confirm-settlement/:settlementId', auth, confirmSettlement);
router.get('/get-expenses/:tripId', auth, getTripExpenses);
router.get('/get-balance/:tripId', auth, getUserBalance);

module.exports = router;