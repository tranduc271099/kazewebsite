const mongoose = require('mongoose');
const Bill = require('./models/Bill/BillUser');

async function compareRevenueCalculations() {
    try {
        await mongoose.connect('mongodb://localhost:27017/kazewebsite');
        console.log('Connected to database');

        const revenueStatusFilter = { trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } };

        // Cách 1: Tính theo tong_tien (cũ)
        const revenueMethod1 = await Bill.aggregate([
            { $match: revenueStatusFilter },
            { $group: { _id: null, total: { $sum: '$tong_tien' } } }
        ]);

        // Cách 2: Tính theo giá × số lượng sản phẩm (mới)
        const revenueMethod2 = await Bill.aggregate([
            { $match: revenueStatusFilter },
            { $unwind: '$danh_sach_san_pham' },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong']
                        }
                    }
                }
            }
        ]);

        console.log('\n=== So sánh cách tính doanh thu ===');
        console.log('Cách 1 (tong_tien):', (revenueMethod1[0]?.total || 0).toLocaleString('vi-VN'), 'VND');
        console.log('Cách 2 (giá × số lượng):', (revenueMethod2[0]?.total || 0).toLocaleString('vi-VN'), 'VND');

        const difference = (revenueMethod1[0]?.total || 0) - (revenueMethod2[0]?.total || 0);
        console.log('Chênh lệch:', difference.toLocaleString('vi-VN'), 'VND');

        if (difference > 0) {
            console.log('➡️ Cách 1 cao hơn (có thể do phí vận chuyển/thuế)');
        } else if (difference < 0) {
            console.log('➡️ Cách 2 cao hơn (có thể do voucher/giảm giá)');
        } else {
            console.log('➡️ Hai cách tính bằng nhau');
        }

        // Kiểm tra một số đơn hàng mẫu
        console.log('\n=== Kiểm tra đơn hàng mẫu ===');
        const sampleOrders = await Bill.find(revenueStatusFilter).limit(3);

        for (const order of sampleOrders) {
            const productRevenue = order.danh_sach_san_pham.reduce((sum, item) =>
                sum + (item.gia * item.so_luong), 0
            );

            console.log(`\nĐơn hàng ${order._id}:`);
            console.log(`- Tổng tiền: ${order.tong_tien.toLocaleString('vi-VN')} VND`);
            console.log(`- Doanh thu sản phẩm: ${productRevenue.toLocaleString('vi-VN')} VND`);
            console.log(`- Chênh lệch: ${(order.tong_tien - productRevenue).toLocaleString('vi-VN')} VND`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

compareRevenueCalculations();
