from astropy.io import fits
import numpy as np
import pandas as pd

def parse_fits(filepath):
    """
    Comprehensive FITS parser that handles multiple HDUs, extracts metadata,
    column info, units, and generates statistics/previews.
    
    Args:
        filepath (str): Absolute path to the FITS file.
        
    Returns:
        dict: Structured JSON containing metadata, stats, and preview data.
    """
    try:
        results = {
            "filename": filepath.split('\\')[-1],
            "format": "FITS",
            "hdus": [],
            "metadata": {},   # Aggregated/Primary metadata for quick access
            "statistics": {}, # Aggregated/Primary stats for quick access
            "preview": []     # Sentinel preview for visualization
        }

        # Open the FITS file
        with fits.open(filepath) as hdul:
            # 6. Handle Multiple HDUs
            for i, hdu in enumerate(hdul):
                hdu_info = _process_hdu(hdu, i)
                results["hdus"].append(hdu_info)

            # Determine "Primary" content for the Dashboard
            # Prioritize Tables over Images for analysis
            table_hdus = [h for h in results["hdus"] if h.get("is_table") and h.get("has_data")]
            image_hdus = [h for h in results["hdus"] if h.get("is_image") and h.get("has_data")]
            
            if table_hdus:
                primary_hdu = table_hdus[0]
            elif image_hdus:
                primary_hdu = image_hdus[0]
            else:
                primary_hdu = results["hdus"][0]
            
            # Populates top-level fields for easy frontend access
            results["metadata"] = primary_hdu["header"]
            results["metadata"]["row_count"] = primary_hdu.get("rows", 0) if primary_hdu.get("is_table") else 1
            results["metadata"]["columns"] = [c["name"] for c in primary_hdu.get("columns", [])]
            
            if "stats" in primary_hdu:
                results["statistics"] = primary_hdu["stats"]
            results["preview"] = primary_hdu.get("preview", [])

        return results

    except Exception as e:
        # Clean clean error handling
        print(f"FITS Parsing Error: {e}")
        raise Exception(f"Failed to parse FITS file: {str(e)}")

def _process_hdu(hdu, index):
    """
    Helper to process a single HDU (Header Data Unit).
    """
    info = {
        "index": index,
        "name": hdu.name,
        "type": type(hdu).__name__,
        "header": _extract_header(hdu.header),
        "has_data": hdu.data is not None,
        "is_table": False,
        "is_image": False,
        "columns": [],
        "stats": {},
        "preview": []
    }

    if info["has_data"]:
        data = hdu.data
        
        # 3. & 4. Identify Data Types / Handle Tables vs Images
        # Check for Table types (BinTableHDU or TableHDU)
        if isinstance(hdu, (fits.BinTableHDU, fits.TableHDU)):
            info["is_table"] = True
            info["rows"] = len(data)
            
            # Extract column info (names, formats, units)
            if hasattr(hdu, 'columns'):
                for col in hdu.columns:
                    info["columns"].append({
                        "name": col.name,
                        "format": col.format,
                        "unit": col.unit if col.unit else "N/A"
                    })

            # Generate Table Preview (simulating scatter plot data from columns)
            # We look for numeric columns to plot (RA, DEC, FLUX/MAG)
            try:
                # Identify numeric columns by format (I=Int, E=Float, D=Double, etc)
                numeric_cols = [
                    col.name for col in hdu.columns 
                    if col.format and col.format[-1].upper() in ['I','J','K','E','D']
                ]
                
                if numeric_cols:
                    # Take first 1000 rows
                    limit = min(len(data), 1000)
                    subset = data[:limit]
                    
                    # Smart Column Mapping
                    x_col = next((c for c in numeric_cols if 'RA' in c.upper() or 'X' in c.upper()), numeric_cols[0])
                    y_col = next((c for c in numeric_cols if 'DEC' in c.upper() or 'Y' in c.upper()), numeric_cols[1] if len(numeric_cols)>1 else numeric_cols[0])
                    val_col = next((c for c in numeric_cols if any(x in c.upper() for x in ['FLUX', 'MAG', 'ERR'])), numeric_cols[-1])
                    
                    for j in range(limit):
                        # Handle potential endianness or complex types by casting to standard float
                        row = subset[j]
                        row_dict = {}
                        
                        # Add all columns to the dictionary
                        for col_name in numeric_cols:
                            val = row[col_name]
                            # Handle potential NaN
                            row_dict[col_name] = float(val) if not np.isnan(val) else 0.0
                        
                        # Add required mapped fields for visualization
                        row_dict["id"] = j
                        row_dict["x"] = float(row[x_col]) if not np.isnan(row[x_col]) else 0.0
                        row_dict["y"] = float(row[y_col]) if not np.isnan(row[y_col]) else 0.0
                        row_dict["value"] = float(row[val_col]) if not np.isnan(row[val_col]) else 0.0
                        
                        info["preview"].append(row_dict)
                        
                    # Basic Stats using Pandas (matching CSV parser style)
                    try:
                        df_subset = pd.DataFrame(subset[numeric_cols])
                        # Filter out rows with all NaNs
                        df_subset = df_subset.dropna(how='all')
                        
                        if not df_subset.empty:
                            info["stats"] = {
                                "numeric_columns": numeric_cols,
                                "mean": float(df_subset.mean().mean()),
                                "shape": f"({len(data)}, {len(numeric_cols)})",
                                "samples": df_subset.describe().map(lambda x: float(x)).to_dict()
                            }
                    except Exception as stats_e:
                        print(f"Warning: Failed to generate detailed stats: {stats_e}")
                        # Fallback to basic stats
                        vals = [float(x[val_col]) for x in subset if not np.isnan(x[val_col])]
                        if vals:
                            info["stats"] = {
                                "min": min(vals),
                                "max": max(vals),
                                "mean": sum(vals)/len(vals),
                                "count": len(data)
                            }
            except Exception as e:
                print(f"Warning: Could not generate table preview: {e}")


        # Check for Image types (PrimaryHDU or ImageHDU)
        elif isinstance(hdu, (fits.PrimaryHDU, fits.ImageHDU)):
            info["is_image"] = True
            info["shape"] = str(data.shape)
            
            # 5. Detect Units from Header keywords
            info["unit"] = hdu.header.get('BUNIT', 'N/A')

            # Calculate Image Statistics
            if data.size > 0:
                # Work with flat array for stats
                flat = data.flatten()
                
                # Filter NaNs for stats arithmetic
                if np.issubdtype(data.dtype, np.floating):
                    valid_data = flat[~np.isnan(flat)]
                else:
                    valid_data = flat
                
                if valid_data.size > 0:
                    # 7. Generate Preview (Pixel Coordinate Grid)
                    # Use pixel indices for images to reflect actual data structure
                    rows, cols = data.shape if len(data.shape) >= 2 else (1, data.size)
                    num_samples = min(data.size, 1000)
                    
                    # Sample indices evenly
                    indices = np.linspace(0, data.size - 1, num_samples, dtype=int)
                    
                    for j, idx in enumerate(indices):
                        # Map flat index to 2D coordinates
                        if len(data.shape) >= 2:
                            r = idx // data.shape[1]
                            c = idx % data.shape[1]
                        else:
                            r = 0
                            c = idx
                            
                        val = data.flat[idx]
                        info["preview"].append({
                            "id": j,
                            "value": float(val) if not np.isnan(val) else 0.0,
                            "x": float(c),
                            "y": float(r)
                        })
                    
                    # Statistics for Images
                    info["stats"] = {
                        "numeric_columns": ["value", "x", "y"],
                        "mean": float(np.mean(valid_data)),
                        "shape": str(data.shape),
                        "samples": {
                            "value": {
                                "mean": float(np.mean(valid_data)),
                                "min": float(np.min(valid_data)),
                                "max": float(np.max(valid_data)),
                                "std": float(np.std(valid_data)),
                                "50%": float(np.median(valid_data))
                            }
                        }
                    }

    return info

def _extract_header(header):
    """
    2. Extract and sanitize header metadata.
    """
    meta = {}
    # Prioritize important astronomical keys
    standard_keys = [
        'TELESCOP', 'INSTRUME', 'OBJECT', 'DATE-OBS', 
        'EXPTIME', 'RA', 'DEC', 'ORIGIN', 'BUNIT', 'EQUINOX'
    ]
    
    for key, value in header.items():
        # Skip history/comments to keep JSON clean
        if key in ['HISTORY', 'COMMENT', '']:
            continue
            
        # Include if standard or if it's a simple value (string/number)
        # This helps capture 'FLUX', 'TEMP' etc which might be non-standard
        if key in standard_keys or (isinstance(value, (str, int, float)) and key not in meta):
             meta[key] = str(value)
             
    return meta
