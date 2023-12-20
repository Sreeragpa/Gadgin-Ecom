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