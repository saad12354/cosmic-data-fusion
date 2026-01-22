from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
import parsers.fits_parser as fits_parser
import parsers.csv_parser as csv_parser
import parsers.hdf5_parser as hdf5_parser
from report_generator import research_report_generator
from standardizer import ColumnStandardizer
from ai_engine import AnomalyDetector
from predictor import DataCompleter
from quality_assurance import QualityScorer
import pandas as pd
from typing import List
from database import engine, get_db
import models
from sqlalchemy.orm import Session
from fastapi import Depends
import socketio
from socket_manager import sio
from chat_engine import ChatEngine
from pydantic import BaseModel

# Initialize Chat Engine
chat_engine = ChatEngine()

class ChatRequest(BaseModel):
    message: str

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="COSMIC Data Fusion API",
    description="Unified Astronomical Data Processing Platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "COSMIC Data Fusion Backend is running", "status": "online"}

@app.post("/chat")
async def chat(request: ChatRequest):
    response = await chat_engine.generate_response(request.message)
    return {"response": response}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        
        # Save file locally
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Determine file type and parse
        result = {}
        if file.filename.endswith('.fits'):
            result = fits_parser.parse_fits(file_path)
        elif file.filename.endswith('.csv'):
            result = csv_parser.parse_csv(file_path)
        elif file.filename.endswith('.h5') or file.filename.endswith('.hdf5'):
            result = hdf5_parser.parse_hdf5(file_path)
        else:
            return JSONResponse(
                status_code=400, 
                content={"message": "Unsupported file format. Please upload FITS, CSV, or HDF5."}
            )
            
        # Run Standardization Engine
        standardizer = ColumnStandardizer()
        
        # Extract column names based on format
        columns_to_process = []
        if result.get("format") == "CSV" and "metadata" in result and "columns" in result["metadata"]:
             columns_to_process = result["metadata"]["columns"]
        elif result.get("format") == "FITS":
             # For FITS, check if it's a table with columns
             for hdu in result.get("hdus", []):
                 if hdu.get("is_table") and hdu.get("columns"):
                     columns_to_process = [c["name"] for c in hdu["columns"]]
                     break
                     
        standardization_result = {}
        if columns_to_process:
             standardization_result = standardizer.standardize(columns_to_process)
             result["standardization"] = standardization_result

        # Run AI Anomaly Detection (on preview data for MVP speed)
        ai_result = {}
        if "preview" in result and len(result["preview"]) > 10:
             detector = AnomalyDetector()
             ai_result = detector.analyze(result["preview"])
             result["ai_analysis"] = ai_result

        # Run Predictive Completion (if gaps exist)
        completer = DataCompleter()
        # Check preview for now (fastest), ideally check full dataset
        if "preview" in result:
             completion_result = completer.analyze_and_predict(result["preview"])
             if completion_result["has_missing"]:
                 result["predictions"] = completion_result

        # Run Data Quality Assurance
        if "preview" in result:
             df_proxy = pd.DataFrame(result["preview"])
             scorer = QualityScorer()
             quality_report = scorer.analyze(df_proxy, result.get("metadata", {}), ai_result)
             result["quality_report"] = quality_report
             
             # PROACTIVE: Inject AI labels into preview for frontend display
             anomalies = ai_result.get("anomalies", [])
             for row in result["preview"]:
                 if row.get("id") in anomalies:
                     row["status"] = "anomaly"
                 elif "status" not in row:
                     row["status"] = "valid"

        # PROACTIVE: Save to DB
        db_dataset = models.Dataset(
            filename=file.filename,
            format=result.get("format"),
            file_path=file_path,
            metadata_json=result.get("metadata"),
            statistics_json=result.get("statistics")
        )
        db.add(db_dataset)
        db.commit()
        db.refresh(db_dataset)
        
        # PROACTIVE: Save Metadata Mappings
        if "standardization" in result and "log" in result["standardization"]:
            for log_entry in result["standardization"]["log"]:
                db_mapping = models.MetadataMapping(
                    dataset_id=db_dataset.id,
                    original_column=log_entry["original_column"],
                    standard_column=log_entry["standardized_column"],
                    confidence_score=log_entry["confidence_score"],
                    mapping_method=log_entry["method"]
                )
                db.add(db_mapping)

        # PROACTIVE: Save Standardized Data (rows)
        # We use the 'preview' data as a proxy for the simplified table rows for this MVP
        if "preview" in result:
             for item in result["preview"]:
                 # Map preview keys to DB columns
                 # Preview has x(RA), y(Dec), value(Brightness)
                     # Apply standardization to preview item for consistent frontend display
                     # and to find the temperature column
                     
                     # Helper to find value by standard name
                     def get_val_by_standard(standard_key, default=None):
                         # 1. Check if key exists directly (already standardized)
                         if standard_key in item:
                             return item[standard_key]
                         
                         # 2. Check via mapping
                         if "standardization" in result and "mapping" in result["standardization"]:
                             for orig, std in result["standardization"]["mapping"].items():
                                 if std == standard_key and orig in item:
                                     return item[orig]
                         return default

                     db_obj = models.StandardizedData(
                         dataset_id=db_dataset.id,
                         original_id=str(item.get("id")),
                         ra=item.get("x"),   # Assuming preview mapping logic handled RA->x
                         dec=item.get("y"),  # Assuming preview mapping logic handled Dec->y
                         brightness=item.get("value"),
                         # Captured Standardized Fields
                         temperature=get_val_by_standard("temperature"),
                         velocity=get_val_by_standard("velocity"),
                         redshift=get_val_by_standard("redshift"),
                         
                         # Set defaults or N/A for others for now
                         brightness_unit=result.get("metadata", {}).get("BUNIT", "unknown"),
                         # PROACTIVE: Store AI flags if detected
                         object_type="ANOMALY" if "ai_analysis" in result and item.get("id") in result["ai_analysis"].get("anomalies", []) else None
                     )
                     
                     # Update preview item keys for frontend display (Optional but recommended)
                     if "standardization" in result and "mapping" in result["standardization"]:
                         # Create a copy of original keys to avoid modifying dict during iteration
                         original_keys = list(item.keys())
                         for orig_key in original_keys:
                             # Find if this original key has a standardized mapping
                             for log_entry in result["standardization"]["log"]:
                                 if log_entry["original_column"] == orig_key:
                                     standard_key = log_entry["standardized_column"]
                                     if standard_key != orig_key: # Only rename if different
                                         item[standard_key] = item.pop(orig_key)
                                     break # Found mapping for this original key, move to next
                     
                     db.add(db_obj)
        
        db.commit()
        
        # Add DB ID to result
        result["id"] = db_dataset.id

        # --- PROACTIVE: GENERATE DEMO ANNOTATIONS ---
        # Pick 3 random points to flag (if more than 10)
        if len(result.get("preview", [])) > 10:
            import random
            sample_indices = random.sample(range(len(result["preview"])), 3)
            demo_flags = [
                ('verified', "Signal confirmed by multiple sensors. Looks solid."),
                ('suspicious', "Unusual peak here. Possibly a cosmic ray strike?"),
                ('quality_issue', "Sensor calibration error detected during this timestamp.")
            ]
            for idx, (ftype, comment) in zip(sample_indices, demo_flags):
                data_point = result["preview"][idx]
                # Find standard_data ID
                data_row = db.query(models.StandardizedData).filter(
                    models.StandardizedData.dataset_id == db_dataset.id,
                    models.StandardizedData.original_id == str(data_point["id"])
                ).first()
                if data_row:
                    db_ann = models.Annotation(
                        dataset_id=db_dataset.id,
                        data_object_id=data_row.id,
                        user_id="SystemAI",
                        flag_type=ftype,
                        comment=comment
                    )
                    db.add(db_ann)
            db.commit()

        return result
        
    except Exception as e:
        # In a real app, log the error
        raise HTTPException(status_code=500, detail=str(e))

# --- ANNOTATIONS & COLLABORATION ---

@app.get("/datasets/{dataset_id}/annotations")
async def get_annotations(dataset_id: int, db: Session = Depends(get_db)):
    annotations = db.query(models.Annotation).filter(models.Annotation.dataset_id == dataset_id).all()
    return annotations

@app.post("/annotations")
async def create_annotation(
    dataset_id: int,
    data_object_id: str, # original_id or id
    user_id: str,
    flag_type: str,
    comment: str,
    db: Session = Depends(get_db)
):
    # Try to find the actual DB object if it's a numeric ID, otherwise use original_id
    # For MVP we'll just store the data_object_id as a string in the comment or a dedicated tag if needed
    # but the model has a data_object_id which is a ForeignKey.
    # Let's check if we can resolve standard_data.id
    
    # Using a simpler approach for the hackathon: store mapping in metadata if needed
    # but let's try to be accurate to the models.py
    
    # Try to find the standardized_data row
    data_row = db.query(models.StandardizedData).filter(
        models.StandardizedData.dataset_id == dataset_id,
        models.StandardizedData.original_id == data_object_id
    ).first()

    db_annotation = models.Annotation(
        dataset_id=dataset_id,
        data_object_id=data_row.id if data_row else None,
        user_id=user_id,
        flag_type=flag_type,
        comment=comment
    )
    db.add(db_annotation)
    db.commit()
    db.refresh(db_annotation)
    
    # Notify other users in the session if needed (via socket.io)
    # sio.emit('new_annotation', {"dataset_id": dataset_id, "id": db_annotation.id})
    
    return db_annotation

@app.get("/quality-feed")
async def get_quality_feed(limit: int = 10, db: Session = Depends(get_db)):
    """ Returns recent annotations across all datasets for a global activity feed. """
    results = db.query(
        models.Annotation, 
        models.Dataset.filename
    ).join(models.Dataset, models.Annotation.dataset_id == models.Dataset.id)\
     .order_by(models.Annotation.timestamp.desc())\
     .limit(limit).all()
     
    feed = []
    for ann, filename in results:
        feed.append({
            "id": ann.id,
            "filename": filename,
            "user_id": ann.user_id,
            "flag_type": ann.flag_type,
            "comment": ann.comment,
            "timestamp": ann.timestamp
        })
    return feed

@app.get("/datasets/{dataset_id}/report")
async def generate_report(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    annotations = db.query(models.Annotation).filter(models.Annotation.dataset_id == dataset_id).all()
    # Convert SQLAlchemy objects to dicts for the generator
    annotation_dicts = [{"flag_type": a.flag_type, "comment": a.comment} for a in annotations]
    
    generator = research_report_generator()
    report = generator.generate(
        dataset_name=dataset.filename,
        format=dataset.format,
        metadata=dataset.metadata_json or {},
        statistics=dataset.statistics_json or {},
        annotations=annotation_dicts
    )
    return report

# Mount Socket.IO
# We must wrap the FastAPI app with the socketio ASGIApp
app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    # Important: Run 'app', which is now the socketio wrapper
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
