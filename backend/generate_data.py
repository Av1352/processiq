import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

activities = ["Order Created", "Credit Check", "Goods Issued", "Invoice Sent", "Payment Received"]
resources = {
    "Order Created": "Sales Rep",
    "Credit Check": "Finance Team",
    "Goods Issued": "Warehouse",
    "Invoice Sent": "Accounts Receivable",
    "Payment Received": "Accounts Receivable"
}

n_cases = 500
start_date = datetime(2024, 1, 1)

rows = []

for i in range(n_cases):
    case_id = f"ORD-{str(i+1).zfill(3)}"
    amount = round(np.random.uniform(1000, 50000), 2)
    high_value = amount > 30000
    base_multiplier = 1.2 if high_value else 1.0

    is_bottleneck = i < int(n_cases * 0.15)
    is_dropout = not is_bottleneck and i < int(n_cases * 0.25)
    is_rework = not is_bottleneck and not is_dropout and i < int(n_cases * 0.30)

    current_time = start_date + timedelta(days=np.random.randint(0, 180))

    acts_to_run = activities if not is_dropout else activities[:4]

    for j, activity in enumerate(acts_to_run):
        if j == 0:
            wait = 0
        elif activity == "Credit Check" and is_bottleneck:
            wait = np.random.uniform(6, 12) * base_multiplier
        else:
            wait = np.random.uniform(1, 3) * base_multiplier

        current_time += timedelta(hours=wait * 24)
        rows.append({
            "case_id": case_id,
            "activity": activity,
            "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
            "resource": resources[activity],
            "amount": amount
        })

        if is_rework and activity == "Invoice Sent":
            current_time += timedelta(hours=np.random.uniform(24, 72))
            rows.append({
                "case_id": case_id,
                "activity": activity,
                "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "resource": resources[activity],
                "amount": amount
            })

os.makedirs("../data", exist_ok=True)
df = pd.DataFrame(rows)
df.to_csv("../data/sample_o2c_log.csv", index=False)
print(f"Generated {len(df)} rows across {n_cases} cases")
print(df.head(10))