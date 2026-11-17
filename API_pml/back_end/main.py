"""
REST API for the online shoppers purchase-intention model.

Run from the API_pml folder:
    uvicorn main:app --reload --port 8000
Docs (test every endpoint in the browser): http://localhost:8000/docs

Needs these files, created by the notebook's save cell:
    model/hgb_retrained.joblib   model fitted on the train split
    model/test_set.csv           the 20% test set (with Revenue column)
    model/artifacts.json         best threshold + feature importance
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_recall_curve, precision_score,
                             recall_score)

MODEL_DIR = Path(__file__).parent / "model"

model = joblib.load(MODEL_DIR / "hgb_retrained.joblib")
with open(MODEL_DIR / "artifacts.json") as f:
    artifacts = json.load(f)

test = pd.read_csv(MODEL_DIR / "test_set.csv")
y_test = test.pop("Revenue").astype(int).to_numpy()
p_test = model.predict_proba(test)[:, 1]  # computed once, reused by every endpoint

FEATURES = list(model.feature_names_in_)
state = {"threshold": float(artifacts["best_threshold"])}

app = FastAPI(title="Online shoppers purchase prediction")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8088", "http://127.0.0.1:8088",
                   "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def metrics_at(t: float) -> dict:
    pred = (p_test >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, pred, labels=[0, 1]).ravel()
    return {
        "threshold": t,
        "accuracy": accuracy_score(y_test, pred),
        "precision": precision_score(y_test, pred, zero_division=0),
        "recall": recall_score(y_test, pred, zero_division=0),
        "f1": f1_score(y_test, pred, zero_division=0),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp),
                             "fn": int(fn), "tp": int(tp)},
        "n_test": int(len(y_test)),
    }


class Threshold(BaseModel):
    threshold: float = Field(ge=0.0, le=1.0)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/features")
def features():
    """Input columns, so the frontend can build the form."""
    cat_cols = model.named_steps["prep"].transformers_[1][2]
    cats = model.named_steps["prep"].named_transformers_["cat"].categories_
    options = {c: [v.item() if hasattr(v, "item") else v for v in vals]
               for c, vals in zip(cat_cols, cats)}
    out = []
    for name in FEATURES:
        if name in options:
            out.append({"name": name, "type": "category", "options": options[name]})
        elif name == "Weekend":
            out.append({"name": name, "type": "boolean"})
        else:
            out.append({"name": name, "type": "number"})
    return out


@app.post("/predict")
def predict(row: dict):
    missing = [c for c in FEATURES if c not in row]
    if missing:
        raise HTTPException(422, f"Missing features: {missing}")
    X = pd.DataFrame([{c: row[c] for c in FEATURES}])
    p = float(model.predict_proba(X)[0, 1])
    t = state["threshold"]
    return {"probability": p, "prediction": int(p >= t),
            "label": "buyer" if p >= t else "not buyer", "threshold": t}


@app.get("/metrics")
def metrics():
    """Test-set metrics at the current threshold."""
    return metrics_at(state["threshold"])


@app.get("/plots/pr")
def pr_curve():
    """Precision-recall curve data (precision/recall have one more point than thresholds)."""
    prec, rec, thr = precision_recall_curve(y_test, p_test)
    return {"precision": prec.tolist(), "recall": rec.tolist(),
            "thresholds": thr.tolist()}


@app.get("/plots/threshold-sweep")
def threshold_sweep():
    """Precision, recall, F1, missed buyers and wrong alarms for thresholds 0.05..0.95."""
    rows = []
    for t in np.round(np.arange(0.05, 0.96, 0.05), 2):
        m = metrics_at(float(t))
        rows.append({"threshold": float(t), "precision": m["precision"],
                     "recall": m["recall"], "f1": m["f1"],
                     "missed_buyers": m["confusion_matrix"]["fn"],
                     "wrong_alarms": m["confusion_matrix"]["fp"]})
    return rows


@app.get("/feature-importance")
def feature_importance():
    return artifacts["importance"]


@app.get("/threshold")
def get_threshold():
    return {"threshold": state["threshold"], "default": artifacts["best_threshold"]}


@app.post("/threshold")
def set_threshold(body: Threshold):
    state["threshold"] = body.threshold
    return metrics_at(state["threshold"])


@app.post("/threshold/reset")
def reset_threshold():
    state["threshold"] = float(artifacts["best_threshold"])
    return metrics_at(state["threshold"])
