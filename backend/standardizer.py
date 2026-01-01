from fuzzywuzzy import process, fuzz

class ColumnStandardizer:
    """
    Standardizes astronomical column names using dictionary lookups and fuzzy matching.
    """

    # 1. Dictionary mapping common variations to standard names
    STANDARD_MAP = {
        "position_ra": [
            "ra", "right ascension", "right_ascension", "alpha", "rarad", "raj2000", "ra_icrs"
        ],
        "position_dec": [
            "dec", "declination", "delta", "decrad", "decj2000", "dec_icrs"
        ],
        "brightness": [
            "flux", "luminosity", "mag", "magnitude", "intensity", "count", "brightness", "flux_density"
        ],
        "temperature": [
            "temp", "temperature", "t_eff", "kelvin", "t_surface"
        ],
        "velocity": [
            "vel", "velocity", "v_lsr", "radial_velocity", "redshift", "z", "doppler"
        ],
        "object_id": [
            "id", "object_id", "source_id", "name", "target", "objid"
        ],
        "error": [
            "err", "error", "uncertainty", "sigma", "std_dev"
        ]
    }

    def __init__(self, fuzzy_threshold=80):
        self.threshold = fuzzy_threshold
        # Invert the map for faster lookup: { 'ra': 'position_ra', 'alpha': 'position_ra', ... }
        self.lookup_map = {}
        for standard, variations in self.STANDARD_MAP.items():
            for var in variations:
                self.lookup_map[var.lower()] = standard
            self.lookup_map[standard] = standard # Add the standard name itself

    def standardize(self, columns, overrides=None):
        """
        Standardizes a list of column names.

        Args:
            columns (list): List of original column names (strings).
            overrides (dict): Optional user-provided mappings {original: standard}.

        Returns:
            dict: {
                "mapping": {original_col: standard_col},
                "log": [{original, standard, method, score}]
            }
        """
        mapping = {}
        log = []
        overrides = overrides or {}

        # Safe normalize overrides
        normalized_overrides = {k.lower(): v for k, v in overrides.items()}

        for col in columns:
            res_col = col  # Default to original if no match
            method = "none"
            score = 0
            
            col_lower = col.lower().strip()

            # 5. User Override Priority
            if col_lower in normalized_overrides:
                res_col = normalized_overrides[col_lower]
                mapping[col] = res_col
                log.append(self._log_entry(col, res_col, "override", 100))
                continue

            # 1. Exact/Dictionary Match (Case-Insensitive)
            if col_lower in self.lookup_map:
                res_col = self.lookup_map[col_lower]
                mapping[col] = res_col
                log.append(self._log_entry(col, res_col, "dictionary_exact", 100))
                continue

            # 2. Fuzzy Matching
            # Compare current column against all known variation keys
            best_match, best_score = process.extractOne(col_lower, self.lookup_map.keys(), scorer=fuzz.token_sort_ratio)
            
            if best_score >= self.threshold:
                standard_name = self.lookup_map[best_match]
                res_col = standard_name
                mapping[col] = standard_name
                log.append(self._log_entry(col, standard_name, f"fuzzy_match (matched: '{best_match}')", best_score))
            else:
                # No match found - keep original
                mapping[col] = col
                log.append(self._log_entry(col, col, "no_match", best_score))

        return {
            "mapping": mapping,
            "log": log
        }

    def _log_entry(self, original, standard, method, score):
        return {
            "original_column": original,
            "standardized_column": standard,
            "method": method,
            "confidence_score": score
        }

if __name__ == "__main__":
    # Test Example
    std = ColumnStandardizer()
    test_cols = ["RA_J2000", "Dec_deg", "FluX_Val", "obj_name", "T_eff_K", "Unknown_Col", "v_rad"]
    
    print("--- Standardization Test ---")
    result = std.standardize(test_cols)
    import json
    print(json.dumps(result, indent=2))
