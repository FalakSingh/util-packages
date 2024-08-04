import ejs from "ejs";
import puppeteer from "puppeteer";

export default async function (filePath, dataSets) {
  try {
    const htmlContent = await Promise.all(
      dataSets.map(async (data) => {
        return ejs.renderFile(filePath, { ...data });
      })
    );

    const htmlWithPageBreaks = htmlContent
      .map((html, index) => {
        return `<div class="page-content">${html}</div>${
          index < htmlContent.length - 1 ? '<div class="page-break"></div>' : ""
        }`;
      })
      .join("");

    const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                .page-break {
                  page-break-before: always;
                }
                .page-content {
                  page-break-inside: avoid;
                }
              </style>
            </head>
            <body>
              ${htmlWithPageBreaks}
            </body>
            </html>
          `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();

    await page.setContent(fullHtml, { waitUntil: "load" });

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
