import ejs from "ejs";
import puppeteer from "puppeteer";

export default async function (filePath, data) {
  try {
    const html = await ejs.renderFile(filePath, { ...data });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
