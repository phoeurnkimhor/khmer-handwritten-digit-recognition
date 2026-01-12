import torch
import torch.nn as nn

class Attention(nn.Module):
    def __init__(self, hidden_size):
        super().__init__()
        self.attn = nn.Linear(hidden_size, 1)

    def forward(self, gru_out):
        weights = torch.softmax(self.attn(gru_out), dim=1)
        # Weighted sum of GRU outputs
        return (gru_out * weights).sum(dim=1)

class DeepGRUModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size, dropout):
        super().__init__()
        self.gru = nn.GRU(input_size, hidden_size, num_layers, batch_first=True,
                          dropout=dropout, bidirectional=True)
        self.attention = Attention(hidden_size * 2)  # due to bidirectional

        self.fc1 = nn.Linear(hidden_size * 2, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size // 2)
        self.fc3 = nn.Linear(hidden_size // 2, output_size)

        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.batch_norm = nn.BatchNorm1d(hidden_size)
        self.layer_norm = nn.LayerNorm(hidden_size * 2)

    def forward(self, x):
        gru_out, _ = self.gru(x)
        attention_out = self.attention(gru_out)
        x = self.layer_norm(attention_out)

        x = self.dropout(x)
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        return self.fc3(x)