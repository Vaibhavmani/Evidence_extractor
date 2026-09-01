# Secure Excel Media Extraction Tool — Build Pack

## 1. Master Build Prompt

Build a production-ready, security-first Excel Media Extraction Tool.

### Objective

Create a simple tool where a user selects an Excel `.xlsx` file containing tabular data and embedded images/documents. The user must be able to:

1. Upload/select the Excel workbook.
2. Select the worksheet.
3. Preview detected column headers and sample values.
4. Choose which column contains the media to export.
5. Choose multiple media columns in one operation.
6. Define the output filename pattern using any column headers from the same worksheet.
7. Add fixed text, separators, prefixes/suffixes, and the original row number/index to the filename.
8. Choose an output extension/format where conversion is supported.
9. Preview several generated filenames before extraction.
10. Extract media while preserving the row-to-media relationship.
11. Download/export the generated files as a ZIP.
12. Generate a processing report showing success, missing media, skipped rows, duplicate names, and errors.

### Critical security requirement

Treat every uploaded workbook as HIGHLY SENSITIVE / CONFIDENTIAL.

The application must be designed so that workbook data and extracted media never leave the user's machine unless the user explicitly chooses an external destination.

Preferred architecture: browser/local-first processing with zero server-side file upload.

If a backend is absolutely required, it must be self-hosted/internal and must process files ephemerally with no persistent storage. Do not use third-party file-processing APIs.

### Non-negotiable privacy requirements

- No cloud upload for file contents.
- No analytics containing workbook contents.
- No telemetry containing filenames, cell values, images, extracted text, or metadata.
- No external AI/OCR service.
- No external conversion API.
- No third-party storage.
- Do not send the workbook to a remote server merely to inspect headers or images.
- Process the workbook locally in the browser/client whenever technically possible.
- Keep generated output in memory or browser-managed temporary storage only until the user downloads it.
- Provide a prominent "Local Processing" indicator.
- Explain that files are processed locally and are not uploaded.
- Clear temporary memory/state after reset, page close, or explicit "Clear Data".
- Never put sensitive values in URLs, query parameters, browser history, console logs, analytics, or error reports.

### Supported input

Primary target:

- `.xlsx`

Reject or clearly mark unsupported:

- `.xls` unless separately implemented.
- Password-protected/encrypted workbooks unless supported.
- Corrupt workbooks.
- Files exceeding configurable safety limits.

Do not silently downgrade security or functionality for unsupported formats.

### Excel structure

The tool must not assume fixed column letters.

Example:

| Index | Date & Time | Video Information | Detected Face | POI Image |
|---|---|---|---|---|
| 1 | 01:01:39 - 01:01:39 | P84F118TOLOSTOYROAD(10.42.115.118).mkv | image | image |

The tool must discover the actual headers dynamically.

A user should be able to select:

- `Index`
- `Date & Time`
- `Video Information`
- `Detected Face`
- `POI Image`

or any other columns present in a different workbook.

### Media extraction

For `.xlsx`, inspect the Office Open XML package directly.

An `.xlsx` file is a ZIP package. Identify:

- worksheet XML
- worksheet relationships
- drawing XML
- drawing relationships
- media files under `xl/media/`

Map embedded images/documents to the worksheet cell/row where they are anchored.

Support, where possible:

- oneCellAnchor
- twoCellAnchor
- relevant drawing relationships
- PNG
- JPEG/JPG
- GIF where extraction without conversion is possible
- BMP where supported

Preserve the original binary media when possible.

Do not re-encode an image unnecessarily.

### Cell/media mapping

The core extraction engine must determine:

- worksheet
- source row
- source column
- source cell
- embedded media relationship
- original media type
- original media filename if available

The UI must show a preview/mapping table before extraction.

Example:

| Row | Index | Video Information | Media Column | Media Detected |
|---|---|---|---|---|
| 2 | 1 | P84F... | Detected Face | Yes |
| 2 | 1 | P84F... | POI Image | Yes |
| 3 | 2 | P85F... | Detected Face | No |

### Important mapping behavior

Do not assume the image is physically inside the cell.

Excel commonly stores images as drawing objects anchored over cells.

Use the drawing anchor's starting cell to associate an image with the corresponding row/column.

Handle merged cells and images spanning multiple cells carefully.

If an image cannot be mapped confidently:

- mark it as `Unmapped`
- do not guess silently
- show the reason
- allow the user to inspect it

### Filename pattern builder

Create a visual filename-pattern builder.

The user should be able to select column names from a dropdown.

Example:

`[Index]_[Video Information]_[Date & Time]_[Media Type]`

Preview:

`1_P84F118TOLOSTOYROAD(10.42.115.118)_01-01-39_-_01-01-39_detected.jpeg`

For POI:

`1_P84F118TOLOSTOYROAD(10.42.115.118)_01-01-39_-_01-01-39_poi.jpeg`

The user must be able to add:

- column token
- fixed text
- separator
- media type token
- row number token
- original media filename token
- extension token

Example pattern:

`[Index]_[Video Information]_[Date & Time]_[Media Type].[Extension]`

### Filename sanitization

Filename values come from potentially untrusted spreadsheet content.

Sanitize all generated filenames.

Remove/replace:

`< > : " / \ | ? *`

Also:

- trim whitespace
- prevent path traversal
- reject `.` and `..`
- prevent absolute paths
- prevent directory separators
- limit filename length
- handle Windows reserved names such as CON, PRN, AUX, NUL, COM1, LPT1, etc.
- normalize problematic Unicode/control characters
- collapse excessive whitespace
- safely handle empty values

Never allow a spreadsheet cell to control an output directory path.

The output path must always be generated by the application.

### Duplicate filename policy

Never silently overwrite.

Offer:

1. Auto-suffix
   - `_2`
   - `_3`
2. Skip duplicate
3. Include row number automatically
4. Ask user

Default: auto-suffix.

### Extension handling

Default behavior:

- Preserve original media extension where possible.

If the user requests conversion to JPEG:

- only convert supported image formats
- explain that conversion changes the binary
- never falsely label a PNG/GIF as JPEG without conversion

For example:

`image.png` → `image.jpeg` only after actual conversion.

If a file type cannot safely be converted, preserve its original extension.

### Output options

Allow:

- individual files
- ZIP package
- optional folder structure

Default:

`Extracted_Media_<timestamp>.zip`

Inside:

```text
Detected_Face/
    1_xxx_detected.jpeg
    2_xxx_detected.jpeg

POI_Image/
    1_xxx_poi.jpeg
    2_xxx_poi.jpeg
```

Also provide a flat-folder mode if the user wants all files together.

### Optional folder pattern

Allow a separate folder pattern based on columns, but sanitize it independently.

Example:

`[Video Information]/[Index]/`

Never allow `../`, absolute paths, drive letters, UNC paths, or arbitrary filesystem paths.

### User interface

Design should be minimalist, professional, and easy for a non-technical user.

Main workflow:

#### Step 1 — Select Workbook

Large drag-and-drop area:

`Drop Excel file here`

Also:

`Choose Excel File`

Display:

- filename
- size
- worksheet count
- security status: `Processed locally`

Do not display sensitive sample values until the user proceeds.

#### Step 2 — Select Sheet

Dropdown/list of worksheets.

Display row/column counts if available.

#### Step 3 — Map Columns

Show detected headers as cards/dropdowns.

Required selections:

- Media column(s)
- Filename pattern source sheet

Do not hardcode D/E.

#### Step 4 — Build Filename Pattern

Show token builder.

Example:

`[Index]_[Video Information]_[Date & Time]_[Media Type]`

Live preview with 5 sample rows.

Include:

- `Add Column`
- `Add Text`
- `Add Media Type`
- `Add Row Number`
- `Remove Token`

#### Step 5 — Preview

Show:

| Row | Source Cell | Media | Generated Filename | Status |
|---|---|---|---|---|
| 2 | D2 | Detected Face | 1_xxx_detected.jpeg | Ready |
| 2 | E2 | POI Image | 1_xxx_poi.jpeg | Ready |

Allow the user to inspect warnings.

#### Step 6 — Extract

Show progress:

`Processing 237 / 500`

Never expose sensitive values in logs.

#### Step 7 — Results

Show:

- extracted count
- skipped count
- unmapped count
- duplicate count
- error count

Buttons:

- `Download ZIP`
- `Download Report`
- `Clear Sensitive Data`

### Security UI

Include a small but visible security panel:

**Local Processing**
- Workbook stays on this device.
- No cloud upload.
- No external processing service.
- Temporary processing data is cleared when you reset the tool.

Do not make claims stronger than the actual implementation.

### Threat model

Assume an attacker may control the workbook.

Treat these as hostile input:

- worksheet names
- cell values
- filenames
- media filenames
- XML content
- relationship IDs
- ZIP entries
- MIME types
- image metadata
- malformed XML
- decompression bombs
- oversized files
- path traversal strings
- formula-like values
- Unicode edge cases

Security controls must include:

1. ZIP bomb/decompression protection.
2. Maximum input size.
3. Maximum uncompressed ZIP size.
4. Maximum number of ZIP entries.
5. Maximum extracted media size.
6. XML parsing limits.
7. Reject external entity resolution / XXE.
8. Do not follow external URLs from workbook relationships.
9. Do not execute macros.
10. Do not execute embedded scripts.
11. Do not render active HTML/SVG unsafely.
12. Sanitize filenames.
13. Prevent path traversal.
14. Prevent ZIP slip during output generation.
15. Memory limits where feasible.
16. Timeouts for parsing/extraction.
17. Safe cancellation.
18. Cleanup on failure.
19. No sensitive logging.
20. Content Security Policy.
21. Avoid `innerHTML` for workbook-derived content.
22. Escape all displayed workbook values.
23. Treat SVG and HTML-like content as potentially active content.
24. Do not load remote resources referenced by workbook data.
25. Do not permit arbitrary URLs generated from cell contents.

### SVG/security

If SVG extraction is supported:

- do not inline untrusted SVG directly into the application DOM
- prefer downloading it as a file
- optionally convert/sanitize it
- never execute scripts embedded in SVG
- never allow SVG content to access application origin

### ZIP security

Use a ZIP parser that supports defensive limits.

Before extraction:

- inspect compressed size
- inspect uncompressed size
- inspect entry count
- reject suspicious compression ratios
- reject absolute paths
- reject `../`
- reject unexpected package structures

Never blindly extract the entire ZIP to disk.

Extract only required XML and media entries.

### Formula/data security

The tool is primarily reading values, not executing formulas.

Do not evaluate formulas.

When displaying values:

- treat them as untrusted text
- do not execute formulas/macros
- do not generate executable HTML from values

If CSV export is implemented, protect against spreadsheet formula injection by prefixing dangerous values or offering a safe text export.

### Error handling

Errors must be understandable to non-technical users.

Bad:

`TypeError: Cannot read properties of undefined`

Good:

`The image in row 27 could not be mapped to a worksheet cell. No file was created for this item.`

Provide an optional technical-details section.

Do not include sensitive cell contents in technical errors.

### Audit/reporting

Generate a local report containing:

- timestamp
- workbook filename
- worksheet
- extraction configuration
- selected media columns
- filename pattern
- total rows
- total media found
- total exported
- skipped
- duplicates
- unmapped
- errors

Do not include image contents.

Do not include unnecessary sensitive cell values in the report.

Make report generation opt-in if it could expose sensitive metadata.

### Accessibility

Support:

- keyboard navigation
- clear labels
- visible focus states
- screen-reader-friendly controls
- high contrast
- no color-only status indicators

### Performance

The application must handle large workbooks gracefully.

Use:

- streaming/controlled parsing where practical
- lazy preview
- bounded concurrency
- progress reporting
- cancellation
- memory-conscious ZIP/media handling

Do not load every large media object into memory simultaneously.

### Browser security

If implemented as a browser application:

- use strict Content Security Policy
- no unsafe inline script
- no remote executable scripts
- avoid third-party analytics
- avoid unnecessary third-party dependencies
- pin dependencies
- regularly audit dependencies
- do not use CDN-hosted JavaScript for production
- use Subresource Integrity only where externally hosted resources are unavoidable
- prevent framing with CSP/frame-ancestors
- set appropriate Referrer-Policy
- set Permissions-Policy
- use HTTPS when hosted
- do not store workbook contents in localStorage
- do not store extracted media in IndexedDB unless explicitly required
- if IndexedDB is used, provide a secure wipe mechanism

### Architecture recommendation

Preferred:

```text
User
  |
  v
Local Browser UI
  |
  +--> XLSX ZIP parser
  |
  +--> XML relationship mapper
  |
  +--> Worksheet parser
  |
  +--> Drawing/media mapper
  |
  +--> Filename template engine
  |
  +--> Sanitizer
  |
  +--> ZIP output generator
  |
  v
User downloads ZIP
```

No application server is required for file processing.

Recommended stack:

- React + TypeScript
- Vite
- Web Worker for parsing
- JSZip or equivalent defensive ZIP library
- secure XML parser
- browser-native Blob/File APIs
- client-side ZIP creation
- no database
- no authentication required for a purely local tool

If a backend is necessary:

- use an internal/private deployment
- ephemeral temporary storage only
- encryption in transit
- encryption at rest for unavoidable temporary data
- automatic deletion
- strict size/time limits
- authenticated access
- audit logging that excludes file contents
- no third-party file processing

### Dependency policy

Minimize dependencies.

Before adding a package:

- verify maintenance status
- verify license
- check known vulnerabilities
- confirm it does not upload files
- confirm it does not execute workbook content
- pin versions

Do not add an analytics SDK.

### Testing requirements

Create automated tests for:

1. Normal `.xlsx`.
2. Workbook with multiple sheets.
3. Empty rows.
4. Missing media.
5. Multiple images in one row.
6. Image in D/E style layout.
7. Images anchored across cells.
8. Duplicate filenames.
9. Illegal filename characters.
10. Unicode filenames.
11. Very long values.
12. Missing column values.
13. Missing headers.
14. Duplicate headers.
15. Empty headers.
16. `.png` extraction.
17. `.jpeg` extraction.
18. Unsupported media.
19. Corrupt XLSX.
20. ZIP bomb.
21. ZIP slip.
22. XML entity attack.
23. Malformed XML.
24. Extremely large workbook.
25. Workbook with macros.
26. External relationships.
27. SVG containing script.
28. Path traversal in media names.
29. Cancellation during extraction.
30. Browser refresh/reset cleanup.

### Acceptance criteria

The product is complete only when:

- A non-technical user can use it without Python.
- No installation is required if delivered as a web/local static app.
- The user can select media columns dynamically.
- The user can select filename tokens dynamically from actual Excel headers.
- The user can create arbitrary safe filename patterns.
- Index can be included in the filename.
- Date & Time can be included.
- Video Information can be included.
- Media type can be included.
- Both Detected Face and POI Image can be extracted from the example structure.
- Generated filenames are sanitized.
- Duplicate filenames never overwrite by default.
- Processing is local by default.
- Sensitive workbook contents never leave the user's device.
- The UI clearly communicates the processing model.
- Extraction failures are visible.
- Output can be downloaded as ZIP.
- No macros or workbook scripts are executed.
- Security tests pass.
- No sensitive data appears in browser console logs.

### Example

Input:

```text
Index = 1
Date & Time = 01:01:39 - 01:01:39
Video Information = P84F118TOLOSTOYROAD(10.42.115.118).mkv
Media Column = Detected Face
```

Pattern:

```text
[Index]_[Video Information]_[Date & Time]_[Media Type]
```

Output:

```text
1_P84F118TOLOSTOYROAD(10.42.115.118)_01-01-39_-_01-01-39_detected.jpeg
```

For POI:

```text
1_P84F118TOLOSTOYROAD(10.42.115.118)_01-01-39_-_01-01-39_poi.jpeg
```

### Product philosophy

The tool should be:

- simple for non-technical users
- powerful for advanced users
- local-first
- privacy-preserving
- deterministic
- transparent
- secure against hostile spreadsheets
- resistant to accidental data leakage

Do not sacrifice the security model for convenience.

Do not add unnecessary features such as cloud storage, user accounts, analytics, AI processing, OCR, or external integrations unless explicitly requested later.

---

# 2. Product Requirements Document

## Product name

Suggested working name:

**Secure Media Extractor**

Alternative:

**Excel Media Extractor — Local**

## Problem

Users currently need Python, packages, command-line instructions, and technical knowledge to extract embedded images from Excel workbooks and rename them using row data.

This is unsuitable for non-technical users, especially when workbooks contain highly sensitive surveillance, identity, security, or operational information.

## Solution

A zero-install, local-first tool that accepts an Excel workbook and provides a visual workflow for:

- selecting media columns
- selecting naming fields
- creating filename patterns
- previewing results
- extracting media
- downloading a ZIP

## Primary users

- Investigators
- Security teams
- Analysts
- Compliance teams
- Administrative staff
- Non-technical users handling evidence or operational spreadsheets

## Security classification

Assume:

**HIGHLY SENSITIVE / RESTRICTED**

The product must be safe to use with:

- face images
- identity documents
- surveillance exports
- CCTV-related information
- IP addresses
- timestamps
- operational information
- personally identifiable information
- confidential organizational data

---

# 3. Functional Requirements

### FR-01 File selection

Accept `.xlsx`.

### FR-02 Workbook inspection

Detect worksheets, headers, rows, and embedded media.

### FR-03 Dynamic columns

Never hardcode column letters.

### FR-04 Media selection

Allow multiple media columns.

### FR-05 Filename tokens

Any worksheet header can become a token.

### FR-06 Custom text

Allow arbitrary fixed text.

### FR-07 Media token

Support media type such as:

- detected
- poi
- source column name

### FR-08 Preview

Show sample generated names before extraction.

### FR-09 Extraction

Extract the original embedded media.

### FR-10 Format conversion

Only convert when explicitly requested and technically safe.

### FR-11 ZIP

Package output into a downloadable ZIP.

### FR-12 Report

Provide processing statistics and errors.

### FR-13 Cancellation

Allow extraction cancellation.

### FR-14 Cleanup

Clear sensitive data after completion/reset.

---

# 4. Security Requirements

## Data minimization

Only process:

- workbook bytes
- required worksheet XML
- required relationship XML
- required drawing XML
- required media

Do not process unrelated content unnecessarily.

## No external communication

The file-processing path must function with the network disabled.

This should be an explicit acceptance test:

> Disconnect the computer from the Internet and extraction must still work.

## Logging

Never log:

- workbook contents
- cell values
- image data
- IP addresses from cells
- names
- timestamps from cells
- media filenames if sensitive

Log only generic operational information such as:

`Extraction started`

`237 media objects exported`

`3 objects could not be mapped`

## Secure cleanup

Provide:

**Clear Data**

which clears:

- selected File objects
- generated Blobs
- previews
- parsed workbook data
- error details
- temporary state

---

# 5. Threat Model

| Threat | Mitigation |
|---|---|
| Malicious XLSX | Treat package as hostile input |
| ZIP bomb | Size/ratio/entry limits |
| ZIP Slip | Strict path validation |
| XXE | Disable external entities |
| Path traversal | Filename/path sanitization |
| Macro execution | Never execute VBA |
| Active content | Never execute workbook content |
| SVG script | Treat SVG as untrusted |
| Memory exhaustion | Bounded processing |
| Huge workbook | Input limits |
| Data leakage | Local processing |
| Browser console leakage | No sensitive logging |
| Duplicate overwrite | Safe collision handling |
| XSS via cell value | Text escaping |
| Remote relationship | Never fetch external resources |
| Malicious filename | Sanitize |
| Dependency compromise | Pin/audit dependencies |

---

# 6. UX Specification

## Landing page

```text
┌──────────────────────────────────────────────┐
│        SECURE MEDIA EXTRACTOR                │
│                                              │
│   Extract images from Excel safely.          │
│                                              │
│   🔒 Processed locally on this device        │
│   No cloud upload • No external processing   │
│                                              │
│       [ Choose Excel File ]                  │
│                                              │
│       or                                     │
│                                              │
│       Drop .xlsx here                        │
└──────────────────────────────────────────────┘
```

## Workflow

```text
1. Workbook
      ↓
2. Worksheet
      ↓
3. Media Columns
      ↓
4. Filename Pattern
      ↓
5. Preview
      ↓
6. Extract
      ↓
7. Download
```

## Pattern builder

Example:

```text
Filename Pattern

[ Index ] [ _ ] [ Video Information ] [ _ ]
[ Date & Time ] [ _ ] [ Media Type ]

Preview:
1_P84F118TOLOSTOYROAD(10.42.115.118)_01-01-39_-_01-01-39_detected.jpeg
```

Buttons:

`+ Column`

`+ Text`

`+ Media Type`

`+ Row Number`

---

# 7. User Acceptance Test

### Test 1

Upload the sample workbook.

Expected:

- workbook opens
- headers are detected
- images are detected
- no upload/network request is made

### Test 2

Select:

`Detected Face`

Pattern:

`[Index]_[Video Information]_[Date & Time]_[Media Type]`

Expected output:

```text
1_P84F118TOLOSTOYROAD(10.42.115.118)_01-01-39_-_01-01-39_detected.jpeg
```

### Test 3

Select:

`POI Image`

Expected:

```text
1_P84F118TOLOSTOYROAD(10.42.115.118)_01-01-39_-_01-01-39_poi.jpeg
```

### Test 4

Use illegal filename characters.

Expected:

No invalid filesystem path is generated.

### Test 5

Create two identical filenames.

Expected:

No overwrite.

### Test 6

Disconnect Internet.

Expected:

Extraction continues to work.

### Test 7

Upload a malicious/malformed workbook.

Expected:

Application rejects or safely handles it without executing content or crashing.

---

# 8. Deployment Recommendation

For maximum confidentiality, deploy as a static client-side application.

Possible deployment options:

### Highest privacy

Offline packaged desktop application.

### Very good

Internal static web application with all processing client-side.

### Acceptable only with controls

Private server with ephemeral backend processing.

Avoid public SaaS processing for this use case unless there is a strong organizational requirement and an approved data-protection architecture.

---

# 9. Developer Deliverables

The developer must deliver:

1. Complete source code.
2. Production build.
3. README.
4. Security architecture document.
5. Threat model.
6. Test suite.
7. User guide.
8. Deployment guide.
9. Dependency list.
10. Privacy/data-flow documentation.
11. Sample workbook for testing.
12. Automated tests for malicious inputs.
13. Clear instructions for offline deployment.
14. No hardcoded sample-specific column letters.
15. No telemetry/analytics.

---

# 10. Definition of Done

Do not consider the task complete merely because the UI looks functional.

The implementation must demonstrate:

- actual XLSX embedded-media extraction
- correct row-to-media mapping
- dynamic column detection
- dynamic filename templates
- safe filename generation
- duplicate protection
- ZIP generation
- local-only processing
- no external file upload
- malicious workbook handling
- cleanup
- automated tests
- production build

The developer should verify the application against the supplied sample workbook structure and create a regression test for it.
