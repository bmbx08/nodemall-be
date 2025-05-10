const Product = require("../models/Product");

const productController={}

productController.createProduct=async(req,res)=>{
    try{
        const {sku,name,size,image,category,description,price,stock,status}=req.body;
        const product = new Product({sku,name,size,image,category,description,price,stock,status})

        await product.save();
        res.status(200).json({status:"success",product})
    }catch(error){
        res.status(400).json({status:"fail",error:error.message})
    }
}

productController.getProducts=async(req,res)=>{
    try{
        const {page,name}=req.query;

        //if문으로 상황별로 다르게 호출할 수 있지만, 조건문을 사용하면 더 편리하게 정리 가능
        //name과 일치하는 상품뿐만 아니라 name을 포함하는 상품도 검색, option:i는 대소문자 구별 안하고 찾아달라는 뜻
        const cond = name?{name:{$regex:name,$options:'i'}}:{}
        let query=Product.find(cond)

        const productList=await query.exec();

        // if(name){
        //     const productList = await Product.find({name:{$regex:name,$options:""}}) 
        // }else{
        //     const productList = await Product.find({})
        // }
        res.status(200).json({status:"success",data:productList})
    }catch(error){
        res.status(400).json({status:"error",error:error.message})
    }
}

module.exports=productController;