const express = require('express');
const BillController = require('../../controllers/Bill/billuser');
const billRouter = express.Router();
const auth = require('../../middleware/auth');

const billControl = new BillController();

billRouter.get('/', auth, (req, res) => billControl.getList(req, res));
billRouter.post('/', auth, (req, res) => billControl.addBill(req, res));
billRouter.put('/:id/cancel', auth, (req, res) => billControl.cancelBill(req, res));

module.exports = billRouter;
