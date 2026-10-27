let currentReport = null;

const PRESETS = {
  respiratory: {
    symptoms: "I've had a fever and cough since yesterday. I also feel tired, have a mild headache, and have a sore throat when swallowing.",
    age: 22,
    sex: "Male",
    duration: "2 days",
    severity: "Moderate",
    history: "None",
    meds: "None",
    allergies: "None"
  },
  headache: {
    symptoms: "I have a dull, throbbing headache across my forehead and temples, worse when staring at computer screens. I feel muscle tension around my neck.",
    age: 24,
    sex: "Female",
    duration: "1 day",
    severity: "Mild",
    history: "None",
    meds: "Paracetamol occasionally",
    allergies: "None"
  },
  emergency: {
    symptoms: "Sudden onset of severe chest pain radiating to arm with severe shortness of breath, heavy sweating, and dizziness.",
    age: 54,
    sex: "Male",
    duration: "30 minutes",
    severity: "Severe",
    history: "Hypertension",
    meds: "Amlodipine",
    allergies: "Penicillin"
  }
};

function setSeverity(val, btnEl) {
  document.getElementById("patient-severity").value = val;
  document.querySelectorAll(".btn-sev").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
}

function loadPreset(key) {
  document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");

  const p = PRESETS[key];
  if (!p) return;

  document.getElementById("symptoms-input").value = p.symptoms;
  document.getElementById("patient-age").value = p.age;
  document.getElementById("patient-sex").value = p.sex;
  document.getElementById("symptom-duration").value = p.duration;
  document.getElementById("patient-history").value = p.history;
  document.getElementById("patient-meds").value = p.meds;
  document.getElementById("patient-allergies").value = p.allergies;

  // set severity button
  document.querySelectorAll(".btn-sev").forEach(b => {
    if (b.textContent.trim() === p.severity) {
      setSeverity(p.severity, b);
    }
  });
}

function clearForm() {
  document.getElementById("symptoms-input").value = "";
  document.getElementById("patient-age").value = 22;
  document.getElementById("patient-history").value = "None";
  document.getElementById("patient-meds").value = "None";
  document.getElementById("patient-allergies").value = "None";
  document.getElementById("empty-state").style.display = "block";
  document.getElementById("report-view").style.display = "none";
}

async function runAnalysis() {
  const symptoms = document.getElementById("symptoms-input").value.trim();
  if (!symptoms) {
    alert("Please enter a symptom description.");
    return;
  }

  const payload = {
    symptoms: symptoms,
    age: document.getElementById("patient-age").value,
    sex: document.getElementById("patient-sex").value,
    duration: document.getElementById("symptom-duration").value,
    severity: document.getElementById("patient-severity").value,
    medical_history: document.getElementById("patient-history").value,
    medication: document.getElementById("patient-meds").value,
    allergies: document.getElementById("patient-allergies").value
  };

  const btn = document.getElementById("btn-submit-analysis");
  const origText = btn.innerHTML;
  btn.innerHTML = "Analyzing Symptoms with GPT-4 Pipeline...";
  btn.disabled = true;

  try {
    const res = await fetch("/analyze_symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      renderReport(data.report);
    } else {
      alert("Analysis error: " + (data.error || "failed"));
    }
  } catch (err) {
    console.error(err);
    alert("Could not reach analysis server.");
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

function renderReport(report) {
  currentReport = report;
  document.getElementById("empty-state").style.display = "none";
  document.getElementById("report-view").style.display = "block";

  // ID and Triage
  document.getElementById("report-id-text").textContent = `#${report.report_id}`;
  
  const triageBox = document.getElementById("triage-banner");
  triageBox.className = "triage-banner";
  if (report.triage.level === "EMERGENCY") {
    triageBox.classList.add("triage-emergency");
  } else if (report.triage.level === "LOW") {
    triageBox.classList.add("triage-low");
  } else {
    triageBox.classList.add("triage-moderate");
  }
  document.getElementById("triage-level-text").textContent = `TRIAGE LEVEL: ${report.triage.level}`;
  document.getElementById("triage-sub-text").textContent = report.triage.label.split(" - ")[1] || report.triage.label;

  // Reported Symptoms
  const sympList = document.getElementById("reported-symptoms-list");
  sympList.innerHTML = "";
  report.extracted_symptoms.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    sympList.appendChild(li);
  });

  document.getElementById("display-duration").textContent = report.patient.duration;

  // Possible Conditions
  const condList = document.getElementById("conditions-list");
  condList.innerHTML = "";
  report.clinical_analysis.possible_conditions.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="condition-item-heading">${c.name}</span><div class="condition-item-desc">${c.description}</div>`;
    condList.appendChild(li);
  });

  document.getElementById("why-considered-text").textContent = report.clinical_analysis.why_considered;

  // Additional Information
  const addList = document.getElementById("additional-info-list");
  addList.innerHTML = "";
  report.clinical_analysis.additional_information_needed.forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    addList.appendChild(li);
  });

  document.getElementById("medical-attention-text").textContent = report.clinical_analysis.medical_attention;
  document.getElementById("report-view").scrollIntoView({ behavior: "smooth" });
}

function copyReportText() {
  if (!currentReport) return;
  const p = currentReport;
  const text = `
CLINICAL MEDICAL SYMPTOM ANALYSIS REPORT
Report ID: #${p.report_id}
Triage: ${p.triage.label}
Duration: ${p.patient.duration}
Symptoms: ${p.extracted_symptoms.join(", ")}
Possible Conditions: ${p.clinical_analysis.possible_conditions.map(c => c.name).join(", ")}
Medical Attention: ${p.clinical_analysis.medical_attention}
Disclaimer: ${p.clinical_analysis.disclaimer}
  `.trim();

  navigator.clipboard.writeText(text).then(() => {
    alert("Clinical report summary copied to clipboard!");
  });
}

function downloadFile(type) {
  if (!currentReport) return;
  window.open(`/download/${currentReport.report_id}/${type}`, "_blank");
}

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1" || params.get("autoload") === "1") {
    const defaultBtn = document.querySelector(".preset-btn.active");
    if (defaultBtn) loadPreset("respiratory");
    setTimeout(runAnalysis, 300);
  }
});
