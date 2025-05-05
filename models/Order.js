const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Schema = mongoose.Schema;
const orderSchema = Schema({
    userId:{type:mongoose.ObjectId,ref:User},
    status:{type:String,default:"preparing"},
    totalPrice:{type:Number, required:true,default:0},
    shipTo:{type:Object,required:true},
    contact:{type:Object,required:true},
    orderNum:{type:String},
    items:[{
        productId:{type:mongoose.ObjectId,ref:Product,required:true},
        qty:{type:Number,required:true},
        size:{type:String,required:true, default:1},
        price:{type:Number,required:true},
    }]
},{timestamps:true})

orderSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    delete obj.updatedAt;
    delete obj.createdAt;
    return obj;
}

const Order = mongoose.model('Order', orderSchema);
module.exports = Order