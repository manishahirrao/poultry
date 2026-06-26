"""
PoultryPulse AI — Input Validator
File: apps/api/security/input_validator.py
Reference: TRD v1.0 §7.1
Validation schemas using Pydantic (analogous to Zod).
"""

from pydantic import BaseModel, Field, constr, validator
from typing import List, Optional

class PredictionRequest(BaseModel):
    mandi: str = Field(..., min_length=2, max_length=50)
    features: List[float] = Field(..., min_items=10, max_items=45)
    
    @validator('mandi')
    def validate_mandi(cls, v):
        allowed = ['gorakhpur', 'namakkal', 'hyderabad', 'pune'] # Expand as needed
        if v.lower() not in allowed:
            raise ValueError(f"Mandi {v} not supported")
        return v.lower()

class OtpRequestSchema(BaseModel):
    phone_number: str = Field(..., regex=r"^\+91\d{10}$")

class OtpVerifySchema(BaseModel):
    phone_number: str = Field(..., regex=r"^\+91\d{10}$")
    otp: str = Field(..., regex=r"^\d{6}$")
    fpjs_request_id: Optional[str] = None
