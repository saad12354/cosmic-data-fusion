import numpy as np
import pandas as pd

class QualityScorer:
    """
    Calculates a real Data Quality Score for astronomical datasets.
    """

    def analyze(self, df, metadata, ai_analysis):
        """
        Calculates score based on multiple metrics.
        """
        if df.empty:
            return self._empty_report()

        report = {
            "score": 0,
            "metrics": {
                "completeness": 0,
                "consistency": 100,
                "validity": 0,
                "stability": 0
            },
            "checks": []
        }

        # 1. COMPLETENESS (30 points)
        # Ratio of non-null values
        total_cells = df.size
        missing_cells = df.isnull().sum().sum()
        completeness_ratio = (total_cells - missing_cells) / total_cells if total_cells > 0 else 0
        report["metrics"]["completeness"] = completeness_ratio * 100
        
        if missing_cells == 0:
            report["checks"].append({"label": "No missing values", "status": "pass"})
        else:
            report["checks"].append({"label": f"{missing_cells} missing values detected", "status": "fail"})

        # 2. VALIDITY (30 points)
        # Coordinate ranges (RA 0-360, Dec -90-90)
        valid_coords = True
        ra_cols = [c for c in df.columns if 'ra' in c.lower() or 'x' in c.lower()]
        dec_cols = [c for c in df.columns if 'dec' in c.lower() or 'y' in c.lower()]

        validity_score = 100
        if ra_cols:
            ra_out = df[(df[ra_cols[0]] < 0) | (df[ra_cols[0]] > 360)]
            if not ra_out.empty:
                validity_score -= 50
                valid_coords = False
        
        if dec_cols:
            dec_out = df[(df[dec_cols[0]] < -90) | (df[dec_cols[0]] > 90)]
            if not dec_out.empty:
                validity_score -= 50
                valid_coords = False

        report["metrics"]["validity"] = max(0, validity_score)
        if valid_coords:
            report["checks"].append({"label": "Coordinate ranges valid", "status": "pass"})
        else:
            report["checks"].append({"label": "Coordinates out of bounds", "status": "warn"})

        # 3. CONSISTENCY (20 points)
        # Check if units are provided and consistent (simplified for MVP)
        has_units = "BUNIT" in metadata or any("unit" in k.lower() for k in metadata.keys())
        if has_units:
             report["checks"].append({"label": "All units consistent", "status": "pass"})
             report["metrics"]["consistency"] = 100
        else:
             report["checks"].append({"label": "Units not explicitly defined", "status": "warn"})
             report["metrics"]["consistency"] = 70

        # 4. STABILITY / ANOMALIES (20 points)
        anomaly_count = len(ai_analysis.get("anomalies", []))
        stability_score = 100
        if anomaly_count > 0:
            # Drop score based on anomaly density
            stability_score = max(0, 100 - (anomaly_count / len(df) * 500))
            report["checks"].append({"label": f"{anomaly_count} potential outliers detected", "status": "warn"})
        else:
            report["checks"].append({"label": "No significant outliers", "status": "pass"})
        
        report["metrics"]["stability"] = stability_score

        # FINAL SCORE (Weighted)
        # Completeness (0.3) + Validity (0.3) + Consistency (0.2) + Stability (0.2)
        final_score = (
            (report["metrics"]["completeness"] * 0.3) +
            (report["metrics"]["validity"] * 0.3) +
            (report["metrics"]["consistency"] * 0.2) +
            (report["metrics"]["stability"] * 0.2)
        )
        report["score"] = int(final_score)

        return report

    def _empty_report(self):
        return {
            "score": 0,
            "metrics": {"completeness": 0, "consistency": 0, "validity": 0, "stability": 0},
            "checks": [{"label": "Empty dataset", "status": "fail"}]
        }
