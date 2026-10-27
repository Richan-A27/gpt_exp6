"""
Ex. No.: 6 - AI-Powered Medical Symptom Assistant using GPT-4
Backend: Flask Application
"""

import os
from flask import Flask, render_template, request, jsonify, send_file
from medical_engine import run_medical_pipeline, REPORTS_DIR

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze_symptoms", methods=["POST"])
def handle_analyze_symptoms():
    data = request.get_json() or {}
    symptoms = data.get("symptoms", "")
    if not symptoms.strip():
        return jsonify({"success": False, "error": "Symptom description cannot be empty."}), 400

    try:
        report = run_medical_pipeline(data)
        return jsonify({"success": True, "report": report})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/download/<report_id>/<file_type>")
def download_file(report_id, file_type):
    if file_type not in ["txt", "json"]:
        return "Invalid format", 400
    
    # Locate file with matching report_id
    for fname in os.listdir(REPORTS_DIR):
        if report_id in fname and fname.endswith(f".{file_type}"):
            return send_file(os.path.join(REPORTS_DIR, fname), as_attachment=True)
            
    return "Report file not found", 404


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "medical-symptom-assistant"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5006))
    print(f"[*] Starting Medical Symptom Assistant on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
