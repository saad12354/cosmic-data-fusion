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
                "statistics": stats
            }

    except Exception as e:
        raise Exception(f"Error parsing HDF5 file: {str(e)}")
