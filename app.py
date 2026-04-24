from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import numpy as np
import re
import os

app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app)

print("Loading data...")
df = joblib.load("models/jobs_df.pkl")
job_embeddings = joblib.load("models/job_embeddings.pkl")
print("✅ Ready!")

# 🔥 Lazy model
model = None
def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
    return model

# 🔥 Skill extraction
def extract_skills(text):
    text = re.sub(r'[^a-zA-Z, ]', ' ', text.lower())
    return set([w.strip() for w in text.split(",") if len(w.strip()) > 2])

# 🔥 Skill match
def get_skill_match(user_text, job_skills_text):
    user = extract_skills(user_text)
    job = extract_skills(job_skills_text)

    matched = list(user & job)
    missing = list(job - user)

    skill_score = len(matched) / (len(job) + 1)

    return matched[:5], missing[:5], skill_score

# 🔥 Helpers
def get_company(row):
    return str(row.get("company_name", "")).strip() or "Tech Company"

def get_location(row):
    return str(row.get("location", "")).strip() or "Remote"

def get_work_type(row):
    return str(row.get("work_type", "")).strip() or "Full-time"

def get_learning_resources(skills):
    res = {
        "python": "Python Course",
        "react": "React Docs",
        "docker": "Docker Course",
        "aws": "AWS Cloud",
        "sql": "SQL Course",
        "spark": "Big Data Course",
        "hadoop": "Hadoop Course"
    }
    return list({res[s] for s in skills if s in res})[:3]

# 🔥 API
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    user_input = data.get("skills", "").strip()

    if not user_input:
        return jsonify({"results": []})

    model = get_model()
    user_emb = model.encode(user_input)

    # 🔥 Fast vector similarity
    sims = np.dot(job_embeddings, user_emb) / (
        np.linalg.norm(job_embeddings, axis=1) * np.linalg.norm(user_emb)
    )

    top_idx = sims.argsort()[-15:][::-1]

    results = []

    for i in top_idx:
        row = df.iloc[i]

        # 🔥 Use SKILLS COLUMN directly
        job_skills_text = row.get("skills", "")

        matched, missing, skill_score = get_skill_match(user_input, job_skills_text)

        semantic_score = sims[i]
        final_score = 0.7 * semantic_score + 0.3 * skill_score

        

        results.append({
            "title": row["title"],
            "company": get_company(row),
            "location": get_location(row),
            "work_type": get_work_type(row),
            "matched_skills": matched,
            "missing_skills": missing,
            "match_score": round(float(final_score), 2),
            "learning_resources": get_learning_resources(missing)
        })
    print("RESULTS LENGTH:", len(results))
    return jsonify({"results": results[:5]})

# 🔥 Skills API
@app.route("/skills")
def skills():
    all_skills = ",".join(df["skills"].astype(str))
    return jsonify(list(set([s.strip() for s in all_skills.split(",")]))[:100])

# 🔥 Frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists("build/" + path):
        return send_from_directory("build", path)
    return send_from_directory("build", "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)