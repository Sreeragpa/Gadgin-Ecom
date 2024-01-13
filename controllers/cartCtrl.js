const Cartdb = require('../models/cartModel');
const cartDb = require('../models/cartModel');
const productDb = require('../models/productModel');
const mongoose = require('mongoose')

exports.addtoCart = async(req,res)=>{
    
    try {
        const pid = req.params.id;
        const userid = req.session.passport.user;
        
        let userCart = await cartDb.findOne({ userid });
        // Creating a new Cart if cart doesnt exist
        if (!userCart) {
            userCart = new cartDb({
                userid,
                cartitems: [
                    {
                        productid: pid,
                        quantity: 1,
                        createdAt:Date.now()
                    },
                ],
            });
        } else {
            // If cart present , then pushing products to Cart
            const existingCartItem = userCart.cartitems.find(item => item.productid.toString() === pid);
        
            if (existingCartItem) {
                if(existingCartItem.quantity!=5){
                    // existingCartItem.quantity += 1;
                }
                
            } else {
                userCart.cartitems.push({
                    productid: pid,
                    quantity: 1,
                    createdAt:Date.now()
                });
            }
        }
        // Save the updated cart
        await userCart.save();

        const referer = req.get('Referer');
        res.redirect(referer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getCart =async(req,res)=>{

    // Destructuring Products inside the cart and sending the cart products
    try {
        const userid = req.params.id;
        const result = await cartDb.aggregate([
            {
                $match:{ userid: new mongoose.Types.ObjectId(userid) }
            },
            {
                $unwind: '$cartitems'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'cartitems.productid',
                    foreignField: '_id',
                    as: 'cartItemsWithDetails'
                }
            },
            {
                $lookup: {
                    from: 'offers',
                    localField: 'cartItemsWithDetails.offer',
                    foreignField: '_id',
                    as: 'offer1'
                }
            },

            // {
            //     $project: {
            //         cartItemsWithDetails: 1,
            //         "cartitems":1
            //     }
            // },
    
        ]);

        if (result.length > 0) {

            res.status(200).send(result)

        } else {
            const message = "false"
            res.send(message)
        }
    } catch (error) {
        console.error("Error in getCart:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
}

exports.deleteCartitem =async(req,res)=>{
    try {
        // Removing Product from Cart 
        const pid = req.params.id;
        const userid = req.session.passport.user;
        const cart = await cartDb.findOne({userid});
        const todeleteIndex = cart.cartitems.findIndex((value)=>{
            return value.productid.toString() === pid
        })
        if (todeleteIndex !== -1){
            cart.cartitems.splice(todeleteIndex,1);
            await cart.save()
            res.status(200).json({ success: true, message: 'Item deleted successfully' });
        }else {
            return res.status(404).json({ message: 'Item not found in the cart' });
        }
    } catch (error) {
        console.error("Error in deleteCartitem:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }


    
}

exports.updateQuantity = async(req,res)=>{
    // Updating Cart Product Quantity
    try {
        const pid=req.params.id;
        const userid=req.session.passport.user;
        let newQuantity=req.query.qty;
        
        const result = await cartDb.findOneAndUpdate(
            { 'cartitems.productid': pid },
            { $set: { 'cartitems.$.quantity': newQuantity } },
            { new: true }
        );
      
    } catch (error) {
        console.error("Error in updateQuantity:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }


}

exports.clearCart = async(req,res)=>{
    // Clearing all items in the cart
    const userid = req.session.passport.user;

    try {
        const result = await cartDb.findOneAndUpdate({userid:userid},{$set:{cartitems:[]}});

        if(result){
            res.redirect('/cart');
        }
    } catch (error) {
        console.error("Error in clearCart:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
}

exports.clearAfterPurchase = async(req,res)=>{
    // Clearing cart after purchase
    const userid = req.query.userid;


    try {
        const result = await cartDb.findOneAndUpdate({userid:userid},{$set:{cartitems:[]}});
        res.status(200).send('Cart cleared successfully');

    } catch (error) {
        console.error("Error in clearCart:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
}