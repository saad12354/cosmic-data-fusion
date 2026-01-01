import pandas as pd
import numpy as np

def parse_csv(filepath):
    """
    Parses a CSV file and returns metadata and basic statistics.
    """
    try:
        # Read specifically mostly numeric data for astronomical purposes?
        # For now just read standard CSV
        df = pd.read_csv(filepath)
        
        # Metadata mostly from file info or if there are specific comment lines
        # In simple CSV, column names are the primary metadata
        metadata = {
            "columns": list(df.columns),
            "row_count": len(df)
        }
        
        # Calculate stats for numeric columns only
        numeric_df = df.select_dtypes(include=[np.number])
        
        stats = {}
        if not numeric_df.empty:
            stats = {
                "numeric_columns": list(numeric_df.columns),
                "mean": float(numeric_df.mean().mean()),
                "shape": str(df.shape),
                "samples": numeric_df.describe().map(lambda x: float(x)).to_dict()
            }
            # Flatten samples for simpler display if needed, but dict is fine
        else:
             stats = {
                 "shape": str(df.shape),
                 "message": "No numeric data found for statistics"
             }

        # Prepare preview data
        preview_data = []
        if not numeric_df.empty:
            # Take up to 1000 rows
            sample_df = numeric_df.head(1000)
            # Try to identify RA/Dec columns or just use first two
            cols = sample_df.columns
            x_col = next((c for c in cols if 'ra' in c.lower() or 'x' in c.lower()), cols[0])
            y_col = next((c for c in cols if 'dec' in c.lower() or 'y' in c.lower()), cols[1] if len(cols) > 1 else cols[0])
            val_col = next((c for c in cols if 'flux' in c.lower() or 'mag' in c.lower() or 'val' in c.lower()), cols[0])

            for i, row in sample_df.iterrows():
                row_dict = row.to_dict()
                row_dict['id'] = i
                # Keep x, y, value for backward compatibility with existing components
                row_dict['x'] = float(row[x_col])
                row_dict['y'] = float(row[y_col])
                row_dict['value'] = float(row[val_col])
                preview_data.append(row_dict)

        return {
            "filename": filepath.split('\\')[-1],
            "format": "CSV",
            "metadata": metadata,
            "statistics": stats,
            "preview": preview_data
        }

    except Exception as e:
        raise Exception(f"Error parsing CSV file: {str(e)}")
