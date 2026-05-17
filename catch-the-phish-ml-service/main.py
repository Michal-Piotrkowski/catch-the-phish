import os
from dotenv import load_dotenv
from fastapi import FastAPI
from faststream.rabbit.fastapi import RabbitRouter
from faststream.rabbit import RabbitQueue
from pydantic import BaseModel
from transformers import pipeline

load_dotenv()

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")

router = RabbitRouter(RABBIT_URL)

app = FastAPI()
app.include_router(router)

model_path = "./fine_tuned_model"
detector = pipeline("text-classification", model=model_path, tokenizer=model_path)

class DataPayload(BaseModel):
    content: str


class NestJSRequest(BaseModel):
    data: DataPayload


@app.get("/health")
def health_check():
    return {"status": "online"}


@router.subscriber(RabbitQueue("predict", durable=True))
async def process_email_ai(request: NestJSRequest):
    email_content = request.data.content
    words = email_content.split()
    
    if not words:
        return {"isPhishing": False, "confidence": 0.0}
        
    chunk_size = 350
    chunks = [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    
    is_phishing = False
    max_phishing_confidence = 0.0
    max_safe_confidence = 0.0

    for chunk in chunks:
        result = detector(chunk, truncation=True, max_length=512)[0]
        
        if result['label'] == 'LABEL_1':
            is_phishing = True
            max_phishing_confidence = max(max_phishing_confidence, result['score'])
        else:
            max_safe_confidence = max(max_safe_confidence, result['score'])

    final_confidence = max_phishing_confidence if is_phishing else max_safe_confidence

    return {
        "isPhishing": is_phishing,
        "confidence": round(final_confidence, 4)
    }