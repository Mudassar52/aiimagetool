// ═══════════════════════════════════════════
//  auth-nav.js  —  Shared Auth Navbar Manager
//  Include this as <script type="module"> in every page
//  Make sure your navbar has: <div id="nav-auth-area"></div>
// ═══════════════════════════════════════════

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMTjMb7GYxDu1agN6TKNAvd3_jtu3eVxs",
  authDomain: "aiimagetool-7729b.firebaseapp.com",
  projectId: "aiimagetool-7729b",
  storageBucket: "aiimagetool-7729b.firebasestorage.app",
  messagingSenderId: "231926132827",
  appId: "1:231926132827:web:7c9cf311100bb5f1410f7e",
  measurementId: "G-FJSJHZHC1R"
};

// Avoid re-initializing if already done on the page
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Pages that don't redirect when not logged in ──
const PUBLIC_PAGES = ['login.html', 'register.html', 'index.html', 'terms.html', 'privacy-policy.html'];
const PROTECTED_PAGES = ['profile.html']; // always require login

function isPublicPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return PUBLIC_PAGES.some(p => path === p);
}
function isProtectedPage() {
  const path = window.location.pathname.split('/').pop();
  return PROTECTED_PAGES.some(p => path === p);
}

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : 'U';
}

function renderLoggedIn(user) {
  const area = document.getElementById('nav-auth-area');
  const mobile = document.getElementById('nav-auth-mobile');

  const initials = getInitials(user.displayName, user.email);
  const photo = user.photoURL;

  const avatarHtml = photo
    ? `<img src="${photo}" alt="avatar" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
    : `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3b7ef8,#2563eb);
                   display:flex;align-items:center;justify-content:center;
                   font-size:11px;font-weight:700;color:#fff;letter-spacing:.5px;">${initials}</div>`;

  const profileLink = `
    <a href="./profile.html" title="My Profile"
       style="display:flex;align-items:center;gap:8px;text-decoration:none;
              padding:6px 12px 6px 6px;border-radius:30px;
              border:1.5px solid #e5e9f5;background:#fff;
              transition:box-shadow .2s,border-color .2s;cursor:pointer;"
       onmouseover="this.style.boxShadow='0 2px 12px rgba(59,126,248,0.15)';this.style.borderColor='#3b7ef8'"
       onmouseout="this.style.boxShadow='none';this.style.borderColor='#e5e9f5'">
      ${avatarHtml}
      <span style="font-size:13px;font-weight:600;color:#1a1f2e;max-width:110px;
                   overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${user.displayName ? user.displayName.split(' ')[0] : 'Profile'}
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2.5">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </a>
    <button class="nav-logout-btn"
      style="font-size:13px;font-weight:600;color:#ef4444;background:transparent;
             border:1.5px solid #fecaca;padding:8px 16px;border-radius:8px;
             cursor:pointer;transition:background .2s;font-family:inherit;"
      onmouseover="this.style.background='#fef2f2'"
      onmouseout="this.style.background='transparent'">
      Logout
    </button>
  `;

  if (area) area.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">${profileLink}</div>`;
  if (mobile) mobile.innerHTML = `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">${profileLink}</div>`;

  document.querySelectorAll('.nav-logout-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.textContent = 'Signing out...';
      btn.disabled = true;
      await signOut(auth);
      window.location.href = './index.html';
    });
  });
}

function renderLoggedOut() {
  const area = document.getElementById('nav-auth-area');
  const mobile = document.getElementById('nav-auth-mobile');

  const html = `
    <div style="display:flex;gap:10px;align-items:center;">
      <a href="./login.html"
         style="font-size:14px;font-weight:600;color:#3b7ef8;text-decoration:none;
                padding:8px 14px;border-radius:8px;border:1.5px solid #dbeafe;">Login</a>
      <a href="./register.html"
         style="font-size:14px;font-weight:600;color:#fff;background:#3b7ef8;
                padding:8px 18px;border-radius:8px;text-decoration:none;">Sign Up Free</a>
    </div>
  `;

  if (area) area.innerHTML = html;
  if (mobile) mobile.innerHTML = html;
}

// ── Main listener ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    renderLoggedIn(user);
    // Redirect away from login/register if already logged in
    // (thoda delay — popup result pehle complete ho sake)
    const path = window.location.pathname.split('/').pop();
    if (path === 'login.html' || path === 'register.html') {
      setTimeout(() => { window.location.href = './index.html'; }, 1500);
    }
  } else {
    renderLoggedOut();
    // Redirect to login if trying to access protected page
    if (isProtectedPage()) {
      sessionStorage.setItem('authReturnUrl', window.location.href);
      window.location.href = './login.html';
    }
  }
});
