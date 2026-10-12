
import { tasks, saveTasks } from "./common.js";

// =====================================
// ① 基本設定
// =====================================

let currentMonth = new Date();
currentMonth.setDate(1);

let calendarEvents = [];
let selectedDate = null;

const API_URL = "http://127.0.0.1:5000";

const EVENT_TYPES = [
  "面接",
  "インターン",
  "インターン準備",
  "選考準備",
  "その他"
];

const PREPARATION_OPTIONS = [
  "履歴書提出",
  "ES提出",
  "Webテスト（SPI）",
  "Webテスト（玉手箱）",
  "Webテスト（CAB）",
  "Webテスト（その他）",
  "AI面接",
  "動画アップロード",
  "その他"
];

// 予定の種類ごとの色
const EVENT_COLORS = {
  "面接": "#dc2626",
  "インターン": "#2563eb",
  "インターン準備": "#16a34a",
  "選考準備": "#f59e0b",
  "その他": "#8b5cf6"
};

// =====================================
// ② カレンダー専用CSS
// =====================================

// 既存のstyle.cssを変更せずに
// ホーム画面のカレンダーだけを調整する

function setupCalendarStyle() {
  if (document.getElementById("custom-calendar-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "custom-calendar-style";

  style.textContent = `
    /* カレンダーを7列にする */
    #calendar {
      display: grid !important;
      grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
      gap: 6px !important;
      width: 100% !important;
    }

    /* 曜日 */
    #calendar .calendar-weekday {
      text-align: center !important;
      font-weight: bold !important;
      color: #374151 !important;
      padding: 10px 0 !important;
    }

    #calendar .calendar-weekday:first-child {
      color: #dc2626 !important;
    }

    #calendar .calendar-weekday:nth-child(7) {
      color: #2563eb !important;
    }

    /* 月初の空白 */
    #calendar .calendar-empty {
      min-height: 75px !important;
      min-width: 0 !important;
    }

    /* 日付のマス */
    #calendar .calendar-day {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 75px !important;
      box-sizing: border-box !important;

      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      justify-content: space-between !important;

      padding: 8px !important;

      background: #ffffff !important;
      color: #1f2937 !important;

      border: 1px solid #dbe2ea !important;
      border-radius: 8px !important;

      cursor: pointer !important;
      text-align: left !important;
    }

    /* 日付の数字 */
    #calendar .calendar-day-number {
      display: block !important;
      color: #111827 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      opacity: 1 !important;
      visibility: visible !important;
    }

    /* マウスを重ねた日 */
    #calendar .calendar-day:hover {
      background: #eff6ff !important;
    }

    /* 今日 */
    #calendar .calendar-day.is-today {
      background: #dbeafe !important;
      border: 2px solid #2563eb !important;
    }

    /* 選択した日 */
    #calendar .calendar-day.is-selected {
      box-shadow: inset 0 0 0 2px #2563eb !important;
    }

    /* 予定がある日 */
    #calendar .calendar-day.has-event {
      border-color: #cbd5e1 !important;
    }

    /* 色付きの点を並べる */
    #calendar .calendar-event-dots {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 4px !important;
      margin-top: 5px !important;
    }

    #calendar .calendar-event-dot {
      display: block !important;
      width: 9px !important;
      height: 9px !important;
      min-width: 9px !important;
      min-height: 9px !important;
      border-radius: 50% !important;
    }

    /* 予定件数 */
    #calendar .calendar-event-count {
      font-size: 11px !important;
      color: #64748b !important;
      margin-top: 3px !important;
    }

    /* 色分けの説明 */
    .calendar-color-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 16px;
      margin: 12px 0 18px;
      font-size: 13px;
      color: #374151;
    }

    .calendar-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .calendar-legend-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    /* 予定入力フォーム */
    #calendarEvents .event-form {
      display: grid;
      gap: 12px;
      padding: 16px;
      margin-top: 12px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      background: #f9fafb;
    }

    #calendarEvents .event-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    #calendarEvents .event-form label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    #calendarEvents .event-form input[type="text"],
    #calendarEvents .event-form input[type="date"],
    #calendarEvents .event-form select {
      box-sizing: border-box;
      width: 100%;
      padding: 9px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      color: #111827;
    }

    #calendarEvents .preparation-box {
      padding: 12px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    #calendarEvents .preparation-box label {
      display: block;
      margin: 8px 0;
      font-weight: normal;
    }

    #calendarEvents .event-form button {
      padding: 10px 14px;
      border: none;
      border-radius: 6px;
      background: #2563eb;
      color: white;
      cursor: pointer;
    }

    #calendarEvents .calendar-task-item {
      margin: 10px 0;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }

    #calendarEvents .calendar-task-item p {
      margin: 6px 0;
    }

    #calendarEvents .calendar-task-item button {
      margin-top: 8px;
      padding: 7px 14px;
      cursor: pointer;
    }

    #calendarEvents .calendar-task-type {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 12px;
      color: white;
      margin-left: 8px;
    }

    #calendarEvents [hidden] {
      display: none !important;
    }

    @media (max-width: 600px) {
      #calendar {
        gap: 3px !important;
      }

      #calendar .calendar-day,
      #calendar .calendar-empty {
        min-height: 55px !important;
      }

      #calendar .calendar-day {
        padding: 5px !important;
      }

      #calendar .calendar-day-number {
        font-size: 13px !important;
      }

      #calendar .calendar-event-dot {
        width: 6px !important;
        height: 6px !important;
        min-width: 6px !important;
        min-height: 6px !important;
      }

      #calendarEvents .event-form-row {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

// =====================================
// ③ 日付関連
// =====================================

function formatDate(year, month, day) {
  return (
    year +
    "-" +
    String(month + 1).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0")
  );
}

function getTodayString() {
  const today = new Date();

  return formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

// =====================================
// ④ 予定の色を取得
// =====================================

function getEventColor(eventType) {
  return EVENT_COLORS[eventType] || EVENT_COLORS["その他"];
}

// =====================================
// ⑤ Pythonから予定を取得
// =====================================

async function loadEvents() {
  try {
    const response = await fetch(
      API_URL + "/api/calendar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tasks: tasks.map(task => ({
            title: task.title,
            due: task.due,
            done: task.done,
            eventType: task.eventType || "",
            preparations: task.preparations || [],
            otherDetail: task.otherDetail || ""
          }))
        })
      }
    );

    if (!response.ok) {
      throw new Error("予定を取得できませんでした");
    }

    calendarEvents = await response.json();

  } catch (error) {
    console.error(error);

    // Pythonサーバーに接続できない場合も
    // 日付と登録済み予定は表示する
    calendarEvents = tasks.map(task => ({
      title: task.title,
      date: task.due,
      done: task.done,
      eventType: task.eventType || "",
      preparations: task.preparations || [],
      otherDetail: task.otherDetail || ""
    }));
  }

  renderCalendar();

  if (selectedDate) {
    showDateEvents(selectedDate);
  }
}

// =====================================
// ⑥ 色分けの説明を表示
// =====================================

function renderLegend() {
  const calendar = document.getElementById("calendar");

  if (!calendar) return;

  let legend = document.getElementById(
    "calendarColorLegend"
  );

  if (!legend) {
    legend = document.createElement("div");
    legend.id = "calendarColorLegend";
    legend.className = "calendar-color-legend";

    calendar.insertAdjacentElement(
      "afterend",
      legend
    );
  }

  legend.replaceChildren();

  EVENT_TYPES.forEach(type => {
    const item = document.createElement("span");
    item.className = "calendar-legend-item";

    const dot = document.createElement("span");
    dot.className = "calendar-legend-dot";
    dot.style.backgroundColor = getEventColor(type);

    const label = document.createElement("span");
    label.textContent = type;

    item.appendChild(dot);
    item.appendChild(label);

    legend.appendChild(item);
  });
}

// =====================================
// ⑦ カレンダーを表示
// =====================================

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const title = document.getElementById("calendarTitle");

  if (!calendar || !title) return;

  setupCalendarStyle();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  title.textContent = `${year}年${month + 1}月`;

  calendar.replaceChildren();

  const weekdays = [
    "日", "月", "火", "水", "木", "金", "土"
  ];

  weekdays.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "calendar-weekday";
    cell.textContent = day;
    calendar.appendChild(cell);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // 月初の空白
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-empty";
    calendar.appendChild(empty);
  }

  const today = getTodayString();

  // 日付を作成
  for (let day = 1; day <= lastDay; day++) {
    const date = formatDate(year, month, day);

    const events = calendarEvents.filter(
      event => event.date === date
    );

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar-day";

    if (date === today) {
      cell.classList.add("is-today");
    }

    if (date === selectedDate) {
      cell.classList.add("is-selected");
    }

    if (events.length > 0) {
      cell.classList.add("has-event");
    }

    // 日付の数字
    const number = document.createElement("span");
    number.className = "calendar-day-number";
    number.textContent = String(day);

    cell.appendChild(number);

    // 予定の種類に応じた色付きの点
    if (events.length > 0) {
      const dots = document.createElement("div");
      dots.className = "calendar-event-dots";

      events.slice(0, 5).forEach(event => {
        const dot = document.createElement("span");
        dot.className = "calendar-event-dot";

        dot.style.backgroundColor =
          getEventColor(event.eventType);

        dot.title =
          (event.eventType || "その他") +
          "：" +
          event.title;

        dots.appendChild(dot);
      });

      cell.appendChild(dots);

      const count = document.createElement("small");
      count.className = "calendar-event-count";
      count.textContent = `${events.length}件`;

      cell.appendChild(count);
    }

    cell.onclick = () => {
      selectedDate = date;

      renderCalendar();
      showDateEvents(date);
    };

    calendar.appendChild(cell);
  }

  renderLegend();
}

// =====================================
// ⑧ Pythonで入力内容を確認
// =====================================

async function validateEvent(data) {
  const response = await fetch(
    API_URL + "/api/validate-event",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(
      result.message || "入力内容を確認してください"
    );
  }

  return result.event;
}

// =====================================
// ⑨ 予定の追加・編集フォーム
// =====================================

function createEventForm(date, existingTask = null) {
  const box = document.createElement("li");

  const form = document.createElement("div");
  form.className = "event-form";

  // 企業名・予定名
  const titleLabel = document.createElement("label");
  titleLabel.textContent = "企業名・予定名";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "例：森永乳業";

  titleInput.value = existingTask
    ? existingTask.title
    : "";

  // 予定の種類
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "予定の種類";

  const typeSelect = document.createElement("select");

  EVENT_TYPES.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;

    typeSelect.appendChild(option);
  });

  typeSelect.value = existingTask
    ? (existingTask.eventType || "その他")
    : "面接";

  // 上段を横並び
  const topRow = document.createElement("div");
  topRow.className = "event-form-row";

  const titleBox = document.createElement("div");
  titleBox.appendChild(titleLabel);
  titleBox.appendChild(titleInput);

  const typeBox = document.createElement("div");
  typeBox.appendChild(typeLabel);
  typeBox.appendChild(typeSelect);

  topRow.appendChild(titleBox);
  topRow.appendChild(typeBox);

  // 予定日
  const dateLabel = document.createElement("label");
  dateLabel.textContent = "予定日";

  const dateInput = document.createElement("input");
  dateInput.type = "date";

  dateInput.value = existingTask
    ? existingTask.due
    : date;

  // 準備項目
  const preparationBox = document.createElement("div");
  preparationBox.className = "preparation-box";

  const preparationTitle = document.createElement("p");
  preparationTitle.textContent =
    "必要な準備（複数選択可能）";

  preparationBox.appendChild(preparationTitle);

  const checkboxes = [];

  const selectedPreparations =
    existingTask &&
    Array.isArray(existingTask.preparations)
      ? existingTask.preparations
      : [];

  PREPARATION_OPTIONS.forEach(optionName => {
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = optionName;

    checkbox.checked =
      selectedPreparations.includes(optionName);

    label.appendChild(checkbox);
    label.appendChild(
      document.createTextNode(" " + optionName)
    );

    preparationBox.appendChild(label);
    checkboxes.push(checkbox);
  });

  // その他の入力欄
  const otherInput = document.createElement("input");
  otherInput.type = "text";

  otherInput.placeholder =
    "その他の内容（例：ポートフォリオ提出）";

  otherInput.value = existingTask
    ? (existingTask.otherDetail || "")
    : "";

  preparationBox.appendChild(otherInput);

  const otherCheckbox = checkboxes.find(
    checkbox => checkbox.value === "その他"
  );

  function updatePreparationVisibility() {
    const isPreparation =
      typeSelect.value === "インターン準備" ||
      typeSelect.value === "選考準備";

    preparationBox.hidden = !isPreparation;

    otherInput.hidden =
      !isPreparation || !otherCheckbox.checked;
  }

  typeSelect.onchange = updatePreparationVisibility;
  otherCheckbox.onchange = updatePreparationVisibility;

  updatePreparationVisibility();

  // 保存ボタン
  const saveButton = document.createElement("button");
  saveButton.type = "button";

  saveButton.textContent = existingTask
    ? "変更を保存"
    : "予定を追加";

  const message = document.createElement("p");
  message.setAttribute("role", "status");

  saveButton.onclick = async () => {
    saveButton.disabled = true;
    message.textContent = "Pythonで確認中...";

    try {
      const preparations = checkboxes
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

      const data = {
        title: titleInput.value,
        date: dateInput.value,
        eventType: typeSelect.value,
        preparations,
        otherDetail: otherInput.value
      };

      const event = await validateEvent(data);

      if (existingTask) {
        // 既存の予定を編集
        existingTask.title = event.title;
        existingTask.due = event.date;
        existingTask.eventType = event.eventType;
        existingTask.preparations = event.preparations;
        existingTask.otherDetail = event.otherDetail;

      } else {
        // 新しい予定を追加
        tasks.push({
          title: event.title,
          due: event.date,
          done: false,
          eventType: event.eventType,
          preparations: event.preparations,
          otherDetail: event.otherDetail
        });
      }

      // Firebaseに保存
      saveTasks();

      // カレンダーを更新
      selectedDate = event.date;

      const parts = event.date.split("-");

      currentMonth = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        1
      );

      await loadEvents();

    } catch (error) {
      message.textContent =
        error.message || "保存に失敗しました";

    } finally {
      saveButton.disabled = false;
    }
  };

  form.appendChild(topRow);

  form.appendChild(dateLabel);
  form.appendChild(dateInput);

  form.appendChild(preparationBox);

  form.appendChild(saveButton);
  form.appendChild(message);

  box.appendChild(form);

  return box;
}

// =====================================
// ⑩ 選択した日の予定を表示
// =====================================

function showDateEvents(date) {
  const list = document.getElementById(
    "calendarEvents"
  );

  if (!list) return;

  list.replaceChildren();

  const heading = document.createElement("li");
  heading.textContent = `【${date} の予定】`;

  list.appendChild(heading);

  const dayTasks = tasks.filter(
    task => task.due === date
  );

  if (dayTasks.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "登録済みの予定はありません";

    list.appendChild(empty);

  } else {
    dayTasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "calendar-task-item";

      const title = document.createElement("strong");
      title.textContent = task.title;

      li.appendChild(title);

      // 予定の種類
      const eventType = task.eventType || "その他";

      const type = document.createElement("span");
      type.className = "calendar-task-type";

      type.textContent = eventType;
      type.style.backgroundColor =
        getEventColor(eventType);

      li.appendChild(type);

      // 準備内容
      const preparations = Array.isArray(task.preparations)
        ? task.preparations
        : [];

      if (preparations.length > 0) {
        const prepTitle = document.createElement("p");
        prepTitle.textContent = "必要な準備：";

        li.appendChild(prepTitle);

        const prepList = document.createElement("ul");

        preparations.forEach(item => {
          const prepItem = document.createElement("li");

          if (item === "その他" && task.otherDetail) {
            prepItem.textContent =
              "その他：" + task.otherDetail;
          } else {
            prepItem.textContent = item;
          }

          prepList.appendChild(prepItem);
        });

        li.appendChild(prepList);
      }

      // 完了状態
      if (task.done) {
        const done = document.createElement("p");
        done.textContent = "完了済み";

        li.appendChild(done);
      }

      // 編集ボタン
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "編集";

      editButton.onclick = () => {
        const editForm = createEventForm(date, task);
        li.replaceWith(editForm);
      };

      li.appendChild(editButton);
      list.appendChild(li);
    });
  }

  // 新規追加フォーム
  const addHeading = document.createElement("li");
  addHeading.textContent = "新しい予定を追加";

  list.appendChild(addHeading);
  list.appendChild(createEventForm(date));
}

// =====================================
// ⑪ 前月・翌月
// =====================================

document.getElementById("prevMonth").onclick = () => {
  currentMonth.setMonth(
    currentMonth.getMonth() - 1
  );

  selectedDate = null;

  document.getElementById(
    "calendarEvents"
  ).replaceChildren();

  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentMonth.setMonth(
    currentMonth.getMonth() + 1
  );

  selectedDate = null;

  document.getElementById(
    "calendarEvents"
  ).replaceChildren();

  renderCalendar();
};

// =====================================
// ⑫ Firebase読み込み後に実行
// =====================================

export function refreshCalendar() {
  return loadEvents();
}

// 最初にカレンダーの枠を表示
renderCalendar();