
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
billRouter.put('/:id/admin-cancel', auth, isAdmin, (req, res) => billControl.cancelBill(req, res));
billRouter.get('/all', auth, isAdmin, (req, res) => billControl.getAll(req, res));
billRouter.get('/:id', auth, isAdmin, (req, res) => billControl.getById(req, res));
billRouter.put('/:id/status', auth, isAdmin, (req, res) => billControl.updateStatus(req, res));
billRouter.put('/:id/confirm-received', auth, (req, res) => billControl.confirmReceived(req, res));
billRouter.post('/:id/return-request', auth, (req, res) => billControl.createReturnRequest(req, res));
billRouter.put('/:id/return-request/status', auth, isAdmin, (req, res) => billControl.updateReturnRequestStatus(req, res));
billRouter.get('/order/:orderId', auth, (req, res) => billControl.getByOrderId(req, res));

// Lấy danh sách đơn hàng đã áp dụng voucher theo code
billRouter.get('/applied-voucher/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const bills = await Bill.find({ 'voucher.code': code }, { orderId: 1, _id: 0 });
    res.json({ orders: bills.map(b => b.orderId) });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = billRouter;
