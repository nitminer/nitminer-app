# Download Testing & Setup Guide

## ✅ How to Test Downloads Are Working

### Option 1: Using curl to verify files exist

```bash
# Check Windows download
curl -I https://releases.nitminer.com/nitminer-1.0.0-win-x64.exe

# Check macOS download  
curl -I https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg
```

You should see a `200 OK` or `302 Redirect` response.

### Option 2: Using the verification endpoint

```bash
# Verify all downloads
curl http://localhost:3001/api/downloads/verify

# Response example:
{
  "releases": [
    {
      "os": "windows",
      "version": "1.0.0",
      "url": "https://releases.nitminer.com/nitminer-1.0.0-win-x64.exe",
      "available": true,
      "statusCode": 200
    },
    {
      "os": "mac",
      "version": "1.0.0", 
      "url": "https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg",
      "available": true,
      "statusCode": 200
    }
  ]
}
```

### Option 3: From the browser

1. Visit: `https://nitminer.com/downloads`
2. The page will automatically verify downloads
3. If links are available, buttons will show "Download"
4. If links are not available, buttons will show "Not Available" (greyed out)

## 🏗️ Setting Up Release Server

### Option 1: Use AWS S3 (Recommended)

1. **Create S3 bucket:**
```bash
aws s3 mb s3://nitminer-releases --region us-east-1
```

2. **Upload files:**
```bash
aws s3 cp nitminer-1.0.0-win-x64.exe s3://nitminer-releases/
aws s3 cp nitminer-1.0.0-mac-universal.dmg s3://nitminer-releases/
```

3. **Create CloudFront distribution:**
   - Point to your S3 bucket
   - Set domain to `releases.nitminer.com`

4. **Update S3 bucket policy for public access:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nitminer-releases/*"
    }
  ]
}
```

### Option 2: Use a Simple HTTP Server

```bash
# Create releases directory
mkdir -p /var/releases

# Copy your built files
cp dist/nitminer-1.0.0-win-x64.exe /var/releases/
cp dist/nitminer-1.0.0-mac-universal.dmg /var/releases/

# Start simple HTTP server
python3 -m http.server 8080 --directory /var/releases

# Or use Node.js
npx http-server /var/releases -p 8080
```

Then configure nginx/domain to point to: `http://localhost:8080`

### Option 3: Use GitHub Releases

1. Create release on GitHub
2. Upload `.exe` and `.dmg` files as assets
3. Use the raw GitHub URLs:

Update `src/app/downloads/page.js`:
```javascript
link: 'https://github.com/nitminer/nitminer-desktop/releases/download/v1.0.0/nitminer-1.0.0-win-x64.exe',
```

## 📝 Update Download Links

Once your release server is ready, update the links in `src/app/downloads/page.js`:

```javascript
const downloadOptions = [
  {
    os: 'windows',
    name: 'Windows',
    icon: FaWindows,
    versions: [
      {
        version: '1.0.0',
        type: 'exe',
        size: '125 MB',
        link: 'https://releases.nitminer.com/nitminer-1.0.0-win-x64.exe',  // ← Update this
        checksum: 'sha256: ...',
        releaseDate: '2026-02-07',
      },
    ],
  },
];
```

## 🔒 Generate Checksums

Before uploading, calculate checksums for security:

```bash
# Windows
certUtil -hashfile "nitminer-1.0.0-win-x64.exe" SHA256

# macOS/Linux
shasum -a 256 nitminer-1.0.0-mac-universal.dmg
```

Update the `checksum` field in downloads page:
```javascript
checksum: 'sha256: 3f8e9c7d2a1b4e6f5c8d9e7f3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
```

## 🚀 Deploy & Test

1. **Build Electron apps:**
```bash
npm run electron-build-win   # Creates .exe file
npm run electron-build-mac   # Creates .dmg file
```

2. **Upload to release server:**
```bash
scp dist/nitminer-1.0.0-*.* user@releases.nitminer.com:/var/releases/
```

3. **Test downloads work:**
```bash
# Check file exists
curl -I https://releases.nitminer.com/nitminer-1.0.0-win-x64.exe

# Download and verify checksum
wget https://releases.nitminer.com/nitminer-1.0.0-win-x64.exe
certUtil -hashfile "nitminer-1.0.0-win-x64.exe" SHA256
```

4. **Visit downloads page:**
https://nitminer.com/downloads

All download buttons should be enabled and working!

## 🔄 How Downloads Work Now

1. **Page loads** → Checks `/api/downloads/verify`
2. **API makes HEAD requests** to each download URL
3. **Status map is created** (available/not available)
4. **Button state updates** based on availability:
   - Available: Normal blue button with direct download
   - Not Available: Greyed out "Not Available" button
5. **Direct download** via `download` attribute (no redirect/new tab)

## 📊 Verification API Response

The verification endpoint checks each release and returns:

```javascript
{
  "releases": [
    {
      "os": "windows",           // Operating system
      "version": "1.0.0",        // App version
      "url": "https://...",      // Download URL
      "type": "exe",             // File type
      "size": "125 MB",          // File size
      "available": true,         // Whether downloadable
      "statusCode": 200          // HTTP status code
    }
  ],
  "timestamp": "2026-02-07T..."  // When checked
}
```

## ⚠️ Troubleshooting

### Downloads showing "Not Available"

```bash
# Check if file exists
curl -I https://releases.nitminer.com/nitminer-1.0.0-win-x64.exe

# If 404: Upload the file
# If 403: Check S3/server permissions
# If 500: Check server logs
```

### CORS errors

If you get CORS errors when checking downloads:
- Add CORS headers to your release server
- For S3: Add CORS policy to bucket

S3 CORS Policy example:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://nitminer.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Download fails after starting

- Check file isn't corrupted
- Verify Content-Length header matches file size
- Check server isn't rate-limiting downloads

---

**Summary:**
✅ Pages now verify downloads exist before showing them  
✅ Direct downloads (no new tab redirect)  
✅ Shows "Not Available" if files missing  
✅ Automatic verification every page load
