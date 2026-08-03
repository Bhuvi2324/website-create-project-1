# Aura Beauty Studio — Website

A premium single-site template for a beauty parlour/salon business:
hero, service menu with live pricing, gallery, about, reviews,
social links (Instagram / WhatsApp / YouTube), and a working
booking form with Razorpay payment integration.

## 1. Open it in VS Code

1. Download/copy this folder (`beauty-parlor-site/`) anywhere on your computer.
2. Open VS Code → `File > Open Folder…` → select `beauty-parlor-site`.
3. Install the **Live Server** extension (by Ritwick Dey) if you don't have it.
4. Right-click `index.html` → **Open with Live Server**. The site opens in your browser and reloads on save.

Files:
```
beauty-parlor-site/
├── index.html      → all page content & structure
├── style.css        → design system (colours, type, layout)
├── script.js        → menu selection, booking, payments
└── README.md
```

## 2. Make it yours (do these first)

| What | Where |
|---|---|
| Business name | Search & replace "Aura Beauty Studio" in `index.html` |
| Phone number | Replace `910000000000` everywhere in `index.html`/`script.js` (WhatsApp links use `https://wa.me/<countrycode+number>`) |
| Instagram handle | Replace `instagram.com/yourhandle` links |
| YouTube channel | Replace `youtube.com/@yourhandle` links |
| Address & hours | `#book` section in `index.html` |
| Services & prices | `#services` section — each `<li data-service="..." data-price="...">` |
| Photos | Replace the placeholder `.frame-photo` and `.g-item` divs with real `<img>` tags (see below) |

### Swapping in real photos
Replace a placeholder block like:
```html
<div class="g-item">Bridal look</div>
```
with:
```html
<div class="g-item"><img src="images/bridal-look.jpg" alt="Bridal makeup look"></div>
```
Then add `object-fit:cover; width:100%; height:100%;` to `.g-item img` in `style.css`, and put your photos in a new `images/` folder.

## 3. Connecting real payments (Razorpay)

The demo works out of the box in **test mode** — clicking "Pay deposit" opens a real Razorpay checkout popup, but no real money moves because the key in `script.js` is a placeholder.

To accept real payments:

1. Create a free account at [dashboard.razorpay.com](https://dashboard.razorpay.com) and complete KYC (required for any live business in India — beauty/salon businesses are approved routinely).
2. Go to **Settings → API Keys** and generate a **Live** Key ID.
3. In `script.js`, replace:
   ```js
   const RAZORPAY_KEY_ID = 'rzp_test_1234567890abcd';
   ```
   with your real `rzp_live_...` key.
4. **Important — for a real business, don't stop there.** Right now the payment amount is calculated in the browser, which is fine for a demo but not safe for real charges (anyone could tamper with it). For production you should create the Razorpay "Order" on a small server you control, then pass the `order_id` into the checkout options already stubbed in `script.js` (see the comment `// order_id: 'order_xxx'`). A minimal Node/Express example:

   ```js
   // server.js (Node + Express + razorpay npm package)
   const Razorpay = require('razorpay');
   const instance = new Razorpay({ key_id: 'rzp_live_xxx', key_secret: 'YOUR_SECRET' });

   app.post('/create-order', async (req, res) => {
     const order = await instance.orders.create({
       amount: req.body.amount * 100, // paise
       currency: 'INR'
     });
     res.json(order);
   });
   ```
   You'd host this on any free-tier host (Render, Railway, Vercel serverless functions, etc.) and call it with `fetch('/create-order', ...)` before opening Razorpay Checkout.

**Alternatives to Razorpay:** if you'd rather not run a server at all, you can swap the payment button for a payment *link* instead — Razorpay, Instamojo, and PayU all let you generate a shareable/embeddable payment link from their dashboard with zero code, which you can point the "Pay" button to directly (`<a href="your-payment-link">`).

## 4. Deploying it live

Cheapest/simplest options, roughly easiest first:
- **Netlify** or **Vercel** — drag-and-drop the folder, get a free `.vercel.app`/`.netlify.app` URL, add a custom domain later.
- **GitHub Pages** — push this folder to a GitHub repo, enable Pages in repo settings.
- Buy a domain (e.g. from GoDaddy, Namecheap, or a `.in` registrar) and point it at whichever host you choose.

## 5. Notes on the design

- Fonts: **Fraunces** (headlines) + **Jost** (body/UI), loaded from Google Fonts.
- Colour system lives at the top of `style.css` under `:root` — change the hex values there to re-theme the whole site.
- Fully responsive down to mobile; the nav collapses into a hamburger menu under 720px.
- The floating WhatsApp button (bottom-right) opens a pre-filled chat — edit the message text in `index.html` (`wa-float` link).
