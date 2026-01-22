import h5py
import numpy as np

def parse_hdf5(filepath):
    """
    Parses an HDF5 file and returns metadata and basic statistics.
    """
    try:
        with h5py.File(filepath, 'r') as f:
            metadata = {}
            # Extract attributes from the root group as general metadata
            for key, value in f.attrs.items():
                metadata[key] = str(value)
            
            # Recursively explore to find datasets? 
            # For this MVP, let's look for known astronomical keys or just the first dataset found.
            
            def find_first_dataset(group):
                for key in group:
                    item = group[key]
                    if isinstance(item, h5py.Dataset):
                        return item, key
                    elif isinstance(item, h5py.Group):
                        ds, name = find_first_dataset(item)
                        if ds: return ds, name
                return None, None

            dataset, ds_name = find_first_dataset(f)
            
            stats = {}
            preview_data = []
            
            if dataset:
                # Handle large datasets carefully, maybe just read a sample
                data = dataset[()] 
                if np.issubdtype(data.dtype, np.number):
                     stats = {
                        "dataset_name": ds_name,
                        "shape": str(data.shape),
                        "mean": float(np.mean(data)),
                        "std": float(np.std(data)),
                        "min": float(np.min(data)),
                        "max": float(np.max(data))
                    }
                     
                     # Generate preview data for visualization
                     flat_data = data.flatten()
                     num_samples = min(len(flat_data), 1000)
                     
                     # Sample evenly across the dataset
                     indices = np.linspace(0, len(flat_data) - 1, num_samples, dtype=int)
                     
                     for i, idx in enumerate(indices):
                         val = flat_data[idx]
                         
                         # For 2D data, map back to row/col coordinates
                         if len(data.shape) >= 2:
                             row = idx // data.shape[1]
                             col = idx % data.shape[1]
                         else:
                             row = 0
                             col = idx
                         
                         preview_data.append({
                             "id": i,
                             "x": float(col),
                             "y": float(row),
                             "value": float(val) if not np.isnan(val) else 0.0
                         })
                else:
                    stats = {
                        "dataset_name": ds_name,
                        "shape": str(data.shape),
                        "message": "Non-numeric data"
                    }
            else:
                 stats = {"message": "No Value dataset found"}

            return {
                "filename": filepath.split('\\')[-1],
                "format": "HDF5",
                "metadata": metadata,
                "statistics": stats,
                "preview": preview_data
            }

    except Exception as e:
        raise Exception(f"Error parsing HDF5 file: {str(e)}")
