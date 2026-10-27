/* ===== Utilities ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const E = { Dog: "🐕", Cat: "🐈", Rabbit: "🐰" };

/* Use the current date instead of a fixed demo date. */
const TODAY = new Date();
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const TODAY_ISO = iso(TODAY);
const fmtDate = (s) => {
  if (!s) return "—";
  const d = parse(s);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
};
const fmtLong = (d) =>
  `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const BADGE = {
  Vaccinated: "g",
  "Up-to-Date": "g",
  Confirmed: "g",
  Active: "g",
  Available: "g",
  Healthy: "g",
  "Due Soon": "y",
  Pending: "y",
  "In Progress": "b",
  Completed: "k",
  Overdue: "r",
  Cancelled: "r",
  Inactive: "r",
  Adopted: "b",
  "No Records": "k",
};
const VAX_ICON = { "Up-to-Date": "✓ ", "Due Soon": "⏰ ", Overdue: "🚨 " };
const badge = (v, icon) =>
  `<span class="badge ${BADGE[v] || ""}">${icon ? VAX_ICON[v] || "" : ""}${esc(v)}</span>`;

const SPECIES = ["Dog", "Cat", "Rabbit"];
const VETS = ["Dr. Rivera", "Dr. Reyes", "Dr. Lim"];
const VACCINES = [
  "Rabies",
  "Distemper",
  "Parvo",
  "FVRCP",
  "Leptospirosis",
  "RHDV",
  "Myxomatosis",
  "Bordetella",
];
const APPT_STATUS = [
  "Confirmed",
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

/* ===== Empty application data (no demo/sample records) ===== */
const D = {
  pets: [],
  appointments: [],
  vaccinations: [],
  adoption: [],
  users: [],
  settings: {
    name: "",
    email: "",
    phone: "",
    address: "",
  },
};

/* ===== Derived values (statuses are calculated from dates, never typed in) ===== */
const vaxStatus = (v) => {
  const d = Math.round((parse(v.next) - TODAY) / 864e5);
  return d < 0 ? "Overdue" : d <= 30 ? "Due Soon" : "Up-to-Date";
};
const petOf = (n) => D.pets.find((p) => p.name === n) || {};
const petVax = (p) => {
  const s = D.vaccinations.filter((v) => v.pet === p.name).map(vaxStatus);
  return !s.length
    ? "No Records"
    : s.includes("Overdue")
      ? "Overdue"
      : s.includes("Due Soon")
        ? "Due Soon"
        : "Vaccinated";
};
const tile = (species, i = 0) =>
  `<span class="tile t${i % 5}">${E[species] || "🐾"}</span>`;
const byTime = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);

let state = {
  user: null,
  page: "dashboard",
  q: "",
  f: "",
  st: "",
  vc: "",
  pg: 1,
  tab: "Available",
  sel: TODAY_ISO,
  cal: { y: TODAY.getFullYear(), m: TODAY.getMonth() },
};

/* ===== Login screen ===== */
const PAW = (c) =>
  `<svg viewBox="0 0 24 24" width="28" height="28" fill="${c}" aria-hidden="true"><ellipse cx="6" cy="10" rx="2.2" ry="2.8" transform="rotate(-20 6 10)"/><ellipse cx="10.5" cy="5.8" rx="2.2" ry="2.8"/><ellipse cx="15.5" cy="6.4" rx="2.2" ry="2.8" transform="rotate(12 15.5 6.4)"/><ellipse cx="19.2" cy="11" rx="2" ry="2.6" transform="rotate(28 19.2 11)"/><path d="M12.4 11c-3 0-6 3.4-6 6.2 0 2 1.6 2.9 3.4 2.6 1.1-.2 1.7-.5 2.6-.5s1.5.3 2.6.5c1.8.3 3.4-.6 3.4-2.6 0-2.8-3-6.2-6-6.2z"/></svg>`;
const ICON = {
  user: '<svg viewBox="0 0 24 24" width="18" height="18" fill="#4c2f7a"><circle cx="12" cy="7.5" r="4.2"/><path d="M4 21c0-4.4 3.6-7.2 8-7.2s8 2.8 8 7.2z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.2" fill="#f2b84b"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#8a97a8" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="15.7" r="1.6" fill="#a8641a"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.5C3.8 8.3 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  signin:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.2" fill="#f5c26b"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.7" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="15.7" r="1.6" fill="#a8641a"/></svg>',
};
const PETS_SVG = `<svg viewBox="0 0 230 175" width="230" height="175" aria-hidden="true">
  <g fill="#e6f2ef">
    <ellipse cx="46" cy="118" rx="36" ry="30"/><ellipse cx="116" cy="124" rx="34" ry="28"/><ellipse cx="186" cy="124" rx="34" ry="30"/>
    <ellipse cx="20" cy="66" rx="12" ry="19" transform="rotate(14 20 66)"/><ellipse cx="72" cy="66" rx="12" ry="19" transform="rotate(-14 72 66)"/>
    <ellipse cx="46" cy="76" rx="30" ry="27"/>
    <path d="M88 74 100 42l16 16 16-16 12 32z"/><ellipse cx="116" cy="88" rx="31" ry="26"/>
    <ellipse cx="172" cy="48" rx="8" ry="26" transform="rotate(-6 172 48)"/><ellipse cx="200" cy="48" rx="8" ry="26" transform="rotate(6 200 48)"/>
    <ellipse cx="186" cy="94" rx="28" ry="25"/>
  </g>
  <g fill="#f6b8c4"><ellipse cx="172" cy="50" rx="3.6" ry="18" transform="rotate(-6 172 50)"/><ellipse cx="200" cy="50" rx="3.6" ry="18" transform="rotate(6 200 50)"/>
    <ellipse cx="46" cy="87" rx="7" ry="5"/><ellipse cx="116" cy="96" rx="5" ry="3.6"/><ellipse cx="186" cy="102" rx="5" ry="3.6"/></g>
  <g fill="#0f4d47"><ellipse cx="37" cy="74" rx="3.4" ry="3"/><ellipse cx="55" cy="74" rx="3.4" ry="3"/>
    <ellipse cx="105" cy="86" rx="3.4" ry="3"/><ellipse cx="127" cy="86" rx="3.4" ry="3"/>
    <ellipse cx="176" cy="92" rx="3.2" ry="3"/><ellipse cx="196" cy="92" rx="3.2" ry="3"/></g>
  <g fill="#8fd0c3"><circle cx="40" cy="162" r="4"/><circle cx="52" cy="162" r="4"/><circle cx="46" cy="155" r="3.4"/>
    <circle cx="110" cy="164" r="4"/><circle cx="122" cy="164" r="4"/><circle cx="116" cy="157" r="3.4"/>
    <circle cx="180" cy="162" r="4"/><circle cx="192" cy="162" r="4"/><circle cx="186" cy="155" r="3.4"/></g>
</svg>`;

let authMode = "login";
async function recordsRequest(payload = null) {
  const response = await fetch(
    "api/records.php" + (payload ? "" : "?type=all"),
    {
      method: payload ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: payload ? JSON.stringify(payload) : undefined,
    },
  );
  const result = await response
    .json()
    .catch(() => ({ success: false, message: "Invalid server response." }));
  if (!response.ok || !result.success)
    throw new Error(result.message || "Database request failed.");
  return result;
}
async function loadRecords() {
  const result = await recordsRequest();
  Object.assign(D, result.data);
  D.pets.forEach((p) => {
    p.owner = p.owner || p.owner_name || "";
    p.added = p.added || TODAY_ISO;
  });
}
async function authRequest(action, data = {}) {
  const response = await fetch(
    "api/auth.php?action=" + encodeURIComponent(action),
    {
      method: action === "me" ? "GET" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: action === "me" ? undefined : JSON.stringify(data),
    },
  );
  const result = await response
    .json()
    .catch(() => ({ success: false, message: "Invalid server response." }));
  if (!response.ok || !result.success)
    throw new Error(result.message || "Request failed.");
  return result;
}
function login() {
  app.innerHTML = `<div class="login">
    <section class="lp"><i class="bub b1"></i><i class="bub b2"></i><div class="lp-in">
      <div class="lp-brand"><span class="lp-logo">${PAW("#3b2f5e")}</span><span><b>Olongapo City</b><small>Veterinary Office</small></span></div>
      <div class="lp-art">${PETS_SVG}</div><h2>Caring for Every Companion</h2>
      <p>Professional veterinary care management for the animals of Olongapo City.</p>
      <div class="lp-stats"><div><b>Pet Care</b><small>Records</small></div><div><b>Clinic</b><small>Management</small></div><div><b>Secure</b><small>Accounts</small></div></div>
    </div></section>
    <section class="rp"><i class="bub b3"></i><form id="lf" novalidate>
      <div class="f-logo">${PAW("#3b2f5e")}</div><h1 id="auth-title">Welcome Back</h1>
      <p class="sub" id="auth-sub">Sign in to access the Veterinary Management System</p>
      <div id="signup-fields" class="hidden">
        <label>Full name<span class="field"><i>${ICON.user}</i><input name="name" autocomplete="name" placeholder="Enter your full name" maxlength="120"></span></label>
        <label>Email<span class="field"><i>${ICON.user}</i><input name="email" type="email" autocomplete="email" placeholder="Enter your email"></span></label>
      </div>
      <label>Username<span class="field"><i>${ICON.user}</i><input name="u" autocomplete="username" placeholder="Enter your username" maxlength="50" required></span></label>
      <label>Password<span class="field"><i>${ICON.lock}</i><input name="p" type="password" autocomplete="current-password" placeholder="Enter your password" required minlength="8"><button type="button" class="eye" id="eye" aria-label="Show password">${ICON.eye}</button></span></label>
      <label id="confirm-wrap" class="hidden">Confirm password<span class="field"><i>${ICON.lock}</i><input name="confirm" type="password" autocomplete="new-password" placeholder="Re-enter your password"></span></label>
      <div class="opts" id="login-options"><label class="chk"><input type="checkbox" name="r"> Remember me</label><a href="#" id="fp">Forgot password?</a></div>
      <div class="err" id="err" role="alert"></div><button class="signin" id="submit-auth">${ICON.signin} Sign In</button>
      <p class="sub" style="margin-bottom:0"><span id="switch-label">Don't have an account?</span> <a href="#" id="switch-auth" style="color:var(--p);font-weight:600;text-decoration:none">Create account</a></p>
      <div class="notice">${ICON.lock.replace('width="17" height="17"', 'width="13" height="13"')} Passwords are stored securely using server-side hashing.</div>
    </form></section><button class="help" id="help" aria-label="Help">?</button></div>`;
  const f = $("#lf");
  function setMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    $("#auth-title").textContent = signup ? "Create Account" : "Welcome Back";
    $("#auth-sub").textContent = signup
      ? "Register for the Veterinary Management System"
      : "Sign in to access the Veterinary Management System";
    $("#signup-fields").classList.toggle("hidden", !signup);
    $("#confirm-wrap").classList.toggle("hidden", !signup);
    $("#login-options").classList.toggle("hidden", signup);
    $("#submit-auth").innerHTML =
      `${ICON.signin} ${signup ? "Create Account" : "Sign In"}`;
    $("#switch-label").textContent = signup
      ? "Already have an account?"
      : "Don't have an account?";
    $("#switch-auth").textContent = signup ? "Sign in" : "Create account";
    f.p.autocomplete = signup ? "new-password" : "current-password";
    $("#err").textContent = "";
  }
  $("#switch-auth").onclick = (e) => {
    e.preventDefault();
    setMode(authMode === "login" ? "signup" : "login");
  };
  $("#eye").onclick = () => {
    const show = f.p.type === "password";
    f.p.type = show ? "text" : "password";
    $("#eye").innerHTML = show ? ICON.eyeOff : ICON.eye;
  };
  $("#fp").onclick = (e) => {
    e.preventDefault();
    $("#err").textContent =
      "Please contact the system administrator to reset your password.";
  };
  $("#help").onclick = () =>
    alert("Need help? Contact your system administrator.");
  f.onsubmit = async (e) => {
    e.preventDefault();
    const err = $("#err"),
      btn = $("#submit-auth");
    err.textContent = "";
    const username = f.u.value.trim(),
      password = f.p.value;
    if (!username || !password) {
      err.textContent = "Please enter your username and password.";
      return;
    }
    if (authMode === "signup") {
      if (!f.name.value.trim() || !f.email.value.trim()) {
        err.textContent = "Please enter your full name and email.";
        return;
      }
      if (password.length < 8) {
        err.textContent = "Password must be at least 8 characters.";
        return;
      }
      if (password !== f.confirm.value) {
        err.textContent = "Passwords do not match.";
        return;
      }
    }
    btn.disabled = true;
    btn.textContent =
      authMode === "signup" ? "Creating account…" : "Signing in…";
    try {
      const result = await authRequest(
        authMode === "signup" ? "register" : "login",
        authMode === "signup"
          ? {
              name: f.name.value.trim(),
              email: f.email.value.trim(),
              username,
              password,
            }
          : { username, password },
      );
      state.user = result.user.username;
      state.account = result.user;
      render();
    } catch (error) {
      err.textContent = error.message;
      btn.disabled = false;
      btn.innerHTML = `${ICON.signin} ${authMode === "signup" ? "Create Account" : "Sign In"}`;
    }
  };
  setMode("login");
}

/* ===== App shell ===== */
const NAV = [
  ["MAIN MENU"],
  ["dashboard", "📊", "Dashboard"],
  ["pets", "🐾", "Pet Records"],
  ["appointments", "📅", "Appointments"],
  ["vaccinations", "💉", "Vaccinations"],
  ["adoption", "🏠", "Adoption"],
  ["SYSTEM"],
  ["users", "👥", "Users"],
  ["settings", "⚙️", "Settings"],
];
const NAV_LABEL = Object.fromEntries(
  NAV.filter((n) => n[1]).map((n) => [n[0], n[2]]),
);

function who() {
  const name0 = state.user || "user",
    u = D.users.find((x) => x.username === name0.toLowerCase());
  const name =
      (state.account && state.account.name) ||
      (u ? u.name : name0[0].toUpperCase() + name0.slice(1)),
    role =
      (state.account && state.account.role) ||
      (u ? u.role : "Veterinary Staff");
  const parts = name.split(/\s+/);
  return {
    name,
    role,
    short: parts[0] === "Dr." ? "Dr. " + parts[parts.length - 1] : parts[0],
    ini: (parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2)
    ).toUpperCase(),
  };
}

function buildShell() {
  const me = who();
  app.innerHTML = `<div class="app">
    <aside class="sb">
      <div class="sb-brand"><span class="sb-logo">${PAW("#fff")}</span><span><b>Olongapo City</b><small>Veterinary Office</small></span></div>
      <nav>${NAV.map((n) => (n[1] ? `<button class="nav" data-go="${n[0]}"><i>${n[1]}</i>${n[2]}</button>` : `<div class="sb-label">${n[0]}</div>`)).join("")}</nav>
      <div class="sb-user"><span class="av">${esc(me.ini)}</span><span class="sb-ut"><b>${esc(me.short)}</b><small>${esc(me.role)}</small></span><button data-act="logout" title="Log out" aria-label="Log out">🚪</button></div>
    </aside>
    <div class="ov" data-menu="1"></div>
    <div class="mn">
      <header class="hd">
        <button class="burger" data-menu="1" aria-label="Menu">☰</button>
        <div class="hd-t"><h1 id="ttl"></h1><small>${fmtLong(TODAY)}</small></div>
        <div class="hd-r">
          <div class="qs"><span>🔍</span><input id="qs" placeholder="Quick search..." aria-label="Quick search"></div>
          <button class="bell" data-act="bell" aria-label="Notifications">🔔<i></i></button>
          <div class="me"><span class="av">${esc(me.ini)}</span><span class="me-t"><b>${esc(me.short)}</b><small>${esc(me.role)}</small></span></div>
        </div>
      </header>
      <main class="ct" id="content"></main>
    </div></div>`;
}

const PAGES = {
  dashboard: pDash,
  pets: pPets,
  appointments: pAppts,
  vaccinations: pVax,
  adoption: pAdopt,
  users: pUsers,
  settings: pSettings,
};

function render() {
  if (!state.user) return login();
  if (!$(".app")) buildShell();
  $("#ttl").textContent = NAV_LABEL[state.page];
  $$(".nav").forEach((b) =>
    b.classList.toggle("on", b.dataset.go === state.page),
  );
  PAGES[state.page]();
}
function go(p, q = "") {
  Object.assign(state, {
    page: p,
    q,
    f: "",
    st: "",
    vc: "",
    pg: 1,
    tab: "Available",
    sel: TODAY_ISO,
    cal: { y: TODAY.getFullYear(), m: TODAY.getMonth() },
  });
  $(".app")?.classList.remove("open");
  render();
  window.scrollTo(0, 0);
}
function refresh() {
  const a = document.activeElement,
    id = a && a.id,
    p = a && a.selectionStart;
  PAGES[state.page]();
  if (id) {
    const n = document.getElementById(id);
    if (n) {
      n.focus();
      try {
        n.setSelectionRange(p, p);
      } catch (e) {}
    }
  }
}
function toast(m) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.append(t);
  }
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ===== Small UI helpers ===== */
const acts = (k, i) =>
  `<div class="ac"><button data-act="view" data-k="${k}" data-i="${i}" title="View">👁️</button><button data-act="edit" data-k="${k}" data-i="${i}" title="Edit">✏️</button><button class="dl" data-act="del" data-k="${k}" data-i="${i}" title="Delete">🗑️</button></div>`;
const search = (ph) =>
  `<div class="sr"><span>🔍</span><input id="q" data-s="q" placeholder="${ph}" value="${esc(state.q)}" autocomplete="off"></div>`;
const chip = (key, val, label) =>
  `<button class="chip ${state[key] === val ? "on" : ""}" data-set="${key}:${val}">${label}</button>`;
const sel = (key, opts, all) =>
  `<select class="sl" data-s="${key}" aria-label="${all}"><option value="">${all}</option>${opts.map((o) => `<option ${state[key] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
function paginate(rows, size) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  state.pg = Math.min(Math.max(1, state.pg), pages);
  const a = (state.pg - 1) * size,
    items = rows.slice(a, a + size);
  const foot = `<div class="foot"><span>${rows.length ? `Showing ${a + 1}–${a + items.length} of ${rows.length} records` : "No records"}</span><div class="pager"><button data-pg="${state.pg - 1}" ${state.pg <= 1 ? "disabled" : ""} aria-label="Previous">‹</button>${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === state.pg ? "on" : ""}" data-pg="${i + 1}">${i + 1}</button>`).join("")}<button data-pg="${state.pg + 1}" ${state.pg >= pages ? "disabled" : ""} aria-label="Next">›</button></div></div>`;
  return { items, foot };
}
const table = (heads, body, foot = "", cls = "") =>
  `<div class="card tb"><div class="wrap"><table class="rt ${cls}"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>${foot}</div>`;
const empty = (m) => `<div class="empty">🐾<br>${m}</div>`;
const cell = (label, html, cls = "") =>
  `<td data-label="${label}" class="${cls}">${html}</td>`;

/* ===== Dashboard ===== */
function pDash() {
  const me = who();
  const todays = D.appointments
    .filter((a) => a.date === TODAY_ISO)
    .sort(byTime);
  const vax = D.vaccinations.map((v) => ({ ...v, status: vaxStatus(v) }));
  const due = vax.filter((v) => v.status === "Due Soon"),
    over = vax.filter((v) => v.status === "Overdue");
  const avail = D.adoption.filter((a) => a.status === "Available").length,
    pend = D.adoption.filter((a) => a.status === "Pending").length;
  const newPets = D.pets.filter(
    (p) => (TODAY - parse(p.added)) / 864e5 <= 30,
  ).length;
  const inProg = todays.filter((a) => a.status === "In Progress").length;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const stats = [
    [
      "🐾",
      "g",
      D.pets.length,
      "Total Pets",
      `+${newPets} this month`,
      pct(
        D.pets.filter((p) => petVax(p) === "Vaccinated").length,
        D.pets.length,
      ),
    ],
    [
      "📅",
      "p",
      todays.length,
      "Today's Appointments",
      `${inProg} in progress`,
      pct(
        todays.filter(
          (a) => a.status === "Confirmed" || a.status === "In Progress",
        ).length,
        todays.length,
      ),
    ],
    [
      "💉",
      "o",
      due.length + over.length,
      "Vaccinations Due",
      `${over.length} overdue`,
      pct(over.length, due.length + over.length),
    ],
    [
      "🏠",
      "k",
      avail,
      "Available for Adoption",
      `${pend} pending review`,
      pct(avail, D.adoption.length),
    ],
  ];
  const recent = [...D.pets]
    .sort((a, b) => b.added.localeCompare(a.added))
    .slice(0, 4);
  const remind = vax
    .filter((v) => v.status !== "Up-to-Date")
    .sort((a, b) => a.next.localeCompare(b.next))
    .slice(0, 5);
  const cnt = (s) => D.pets.filter((p) => p.species === s).length;
  const head = (t, go, label) =>
    `<div class="ch"><h3>${t}</h3><button class="btn sm" data-go="${go}">${label}</button></div>`;
  $("#content").innerHTML = `
    <section class="hero"><div><small>Good Day,</small><h2>${esc(me.short)} 👋</h2><p>You have <b>${plural(todays.length, "appointment")}</b> today and <b>${plural(over.length, "overdue vaccination")}</b> to review.</p></div>
      <div class="hero-r"><span class="paws">🐾</span><div class="hero-date"><b>${MONTHS[TODAY.getMonth()]} ${TODAY.getDate()}, ${TODAY.getFullYear()}</b><span>${WEEKDAYS[TODAY.getDay()]}</span></div></div></section>
    <section class="g4">${stats.map((s) => `<div class="card stat"><div class="stat-t"><span class="ic ic-${s[1]}">${s[0]}</span><em class="tag tag-${s[1]}">${s[4]}</em></div><b>${s[2]}</b><small>${s[3]}</small><div class="bar"><i class="bar-${s[1]}" style="width:${s[5]}%"></i></div></div>`).join("")}</section>
    <section class="g3">
      <div class="card">${head("Today's Appointments", "appointments", "View All")}${
        todays.length
          ? todays
              .slice(0, 5)
              .map(
                (a, i) =>
                  `<div class="li"><span class="tile t${i}">${E[petOf(a.pet).species] || "🐾"}</span><div class="li-m"><span><b>${esc(a.pet)}</b> <em>· ${esc(petOf(a.pet).owner || "—")}</em></span><small>${esc(a.purpose)}</small></div><div class="li-r"><b class="or">${fmtTime(a.time)}</b><small>${esc(a.vet)}</small></div></div>`,
              )
              .join("")
          : empty("No appointments today.")
      }</div>
      <div class="card">${head("Recently Added Pets", "pets", "View All")}${recent.map((p, i) => `<div class="li"><span class="tile t${i}">${E[p.species] || "🐾"}</span><div class="li-m"><b>${esc(p.name)}</b><small>${esc(p.breed)} · ${esc(p.owner)}</small></div><div class="li-r"><small>${fmtDate(p.added)}</small></div></div>`).join("")}
        <div class="sum"><div><b>${cnt("Dog")}</b><small>Dogs</small></div><div><b>${cnt("Cat")}</b><small>Cats</small></div><div><b>${D.pets.length - cnt("Dog") - cnt("Cat")}</b><small>Others</small></div></div></div>
      <div class="card">${head("Vaccination Reminders", "vaccinations", "Manage")}
        <div class="two"><div class="mini y"><b>${due.length}</b><small>Due Soon</small></div><div class="mini r"><b>${over.length}</b><small>Overdue</small></div></div>
        ${remind.length ? remind.map((v) => `<div class="li"><span class="tile t4">💉</span><div class="li-m"><b>${esc(v.pet)}</b><small>${esc(v.vaccine)} · ${esc(petOf(v.pet).owner || "—")}</small></div><div class="li-r">${badge(v.status)}<small>${fmtDate(v.next)}</small></div></div>`).join("") : empty("All vaccinations are up to date.")}</div>
    </section>`;
}

/* ===== Pet Records ===== */
function pPets() {
  const q = state.q.toLowerCase();
  const rows = D.pets
    .map((p, i) => ({ ...p, i, vax: petVax(p) }))
    .filter(
      (p) =>
        (!state.f || p.species === state.f) &&
        (!state.st || p.vax === state.st) &&
        (!q || [p.name, p.owner, p.breed].join(" ").toLowerCase().includes(q)),
    );
  const { items, foot } = paginate(rows, 6);
  $("#content").innerHTML = `
    <div class="top"><p class="mu">${plural(D.pets.length, "pet")} registered</p><button class="btn" data-act="add" data-k="pets">+ Add New Pet</button></div>
    <div class="card bar2">${search("Search by pet name, owner, or breed...")}<div class="chips">${chip("f", "", "🐾 All")}${chip("f", "Dog", "🐕 Dog")}${chip("f", "Cat", "🐈 Cat")}${chip("f", "Rabbit", "🐰 Rabbit")}</div>${sel("st", ["Vaccinated", "Due Soon", "Overdue", "No Records"], "All Statuses")}</div>
    ${rows.length ? table(["Pet", "Species", "Breed", "Owner", "Age", "Gender", "Vax Status", "Actions"], items.map((p) => `<tr>${cell("Pet", `<div class="who">${tile(p.species, p.i)}<b>${esc(p.name)}</b></div>`)}${cell("Species", esc(p.species))}${cell("Breed", esc(p.breed))}${cell("Owner", esc(p.owner))}${cell("Age", esc(p.age))}${cell("Gender", `<span class="${p.gender === "Male" ? "male" : "female"}">${p.gender === "Male" ? "♂" : "♀"} ${esc(p.gender)}</span>`)}${cell("Vax Status", badge(p.vax))}${cell("Actions", acts("pets", p.i))}</tr>`).join(""), foot) : `<div class="card">${empty("No pets found.")}</div>`}`;
}

/* ===== Appointments ===== */
const DOT = {
  Confirmed: "g",
  Pending: "o",
  "In Progress": "b",
  Cancelled: "r",
  Completed: "k",
};
function pAppts() {
  const q = state.q.toLowerCase(),
    { y, m } = state.cal;
  const list = D.appointments
    .map((a, i) => ({
      ...a,
      i,
      owner: petOf(a.pet).owner || "—",
      address: petOf(a.pet).address || "Olongapo City",
    }))
    .filter(
      (a) =>
        !q ||
        [a.pet, a.owner, a.purpose, a.vet, a.status]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
  const pad = new Date(y, m, 1).getDay(),
    days = new Date(y, m + 1, 0).getDate();
  let cells = "";
  for (let i = 0; i < pad; i++) cells += '<span class="day blank"></span>';
  for (let d = 1; d <= days; d++) {
    const key = iso(new Date(y, m, d)),
      ap = list.filter((a) => a.date === key);
    cells += `<button class="day ${ap.length ? "has" : ""} ${key === state.sel ? "sel" : ""} ${key === TODAY_ISO ? "today" : ""}" data-day="${key}" aria-label="${fmtDate(key)}: ${plural(ap.length, "appointment")}"><b>${d}</b><span class="dots">${ap
      .slice(0, 3)
      .map((a) => `<i class="d-${DOT[a.status]}"></i>`)
      .join("")}</span></button>`;
  }
  const day = list.filter((a) => a.date === state.sel).sort(byTime),
    sd = parse(state.sel);
  const ws = new Date(sd);
  ws.setDate(sd.getDate() - sd.getDay());
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);
  const wk = D.appointments.filter(
    (a) => a.date >= iso(ws) && a.date <= iso(we),
  );
  const n = (s) => wk.filter((a) => a.status === s).length;
  $("#content").innerHTML = `
    <div class="top end">${search("Search appointments...")}<button class="btn" data-act="add" data-k="appointments">+ New Appointment</button></div>
    <div class="cal-wrap">
      <div class="card cal"><div class="ch"><h3>${MONTHS[m]} ${y}</h3><div class="nv"><button data-cal="-1" aria-label="Previous month">‹</button><button data-cal="1" aria-label="Next month">›</button></div></div>
        <div class="wd">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => `<span>${w}</span>`).join("")}</div><div class="days">${cells}</div>
        <div class="legend"><span><i class="d-g"></i>Scheduled</span><span><i class="d-b"></i>In Progress</span><span><i class="d-o"></i>Pending</span><span><i class="d-r"></i>Cancelled</span></div></div>
      <div class="side">
        <div class="card"><h3>${state.sel === TODAY_ISO ? "Today's Schedule" : "Schedule"}</h3><small class="mu">${fmtDate(state.sel)} — ${plural(day.length, "appointment")}</small>
          <div class="tl">${day.length ? day.map((a) => `<div class="tli"><i class="d-${DOT[a.status]}"></i><div class="tc"><div class="tc-t"><b>${fmtTime(a.time)}</b>${badge(a.status)}</div><strong>${esc(a.pet)}</strong><p><b>Owner:</b> ${esc(a.owner)}</p><p><b>Address:</b> ${esc(a.address)}</p><small>${esc(a.purpose)} • ${esc(a.vet)}</small><div class="ac sm"><button data-act="edit" data-k="appointments" data-i="${a.i}" title="Edit">✏️</button><button class="dl" data-act="del" data-k="appointments" data-i="${a.i}" title="Delete">🗑️</button></div></div></div>`).join("") : empty("No appointments on this day.")}</div></div>
        <div class="card"><h3>This Week Summary</h3><div class="wk"><div class="wr g"><span>Total Appointments</span><b>${wk.length}</b></div><div class="wr g"><span>Completed</span><b>${n("Completed")}</b></div><div class="wr y"><span>Pending</span><b>${n("Pending")}</b></div><div class="wr r"><span>Cancelled</span><b>${n("Cancelled")}</b></div></div></div>
      </div></div>`;
}
function moveMonth(d) {
  const c = new Date(state.cal.y, state.cal.m + d, 1);
  state.cal = { y: c.getFullYear(), m: c.getMonth() };
  state.sel =
    TODAY.getFullYear() === c.getFullYear() && TODAY.getMonth() === c.getMonth()
      ? TODAY_ISO
      : iso(c);
  refresh();
}

/* ===== Vaccinations ===== */
function pVax() {
  const q = state.q.toLowerCase();
  const all = D.vaccinations.map((v, i) => ({
    ...v,
    i,
    status: vaxStatus(v),
    owner: petOf(v.pet).owner || "—",
  }));
  const rows = all
    .filter(
      (v) =>
        (!state.st || v.status === state.st) &&
        (!state.vc || v.vaccine === state.vc) &&
        (!q || [v.pet, v.owner, v.vaccine].join(" ").toLowerCase().includes(q)),
    )
    .sort((a, b) => a.i - b.i);
  const c = (s) => all.filter((v) => v.status === s).length;
  const { items, foot } = paginate(rows, 8);
  const sc = (s, cls, ic) =>
    `<button class="card sc ${cls} ${state.st === s ? "on" : ""}" data-set="st:${state.st === s ? "" : s}"><span><b>${c(s)}</b><strong>${s}</strong><small>Click to filter</small></span><i>${ic}</i></button>`;
  $("#content").innerHTML = `
    <section class="g3 sc-row">${sc("Up-to-Date", "g", "✅")}${sc("Due Soon", "y", "⏰")}${sc("Overdue", "r", "🚨")}</section>
    <div class="card bar2">${search("Search pet or owner...")}${sel("vc", VACCINES, "All Vaccines")}<div class="chips">${chip("st", "", "All")}${chip("st", "Up-to-Date", "Up-to-Date")}${chip("st", "Due Soon", "Due Soon")}${chip("st", "Overdue", "Overdue")}</div><button class="btn" data-act="add" data-k="vaccinations">+ Add Vaccination</button></div>
    ${rows.length ? table(["Pet", "Vaccine", "Date Given", "Next Due", "Status", "Veterinarian", "Actions"], items.map((v) => `<tr>${cell("Pet", `<div class="who">${tile(petOf(v.pet).species, v.i)}<span><b>${esc(v.pet)}</b><small>${esc(v.owner)}</small></span></div>`)}${cell("Vaccine", `<span class="vc">💉 ${esc(v.vaccine)}</span>`)}${cell("Date Given", fmtDate(v.given), "cc")}${cell("Next Due", fmtDate(v.next), "cc nd-" + v.status[0])}${cell("Status", badge(v.status, 1), "cc")}${cell("Veterinarian", esc(v.vet), "cc")}${cell("Actions", acts("vaccinations", v.i), "cc")}</tr>`).join(""), foot, "vx") : `<div class="card">${empty("No vaccination records found.")}</div>`}`;
}

/* ===== Adoption ===== */
const HEADS = ["c0", "c1", "c2", "c3", "c4", "c5"];
function pAdopt() {
  const q = state.q.toLowerCase();
  const tabs = [
    ["Available", "g"],
    ["Pending", "y"],
    ["Adopted", "b"],
  ];
  const rows = D.adoption
    .map((a, i) => ({ ...a, i }))
    .filter(
      (a) =>
        a.status === state.tab &&
        (!q ||
          [a.name, a.breed, a.species, a.reason]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    );
  const primary = (a) =>
    a.status === "Available"
      ? `<button class="btn" data-act="adopt" data-k="adoption" data-i="${a.i}">Adopt</button>`
      : a.status === "Pending"
        ? `<button class="btn" data-act="finish" data-k="adoption" data-i="${a.i}">Complete</button>`
        : `<button class="btn" disabled>Adopted ✓</button>`;
  $("#content").innerHTML = `
    <div class="top">${search("Search pets for adoption...")}<button class="btn" data-act="add" data-k="adoption">+ Add Pet for Adoption</button></div>
    <div class="card tabs">${tabs.map(([t, c]) => `<button class="tab ${state.tab === t ? "on" : ""}" data-set="tab:${t}"><i class="dot-${c}"></i>${t}<em>${D.adoption.filter((a) => a.status === t).length}</em></button>`).join("")}</div>
    ${
      rows.length
        ? `<div class="pgrid">${rows
            .map(
              (
                a,
              ) => `<article class="pc"><div class="pc-h ${HEADS[a.i % 6]}"><span class="pc-em">${E[a.species] || "🐾"}</span><h3>${esc(a.name)}</h3><small>${esc(a.breed)}</small></div>
      <div class="pc-b"><div class="info"><div><small>SPECIES</small><b>${E[a.species] || ""} ${esc(a.species)}</b></div><div><small>AGE</small><b>${esc(a.age)}</b></div><div><small>GENDER</small><b>${a.gender === "Male" ? "♂" : "♀"} ${esc(a.gender)}</b></div><div><small>HEALTH</small><b>${esc(a.health)}</b></div></div>
      <div class="why">📌 ${esc(a.reason)}</div><div class="pc-a"><button class="btn out" data-act="view" data-k="adoption" data-i="${a.i}">View Details</button>${primary(a)}</div></div></article>`,
            )
            .join("")}</div>`
        : `<div class="card">${empty(`No ${state.tab.toLowerCase()} pets found.`)}</div>`
    }`;
}

/* ===== Users ===== */
function pUsers() {
  const q = state.q.toLowerCase();
  const rows = D.users
    .map((u, i) => ({ ...u, i }))
    .filter(
      (u) =>
        (!state.st || u.status === state.st) &&
        (!q ||
          [u.name, u.role, u.username, u.email]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    );
  const { items, foot } = paginate(rows, 8);
  const ini = (n) => {
    const p = n.split(/\s+/);
    return (
      p.length > 1 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2)
    ).toUpperCase();
  };
  $("#content").innerHTML = `
    <div class="top"><p class="mu">${plural(D.users.length, "system account")}</p><button class="btn" data-act="add" data-k="users">+ Add User</button></div>
    <div class="card bar2">${search("Search users...")}${sel("st", ["Active", "Inactive"], "All Statuses")}</div>
    ${rows.length ? table(["Name", "Role", "Username", "Email", "Status", "Actions"], items.map((u) => `<tr>${cell("Name", `<div class="who"><span class="av sm">${ini(u.name)}</span><b>${esc(u.name)}</b></div>`)}${cell("Role", esc(u.role))}${cell("Username", esc(u.username))}${cell("Email", esc(u.email))}${cell("Status", badge(u.status))}${cell("Actions", acts("users", u.i))}</tr>`).join(""), foot) : `<div class="card">${empty("No users found.")}</div>`}`;
}

/* ===== Settings ===== */
function pSettings() {
  const s = D.settings;
  $("#content").innerHTML =
    `<form class="card sform" id="sf"><h3>Clinic Information</h3><p class="mu">These details appear on reports and printed records.</p>
    <label>Clinic Name<input name="name" value="${esc(s.name)}" required></label><label>Contact Email<input name="email" type="email" value="${esc(s.email)}" required></label>
    <label>Phone<input name="phone" value="${esc(s.phone)}" required></label><label>Address<input name="address" value="${esc(s.address)}"></label>
    <div class="acts"><button class="btn">Save Changes</button></div></form>`;
  $("#sf").onsubmit = (e) => {
    e.preventDefault();
    Object.assign(D.settings, Object.fromEntries(new FormData(e.target)));
    toast("Settings saved.");
  };
}

/* ===== Modals: add / edit / view ===== */
const F = (k, l, o = {}) => ({ k, l, ...o });
const FORM = {
  pets: () => [
    F("name", "Pet Name"),
    F("species", "Species", { sel: SPECIES }),
    F("breed", "Breed"),
    F("owner", "Owner Name"),
    F("address", "Owner Address", { full: 1, ph: "Barangay, Olongapo City" }),
    F("age", "Age", { ph: "e.g. 3 yrs" }),
    F("gender", "Gender", { sel: ["Male", "Female"] }),
  ],
  appointments: () => [
    F("pet", "Pet", { sel: D.pets.map((p) => p.name) }),
    F("vet", "Veterinarian", { sel: VETS }),
    F("date", "Date", { type: "date" }),
    F("time", "Time", { type: "time" }),
    F("purpose", "Purpose", { full: 1 }),
    F("status", "Status", { sel: APPT_STATUS }),
  ],
  vaccinations: () => [
    F("pet", "Pet", { sel: D.pets.map((p) => p.name) }),
    F("vaccine", "Vaccine", { sel: VACCINES }),
    F("given", "Date Given", { type: "date" }),
    F("next", "Next Due", { type: "date" }),
    F("vet", "Veterinarian", { sel: VETS }),
  ],
  adoption: () => [
    F("name", "Name"),
    F("species", "Species", { sel: SPECIES }),
    F("breed", "Breed"),
    F("age", "Age", { ph: "e.g. 2 yrs" }),
    F("gender", "Gender", { sel: ["Male", "Female"] }),
    F("health", "Health", {
      sel: ["Vaccinated", "Not Vaccinated", "Under Treatment"],
    }),
    F("status", "Status", { sel: ["Available", "Pending", "Adopted"] }),
    F("reason", "Reason / Notes", { full: 1 }),
  ],
  users: () => [
    F("name", "Full Name"),
    F("role", "Role", { sel: ["Veterinarian", "Veterinary Staff"] }),
    F("username", "Username"),
    F("email", "Email", { type: "email" }),
    F("status", "Status", { sel: ["Active", "Inactive"] }),
  ],
};
const NOUN = {
  pets: "Pet",
  appointments: "Appointment",
  vaccinations: "Vaccination",
  adoption: "Adoption Pet",
  users: "User",
};
const ADD = {
  pets: "Add New Pet",
  appointments: "New Appointment",
  vaccinations: "Add Vaccination",
  adoption: "Add Pet for Adoption",
  users: "Add User",
};
const nextYear = () =>
  iso(new Date(TODAY.getFullYear() + 1, TODAY.getMonth(), TODAY.getDate()));
const DEF = {
  pets: () => ({}),
  appointments: () => ({
    date: state.sel || TODAY_ISO,
    time: "09:00",
    status: "Pending",
  }),
  vaccinations: () => ({ given: TODAY_ISO, next: nextYear() }),
  adoption: () => ({ status: "Available", health: "Vaccinated" }),
  users: () => ({ status: "Active" }),
};

function modal(html) {
  const m = document.createElement("div");
  m.className = "modal";
  m.innerHTML = `<div class="mbox" role="dialog" aria-modal="true">${html}</div>`;
  document.body.append(m);
  m.onclick = (e) => {
    if (e.target === m || e.target.closest("[data-x]")) m.remove();
  };
  return m;
}
const fieldHtml = (f, v) =>
  `<label class="${f.full ? "full" : ""}">${f.l}${f.sel ? `<select name="${f.k}" required>${f.sel.map((o) => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>` : `<input name="${f.k}" type="${f.type || "text"}" value="${esc(v)}" placeholder="${esc(f.ph || "")}" required>`}</label>`;

function form(k, i) {
  const edit = i != null,
    fs = FORM[k](),
    r = edit ? D[k][i] : DEF[k]();
  const m = modal(
    `<form><h2>${edit ? "Edit " + NOUN[k] : ADD[k]}</h2><div class="fg">${fs.map((f) => fieldHtml(f, r[f.k])).join("")}</div><div class="err" id="ferr"></div><div class="acts"><button type="button" class="btn ghost" data-x>Cancel</button><button class="btn">${edit ? "Save Changes" : "Save"}</button></div></form>`,
  );
  $("form", m).onsubmit = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target)),
      fail = (t) => ($("#ferr", m).textContent = t);
    for (const f of fs) v[f.k] = String(v[f.k] ?? "").trim();
    if (fs.some((f) => !v[f.k])) return fail("Please fill in every field.");
    if (
      k === "pets" &&
      D.pets.some(
        (p, j) => j !== i && p.name.toLowerCase() === v.name.toLowerCase(),
      )
    )
      return fail("A pet with this name already exists.");
    if (k === "vaccinations" && v.next < v.given)
      return fail("Next due date must be after the date given.");
    if (
      k === "users" &&
      D.users.some(
        (u, j) =>
          j !== i && u.username.toLowerCase() === v.username.toLowerCase(),
      )
    )
      return fail("That username is already taken.");
    const old = edit ? D[k][i] : null;
    const payload = { ...v };
    if (edit) payload.id = old.id;
    const submit = e.submitter;
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Saving…";
    }
    try {
      await recordsRequest({
        type: k,
        action: "save",
        id: edit ? old.id : 0,
        data: payload,
      });
      await loadRecords();
      m.remove();
      toast(edit ? "Changes saved to database." : "Record saved to database.");
      refresh();
    } catch (error) {
      if (submit) {
        submit.disabled = false;
        submit.textContent = edit ? "Save Changes" : "Save";
      }
      fail(error.message);
    }
  };
  $("input,select", m)?.focus();
}

function detail(k, i) {
  const r = D[k][i],
    rows = FORM[k]().map((f) => [
      f.l,
      f.type === "date"
        ? fmtDate(r[f.k])
        : f.type === "time"
          ? fmtTime(r[f.k])
          : esc(r[f.k]),
    ]);
  if (k === "pets")
    rows.push(
      ["Registered", fmtDate(r.added)],
      ["Vax Status", badge(petVax(r))],
    );
  if (k === "appointments")
    rows.push(
      ["Owner", esc(petOf(r.pet).owner || "—")],
      ["Address", esc(petOf(r.pet).address || "—")],
    );
  if (k === "vaccinations")
    rows.push(
      ["Owner", esc(petOf(r.pet).owner || "—")],
      ["Status", badge(vaxStatus(r), 1)],
    );
  const m = modal(
    `<h2>${esc(r.name || r.pet)}</h2><dl class="dlist">${rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl><div class="acts"><button class="btn red" data-x data-act="del" data-k="${k}" data-i="${i}">Delete</button><button class="btn ghost" data-x>Close</button><button class="btn" data-x data-act="edit" data-k="${k}" data-i="${i}">Edit</button></div>`,
  );
  m.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (b) act(b.dataset.act, b.dataset.k, +b.dataset.i);
  });
}

async function remove(k, i) {
  const r = D[k][i],
    label = r.name || r.pet;
  const extra =
    k === "pets"
      ? " Their appointments and vaccination records will also be removed."
      : "";
  if (!confirm(`Delete "${label}"?${extra}`)) return;
  try {
    await recordsRequest({ type: k, action: "delete", id: r.id });
    await loadRecords();
    toast("Record deleted from database.");
    refresh();
  } catch (error) {
    toast(error.message);
  }
}

async function act(a, k, i) {
  if (a === "add") form(k);
  else if (a === "edit") form(k, i);
  else if (a === "view") detail(k, i);
  else if (a === "del") remove(k, i);
  else if (a === "adopt" || a === "finish") {
    const nextStatus = a === "adopt" ? "Pending" : "Adopted";
    try {
      await recordsRequest({
        type: "adoption",
        action: "status",
        id: D.adoption[i].id,
        data: { status: nextStatus },
      });
      await loadRecords();
      state.tab = nextStatus;
      toast(`${D.adoption[i].name} status saved to database.`);
      refresh();
    } catch (error) {
      toast(error.message);
    }
  } else if (a === "logout") {
    authRequest("logout")
      .catch(() => {})
      .finally(() => {
        state.user = null;
        state.account = null;
        state.page = "dashboard";
        login();
      });
  } else if (a === "bell") {
    const o = D.vaccinations.filter((v) => vaxStatus(v) === "Overdue").length,
      t = D.appointments.filter((x) => x.date === TODAY_ISO).length;
    toast(
      `${plural(o, "overdue vaccination")} · ${plural(t, "appointment")} today`,
    );
  }
}

/* ===== Event delegation (one set of listeners for the whole app) ===== */
app.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-go],[data-act],[data-set],[data-pg],[data-day],[data-cal],[data-menu]",
  );
  if (!t) return;
  const d = t.dataset;
  if (d.menu) $(".app").classList.toggle("open");
  else if (d.go) go(d.go);
  else if (d.set) {
    const [k, ...v] = d.set.split(":");
    state[k] = v.join(":");
    state.pg = 1;
    refresh();
  } else if (d.pg) {
    state.pg = +d.pg;
    refresh();
  } else if (d.day) {
    state.sel = d.day;
    refresh();
  } else if (d.cal) moveMonth(+d.cal);
  else if (d.act) act(d.act, d.k, +d.i);
});
app.addEventListener("input", (e) => {
  const s = e.target.dataset.s;
  if (s) {
    state[s] = e.target.value;
    state.pg = 1;
    refresh();
  }
});
app.addEventListener("keydown", (e) => {
  if (e.target.id === "qs" && e.key === "Enter" && e.target.value.trim())
    go("pets", e.target.value.trim());
});

// Restore an existing PHP session; the server, not localStorage, is the source of truth.
authRequest("me")
  .then(async (r) => {
    state.user = r.user.username;
    state.account = r.user;
    await loadRecords();
    render();
  })
  .catch(() => {
    state.user = null;
    login();
  });
