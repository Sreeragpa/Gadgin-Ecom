const {body ,check ,validationResult} =require('express-validator');
exports.checkAddress = [
    body('name')
    .exists().withMessage('Name Required')
    .trim().withMessage('Name Required')
    .isLength({ min: 2 }).withMessage("Minimun 2 characters Required"),

    check('house','Address Required')
        .exists()
        .trim()
        .isLength({min:2}),

    check('phone','Invalid Phone')
        .isLength({min:10})
        ,

    check('pin','Invalid Pincode')
        .isLength(6)

]

exports.strongPassword = [
    body('password')
    .isStrongPassword().withMessage("Enter a stong Password")
]

exports.validateCoupon = [
    body('couponcode')
        .isLength({ min: 1 }).trim().withMessage('Coupon Code should not contain spaces'),
    body('couponexpiry')
        .isDate().withMessage('Invalid Date'),
    body('coupondiscount')
        .custom(value => {
            // Custom validation function
            if (parseInt(value) > 70) {
                throw new Error(`Coupon discount must be less than 70`);
            }
            return true; // Indicates the validation passed
        }).withMessage('Coupon discount must be less than 70'),
]

exports.validateOffer = [
    body('discount')
        .isLength({min:1}).trim().withMessage('Invalid Discount')
        .custom(value => {
            if (parseInt(value) > 70) {
                throw new Error(`Coupon discount must be less than 70`);
            }
            return true; 
        }).withMessage('Coupon discount must be less than 70'),
    body('offerexpiry')
        .isDate().withMessage('Invalid Date')
]