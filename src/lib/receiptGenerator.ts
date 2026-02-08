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
                font-size: 13px;
                line-height: 1.4;
            }

            .receipt {
                width: 100%;
                max-width: 210mm;
                height: 297mm;
                background: white;
                padding: 15mm 20mm;
                margin: 0 auto;
                position: relative;
                overflow: hidden;
            }

            .qr-code {
                position: absolute;
                top: 15mm;
                right: 20mm;
                z-index: 10;
            }

            .qr-code img {
                width: 100px;
                height: 100px;
                border: 2px solid #ddd;
                padding: 5px;
                background: white;
            }

            .main-content {
                max-width: calc(100% - 0px);
            }

            .header {
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 5px;
                border-bottom: 1px dashed #333;
            }

            .logo-container {
                text-align: center;
                margin-bottom: 10px;
            }

            .logo {
                width: 60px;
                height: 60px;
                margin: 0 auto 5px;
            }

            .logo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .company-name {
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                margin-bottom: 5px;
            }

            .company-details {
                font-size: 12px;
                color: #555;
                margin: 2px 0;
            }

            .receipt-title {
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin: 15px 0 10px 0;
                letter-spacing: 2px;
            }

            .divider {
                border-top: 1px dashed #333;
                margin: 10px 0;
            }

            .double-divider {
                border-top: 3px solid #333;
                margin: 10px 0;
            }

            .receipt-info {
                margin: 10px 0;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 13px;
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
                font-size: 14px;
                margin: 10px 0 5px 0;
                text-transform: uppercase;
                letter-spacing: 1.5px;
            }

            .customer-section {
                background: #f9f9f9;
                padding: 10px;
                border: 2px solid #ddd;
                margin: 10px 0;
            }

            .item-row {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                padding: 5px 0;
                font-size: 13px;
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
                margin-top: 15px;
                padding-top: 10px;
                border-top: 3px solid #333;
                position: relative;
            }

            .stamp-container {
                position: absolute;
                right: -10px;
                top: -40px;
            }

            .stamp {
                width: 150px;
                height: 110px;
                transform: rotate(-15deg);
            }

            .stamp img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .paid-stamp-container {
                position: absolute;
                right: 50%;
                top: 50%;
                transform: translate(50%, -50%) rotate(-20deg);
                z-index: 0;
            }

            .paid-stamp {
                width: 180px;
                height: 180px;
                opacity: 0.7;
            }

            .paid-stamp img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 18px;
                font-weight: bold;
            }

            .total-label {
                letter-spacing: 2px;
            }

            .total-amount {
                font-size: 22px;
            }

            .status-paid {
                text-align: center;
                margin: 10px 0;
                padding: 8px;
                border: 3px solid #000;
                font-weight: bold;
                font-size: 16px;
                letter-spacing: 3px;
            }

            .barcode {
                text-align: center;
                margin: 15px 0 10px 0;
                font-family: 'Inconsolata', monospace;
                font-size: 12px;
                letter-spacing: 2px;
            }

            .footer {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 2px dashed #333;
                text-align: center;
            }

            .thank-you {
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
                letter-spacing: 2px;
            }

            .footer-text {
                font-size: 11px;
                color: #666;
                margin: 3px 0;
            }

            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
                .receipt {
                    margin: 0;
                    padding: 15mm 20mm;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <!-- QR Code in Top Right -->
            <div class="qr-code">
                <img src="${qrCodeDataUrl}" alt="Transaction QR Code">
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Logo -->
                <div class="logo-container">
                    <div class="logo">
                        <img src="https://res.cloudinary.com/dmpkp1nxv/image/upload/v1770376358/logo_evvxuk.png" alt="TrustInn Logo">
                    </div>
                </div>

                <!-- Header -->
                <div class="header">
                    <div class="company-name">NITMINER</div>
                    <div class="company-details">Premium Tool Platform</div>
                    <div class="company-details">www.trustinn.com | <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="c8bbbdb8b8a7babc88a6a1bca5a1a6adbae6aba7a5">[email&#160;protected]</a></div>
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
                    <div class="paid-stamp-container">
                        <div class="paid-stamp">
                            <img src="https://res.cloudinary.com/dmpkp1nxv/image/upload/v1770378055/paid-stamp_hrmmuk.png" alt="Paid Stamp">
                        </div>
                    </div>
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
                    <div class="footer-text">
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
    const launchOptions: any = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--single-process',
    '--disable-gpu',
    '--disable-software-rasterizer',
  ],
};

    // Look for browser executable in system paths
    const fs = require('fs');
    
    const systemPaths = [
      '/snap/bin/chromium',        // Snap installation
      '/usr/bin/chromium-browser', // APT installation
      '/usr/bin/chromium',         // Alternative chromium
      '/usr/bin/google-chrome',    // Google Chrome
      '/usr/bin/google-chrome-stable', // Chrome stable
      
    ];

    let chromePath: string | undefined;
    for (const p of systemPaths) {
      if (fs.existsSync(p)) {
        chromePath = p;
        console.log(`✅ Found browser at: ${p}`);
        break;
      }
    }

    if (chromePath) {
      launchOptions.executablePath = chromePath;
      console.log('🌐 Using browser at:', chromePath);
    } else {
      throw new Error('❌ No browser executable found at: ' + systemPaths.join(', '));
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