Table User {
  _id varchar [pk]
  name varchar
  email varchar [unique]
  password varchar
  phone varchar
  address varchar
  image varchar
  vouchers varchar[]
  gender varchar
  dob date
  isActive boolean
  resetPasswordToken varchar
  resetPasswordExpiry datetime
}

Table Product {
  _id varchar [pk]
  name varchar
  slug varchar
  description text
  brand varchar
  category varchar [ref: > Category._id]
  price int
  costPrice int
  stock int
  isActive boolean
  rating float
  reviewCount int
}

Table ProductVariant {
  _id varchar [pk]
  productId varchar [ref: > Product._id]
  attributes json
  stock int
  price int
  costPrice int
  images varchar[]
}

Table Category {
  _id varchar [pk]
  name varchar
  image varchar
  parentId varchar [ref: - Category._id]
}

Table Cart {
  _id varchar [pk]
  userId varchar [ref: > User._id, unique]
}

Table CartItem {
  cartId varchar [ref: > Cart._id]
  productId varchar [ref: > Product._id]
  quantity int
  color varchar
  size varchar
  priceAtTimeOfAddition int
}

Table Bill {
  _id varchar [pk]
  nguoi_dung_id varchar [ref: > User._id]
  dia_chi_giao_hang varchar
  tong_tien int
  phuong_thuc_thanh_toan varchar
  ghi_chu varchar
  trang_thai varchar
  thanh_toan varchar
  ly_do_huy varchar
  nguoi_huy_id varchar [ref: > User._id]
  nguoi_huy_loai varchar
  ngay_tao datetime
  ngay_cap_nhat datetime
}

Table BillProduct {
  billId varchar [ref: > Bill._id]
  san_pham_id varchar [ref: > Product._id]
  so_luong int
  gia int
  mau_sac varchar
  kich_thuoc varchar
}

Table CommentUser {
  _id varchar [pk]
  productId varchar [ref: > Product._id]
  userId varchar [ref: > User._id]
  content text
  rating int
  orderId varchar [ref: > Bill._id]
  status varchar
  adminReply json
  reports json
  isHidden boolean
}
