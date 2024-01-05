const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const easyinvoice = require('easyinvoice')
















function generatePdf(invoiceData) {
    //Import the library into your project

    const logoPath = path.join(__dirname, '..', 'public', 'img', 'gadgin.png');
    console.log(logoPath);
    const logoImagebuffer = fs.readFileSync(logoPath);
    const logoBase64 = logoImagebuffer.toString('base64');
    console.log(invoiceData.address);
    const data = {

        "customize": {
            //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
        },
        "images": {
            // The logo on top of your invoice
            "logo": logoBase64,
            // The invoice background
            // "background": "https://public.budgetinvoice.com/img/watermark-draft.jpg"
        },
        // Your own data
        "sender": {
            "company": "GADGIN",
            "country": "INDIA"
  
        },
        // Your recipient

        "client": {
            "company": invoiceData.address.name,
            "address": invoiceData.address.house,
            "zip": invoiceData.address.pincode,
            "city": invoiceData.address.phone,
          },
        "information": {
            "number": invoiceData.orderid,
            "date": invoiceData.orderdate,
            "due-date": "15.1.2022"
          },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        "products": invoiceData.products,
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Keep Shopping with us.",
        // Settings to customize your invoice
        "settings": {
            "currency": "INR", // See documentation 'Locales and 
        },
        // Translate your invoice to your preferred language

    };

    return new Promise((resolve, reject) => {
        easyinvoice.createInvoice(data, (result, error) => {
            if (error) {
                console.error('Error generating PDF:', error);
                reject(error);
            } else if (result.pdf) {
                resolve(Buffer.from(result.pdf, 'base64'));
            } else {
                console.error('Failed to generate PDF:', result);
                reject('Failed to generate PDF');
            }
        });
    });



}



module.exports = {
    generatePdf
}