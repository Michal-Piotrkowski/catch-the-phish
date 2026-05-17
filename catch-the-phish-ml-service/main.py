import os
import asyncio
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

path_to_env_file = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=path_to_env_file)

model_id = os.getenv("MODEL_ID", "michal-piotrkowski/catch-the-phish-distilbert")
detector = pipeline("text-classification", model=model_id , tokenizer=model_id )
PHISHING_LABEL = detector.model.config.id2label.get(1, "LABEL_1")

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
    
    if not email_content.strip():
        return {"isPhishing": False, "confidence": 0.0}

    inference_result = await asyncio.to_thread(
        detector, 
        email_content, 
        truncation=True, 
        max_length=512
    )
    result = inference_result[0]
    threshold = 0.95
    phishing_prob = result['score']   

    if result['label'] == PHISHING_LABEL:
        is_phishing = phishing_prob >= threshold
    else:
        is_phishing = False

    return {
        "isPhishing": is_phishing,
        "confidence": round(phishing_prob, 4)
    }