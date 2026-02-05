/**
 * PDF Receipt Generator using HTML Template + Puppeteer
 * Server-side HTML-to-PDF generation with QR code
 * Uses exact HTML template design
 */

import puppeteer from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';
import QRCode from 'qrcode';

interface ReceiptData {
  receiptNumber: string;
  receiptDate: string;
  receiptTime?: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  serviceDescription: string;
  amountInRupees: number;
  paymentMethod: string;
  transactionId: string;
  serviceStartDate: string;
  serviceEndDate: string;
  paymentStatus: string;
  duration: number;
}

function generateReceiptHTML(data: ReceiptData, qrCodeDataUrl: string): string {
  const formattedAmount = (data.amountInRupees / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const receiptTime = data.receiptTime || new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - TrustInn</title>
        
        <!-- Google Fonts - Receipt Style Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Inconsolata:wght@400;700&display=swap" rel="stylesheet">
        
        <style>
            @page {
                size: A4;
                margin: 0;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Courier Prime', 'Courier New', monospace;
                background: white;
                padding: 0;
                font-size: 14px;
                line-height: 1.6;
            }

            .receipt {
                width: 100%;
                max-width: 210mm;
                background: white;
                padding: 30mm 20mm;
                margin: 0;
                min-height: 297mm;
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px dashed #333;
            }

            .company-name {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 3px;
                margin-bottom: 8px;
            }

            .company-details {
                font-size: 14px;
                color: #555;
                margin: 3px 0;
            }

            .receipt-title {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
                letter-spacing: 2px;
            }

            .divider {
                border-top: 1px dashed #333;
                margin: 15px 0;
            }

            .double-divider {
                border-top: 3px solid #333;
                margin: 15px 0;
            }

            .receipt-info {
                margin: 15px 0;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 14px;
            }

            .info-label {
                font-weight: normal;
            }

            .info-value {
                font-weight: bold;
                text-align: right;
            }

            .section-title {
                font-weight: bold;
                font-size: 16px;
                margin: 15px 0 8px 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .customer-section {
                background: #f9f9f9;
                padding: 15px;
                border: 2px solid #ddd;
                margin: 15px 0;
            }

            .item-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
                font-size: 14px;
            }

            .item-desc {
                flex: 1;
                padding-right: 15px;
            }

            .item-amount {
                font-weight: bold;
                white-space: nowrap;
            }

            .total-section {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 3px solid #333;
            }

            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 20px;
                font-weight: bold;
            }

            .total-label {
                letter-spacing: 2px;
            }

            .total-amount {
                font-size: 24px;
            }

            .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 2px dashed #333;
                text-align: center;
            }

            .thank-you {
                font-size: 18px;
                font-weight: bold;
                margin: 15px 0;
                letter-spacing: 2px;
            }

            .footer-text {
                font-size: 12px;
                color: #666;
                margin: 5px 0;
            }

            .barcode {
                text-align: center;
                margin: 20px 0;
                font-family: 'Inconsolata', monospace;
                font-size: 14px;
                letter-spacing: 3px;
            }

            .status-paid {
                text-align: center;
                margin: 15px 0;
                padding: 10px;
                border: 3px solid #000;
                font-weight: bold;
                font-size: 18px;
                letter-spacing: 3px;
            }

            .stamp-container {
                position: relative;
                margin: 30px 0;
            }

            .stamp {
                position: absolute;
                right: 0px;
                top: -80px;
                width: 200px;
                height: 150px;
                transform: rotate(-15deg);
            }

            .stamp img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .logo-container {
                text-align: center;
                margin-bottom: 15px;
            }

            .logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 10px;
            }

            .logo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .qr-code {
                text-align: center;
                margin: 20px 0;
            }

            .qr-code img {
                width: 150px;
                height: 150px;
                border: 2px solid #ddd;
                padding: 10px;
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <!-- Logo -->
            <div class="logo-container">
                <div class="logo">
                    <img src="https://nitminer.vercel.app/_next/image?url=https%3A%2F%2Fnitminer.com%2Flogo_img%2Flogo-rbg.png&w=128&q=75" alt="TrustInn Logo">
                </div>
            </div>

            <!-- Header -->
            <div class="header">
                <div class="company-name">NITMINER</div>
                <div class="company-details">Premium Tool Platform</div>
                <div class="company-details">www.trustinn.com</div>
                <div class="company-details">support@nitminer.com</div>
            </div>

            <!-- Receipt Title -->
            <div class="receipt-title">PAYMENT RECEIPT</div>

            <div class="divider"></div>

            <!-- Receipt Info -->
            <div class="receipt-info">
                <div class="info-row">
                    <span class="info-label">Receipt No:</span>
                    <span class="info-value">${data.receiptNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${data.receiptDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Time:</span>
                    <span class="info-value">${receiptTime}</span>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Customer Information -->
            <div class="section-title">Customer</div>
            <div class="customer-section">
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${data.customerName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${data.customerEmail}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Customer ID:</span>
                    <span class="info-value">${data.customerId.substring(0, 8).toUpperCase()}</span>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Items -->
            <div class="section-title">Items</div>
            <div class="item-row">
                <div class="item-desc">${data.serviceDescription}</div>
                <div class="item-amount">₹${formattedAmount}</div>
            </div>

            <div class="divider"></div>

            <!-- Payment Details -->
            <div class="section-title">Payment Info</div>
            <div class="info-row">
                <span class="info-label">Method:</span>
                <span class="info-value">${data.paymentMethod}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">${data.transactionId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Service Period:</span>
                <span class="info-value">${data.serviceStartDate} to ${data.serviceEndDate}</span>
            </div>

            <div class="double-divider"></div>

            <!-- Total -->
            <div class="total-section">
                <div class="stamp-container">
                    <div class="stamp">
                        <img src="https://res.cloudinary.com/dkg81hfgd/image/upload/v1770312595/stamp-sign-removebg-preview_e9sslr.png" alt="Official Stamp">
                    </div>
                </div>
                <div class="total-row">
                    <span class="total-label">TOTAL PAID</span>
                    <span class="total-amount">₹${formattedAmount}</span>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Status -->
            <div class="status-paid">PAID</div>

            <!-- QR Code -->
            <div class="qr-code">
                <img src="${qrCodeDataUrl}" alt="Transaction QR Code">
            </div>

            <!-- Barcode -->
            <div class="barcode">
                ||||| |||| ||||| || ||| ||||| ||<br>
                * TI-${Date.now()}-${data.customerId.substring(0, 6).toUpperCase()} *
            </div>

            <div class="divider"></div>

            <!-- Footer -->
            <div class="footer">
                <div class="thank-you">THANK YOU!</div>
                <div class="footer-text">This is an official payment receipt</div>
                <div class="footer-text">Your premium access is now active</div>
                <div class="footer-text">────────────────────────────────</div>
                <div class="footer-text">For support, contact: support@nitminer.com</div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export async function generateHTMLPDFReceiptBuffer(data: ReceiptData): Promise<Buffer> {
  let browser: Browser | undefined;
  try {
    console.log('🎨 Generating PDF receipt from HTML template...');

    // Create QR code with transaction data
    const qrData = JSON.stringify({
      receiptNo: data.receiptNumber,
      amount: data.amountInRupees,
      date: data.receiptDate,
      customer: data.customerName,
      transactionId: data.transactionId,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
    });

    console.log('✅ QR code generated');

    // Generate HTML content
    const htmlContent = generateReceiptHTML(data, qrCodeDataUrl);

    // Launch browser with puppeteer-core
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    };

    // Vercel has Chrome pre-installed, use it directly
    if (isProduction) {
      launchOptions.channel = 'chrome';
    } else {
      // For local dev, look for Chrome in puppeteer cache or system locations
      const path = require('path');
      const os = require('os');
      const fs = require('fs');
      
      let chromePath: string | undefined;
      const cacheDir = path.join(os.homedir(), '.cache/puppeteer/chrome');

      // Try to find latest Chrome in puppeteer cache
      if (fs.existsSync(cacheDir)) {
        try {
          const versions = fs.readdirSync(cacheDir).sort().reverse();
          for (const version of versions) {
            const versionPath = path.join(cacheDir, version);
            // Find any chrome-* subdirectory
            const subdirs = fs.readdirSync(versionPath);
            for (const subdir of subdirs) {
              const appDir = path.join(versionPath, subdir, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
              if (fs.existsSync(appDir)) {
                chromePath = appDir;
                break;
              }
            }
            if (chromePath) break;
          }
        } catch (e) {
          console.warn('⚠️ Failed to find Chrome in puppeteer cache:', e);
        }
      }

      // Fallback system Chrome locations
      if (!chromePath) {
        const systemPaths = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
          '/usr/bin/google-chrome', // Linux
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
        ];
        for (const p of systemPaths) {
          if (fs.existsSync(p)) {
            chromePath = p;
            break;
          }
        }
      }

      if (chromePath) {
        launchOptions.executablePath = chromePath;
        console.log('🌐 Using Chrome at:', chromePath);
      } else {
        console.log('⚠️ Chrome not found, using system Chrome channel');
        launchOptions.channel = 'chrome';
      }
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      printBackground: true,
    });

    console.log(`✅ PDF generated: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}