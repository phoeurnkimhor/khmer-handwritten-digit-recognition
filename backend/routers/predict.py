from fastapi import APIRouter
from schemas.request import PredictRequest, PredictResponse
from utils.extract import extract_coordinates
from utils.scale import scale_coordinates
from model.gru import DeepGRUModel
from model.load_gru import load_model
import torch

router = APIRouter(prefix="/predict", tags=["predict character"])

model = load_model('./best_gru_model.pth')

@router.post("/", response_model=PredictResponse)
def generate(req: PredictRequest):

    data = req.coordinates
    coordinates = extract_coordinates(data)
    scaled_coordinates = scale_coordinates(coordinates)
    tensor_data = torch.tensor(scaled_coordinates, dtype=torch.float32)
    tensor_data = tensor_data.unsqueeze(0)

    with torch.no_grad():
        output = model(tensor_data)
        prediction = torch.argmax(output, dim=1).cpu().numpy()

    response = PredictResponse(prediction=prediction)
    return response