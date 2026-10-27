"""
Sample Run / Test Script for Experiment 6
Tests AI-Powered Medical Symptom Assistant end-to-end pipeline.
"""

from medical_engine import run_medical_pipeline

def run_test():
    print("=" * 70)
    print("EXPERIMENT 6: AI-POWERED MEDICAL SYMPTOM ASSISTANT USING GPT-4")
    print("=" * 70)

    # 1. Standard Lab Example Input (Respiratory)
    intake_data = {
        "age": 22,
        "sex": "Male",
        "symptoms": "I've had a fever and cough since yesterday. I also feel tired, have a mild headache, and have a sore throat when swallowing.",
        "duration": "2 days",
        "severity": "Moderate",
        "medical_history": "None",
        "medication": "None",
        "allergies": "None"
    }

    print("\n[+] 1. Patient Profile Intake:")
    for k, v in intake_data.items():
        print(f"    - {k}: {v}")

    print("\n[+] 2. Executing Clinical Processing Pipeline...")
    report = run_medical_pipeline(intake_data)

    print(f"\n[+] Report ID: #{report['report_id']}")
    print(f"[+] Engine: {report['engine']}")
    print(f"[+] Extracted Symptoms: {', '.join(report['extracted_symptoms'])}")
    print(f"[+] Triage Level: {report['triage']['label']}")
    print(f"[+] Urgency Rationale: {report['triage']['urgency_rationale']}")

    print("\n[+] Possible Conditions:")
    for i, c in enumerate(report["clinical_analysis"]["possible_conditions"], 1):
        print(f"    {i}. {c['name']} - {c['description']}")

    print(f"\n[+] Why These Were Considered:\n    {report['clinical_analysis']['why_considered']}")

    print("\n[+] Additional Information Needed:")
    for q in report["clinical_analysis"]["additional_information_needed"]:
        print(f"    * {q}")

    print(f"\n[+] Medical Attention Guidance:\n    {report['clinical_analysis']['medical_attention']}")
    print(f"\n[+] Safety Disclaimer:\n    {report['clinical_analysis']['disclaimer']}")

    print(f"\n[+] Persisted Files in /reports/:")
    print(f"    - TXT: {report['files']['txt_path']}")
    print(f"    - JSON: {report['files']['json_path']}")

    print("\n[✓] Experiment 6 test completed successfully!\n")

if __name__ == "__main__":
    run_test()
