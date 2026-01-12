from .gru import DeepGRUModel
import torch

def load_model(model_path, input_size=16, hidden_size=256, num_layers=4, output_size=10, dropout=0.3):
    model = DeepGRUModel(input_size, hidden_size, num_layers, output_size, dropout)
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    return model