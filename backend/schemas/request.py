from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    coordinates: list[float] = Field(..., description="Flat list of coordinates from the drawing canvas")
    class config:
        schema_extra = {
            "example": {
                "coordinates": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
            }
        }

class PredictResponse(BaseModel):
    prediction: int = Field(..., description="Predicted class/digit from the model")