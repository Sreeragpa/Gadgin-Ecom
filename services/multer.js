const multer = require('multer');
const path = require('path')
// set storage

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        const publicFolder = path.join(__dirname,'..','public');
        const destinationPath = path.join(publicFolder, 'uploads');
        cb(null,destinationPath);
    },
    filename:function(req,file,cb){
        // image.jpg
        var ext = file.originalname.substring(file.originalname.lastIndexOf('.'));

        cb(null,file.fieldname+'-'+Date.now()+ ext)
    }
})




module.exports = store = multer({storage:storage});