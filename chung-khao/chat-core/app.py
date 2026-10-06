"""Máy chủ API và trang HTML thử chatbot."""

import os
import base64
import json
import re
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from starlette.exceptions import HTTPException as StarletteHTTPException

import chatbot

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
HTML_FILE = Path(__file__).resolve().parent / "static" / "index.html"
MAX_BODY_BYTES = 128 * 1024
from onboarding import router as onboarding_router
from plan_actions import PlanContext, PlanUpdate, PLAN_INSTRUCTIONS, VISION_INSTRUCTIONS, extract_plan_updates

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.include_router(onboarding_router)
HTML_FILE = Path(__file__).resolve().parent / "static" / "index.html"
MAX_BODY_BYTES = 128 * 1024
MAX_CHAT_BODY_BYTES = 2 * 1024 * 1024


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=20000)
    image: str | None = Field(default=None, max_length=1500000)

    @field_validator("image")
    @classmethod
    def validate_image(cls, value):
        if value is None:
            return value
        match = re.fullmatch(r"data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)", value)
        if not match:
            raise ValueError("Ảnh phải là JPEG, PNG hoặc WebP.")
        try:
            decoded = base64.b64decode(match.group(2), validate=True)
        except ValueError:
            raise ValueError("Ảnh không hợp lệ.") from None
        signatures = {"jpeg": decoded.startswith(b"\xff\xd8\xff"), "png": decoded.startswith(b"\x89PNG\r\n\x1a\n"), "webp": decoded.startswith(b"RIFF") and decoded[8:12] == b"WEBP"}
        if not signatures[match.group(1)] or len(decoded) > 1024 * 1024:
            raise ValueError("Ảnh không hợp lệ hoặc quá lớn.")
        return value

    @field_validator("content")
    @classmethod
    def strip_content(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Tin nhắn không được trống.")
        return value.strip()

    @model_validator(mode="after")
    def limit_user_message(self):
        if self.role == "user" and len(self.content) > 4000:
            raise ValueError("Tin nhắn của người dùng quá dài.")
        return self


class ProfileAnswers(BaseModel):
    """Các trường lấy từ biểu mẫu; không nhận trường tùy ý từ trình duyệt."""

    model_config = ConfigDict(extra="forbid")

    age: str | None = Field(default=None, max_length=40)
    sex: str | None = Field(default=None, max_length=80)
    height: str | None = Field(default=None, max_length=40)
    weight: str | None = Field(default=None, max_length=40)
    goal: str | None = Field(default=None, max_length=120)
    training_type: str | None = Field(default=None, max_length=120)
    intensity: str | None = Field(default=None, max_length=80)
    sessions: str | None = Field(default=None, max_length=80)
    schedule: str | None = Field(default=None, max_length=500)
    additional: str | None = Field(default=None, max_length=500)

    @field_validator("age", "sex", "height", "weight", "goal", "training_type", "intensity", "sessions", "schedule", "additional")
    @classmethod
    def clean_answer(cls, value: str | None) -> str | None:
        return value.strip() if value else None

    @model_validator(mode="after")
    def at_least_one_answer(self):
        if not any(getattr(self, name) for name in type(self).model_fields):
            raise ValueError("Biểu mẫu chưa có thông tin.")
        return self


class ChatRequest(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=80)
    profile_answers: ProfileAnswers | None = None
    plan_context: PlanContext | None = None

    @model_validator(mode="after")
    def last_message_is_user(self):
        if self.messages[-1].role != "user":
            raise ValueError("Tin nhắn cuối cần là câu hỏi của bạn.")
        if any(message.image for message in self.messages[:-1]):
            raise ValueError("Chỉ gửi ảnh của tin nhắn mới nhất.")
        return self


class ChatResponse(BaseModel):
    reply: str
    plan_updates: list[PlanUpdate] | None = None
    profile_request: list[Literal["age", "sex", "height", "weight", "goal", "training_type", "intensity", "sessions", "schedule"]] | None = None


@app.middleware("http")
async def response_headers_and_body_limit(request: Request, call_next):
    if request.method == "POST" and request.url.path == "/api/chat":
        body = await request.body()
        if len(body) > MAX_BODY_BYTES:
            return JSONResponse(status_code=413, content={"error": "Hội thoại quá dài. Bạn hãy bắt đầu lại."}, headers={"Cache-Control": "no-store"})
    if request.method == "POST" and request.url.path in {"/api/chat", "/api/onboarding"}:
        body = await request.body()
        limit = MAX_CHAT_BODY_BYTES if request.url.path == "/api/chat" else MAX_BODY_BYTES
        if len(body) > limit:
            return JSONResponse(status_code=413, content={"error": "Hội thoại hoặc ảnh quá lớn. Hãy giảm kích thước ảnh hoặc rút gọn nội dung."}, headers={"Cache-Control": "no-store"})
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.exception_handler(RequestValidationError)
async def invalid_request(request: Request, error: RequestValidationError):
    return JSONResponse(status_code=400, content={"error": "Tin nhắn không hợp lệ. Nhập nội dung tối đa 4.000 ký tự, hoặc bắt đầu lại nếu hội thoại quá dài."})


@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, error: StarletteHTTPException):
    defaults = {404: "Không tìm thấy trang.", 405: "Phương thức không được hỗ trợ."}
    message = defaults.get(error.status_code, error.detail if isinstance(error.detail, str) else "Yêu cầu không hợp lệ.")
    return JSONResponse(status_code=error.status_code, content={"error": message}, headers=error.headers)


@app.get("/", response_class=FileResponse)
@app.get("/index.html", response_class=FileResponse)
async def index():
    return FileResponse(HTML_FILE, media_type="text/html")


@app.post("/api/chat", response_model=ChatResponse, response_model_exclude_none=True)
async def chat(payload: ChatRequest, request: Request):
    origin = request.headers.get("origin")
    if origin:
        try:
            origin_host = urlsplit(origin).netloc
        except ValueError:
            raise HTTPException(403, "Nguồn yêu cầu không hợp lệ.") from None
        if origin_host != request.headers.get("host"):
            raise HTTPException(403, "Nguồn yêu cầu không hợp lệ.")
    try:
        messages = [message.model_dump() for message in payload.messages]
        messages = [message.model_dump(exclude_none=True) for message in payload.messages]
        profile_completion = payload.profile_answers is not None
        if payload.profile_answers:
            labels = {
                "age": "Tuổi",
                "sex": "Giới tính/nhóm công thức sinh lý",
                "height": "Chiều cao (cm)",
                "weight": "Cân nặng (kg)",
                "goal": "Mục tiêu",
                "training_type": "Hình thức tập",
                "intensity": "Cường độ tự đánh giá",
                "sessions": "Số buổi mỗi tuần",
                "schedule": "Lịch tập",
                "additional": "Ghi chú thêm",
            }
            answers = payload.profile_answers.model_dump(exclude_none=True)
            details = "\n".join(f"- {labels[key]}: {value}" for key, value in answers.items())
            messages[-1]["content"] = "Thông tin bổ sung từ biểu mẫu (người dùng tự khai):\n" + details
        reply = await chatbot.ask_assistant(messages, profile_completion=profile_completion)
        reply, requested_fields = chatbot.extract_profile_request(reply)
        instructions = chatbot.INSTRUCTIONS.replace("Phiên bản này chỉ nhận văn bản, chưa phân tích ảnh.", "") + VISION_INSTRUCTIONS
        if profile_completion:
            instructions += chatbot.PROFILE_COMPLETION_INSTRUCTIONS
        if payload.plan_context:
            instructions += PLAN_INSTRUCTIONS + "\nDữ liệu kế hoạch hiện tại (JSON):\n" + json.dumps(payload.plan_context.model_dump(mode="json", exclude_none=True), ensure_ascii=False)
        for message in messages:
            image = message.pop("image", None)
            if image:
                message["content"] = [{"type": "input_text", "text": message["content"]}, {"type": "input_image", "image_url": image}]
        reply = await chatbot.ask_assistant(messages, profile_completion=profile_completion, instructions=instructions)
        reply, requested_fields = chatbot.extract_profile_request(reply)
        reply, updates = extract_plan_updates(reply, payload.plan_context)
    except chatbot.ChatbotError as error:
        return JSONResponse(status_code=error.status_code, content={"error": error.message})
    except Exception:
        # Không đưa traceback, nội dung người dùng hoặc cấu hình ra ngoài.
        return JSONResponse(status_code=502, content={"error": "Dịch vụ chưa thể trả lời. Bạn hãy thử lại."})
    if profile_completion:
        requested_fields = []
    return ChatResponse(reply=reply, profile_request=requested_fields or None)
    return ChatResponse(reply=reply, profile_request=requested_fields or None, plan_updates=updates or None)


if __name__ == "__main__":
    import uvicorn

    try:
        port = int(os.getenv("CHAT_PORT", "3000"))
        if not 1 <= port <= 65535:
            raise ValueError
    except ValueError:
        raise SystemExit("CHAT_PORT phải là số nguyên từ 1 đến 65535.") from None
    print(f"http://localhost:{port}", flush=True)
    uvicorn.run(app, host=os.getenv("CHAT_HOST", "127.0.0.1"), port=port, log_level="warning", access_log=False)
