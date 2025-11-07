import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
type PuppeteerLaunchOptions = Parameters<typeof puppeteer.launch>[0];

export type PdfPayload = {
  html: string;
  header?: string;
  footer?: string;
  fileName?: string;
};

const DEFAULT_HEADER = `<div style="width:100%;font-size:10px;text-align:center;font-family:'Noto Sans',sans-serif;padding:4px 0;">
  <span class="title"></span>
</div>`;

const DEFAULT_FOOTER = `<div style="width:100%;font-size:10px;font-family:'Noto Sans',sans-serif;padding:4px 24px;display:flex;justify-content:space-between;">
  <span>Gerado em: <span class="date"></span></span>
  <span>Pagina <span class="pageNumber"></span>/<span class="totalPages"></span></span>
</div>`;

export async function renderDocumentPdf({ html, header, footer }: PdfPayload): Promise<ArrayBuffer> {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_REGION);
  const launchOptions: PuppeteerLaunchOptions = isServerless
    ? {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless
      }
    : {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
      };

  const puppeteer = await resolvePuppeteer();
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  await page.setContent(
    `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page {
              margin: 20mm;
            }
            body {
              font-family: 'Noto Sans', sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #111827;
            }
            h1, h2, h3, h4 {
              color: #111827;
              margin-bottom: 8px;
            }
            p { margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            table td, table th { border: 1px solid #e5e7eb; padding: 6px; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `,
    { waitUntil: "networkidle0" }
  );

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: header ?? DEFAULT_HEADER,
    footerTemplate: footer ?? DEFAULT_FOOTER,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "20mm",
      right: "20mm"
    }
  });

  await browser.close();

  return pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength) as ArrayBuffer;
}
