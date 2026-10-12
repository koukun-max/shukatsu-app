from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import date

app = Flask(__name__)

# ローカルのWeb画面からの通信を許可
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ]
    }
})

# 選択できる予定の種類
EVENT_TYPES = [
    "面接",
    "インターン",
    "インターン準備",
    "選考準備",
    "その他"
]

# 準備内容の選択肢
PREPARATION_OPTIONS = [
    "履歴書提出",
    "ES提出",
    "Webテスト（SPI）",
    "Webテスト（玉手箱）",
    "Webテスト（CAB）",
    "Webテスト（その他）",
    "AI面接",
    "動画アップロード",
    "その他"
]

PREPARATION_TYPES = [
    "インターン準備",
    "選考準備"
]


# =====================================
# ① カレンダーの予定を取得
# =====================================

@app.route("/api/calendar", methods=["POST"])
def calendar():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "データの形式が正しくありません"
        }), 400

    tasks = data.get("tasks", [])

    if not isinstance(tasks, list):
        return jsonify({
            "error": "タスクの形式が正しくありません"
        }), 400

    events = []
    today = date.today()

    for task in tasks:

        if not isinstance(task, dict):
            continue

        title = task.get("title", "")
        due = task.get("due", "")
        done = task.get("done", False)

        if not isinstance(title, str):
            continue

        if not isinstance(due, str) or not due:
            continue

        try:
            due_date = date.fromisoformat(due)
        except ValueError:
            continue

        # 期限までの日数を計算
        remaining = (due_date - today).days

        # 期限切れかどうか
        overdue = remaining < 0 and done is not True

        # 新しく追加した情報も返す
        events.append({
            "title": title,
            "date": due,
            "type": "task",
            "done": done is True,
            "remaining_days": remaining,
            "overdue": overdue,
            "eventType": task.get("eventType", ""),
            "preparations": task.get("preparations", []),
            "otherDetail": task.get("otherDetail", "")
        })

    return jsonify(events)


# =====================================
# ② 予定の追加・編集内容をチェック
# =====================================

@app.route("/api/validate-event", methods=["POST"])
def validate_event():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "ok": False,
            "message": "データの形式が正しくありません"
        }), 400

    # JavaScriptから情報を取得
    title = data.get("title", "")
    event_date = data.get("date", "")
    event_type = data.get("eventType", "")
    preparations = data.get("preparations", [])
    other_detail = data.get("otherDetail", "")

    # 企業名・予定名の確認
    if not isinstance(title, str) or not title.strip():
        return jsonify({
            "ok": False,
            "message": "企業名または予定名を入力してください"
        }), 400

    # 日付の確認
    try:
        if not isinstance(event_date, str):
            raise ValueError()

        parsed_date = date.fromisoformat(event_date)

    except ValueError:
        return jsonify({
            "ok": False,
            "message": "正しい日付を入力してください"
        }), 400

    # 予定の種類を確認
    if event_type not in EVENT_TYPES:
        return jsonify({
            "ok": False,
            "message": "予定の種類を選択してください"
        }), 400

    # 準備内容が配列か確認
    if not isinstance(preparations, list):
        return jsonify({
            "ok": False,
            "message": "準備内容の形式が正しくありません"
        }), 400

    # 不正な選択肢が含まれていないか確認
    if any(
        not isinstance(item, str)
        or item not in PREPARATION_OPTIONS
        for item in preparations
    ):
        return jsonify({
            "ok": False,
            "message": "選択できない準備内容が含まれています"
        }), 400

    if not isinstance(other_detail, str):
        return jsonify({
            "ok": False,
            "message": "その他の内容が正しくありません"
        }), 400

    # 準備以外の予定ではチェック項目を空にする
    if event_type not in PREPARATION_TYPES:
        preparations = []
        other_detail = ""

    # 重複している選択肢を整理
    preparations = list(dict.fromkeys(preparations))

    # 「その他」を選んでいない場合は自由入力を空にする
    if "その他" not in preparations:
        other_detail = ""

    # 確認した情報をJavaScriptへ返す
    return jsonify({
        "ok": True,
        "message": "登録できる予定です",
        "event": {
            "title": title.strip(),
            "date": parsed_date.isoformat(),
            "eventType": event_type,
            "preparations": preparations,
            "otherDetail": other_detail.strip()
        }
    })


# =====================================
# ③ Pythonサーバーを起動
# =====================================

if __name__ == "__main__":
    app.run(debug=True)


