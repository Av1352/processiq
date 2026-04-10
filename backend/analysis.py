import pandas as pd
import numpy as np
from datetime import datetime


def analyze(df: pd.DataFrame) -> dict:
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(["case_id", "timestamp"])

    # Throughput time per case
    case_times = df.groupby("case_id")["timestamp"].agg(["min", "max"])
    case_times["throughput_days"] = (case_times["max"] - case_times["min"]).dt.total_seconds() / 86400
    avg_throughput = round(case_times["throughput_days"].mean(), 1)

    # Activity durations
    activity_durations = {}
    for case_id, group in df.groupby("case_id"):
        group = group.drop_duplicates(subset=["activity"]).sort_values("timestamp")
        acts = group["activity"].tolist()
        times = group["timestamp"].tolist()
        for idx in range(len(acts) - 1):
            pair = acts[idx + 1]
            duration = (times[idx + 1] - times[idx]).total_seconds() / 86400
            if pair not in activity_durations:
                activity_durations[pair] = []
            activity_durations[pair].append(duration)

    avg_activity_duration = {
        act: round(np.mean(vals), 2)
        for act, vals in activity_durations.items()
    }

    # Bottleneck detection
    durations = list(avg_activity_duration.values())
    median_duration = np.median(durations) if durations else 1
    bottlenecks = {
        act: dur for act, dur in avg_activity_duration.items()
        if dur > 2 * median_duration
    }
    bottleneck_activity = max(bottlenecks, key=bottlenecks.get) if bottlenecks else max(avg_activity_duration, key=avg_activity_duration.get)
    bottleneck_days = avg_activity_duration.get(bottleneck_activity, 0)

    # Rework detection
    activity_counts = df.groupby(["case_id", "activity"]).size().reset_index(name="count")
    rework_cases = activity_counts[activity_counts["count"] > 1]
    rework_rate = round(len(rework_cases["case_id"].unique()) / df["case_id"].nunique() * 100, 1)

    # Dropout rate
    completed = df[df["activity"] == "Payment Received"]["case_id"].unique()
    total_cases = df["case_id"].nunique()
    dropout_rate = round((1 - len(completed) / total_cases) * 100, 1)

    # Resource workload
    resource_counts = df.groupby("resource")["case_id"].nunique().reset_index()
    resource_counts.columns = ["resource", "case_count"]
    resource_counts = resource_counts.sort_values("case_count", ascending=False)
    top_resource = resource_counts.iloc[0]["resource"]
    top_resource_cases = int(resource_counts.iloc[0]["case_count"])

    # Weekly volume
    df["week"] = df["timestamp"].dt.to_period("W").astype(str)
    weekly = df.groupby("week")["case_id"].nunique().reset_index()
    weekly.columns = ["week", "cases"]
    weekly = weekly.sort_values("week").tail(12)

    # Top slowest cases per activity
    slowest_cases = []
    for case_id, group in df.groupby("case_id"):
        group = group.sort_values("timestamp")
        amount = group["amount"].iloc[0]
        throughput = case_times.loc[case_id, "throughput_days"] if case_id in case_times.index else 0
        slowest_cases.append({
            "case_id": case_id,
            "throughput_days": round(throughput, 1),
            "amount": amount,
            "resource": group["resource"].iloc[0]
        })
    slowest_cases = sorted(slowest_cases, key=lambda x: x["throughput_days"], reverse=True)[:10]

    return {
        "total_cases": total_cases,
        "avg_throughput": avg_throughput,
        "avg_activity_duration": avg_activity_duration,
        "bottleneck_activity": bottleneck_activity,
        "bottleneck_days": round(bottleneck_days, 1),
        "rework_rate": rework_rate,
        "rework_cases": rework_cases.to_dict(orient="records"),
        "dropout_rate": dropout_rate,
        "top_resource": top_resource,
        "top_resource_cases": top_resource_cases,
        "resource_workload": resource_counts.to_dict(orient="records"),
        "weekly_volume": weekly.to_dict(orient="records"),
        "slowest_cases": slowest_cases
    }