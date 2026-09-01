# Security Architecture & Threat Model

## Confidentiality & Privacy Principles

The **Secure Excel Media Extractor** is built specifically to process highly sensitive spreadsheets (e.g. surveillance exports, CCTV logs, identity documents, legal evidence) with strict privacy guarantees.

### Non-Negotiable Privacy Requirements

1. **Zero External Data Flow**:
   - No remote server uploads.
   - No analytics SDKs or telemetry collection.
   - No remote conversion APIs or OCR services.
   - All parsing, rendering, and ZIP bundling occur in browser memory via JavaScript (`JSZip`, `fast-xml-parser`, Blob API).

2. **Volatile Memory Management**:
   - Workbooks are parsed in temporary Uint8Array buffers.
   - Clicking "Clear Data" nullifies all internal references and revokes Blob object URLs.

## Threat Model & Mitigations

| Threat | Risk Level | Mitigation Strategy |
|---|---|---|
| **ZIP Bomb Attack** | High | `zipGuard.ts` validates uncompressed total size (1GB limit), compression ratio (100x max), and file count (10,000 max) prior to extraction. |
| **Zip Slip / Path Traversal** | High | Reject any entry containing `..`, leading `/`, or `:\` in relative paths. Filenames are sanitized via `sanitizer.ts`. |
| **XXE (XML External Entity)** | High | XML parser (`fast-xml-parser`) disables entity resolution and external document fetches. |
| **Filename Injection / Malicious Characters** | Medium | Strips `< > : " / \ \| ? *`, control chars, and maps Windows system reserved names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`) to `safe_*`. |
| **Macro / Script Execution** | High | Office Open XML VBA macros (`xl/vbaProject.bin`) are ignored. Only raw images under `xl/media/` are extracted. |
| **Data Overwrite Collisions** | Medium | Duplicate resolution engine enforces `auto-suffix` (`_2`, `_3`) or explicit skip policies. |
