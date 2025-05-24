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

productController.getProductDetail=async(req,res)=>{
    try{
        const productId = req.params.id;
        const product = await Product.findById(productId);
        res.status(200).json({status:"success",data:product});
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

productController.checkStock=async(item)=>{
    // 내가 사려는 아이템 재고 정보 들고오기
    const product = await Product.findById(item.productId)
    // 내가 사려는 아이템 qty, 재고 비교
    if(product.stock[item.size] < item.qty){
    // 재고가 불충분하면 불충분 메세지와 함께 데이터 반환
        return {isVerify:false, message: `${product.name}의 ${item.size} 재고가 부족합니다.`}
    }

    // 충분하다면, 재고에서 qty를 빼고 성공 반환
    const newStock = {...product.stock}
    newStock[item.size] -= item.qty
    product.stock = newStock;

    await product.save();
    return{isVerify:true};
}

productController.checkItemListStock=async(itemList)=>{
    const insufficientStockItems = [];
    //재고 확인 로직
    await Promise.all(  //Promise.all()을 사용하면 안에 있는 비동기 처리들이 병렬로 한 번에 실행된다(더 빨리 끝난다)(기존에는 직렬 처리).
        itemList.map(async (item)=>{
            const stockCheck = await productController.checkStock(item);
            if(!stockCheck.isVerify) {
                insufficientStockItems.push({item,message:stockCheck.message})
            }
            return stockCheck;
        })
    )
    return insufficientStockItems;
}



module.exports=productController;