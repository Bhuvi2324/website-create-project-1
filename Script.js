/* ==========================================================
   AURA BEAUTY STUDIO — interactivity
   Sections: nav, menu selection, booking totals, reviews
   carousel, Razorpay checkout.
   ========================================================== */

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
mainNav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mainNav.classList.remove('is-open'))
);

/* ---------- Service menu -> booking basket ---------- */
const selected = new Map(); // name -> price

const selectedList = document.getElementById('selectedList');
const ssEmpty = document.getElementById('ssEmpty');
const ssTotal = document.getElementById('ssTotal');

function formatINR(n){
  return '₹' + n.toLocaleString('en-IN');
}

function renderBasket(){
  selectedList.querySelectorAll('li:not(#ssEmpty)').forEach(li => li.remove());
  if (selected.size === 0){
    ssEmpty.style.display = 'block';
  } else {
    ssEmpty.style.display = 'none';
    selected.forEach((price, name) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${name}</span><span>${formatINR(price)} <span class="ss-remove" data-name="${name}">remove</span></span>`;
      selectedList.appendChild(li);
    });
  }
  const total = [...selected.values()].reduce((a,b) => a+b, 0);
  ssTotal.textContent = formatINR(total);
}

document.querySelectorAll('.menu-list li').forEach(li => {
  li.addEventListener('click', () => {
    const name = li.dataset.service;
    const price = parseInt(li.dataset.price, 10);
    if (selected.has(name)){
      selected.delete(name);
      li.classList.remove('is-selected');
    } else {
      selected.set(name, price);
      li.classList.add('is-selected');
    }
    renderBasket();
  });
});

selectedList.addEventListener('click', (e) => {
  const target = e.target.closest('.ss-remove');
  if (!target) return;
  const name = target.dataset.name;
  selected.delete(name);
  document.querySelectorAll('.menu-list li').forEach(li => {
    if (li.dataset.service === name) li.classList.remove('is-selected');
  });
  renderBasket();
});

renderBasket();

/* ---------- Reviews mini-carousel (dots reflect scroll) ---------- */
const track = document.getElementById('reviewTrack');
const dotsWrap = document.getElementById('reviewDots');
const cards = track.querySelectorAll('.review-card');
cards.forEach((_, i) => {
  const dot = document.createElement('span');
  if (i === 0) dot.classList.add('active');
  dotsWrap.appendChild(dot);
});
track.addEventListener('scroll', () => {
  const index = Math.round(track.scrollLeft / (cards[0].offsetWidth + 26));
  [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === index));
});

/* ---------- Booking form + Razorpay payment ----------
   RAZORPAY SETUP (see README.md for full steps):
   1. Create a free account at https://dashboard.razorpay.com
   2. Grab your Key ID from Settings -> API Keys
   3. Replace RAZORPAY_KEY_ID below with your real key
   4. For production, deposit orders must be created on YOUR
      server (Razorpay Orders API) — never trust a client-side
      amount for a real charge. A Node/Express example is in
      the README.
------------------------------------------------------------ */
const RAZORPAY_KEY_ID = 'rzp_test_1234567890abcd'; // <-- replace with your key

const bookForm = document.getElementById('bookForm');
const payBtn = document.getElementById('payBtn');

bookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (selected.size === 0){
    alert('Please select at least one service from the menu above before booking.');
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const date = document.getElementById('custDate').value;
  const time = document.getElementById('custTime').value;
  const payMethod = bookForm.querySelector('input[name="paymethod"]:checked').value;

  const total = [...selected.values()].reduce((a,b) => a+b, 0);
  const deposit = Math.round(total * 0.2);
  const serviceNames = [...selected.keys()].join(', ');

  if (payMethod === 'cash'){
    confirmBooking({ name, phone, date, time, serviceNames, total, deposit: 0, paid: 'At studio' });
    return;
  }

  // Online payment via Razorpay Checkout
  if (typeof Razorpay === 'undefined'){
    alert('Payment gateway failed to load — check your internet connection and try again.');
    return;
  }

  payBtn.disabled = true;
  payBtn.textContent = 'Opening secure checkout…';

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: deposit * 100, // Razorpay expects paise
    currency: 'INR',
    name: 'Aura Beauty Studio',
    description: `Booking deposit — ${serviceNames}`,
    // order_id: 'order_xxx', // <-- generate server-side for production, see README
    prefill: { name, contact: phone },
    theme: { color: '#3E1C27' },
    handler: function (response){
      confirmBooking({
        name, phone, date, time, serviceNames, total, deposit,
        paid: `Online (Payment ID: ${response.razorpay_payment_id})`
      });
    },
    modal: {
      ondismiss: function(){
        payBtn.disabled = false;
        payBtn.textContent = 'Pay deposit & confirm booking';
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function(){
    alert('Payment failed or was cancelled. Please try again.');
    payBtn.disabled = false;
    payBtn.textContent = 'Pay deposit & confirm booking';
  });
  rzp.open();
  payBtn.disabled = false;
  payBtn.textContent = 'Pay deposit & confirm booking';
});

function confirmBooking(details){
  // In production, send `details` to your server here (fetch POST)
  // to store the booking and trigger a confirmation SMS/WhatsApp/email.
  console.log('Booking confirmed:', details);
  alert(
    `Thank you, ${details.name}! Your booking for ${details.date} at ${details.time} is confirmed.\n\n` +
    `Services: ${details.serviceNames}\nTotal: ₹${details.total}\nPaid now: ${details.paid === 'At studio' ? '₹0 (pay at studio)' : '₹' + details.deposit}\n\n` +
    `We'll message you on WhatsApp shortly to confirm.`
  );
  bookForm.reset();
  selected.clear();
  document.querySelectorAll('.menu-list li.is-selected').forEach(li => li.classList.remove('is-selected'));
  renderBasket();
}

/* ---------- Sticky header shadow on scroll ---------- */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 8px 24px -16px rgba(62,28,39,.35)' : 'none';
});
