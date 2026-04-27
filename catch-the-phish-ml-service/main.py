import os
from dotenv import load_dotenv
from fastapi import FastAPI
from faststream.rabbit.fastapi import RabbitRouter
from pydantic import BaseModel

load_dotenv()

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

router = RabbitRouter(RABBIT_URL)

app = FastAPI()
app.include_router(router)


class DataPayload(BaseModel):
    content: str


class NestJSRequest(BaseModel):
    data: DataPayload


@app.get("/health")
def health_check():
    return {"status": "online"}


@router.subscriber("predict")
async def process_email_ai(request: NestJSRequest):
    print(request.data.content)

    return {
        "is_phishing": True,
        "confidence": 0.96
    }