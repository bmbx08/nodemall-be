const orderController = {};
const Order = require("../models/Order");
const Product = require("../models/Product");
const randomStringGenerator = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

PAGE_SIZE = 5;

orderController.createOrder = async (req, res) => {
  try {
    //프론트엔드에서 데이터 보낸거 받아와 userId, totalPrice, shipTo, contact, orderList
    const {userId} = req;
    const {shipTo, contact, totalPrice, orderList} = req.body;
    //재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    //재고가 충분하지 않는 아이템이 있었다 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        //.reduce()는 배열의 모든 요소를 하나의 값으로 줄일 때 사용용
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    //order을 만들자!
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    //save후에 카트를 비워주자
    res.status(200).json({status: "success", orderNum: newOrder.orderNum});
  } catch (error) {
    return res.status(400).json({status: "fail", error: error.message});
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const {userId} = req;
    const orderList = await Order.find({userId}).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({status: "success", orderList});
  } catch (error) {
    return res.status(400).json({status: "fail", error: error.message});
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const {page, ordernum} = req.query;

    const cond = ordernum ? {orderNum: {$regex: ordernum, $options: "i"}} : {};
    let query = Order.find(cond).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    let response = {state: "success"};
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      //최종 몇개 페이지
      const totalItemNum = await Order.countDocuments(cond);
      //데이터가 총 개수/ PAGE_SIZE
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const orderList = await query.exec();
    response.data = orderList;
    res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({status: "fail", error: error.message});
  }
};

module.exports = orderController;
