WhatsApp Chat Widget - Standalone

Quick start

1. Open `web/index.html` in a browser.
2. Configure your settings in the dashboard UI and test.
3. To embed the floating WhatsApp button in any page, include this script tag:

```html
<script
  src="assets/js/whatsapp-widget.js"
  data-phone="919876543210"
  data-message="Hello! I have a question about..."
  data-color="#25D366"
  data-position="bottom-right"  
  data-size="56"
  data-shape="round"           
  data-badge="true"
  data-badge-count="1"
  data-avail-start="09:00"
  data-avail-end="18:00"
  async
></script>
```

Attribute reference

- phone: Digits only (include ISD/country code). Example: `919876543210`.
- message: Prefilled message for the chat.
- color: Button background color (hex or CSS color).
- position: `bottom-right` | `bottom-left`.
- size: Button size in pixels (40–100).
- shape: `round` | `squircle`.
- badge: `true` | `false`.
- badge-count: 0–99.
- avail-start / avail-end: Daily availability window, 24h format (e.g., `09:00`).
- offline-notice: Optional text to show via alert if clicked outside availability.

Notes

- The widget auto-detects mobile vs desktop and opens `wa.me` or WhatsApp Web accordingly.
- Multiple inclusions on the same page are ignored to prevent duplicates.
- This script is standalone and does not depend on any frameworks.

