import os
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from anthropic import Anthropic
from dotenv import load_dotenv
from analysis import analyze

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "sample_o2c_log.csv")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/sample")
def get_sample():
    return FileResponse(DATA_PATH, media_type="text/csv", filename="sample_o2c_log.csv")

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    metrics = analyze(df)
    explanation = generate_explanation(metrics)
    return {**metrics, "explanation": explanation}

@app.get("/analyze-sample")
def analyze_sample():
    df = pd.read_csv(DATA_PATH)
    metrics = analyze(df)
    explanation = generate_explanation(metrics)
    return {**metrics, "explanation": explanation}

def generate_explanation(metrics: dict) -> dict:
    prompt = f"""You are a process intelligence consultant analyzing a business order-to-cash process for a CFO.

Process analysis results:
- Total cases: {metrics['total_cases']}
- Average throughput time: {metrics['avg_throughput']} days
- Biggest bottleneck: {metrics['bottleneck_activity']} (average {metrics['bottleneck_days']} days wait)
- Case dropout rate: {metrics['dropout_rate']}%
- Rework rate: {metrics['rework_rate']}%
- Most overloaded resource: {metrics['top_resource']} ({metrics['top_resource_cases']} cases)

Write a response in two parts:

ANALYSIS: Write 3-4 sentences explaining what the main problems are and what the business impact likely is. Be specific about numbers. Write as if presenting to a CFO. No jargon.

ACTIONS:
- [First specific recommendation]
- [Second specific recommendation]
- [Third specific recommendation]

Be direct. Reference specific activities and numbers from the analysis."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.content[0].text
    parts = text.split("ACTIONS:")
    analysis = parts[0].replace("ANALYSIS:", "").strip()
    actions = []
    if len(parts) > 1:
        action_lines = [l.strip().lstrip("- ").strip() for l in parts[1].strip().split("\n") if l.strip().startswith("-")]
        actions = action_lines

    return {"analysis": analysis, "actions": actions}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)