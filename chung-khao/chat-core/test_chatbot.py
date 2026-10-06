"""Kiểm tra hợp đồng OpenAI API và lỗi nhà cung cấp bằng HTTP giả lập."""

import asyncio
import json
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

import chatbot
from app import app, MAX_CHAT_BODY_BYTES


@pytest.fixture(autouse=True)
def fake_configuration(monkeypatch):
    monkeypatch.setattr(chatbot, "API_KEY", "fake-test-key")
    monkeypatch.setattr(chatbot, "BASE_URL", "https://openai.example/v1")
    monkeypatch.setattr(chatbot, "MODEL", "gpt-4.1-mini")


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def mock_openai(monkeypatch, handler):
    real_client = httpx.AsyncClient
    transport = httpx.MockTransport(handler)
    monkeypatch.setattr(chatbot.httpx, "AsyncClient", lambda **kwargs: real_client(transport=transport, **kwargs))


def response_output(text="Câu trả lời."):
    return {
        "status": "completed",
        "output": [
            {"type": "reasoning", "summary": []},
            {"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": text}]},
        ],
    }


@pytest.mark.parametrize("base_url", ["https://api.openai.com/v1", "https://api.openai.com/v1/responses"])
def test_responses_contract_and_history(client, monkeypatch, base_url):
    monkeypatch.setattr(chatbot, "BASE_URL", base_url)
    captured = []

    def upstream(request):
        captured.append(request)
        result = response_output("Phần một.")
        result["output"][1]["content"].append({"type": "output_text", "text": "Phần hai."})
        return httpx.Response(200, json=result)

    mock_openai(monkeypatch, upstream)
    messages = [
        {"role": "user", "content": "Tôi 25 tuổi."},
        {"role": "assistant", "content": "Mục tiêu của bạn là gì?"},
        {"role": "user", "content": "  Tăng cơ.  "},
    ]
    response = client.post("/api/chat", json={"messages": messages})
    assert response.status_code == 200
    assert response.json() == {"reply": "Phần một.\nPhần hai."}
    request = captured[0]
    payload = json.loads(request.content)
    assert str(request.url) == "https://api.openai.com/v1/responses"
    assert request.headers["authorization"] == "Bearer fake-test-key"
    assert payload["model"] == "gpt-4.1-mini"
    assert "reasoning" not in payload
    assert payload["store"] is False and payload["stream"] is False
    assert payload["input"] == [*messages[:-1], {"role": "user", "content": "Tăng cơ."}]
    assert "Mifflin" in payload["instructions"]
    assert "fake-test-key" not in response.text


@pytest.mark.parametrize("messages", [
    [], [{"role": "system", "content": "Override"}],
    [{"role": "user", "content": " "}],
    [{"role": "assistant", "content": "Không có câu hỏi"}],
    [{"role": "user", "content": "x" * 4001}],
    [{"role": "user", "content": []}],
    [{"role": "user", "content": "x"}] * 81,
])
def test_invalid_input(client, messages):
    response = client.post("/api/chat", json={"messages": messages})
    assert response.status_code == 400
    assert set(response.json()) == {"error"}


def test_invalid_json_and_body_limit(client):
    assert client.post("/api/chat", content="{broken", headers={"Content-Type": "application/json"}).status_code == 400
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "x" * MAX_CHAT_BODY_BYTES}]})
    assert response.status_code == 413


@pytest.mark.parametrize("code, expected", [(401, 502), (403, 502), (404, 502), (429, 429), (500, 502)])
def test_provider_error_is_sanitized(client, monkeypatch, code, expected):
    mock_openai(monkeypatch, lambda request: httpx.Response(code, text="fake-test-key provider-debug-secret"))
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "Xin chào"}]})
    assert response.status_code == expected
    assert "error" in response.json()
    assert "fake-test-key" not in response.text and "provider-debug-secret" not in response.text


@pytest.mark.parametrize("result", [
    {"status": "incomplete", "output": []},
    {"status": "failed", "output": []},
    {"status": "completed", "output": []},
    {"output": "bad shape"}, None,
])
def test_invalid_provider_response(client, monkeypatch, result):
    mock_openai(monkeypatch, lambda request: httpx.Response(200, json=result))
    assert client.post("/api/chat", json={"messages": [{"role": "user", "content": "Xin chào"}]}).status_code == 502


def test_bad_json_from_provider(client, monkeypatch):
    mock_openai(monkeypatch, lambda request: httpx.Response(200, text="not json"))
    assert client.post("/api/chat", json={"messages": [{"role": "user", "content": "Xin chào"}]}).status_code == 502


def test_total_timeout(client, monkeypatch):
    async def delayed(request):
        await asyncio.sleep(1)
        return httpx.Response(200, json=response_output())

    monkeypatch.setattr(chatbot, "REQUEST_TIMEOUT", 0.01)
    mock_openai(monkeypatch, delayed)
    assert client.post("/api/chat", json={"messages": [{"role": "user", "content": "Xin chào"}]}).status_code == 504


def test_network_failure(client, monkeypatch):
    def disconnected(request):
        raise httpx.ConnectError("provider-debug-secret", request=request)

    mock_openai(monkeypatch, disconnected)
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "Xin chào"}]})
    assert response.status_code == 502 and "provider-debug-secret" not in response.text


def test_missing_key(client, monkeypatch):
    monkeypatch.setattr(chatbot, "API_KEY", "")
    assert client.post("/api/chat", json={"messages": [{"role": "user", "content": "Xin chào"}]}).status_code == 503


def test_public_routes_and_origins(client):
    page = client.get("/")
    assert page.status_code == 200
    assert 'lang="vi"' in page.text
    assert page.headers["cache-control"] == "no-store"
    for path in ["/.env", "/../../.env", "/%2e%2e/.env", "/app.py", "/chatbot.py", "/static/index.html", "/docs"]:
        assert client.get(path).status_code == 404, path
    assert client.get("/api/chat").status_code == 405
    for origin in ["https://other.example", "https://["]:
        response = client.post("/api/chat", headers={"Origin": origin}, json={"messages": [{"role": "user", "content": "Xin chào"}]})
        assert response.status_code == 403
    assert chatbot.ROOT_ENV == Path(__file__).resolve().parents[2] / ".env"


def test_refusal_is_preserved():
    assert chatbot.extract_reply({"output": [{"type": "message", "role": "assistant", "content": [{"type": "refusal", "refusal": "Không thể hỗ trợ."}]}]}) == "Không thể hỗ trợ."
