const sharp = require('sharp');
const fs = require('fs');
const path = require('path')

 function generateProfilepicture(character){ 
    const date =Date.now();
    const filename= `/uploads/profilepic/profile-${date}.png`
    const outputPath = path.join(__dirname,'..',`/public${filename}`);
    const size = 200;
    const fontsize = 80;

      return new Promise((resolve, reject) => {
        sharp({
          create:{
              width:size,
              height:size,
              channels:4,
              background: { r: 255, g: 255, b: 100}
          }
      })
      .png()
      .composite([{
          input: Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <text x="${size / 2}" y="${size / 2}" font-size="${fontsize}px" dominant-baseline="middle" font-family="Roboto, sans-serif"  text-anchor="middle" fill="#000">${character}</text>
        </svg>`),
        top: 25,
        left: 0
        }])
      .toFile(outputPath, (err, info) => {
          if (err) {
            reject(err)
          } else {
            resolve(filename);
          }
      });
      })
 
}
module.exports = {generateProfilepicture}


    