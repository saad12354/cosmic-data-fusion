from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    format = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String)
    file_size = Column(Integer, nullable=True) # in bytes
    uploader_id = Column(String, nullable=True, index=True) # Optional: if auth is added
    
    # Store raw metadata extracted from headers
    metadata_json = Column(JSON)
    # Store pre-calculated stats (min/max/mean) to avoid full table scans
    statistics_json = Column(JSON)
    
    # Relationships
    standardized_data = relationship("StandardizedData", back_populates="dataset", cascade="all, delete-orphan")
    mappings = relationship("MetadataMapping", back_populates="dataset", cascade="all, delete-orphan")

class StandardizedData(Base):
    """
    Unified Astronomical Observation Table (The 'Golden Record')
    Stores every object from every dataset in a single schema.
    """
    __tablename__ = "standardized_data"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    
    # Traceability
    original_id = Column(String, nullable=True) # ID in original file (if exists) or row index
    
    # 1. COORDINATES (ICRS Frame - J2000)
    # Most critical for astronomy. Index these heavily.
    ra = Column(Float, index=True)   # Right Ascension (0-360 deg)
    dec = Column(Float, index=True)  # Declination (-90 to +90 deg)
    
    # 2. PHOTOMETRY (Standardized Flux/Mag)
    brightness = Column(Float, nullable=True) 
    brightness_error = Column(Float, nullable=True)
    brightness_unit = Column(String, nullable=True) # e.g., 'Jy', 'mag', 'count/s'
    bandpass = Column(String, nullable=True) # e.g., 'V', 'K', 'u', 'microns'
    
    # 3. PHYSICAL PROPERTIES
    temperature = Column(Float, nullable=True) # Kelvin
    redshift = Column(Float, nullable=True) # z
    velocity = Column(Float, nullable=True) # km/s
    
    # 4. CLASSIFICATION
    object_type = Column(String, nullable=True) # e.g., 'STAR', 'GALAXY', 'QSO'
    
    # Relationship
    dataset = relationship("Dataset", back_populates="standardized_data")
    annotations = relationship("Annotation", back_populates="data_object")

class MetadataMapping(Base):
    """
    Tracks how original columns were mapped to standard ones.
    Auditable history of the standardization process.
    """
    __tablename__ = "metadata_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    
    original_column = Column(String)
    standard_column = Column(String)
    confidence_score = Column(Integer) # 0-100
    mapping_method = Column(String) # 'exact', 'fuzzy', 'manual_override'
    
    dataset = relationship("Dataset", back_populates="mappings")

class Annotation(Base):
    """
    User collaborative layer. Flags, comments, and tags on specific data points.
    """
    __tablename__ = "annotations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Polymorphic-ish association (can point to dataset or specific object)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True) 
    data_object_id = Column(Integer, ForeignKey("standardized_data.id"), nullable=True)
    
    user_id = Column(String, index=True) # User who created it
    flag_type = Column(String) # 'anomaly', 'quality_issue', 'interesting', 'comment'
    comment = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    data_object = relationship("StandardizedData", back_populates="annotations")

class AnalysisSession(Base):
    """
    Real-time collaboration state.
    """
    __tablename__ = "analysis_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Which users are currently active?
    active_users_json = Column(JSON) # List of user_ids
    
    # Current UI state (cam position, filters)
    view_state_json = Column(JSON)
