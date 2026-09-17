# Catalogue verification report

Extracted 497 unique product codes from the 135-page catalogue using OCR + pattern detection.

These are **review records**, not production-approved products. Every row is `needs_review`. Prices are blank.

## Detected codes by family
- BL: 2 detected; range 75–86
  - Possible missing OCR detections (candidates only): XG-BL-076, XG-BL-077, XG-BL-078, XG-BL-079, XG-BL-080, XG-BL-081, XG-BL-082, XG-BL-083, XG-BL-084, XG-BL-085
- BT: 81 detected; range 1–123
  - Possible missing OCR detections (candidates only): XG-BT-025, XG-BT-026, XG-BT-027, XG-BT-028, XG-BT-029, XG-BT-030, XG-BT-071, XG-BT-075, XG-BT-086, XG-BT-090, XG-BT-091, XG-BT-092, XG-BT-093, XG-BT-094, XG-BT-095, XG-BT-096, XG-BT-097, XG-BT-098, XG-BT-099, XG-BT-100, XG-BT-101, XG-BT-102, XG-BT-103, XG-BT-104, XG-BT-105, XG-BT-106, XG-BT-107, XG-BT-108, XG-BT-109, XG-BT-110, XG-BT-111, XG-BT-112, XG-BT-113, XG-BT-114, XG-BT-115, XG-BT-116, XG-BT-117, XG-BT-118, XG-BT-119, XG-BT-120, XG-BT-121, XG-BT-122
- EL: 41 detected; range 1–44
  - Possible missing OCR detections (candidates only): XG-EL-011, XG-EL-027, XG-EL-028
- GS: 214 detected; range 2–232
  - Possible missing OCR detections (candidates only): XG-GS-004, XG-GS-026, XG-GS-027, XG-GS-055, XG-GS-060, XG-GS-061, XG-GS-063, XG-GS-066, XG-GS-067, XG-GS-071, XG-GS-073, XG-GS-076, XG-GS-080, XG-GS-081, XG-GS-082, XG-GS-123, XG-GS-185
- ID: 48 detected; range 1–48
- MG: 44 detected; range 1–46
  - Possible missing OCR detections (candidates only): XG-MG-019, XG-MG-020
- MP: 18 detected; range 1–21
  - Possible missing OCR detections (candidates only): XG-MP-002, XG-MP-008, XG-MP-014
- NB: 25 detected; range 1–26
  - Possible missing OCR detections (candidates only): XG-NB-015

## Key chains
Detected/normalized codes include XG-K1 through XG-K27 where the source uses forms such as `K4`, `K8`, etc. The source code is preserved in `source_code`.

## Category page ranges used for the PoC
- Water Bottles: pages 3–16
- Mugs: pages 17–24
- Electronics: pages 25–32
- Pens: pages 33–36
- Notebooks: pages 37–41
- ID Card Holders: pages 42–49
- Gift Sets: pages 50–106
- Key Chains: pages 108–134

The index also mentions Table Tops, VC Card Holders and Acrylic Stands, but no dedicated page range was confidently identified from the visual catalogue during this extraction. Do not create placeholder products for them until verified.