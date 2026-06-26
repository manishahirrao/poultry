from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from auth.license import router as license_router
from auth.sales import router as sales_router

app = FastAPI(title="PoultryPulse Minimal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(license_router, prefix="/api/v1")
app.include_router(sales_router, prefix="/api/v1")
