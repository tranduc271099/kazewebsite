const express = require('express');
const BillController = require('../../controllers/Bill/billuser');
const billRouter = express.Router();
const auth = require('../../middleware/auth');
const Bill = require('../../models/Bill/BillUser');

const billControl = new BillController();

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Bạn không có quyền admin' });
};

billRouter.get('/', auth, (req, res) => billControl.getList(req, res));
billRouter.post('/', auth, (req, res) => billControl.addBill(req, res));
billRouter.put('/:id/cancel', auth, (req, res) => billControl.cancelBill(req, res));
billRouter.get('/all', auth, isAdmin, (req, res) => billControl.getAll(req, res));
billRouter.get('/:id', auth, isAdmin, (req, res) => billControl.getById(req, res));
billRouter.put('/:id/status', auth, isAdmin, (req, res) => billControl.updateStatus(req, res));
billRouter.put('/:id/confirm-received', auth, (req, res) => billControl.confirmReceived(req, res));
billRouter.get('/:orderId', async (req, res) => {
  try {
    const bill = await Bill.findOne({ orderId: req.params.orderId });
    if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(bill);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = billRouter;
