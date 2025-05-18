const Cart = require("../models/Cart");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const {userId} = req;
    const {productId, size, qty} = req.body;
    //1.유저를 가지고 카트 찾기
    let cart = await Cart.findOne({userId});
    //2.유저가 만든 카트가 없다, 만들어주기
    if (!cart) {
      cart = new Cart({userId});
      await cart.save();
    }
    //3.이미 카트에 들어가있는 아이템이냐? productId, size
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
      //item에 있는 productId는 string이 아니라 mongoose.ObjectId이기 때문에 ===이 아니라 .equals()로 비교연산해야된다.
    );
    //4.그렇다면 에러 ('이미 아이템이 카트에 있습니다')
    if (existItem) {
      throw new Error("아이템이 이미 카트에 담겨 있습니다!");
    }

    //5.카트에 아이템을 추가
    cart.items = [...cart.items, {productId, size, qty}];
    await cart.save();
    res
      .status(200)
      .json({status: "success", data: cart, cartItemQty: cart.items.length});
  } catch (error) {
    return res.status(400).json({status: "fail", error: error.message});
  }
};

cartController.getCart = async (req, res) => {
  try {
    const {userId} = req;
    const cart = await Cart.findOne({userId}).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({status: "success", data: cart.items});
  } catch (error) {
    return res.status(400).json({status: "fail", error: error.message});
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const {userId} = req;
    const cartItemId = req.params.id;
    const cart = await Cart.findOne({userId});
    // const deleteItem = await cart.items.findById(cartItemId) //cart.items는 배열이므로 mongoose model 함수를 쓰면 오류가 뜸
    const deleteItem = cart.items.find((item) => item._id == cartItemId);
    //item._id는 ObjectId type, cartItemId는 string type이어서 값이 같아도도 ===연산은 false가 뜬다/ !item._id.equals(id)도 가능
    if (!deleteItem) throw new Error("item doesn't exist");
    cart.items = cart.items.filter((item) => item._id != cartItemId);
    await cart.save();
    res.status(200).json({status: "success",cartItemCount: cart.items.length});
  } catch (error) {
    return res.status(400).json({status: "fail", error: error.message});
  }
};

cartController.updateQty = async (req, res) => {
  try{
    const {userId} = req;
    const cartItemId = req.params.id;
    const {qty} = req.body;
    const cart = await Cart.findOne({userId}).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if(!cart) throw new Error("cart doesn't exist");
    const updateItem = cart.items.find((item) => item._id == cartItemId);
    if (!updateItem) throw new Error("item doesn't exist");
    cart.items = cart.items.map((item)=>{
      if(item._id==cartItemId) item.qty=qty;
      return item;
    })
    await cart.save();
    res.status(200).json({status:"success",data:cart.items})
  }catch(error){
    return res.status(400).json({status:"fail", error:error.message});
  }
};

cartController.getCartQty = async(req,res)=>{
  try{
    const {userId} = req;
    const cart = await Cart.findOne({userId})
    if(!cart) throw new Error("cart doesn't exist")
    const cartItemCount = cart.items.length
    // console.log(cartItemCount,typeof(cartItemCount))
    if(cartItemCount<0) cartItemCount=0;
    res.status(200).json({status:"success",cartItemCount})
  }catch(error){
    return res.status(400).json({status:"fail",error:error.message});
  }
}

module.exports = cartController;
