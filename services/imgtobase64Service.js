const fs = require('fs');

function imageToBase64(filePath) {
    return new Promise((resolve, reject) => {
    
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const base64String = data.toString('base64');
                resolve(base64String);
            }
        });
    });
}

module.exports = {imageToBase64} 
