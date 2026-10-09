const KEY = "shukatsu-companies";
const TASK_KEY = "shukatsu-tasks";
function load(key) {
  const data = localStorage.getItem(key);
  if (data === null) return [];
  return JSON.parse(data);
}
function saveCompanies(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
function saveTasks(list) { localStorage.setItem(TASK_KEY, JSON.stringify(list)); }
function dateString(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}
function makeLink(url) {
  const a = document.createElement("a");
  a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "採用ページ";
  return a;
}
function renderNav(current) {
  const pages = [["index.html","ホーム"],["tasks.html","タスク"],["companies.html","企業"],["backup.html","バックアップ"]];
  const nav = document.getElementById("nav");
  pages.forEach(function (p) {
    const a = document.createElement("a");
    a.href = p[0]; a.textContent = p[1];
    if (p[0] === current) a.className = "current";
    nav.appendChild(a);
  });
}
