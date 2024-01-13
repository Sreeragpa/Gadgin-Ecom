const path = require('path');
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');

const ejs = require('ejs');
const fs = require('fs').promises;


const generatePdf = async (res, invoiceData) => {
    const browser = await puppeteer.launch({ headless: "new" });
    // const browser = await puppeteer.launch({args: ['--no-sandbox']});

    const page = await browser.newPage();

    try {
        const data = {
            invoiceData
        };

        const templatePath = path.join(__dirname, '..', 'views', 'invoice.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const renderedHtml = ejs.render(templateContent, data);

        await page.setContent(renderedHtml);
        // Generate the PDF as a buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm',
            },
        });
        // Send the PDF buffer as a response for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment: filename=invoice.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        await browser.close();
    }
};



module.exports = {
    generatePdf
}