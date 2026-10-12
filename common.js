import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = initializeFirestore(fbApp, { ignoreUndefinedProperties: true });

export const companies = [];
export const tasks = [];
let uid = null;
let timer = null;

function ref() {
  return doc(db, "users", uid, "data", "app");
}

export async function saveNow() {
  clearTimeout(timer);
  timer = null;

  if (!uid) return;

  const s = document.getElementById("status");

  try {
    if (s) s.textContent = "保存中...";

    await setDoc(ref(), {
      companies: companies,
      tasks: tasks
    });

    if (s) s.textContent = "保存済み";

  } catch (e) {
    console.error(e);

    if (s) {
      s.textContent =
        "保存できませんでした(" +
        (e.code || "error") +
        ")";
    }
  }
}

function scheduleSave() {
  clearTimeout(timer);
  timer = setTimeout(saveNow, 600);
}

export function saveCompanies() {
  saveNow();
}

export function saveTasks() {
  saveNow();
}

export function saveSoon() {
  scheduleSave();
}

export function newId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6)
  );
}

export function ensureIds() {
  let changed = false;

  companies.forEach(function (c) {
    if (!c.id) {
      c.id = newId();
      changed = true;
    }
  });

  return changed;
}

export function companyName(id) {
  const c = companies.find(function (x) {
    return x.id === id;
  });

  return c ? c.name : "";
}

window.addEventListener("pagehide", function () {
  if (timer) saveNow();
});

async function loadData() {
  const snap = await getDoc(ref());

  companies.length = 0;
  tasks.length = 0;

  if (snap.exists()) {
    const d = snap.data();

    (d.companies || []).forEach(function (c) {
      companies.push(c);
    });

    (d.tasks || []).forEach(function (t) {
      tasks.push(t);
    });
  }

  if (ensureIds()) scheduleSave();
}

export function dateString(offset) {
  const d = new Date();

  d.setDate(d.getDate() + offset);

  const m = String(
    d.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    d.getDate()
  ).padStart(2, "0");

  return (
    d.getFullYear() +
    "-" +
    m +
    "-" +
    day
  );
}

export function makeLink(url) {
  const a = document.createElement("a");

  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "採用ページ";

  return a;
}

// =====================================
// 上部ナビゲーション
// カレンダーの項目を削除
// =====================================

function renderNav(current) {
  const pages = [
    ["index.html", "ホーム"],
    ["tasks.html", "タスク"],
    ["companies.html", "企業"],
    ["backup.html", "バックアップ"]
  ];

  const nav = document.getElementById("nav");

  pages.forEach(function (p) {
    const a = document.createElement("a");

    a.href = p[0];
    a.textContent = p[1];

    if (p[0] === current) {
      a.className = "current";
    }

    a.onclick = async function (e) {
      if (timer) {
        e.preventDefault();
        await saveNow();
        location.href = p[0];
      }
    };

    nav.appendChild(a);
  });

  const box = document.createElement("span");
  box.id = "userbox";

  nav.appendChild(box);
}

function setUserBox(user) {
  const box = document.getElementById("userbox");

  box.innerHTML = "";

  if (!user) return;

  const st = document.createElement("span");
  st.id = "status";
  st.className = "status";

  const out = document.createElement("button");

  out.textContent = "ログアウト";
  out.className = "small";

  out.onclick = async function () {
    await saveNow();
    await signOut(auth);
  };

  box.append(st, out);
}

// =====================================
// Firebaseログインと初期表示
// =====================================

export function start(current, onReady) {
  renderNav(current);

  const appEl = document.getElementById("app");

  const login = document.createElement("div");
  login.id = "login";

  login.innerHTML =
    '<p>使うには、Googleアカウントでログインしてください。</p>' +
    '<button id="loginBtn">Googleでログイン</button>' +
    '<p id="loginMsg"></p>';

  document.getElementById("nav").after(login);

  appEl.hidden = true;

  document.getElementById("loginBtn").onclick =
    async function () {
      try {
        await signInWithPopup(
          auth,
          new GoogleAuthProvider()
        );
      } catch (e) {
        document.getElementById(
          "loginMsg"
        ).textContent =
          "ログインできませんでした(" +
          (e.code || "error") +
          ")";
      }
    };

  onAuthStateChanged(auth, async function (user) {
    if (!user) {
      uid = null;
      appEl.hidden = true;
      login.hidden = false;
      setUserBox(null);
      return;
    }

    uid = user.uid;

    try {
      await loadData();
    } catch (e) {
      document.getElementById(
        "loginMsg"
      ).textContent =
        "データを読み込めませんでした(" +
        (e.code || "error") +
        ")";
      return;
    }

    login.hidden = true;
    appEl.hidden = false;

    setUserBox(user);
    onReady();
  });
}
