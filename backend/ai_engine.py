import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

class AnomalyDetector:
    """
    AI-powered engine for detecting astronomical anomalies and patterns.
    """
    
    def __init__(self, contamination=0.05):
        """
        Args:
            contamination (float): Expected proportion of outliers (default 5%)
        """
        self.contamination = contamination
        self.scaler = StandardScaler()

    def analyze(self, data_list):
        """
        Main analysis pipeline.
        
        Args:
            data_list (list): List of dicts, e.g. [{'x':RA, 'y':Dec, 'value':Flux}, ...]
            
        Returns:
            dict: {
                "anomalies": [indices],
                "clusters": [cluster_labels],
                "insights": ["Natural language string", ...]
            }
        """
        if not data_list or len(data_list) < 10:
            return {"error": "Insufficient data for analysis"}

        df = pd.DataFrame(data_list)
        results = {"anomalies": [], "clusters": [], "insights": []}

        # Select Features for Analysis
        # We generally care about Position (Cluster) and Value/Flux (Anomaly)
        feature_cols = []
        if 'value' in df.columns: feature_cols.append('value')
        if 'x' in df.columns and 'y' in df.columns: 
             feature_cols.extend(['x', 'y'])
        
        if not feature_cols:
             return {"error": "No valid features found"}

        X = df[feature_cols].dropna() 
        if X.empty: return results
        
        # 1. Anomaly Detection (Isolation Forest)
        # Good for high-dimensional data, effective for "unusualness"
        iso = IsolationForest(contamination=self.contamination, random_state=42)
        # Returns -1 for outlier, 1 for inlier
        preds = iso.fit_predict(X)
        
        anomalies = X[preds == -1]
        results["anomalies"] = anomalies.index.tolist()
        
        # 2. Pattern/Cluster Detection (DBSCAN)
        # Good for finding spatial groups of stars/galaxies
        # We typically cluster on Position (x, y) only for Sky Maps
        if 'x' in df.columns and 'y' in df.columns:
            pos_data = df[['x', 'y']].dropna()
            # Standardize positions for DBSCAN (RA/Dec degrees can vary wildly)
            pos_scaled = self.scaler.fit_transform(pos_data)
            
            # Epsilon 0.3std -> arbitrary heuristic for "close" on sky
            db = DBSCAN(eps=0.3, min_samples=5).fit(pos_scaled)
            results["clusters"] = db.labels_.tolist()
            
            n_clusters = len(set(db.labels_)) - (1 if -1 in db.labels_ else 0)
            if n_clusters > 0:
                results["insights"].append(f"Detected {n_clusters} distinct spatial clusters of objects.")

        # 3. Generate Natural Language Insights
        self._generate_insights(df, anomalies, results)
        
        return results

    def _generate_insights(self, df, anomalies, results):
        """Helper to create human-readable explanations."""
        
        # A. Flux Anomalies
        if 'value' in df.columns and not anomalies.empty:
            mean_flux = df['value'].mean()
            # Check if anomalies are mostly bright or dim
            bright_anoms = anomalies[anomalies['value'] > mean_flux]
            
            if len(bright_anoms) > 0:
                results["insights"].append(
                    f"Identified {len(bright_anoms)} objects with unusually high brightness (potential supernovae or variable stars)."
                )
        
        # B. Correlation Check
        # Check if Brightness correlates with Position (e.g. Galactic Plane)
        if {'x', 'y', 'value'}.issubset(df.columns):
            corr_x = df['value'].corr(df['x'])
            if abs(corr_x) > 0.5:
                direction = "increases" if corr_x > 0 else "decreases"
                results["insights"].append(f"Strong trend detected: Brightness {direction} significantly along the RA axis.")

        # C. Overall Distribution
        if 'value' in df.columns:
            skew = df['value'].skew()
            if abs(skew) > 1:
                results["insights"].append("The data is highly skewed, indicating a mix of many faint objects and a few extremely bright sources.")

if __name__ == "__main__":
    # Test
    mock_data = [{"x": np.random.uniform(0, 100), "y": np.random.uniform(0, 100), "value": np.random.normal(10, 2)} for _ in range(100)]
    # Add outlier
    mock_data.append({"x": 50, "y": 50, "value": 1000}) 
    
    detector = AnomalyDetector()
    print(detector.analyze(mock_data))
