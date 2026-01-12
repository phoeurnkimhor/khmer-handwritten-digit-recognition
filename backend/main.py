from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import predict

app = FastAPI(
    title="Khmer Digit Recognition API",
    description="API for Khmer digit recognition using DeepGRU model",
    version="1.0.0"
)

app.include_router(predict.router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "API for Predict Khmer Digits",
        "endpoints": {
            "predict": "/predict",
            "docs": "/docs",
            "health": "/health",
        }
    }

@app.get("/")
async def health_check():
    return {"status": "ok"}