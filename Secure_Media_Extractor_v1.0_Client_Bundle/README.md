# Secure Excel Media Extractor

A zero-install, local-first web application for extracting embedded images and media from `.xlsx` workbooks and renaming them dynamically using worksheet row values and visual filename templates.

## Key Features

- **100% Client-Side Processing**: Excel workbooks and extracted media never leave the local web browser. Zero network uploads.
- **Dynamic OOXML Anchor Mapping**: Direct parsing of Office Open XML drawing anchors (`oneCellAnchor`, `twoCellAnchor`) to dynamically associate images with Excel rows and column headers without hardcoding.
- **Visual Filename Pattern Builder**: Drag/click interactive token chips combining column headers (`[Index]`, `[Video Information]`, `[Date & Time]`), fixed text, media types (`[Media Type]`), and row indices (`[Row Number]`).
- **Defensive Security Controls**: Anti-ZIP-bomb decompression guard, Zip-slip path traversal protection, XXE mitigation, and strict POSIX/Windows filename sanitization (handles reserved names `CON`, `PRN`, `AUX`, `NUL`, etc.).
- **Collision Policy Engine**: Automatic duplicate resolution (`auto-suffix`, `row-number`, `skip`) to prevent overwriting files.
- **Audit Reporting & Data Handoff**: Generates downloadable Markdown audit trails and provides one-click "Clear Sensitive Data" memory clearing.

## Development & Usage

### Local Development Server

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.

### Automated Testing

Run the Vitest test suite for sanitizer, ZIP security, and pattern engine:

```bash
npm test
```

### Production Build

To build the static local distribution artifact:

```bash
npm run build
```

The output bundle is generated under `dist/`. You can serve `dist/` with any static web server or launch it locally offline.

## Security Architecture Summary

- **CSP Headers**: Configured with strict Content Security Policy blocking unsafe remote scripts or object embedding.
- **Volatile Storage**: Workbooks and extracted media Blobs exist solely in application memory (`JSZip` & browser `Blob`) and are automatically wiped upon page reset or clicking **Clear Data**.
- **Offline Capable**: Fully operational with network interface disabled.
