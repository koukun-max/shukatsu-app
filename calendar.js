import { tasks, companies, saveTasks } from "./common.js";

// =====================================
// ① 基本設定
// =====================================

let currentMonth = new Date();
currentMonth.setDate(1);

let selectedDate = null;

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

const EVENT_COLORS = {
  "面接": "#dc2626",
  "インターン": "#2563eb",
  "インターン準備": "#16a34a",
  "選考準備": "#f59e0b",
  "その他": "#8b5cf6",
  "企業確認": "#0891b2"
};

// =====================================
// ② カレンダーのデザイン
// =====================================

function setupCalendarStyle() {
  if (document.getElementById("custom-calendar-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "custom-calendar-style";

  style.textContent = `
    #calendar {
      display: grid !important;
      grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
      gap: 6px !important;
      width: 100% !important;
    }

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

    #calendar .calendar-empty {
      min-height: 75px !important;
      min-width: 0 !important;
    }

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

    #calendar .calendar-day-number {
      display: block !important;
      color: #111827 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      opacity: 1 !important;
      visibility: visible !important;
    }

    #calendar .calendar-day:hover {
      background: #eff6ff !important;
    }

    #calendar .calendar-day.is-today {
      background: #dbeafe !important;
      border: 2px solid #2563eb !important;
    }

    #calendar .calendar-day.is-selected {
      box-shadow: inset 0 0 0 2px #2563eb !important;
    }

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

    #calendar .calendar-event-count {
      font-size: 11px !important;
      color: #64748b !important;
      margin-top: 3px !important;
    }

    .calendar-color-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 16px;
      margin: 12px 0 18px;
      font-size: 13px;
      color: var(--text, #374151);
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

    #calendarEvents .event-form {
      display: grid;
      gap: 12px;
      padding: 16px;
      margin-top: 12px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      background: #f9fafb;
      color: #111827;
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

    #calendarEvents .event-form button:disabled {
      opacity: 0.6;
      cursor: wait;
    }

    #calendarEvents .calendar-task-item {
      margin: 10px 0;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      color: #111827;
    }

    #calendarEvents .calendar-task-item p {
      margin: 6px 0;
      color: #374151;
    }

    #calendarEvents .calendar-task-item button {
      margin-top: 8px;
      padding: 7px 14px;
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

function isValidDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// =====================================
// ④ 予定の色
// =====================================

function getEventColor(eventType) {
  return (
    EVENT_COLORS[eventType] ||
    EVENT_COLORS["その他"]
  );
}

// =====================================
// ⑤ 入力内容の確認
// Pythonを使わずJavaScriptで実行
// =====================================

function validateEvent(data) {
  const title = String(data.title || "").trim();
  const date = String(data.date || "").trim();

  const eventType = String(
    data.eventType || "その他"
  );

  if (!title) {
    throw new Error("企業名・予定名を入力してください");
  }

  if (!isValidDate(date)) {
    throw new Error("正しい予定日を入力してください");
  }

  if (!EVENT_TYPES.includes(eventType)) {
    throw new Error("予定の種類を選択してください");
  }

  const preparations = Array.isArray(data.preparations)
    ? data.preparations.filter(
        item => PREPARATION_OPTIONS.includes(item)
      )
    : [];

  const otherDetail = String(
    data.otherDetail || ""
  ).trim();

  if (
    preparations.includes("その他") &&
    !otherDetail &&
    (
      eventType === "インターン準備" ||
      eventType === "選考準備"
    )
  ) {
    throw new Error("その他の準備内容を入力してください");
  }

  return {
    title,
    date,
    eventType,
    preparations:
      eventType === "インターン準備" ||
      eventType === "選考準備"
        ? preparations
        : [],
    otherDetail:
      eventType === "インターン準備" ||
      eventType === "選考準備"
        ? otherDetail
        : ""
  };
}

// =====================================
// ⑥ Firebaseから読み込まれたデータを利用
// =====================================

function getCalendarEvents() {
  const events = [];

  tasks.forEach(task => {
    if (!task.due) return;

    const company = companies.find(
      item => item.id === task.companyId
    );

    const title = company
      ? company.name + "：" + task.title
      : task.title;

    events.push({
      title,
      date: task.due,
      done: Boolean(task.done),
      eventType: task.eventType || "その他",
      task
    });
  });

  companies.forEach(company => {
    if (!company.check) return;

    events.push({
      title: company.name + " の採用ページを確認",
      date: company.check,
      done: false,
      eventType: "企業確認",
      task: null
    });
  });

  return events;
}

// =====================================
// ⑦ 色分けの説明
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

  [...EVENT_TYPES, "企業確認"].forEach(type => {
    const item = document.createElement("span");
    item.className = "calendar-legend-item";

    const dot = document.createElement("span");
    dot.className = "calendar-legend-dot";
    dot.style.backgroundColor = getEventColor(type);

    const label = document.createElement("span");
    label.textContent =
      type === "企業確認"
        ? "企業の確認日"
        : type;

    item.appendChild(dot);
    item.appendChild(label);
    legend.appendChild(item);
  });
}

// =====================================
// ⑧ カレンダー表示
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

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-empty";
    calendar.appendChild(empty);
  }

  const today = getTodayString();
  const allEvents = getCalendarEvents();

  for (let day = 1; day <= lastDay; day++) {
    const date = formatDate(year, month, day);

    const events = allEvents.filter(
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

    const number = document.createElement("span");
    number.className = "calendar-day-number";
    number.textContent = String(day);

    cell.appendChild(number);

    if (events.length > 0) {
      const dots = document.createElement("div");
      dots.className = "calendar-event-dots";

      events.slice(0, 5).forEach(event => {
        const dot = document.createElement("span");
        dot.className = "calendar-event-dot";

        dot.style.backgroundColor =
          getEventColor(event.eventType);

        dot.title =
          event.eventType + "：" + event.title;

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
// ⑨ 予定の追加・編集フォーム
// =====================================

function createEventForm(date, existingTask = null) {
  const box = document.createElement("li");

  const form = document.createElement("div");
  form.className = "event-form";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "企業名・予定名";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "例：森永乳業";

  titleInput.value = existingTask
    ? existingTask.title
    : "";

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

  const dateLabel = document.createElement("label");
  dateLabel.textContent = "予定日";

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = existingTask
    ? existingTask.due
    : date;

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

  const saveButton = document.createElement("button");
  saveButton.type = "button";

  saveButton.textContent = existingTask
    ? "変更を保存"
    : "予定を追加";

  const message = document.createElement("p");
  message.setAttribute("role", "status");

  saveButton.onclick = async () => {
    saveButton.disabled = true;
    message.textContent = "保存中...";

    try {
      const preparations = checkboxes
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

      const event = validateEvent({
        title: titleInput.value,
        date: dateInput.value,
        eventType: typeSelect.value,
        preparations,
        otherDetail: otherInput.value
      });

      if (existingTask) {
        existingTask.title = event.title;
        existingTask.due = event.date;
        existingTask.eventType = event.eventType;
        existingTask.preparations = event.preparations;
        existingTask.otherDetail = event.otherDetail;
      } else {
        tasks.push({
          title: event.title,
          due: event.date,
          done: false,
          eventType: event.eventType,
          preparations: event.preparations,
          otherDetail: event.otherDetail
        });
      }

      await saveTasks();

      selectedDate = event.date;

      const parts = event.date.split("-");

      currentMonth = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        1
      );

      refreshCalendar();

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
// ⑩ 選択した日の予定
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

  const allEvents = getCalendarEvents();

  const dayEvents = allEvents.filter(
    event => event.date === date
  );

  if (dayEvents.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "登録済みの予定はありません";
    list.appendChild(empty);
  }

  dayEvents.forEach(event => {
    const li = document.createElement("li");
    li.className = "calendar-task-item";

    const title = document.createElement("strong");
    title.textContent = event.title;
    li.appendChild(title);

    const type = document.createElement("span");
    type.className = "calendar-task-type";

    type.textContent =
      event.eventType === "企業確認"
        ? "企業の確認日"
        : event.eventType;

    type.style.backgroundColor =
      getEventColor(event.eventType);

    li.appendChild(type);

    if (event.task) {
      const task = event.task;

      const preparations = Array.isArray(
        task.preparations
      ) ? task.preparations : [];

      if (preparations.length > 0) {
        const prepTitle = document.createElement("p");
        prepTitle.textContent = "必要な準備：";
        li.appendChild(prepTitle);

        const prepList = document.createElement("ul");

        preparations.forEach(item => {
          const prepItem = document.createElement("li");

          prepItem.textContent =
            item === "その他" && task.otherDetail
              ? "その他：" + task.otherDetail
              : item;

          prepList.appendChild(prepItem);
        });

        li.appendChild(prepList);
      }

      if (task.done) {
        const done = document.createElement("p");
        done.textContent = "完了済み";
        li.appendChild(done);
      }

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "編集";

      editButton.onclick = () => {
        li.replaceWith(
          createEventForm(date, task)
        );
      };

      li.appendChild(editButton);
    }

    list.appendChild(li);
  });

  const addHeading = document.createElement("li");
  addHeading.textContent = "新しい予定を追加";
  list.appendChild(addHeading);

  list.appendChild(createEventForm(date));
}

// =====================================
// ⑪ 前月・翌月ボタン
// =====================================

const prevButton = document.getElementById("prevMonth");
const nextButton = document.getElementById("nextMonth");

if (prevButton) {
  prevButton.onclick = () => {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    selectedDate = null;

    const list = document.getElementById(
      "calendarEvents"
    );

    if (list) list.replaceChildren();

    renderCalendar();
  };
}

if (nextButton) {
  nextButton.onclick = () => {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );

    selectedDate = null;

    const list = document.getElementById(
      "calendarEvents"
    );

    if (list) list.replaceChildren();

    renderCalendar();
  };
}

// =====================================
// ⑫ 外部からの更新
// =====================================

export function refreshCalendar() {
  renderCalendar();

  if (selectedDate) {
    showDateEvents(selectedDate);
  }
}

// 最初にカレンダーの枠を表示
renderCalendar();
