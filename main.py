import pandas as pd
import joblib
from sentence_transformers import SentenceTransformer
from utils import clean_text

print("Loading dataset...")

df = pd.read_csv("data/linkedin_jobs.csv", encoding="latin1")
df.columns = df.columns.str.lower().str.strip()

# Drop bad rows
df = df.dropna(subset=["title", "skills"])

# Fill missing safely
df["description"] = df["description"].fillna("")
df["skills"] = df["skills"].fillna("")

# 🔥 Weighted text (BEST)
df["cleaned_text"] = (
    df["title"] * 3 + " " +
    df["skills"] * 2 + " " +
    df["description"]
).apply(clean_text)

print("Loading model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

print("Generating embeddings...")
embeddings = model.encode(
    df["cleaned_text"].tolist(),
    show_progress_bar=True
)

# Save
joblib.dump(df, "models/jobs_df.pkl")
joblib.dump(embeddings, "models/job_embeddings.pkl")

print("✅ Embeddings saved!")