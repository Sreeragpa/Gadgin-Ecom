const Wishlistdb = require('../models/wishlistModel');
const Productdb = require('../models/productModel')
exports.addtoWishlist = async(req,res,next)=>{
    try {
        const userid = req.session?.passport?.user;

        if(!userid){
            const refferer = req.get("Referrer");
            return res.redirect(303,refferer)
        }
        const pid = req.params.pid;
        const wishlist = await Wishlistdb.findOne({userid:userid});

        if(!wishlist){
            const newWishlist = new Wishlistdb({
                userid:userid,
                products:[pid]
            });

            await newWishlist.save();
        }else{
            const wishlist = await Wishlistdb.findOne({userid:userid,products:pid});
            const wishlist2 = await Wishlistdb.findOne({
                userid: userid,
                products: { $elemMatch: { $eq: pid } }
              });

              if(!wishlist){
                const updatedwishlist = await Wishlistdb.findOneAndUpdate({userid:userid},{$push:{products:pid}},{new:true});

              }else{
                const updatedwishlist = await Wishlistdb.findOneAndUpdate({userid:userid},{$pull:{products:pid}},{new:true});
      
              }
            
              
        }
        const refferer = req.get("Referrer");
        
        res.redirect(303,refferer);
    } catch (error) {
        next(error)
    }
}

exports.getWishlist = async(req,res,next)=>{
    const userid = req.params.id;
    const getProducts = req.query?.products
    if(getProducts){
        console.log('hehehheheh');
        const wishlist = await Wishlistdb.find({userid:userid}).populate('products');
        console.log(wishlist);
        if(wishlist.length!=0){
            res.send(wishlist)
        }else{
            res.send(false)
        }
    }else{
        const wishlist = await Wishlistdb.find({userid:userid});
        if(wishlist.length!=0){
            res.send(wishlist)
        }else{
            res.send(false)
        }
    }
   
}