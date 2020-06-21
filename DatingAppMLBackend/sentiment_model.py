from transformers import AlbertConfig, AlbertModel, AlbertTokenizer
import torch
import torch.nn as nn

PRE_TRAINED_MODEL = 'albert-base-v2'
tokenizer = AlbertTokenizer.from_pretrained(PRE_TRAINED_MODEL)

NUM_OUTPUT_NEURONS = 3
ALBERT_DROPOUT = 0

class ALBERTSentimentModel(nn.Module):

  def __init__(self):
    super(ALBERTSentimentModel, self).__init__()

    self.albert = AlbertModel.from_pretrained(PRE_TRAINED_MODEL)
    self.dropout = nn.Dropout(p=ALBERT_DROPOUT)
    self.out_layer = nn.Linear(self.albert.config.hidden_size, NUM_OUTPUT_NEURONS)

  def forward(self, input_ids, attention_mask):

    _, pooled_output = self.albert(
      input_ids=input_ids,
      attention_mask=attention_mask
    )

    dropout_output = self.dropout(pooled_output)

    return self.out_layer(dropout_output)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print('Using device:', device)
if device.type == 'cuda':
  torch.cuda.empty_cache()
  print(torch.cuda.get_device_name(0))

model = ALBERTSentimentModel()
model = model.to(device)
model.load_state_dict(torch.load('sentiment_model.bin', map_location=torch.device(device)))
model.eval()

# Runs each sentence through the model. Returns a mean score for how positive, and
# how negative the text is deemed to be by the model
def get_sentiment(sentence_list):
    negative = 0
    positive = 0

    for sentence in sentence_list:
        print('sentence:')
        print(sentence)
        encoding = tokenizer.encode_plus(sentence,
                                        add_special_tokens=True,
                                        max_length=100,
                                        return_token_type_ids=False,
                                        pad_to_max_length=True,
                                        return_attention_mask=True,
                                        return_tensors='pt')

        input_ids = encoding['input_ids'].to(device)
        attention_mask = encoding['attention_mask'].to(device)

        model_outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        temp_sum = model_outputs[0][0].abs() + model_outputs[0][2].abs()
        temp_negative = model_outputs[0][0].abs() / temp_sum
        temp_positive = model_outputs[0][2].abs() / temp_sum

        negative += temp_negative
        positive += temp_positive

    num_sentences = len(sentence_list)
    if num_sentences <= 0:
        return 0.5, 0.5
    return (positive / num_sentences).item(), (negative / num_sentences).item()
