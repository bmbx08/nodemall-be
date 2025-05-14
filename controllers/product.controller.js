const Product = require("../models/Product");

const PAGE_SIZE=5
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

        //if문으로 상황별로 다르게 호출할 수 있지만, 조건문을 사용하면 더 효율적으로 정리 가능
        //name과 일치하는 상품뿐만 아니라 name을 포함하는 상품도 검색, option:i는 대소문자 구별 안하고 찾아달라는 뜻
        const cond = name?{name:{$regex:name,$options:'i'},isDeleted:false}:{isDeleted:false}
        let query=Product.find(cond)
        let response = {state:"success"} //필요에 따라 response를 수정할것(동적인 response)이기에 response를 먼저 선언
        if(page){
            query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);
            //최종 몇개 페이지
            const totalItemNum = await Product.countDocuments(cond);
            //데이터가 총 개수/ PAGE_SIZE
            const totalPageNum=Math.ceil(totalItemNum/PAGE_SIZE);
            response.totalPageNum=totalPageNum; 
        }

        const productList=await query.exec();
        response.data=productList;
        res.status(200).json(response);


        // if(name){
        //     const productList = await Product.find({name:{$regex:name,$options:""}}) 
        // }else{
        //     const productList = await Product.find({})
        // }
    }catch(error){
        res.status(400).json({status:"error",error:error.message});
    }
}

productController.updateProduct=async(req,res)=>{
    try{
        const productId = req.params.id;
        const {sku,name,size,image,price,description,category,stock,status}=req.body;
        const product = await Product.findByIdAndUpdate({_id:productId},{sku,name,size,image,price,description,category,stock,status},{new:true});
        if(!product) throw new Error("item doesn't exist");
        res.status(200).json({status:"success",data:product});
    }catch(error){
        res.status(400).json({status:"error",error:error.message})
    }
}

productController.deleteProduct=async(req,res)=>{
    try{
        const productId=req.params.id;
        const product = await Product.findByIdAndUpdate(productId,{isDeleted:true},{new:true});
        if(!product) throw new Error("item doesn't exist");
        res.status(200).json({status:"success",data:product});
    }catch(error){
        res.status(400).json({status:"error",error:error.message})
    }
}

module.exports=productController;