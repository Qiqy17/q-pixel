#!/usr/bin/env python3
"""Small, dependency-free OpenAI Images API client for the local QPixel service."""

import base64
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class OpenAIConfigError(Exception):
    pass


class OpenAIRequestError(Exception):
    pass


def _number(value, fallback):
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def validate_request(request):
    if not isinstance(request, dict):
        raise ValueError("请求格式无效")
    prompt = str(request.get("prompt") or "").strip()
    if not prompt or len(prompt) > 1200:
        raise ValueError("主题描述不能为空且不能超过 1200 个字符")
    width = _number(request.get("width"), 48)
    height = _number(request.get("height"), 48)
    color_limit = _number(request.get("colorLimit"), 20)
    if not 16 <= width <= 128 or not 16 <= height <= 128:
        raise ValueError("网格宽高必须在 16 到 128 之间")
    if not 2 <= color_limit <= 64:
        raise ValueError("色号数量必须在 2 到 64 之间")
    return prompt, width, height, color_limit, str(request.get("style") or "pixel")


def _api_size(width, height):
    ratio = width / max(height, 1)
    if ratio > 1.18:
        return "1536x1024"
    if ratio < 0.85:
        return "1024x1536"
    return "1024x1024"


def _build_prompt(prompt, style, width, height, color_limit):
    style_text = {
        "cute": "可爱卡通像素画",
        "retro": "复古掌机游戏像素画",
        "pixel": "清晰现代像素画",
    }.get(style, "清晰现代像素画")
    return (
        f"Create a {style_text} for a fuse-bead and pixel-grid pattern. Subject: {prompt}. "
        f"Target composition is a {width} by {height} grid with at most {color_limit} dominant colors. "
        "Use a clean light or transparent-looking background, strong continuous dark outlines, "
        "large flat solid color regions, intentional 1-pixel highlights and facial details, "
        "crisp block edges, and a centered full subject. Avoid gradients, blur, anti-aliasing, "
        "photorealistic texture, noise, tiny speckles, soft shadows, text, watermark, and broken outlines. "
        "The result must read clearly when downsampled to a fuse-bead grid."
    )


def generate_image(request):
    prompt, width, height, color_limit, style = validate_request(request)
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise OpenAIConfigError("未配置 OpenAI API Key")
    base_url = os.environ.get("OPENAI_API_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-2").strip() or "gpt-image-2"
    body = json.dumps({
        "model": model,
        "prompt": _build_prompt(prompt, style, width, height, color_limit),
        "size": _api_size(width, height),
        "quality": os.environ.get("OPENAI_IMAGE_QUALITY", "medium"),
        "output_format": "png",
    }).encode("utf-8")
    request_obj = Request(
        f"{base_url}/images/generations",
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request_obj, timeout=130) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        try:
            detail = json.loads(error.read().decode("utf-8")).get("error", {}).get("message", "")
        except Exception:
            detail = ""
        raise OpenAIRequestError(detail or f"OpenAI 返回 HTTP {error.code}") from error
    except (URLError, TimeoutError, OSError) as error:
        raise OpenAIRequestError("无法连接 OpenAI，请检查网络或代理设置") from error
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise OpenAIRequestError("OpenAI 返回内容无法解析") from error

    items = result.get("data") if isinstance(result, dict) else None
    encoded = items[0].get("b64_json") if items and isinstance(items[0], dict) else ""
    if not encoded:
        raise OpenAIRequestError("OpenAI 未返回图片数据")
    try:
        base64.b64decode(encoded, validate=True)
    except (ValueError, TypeError) as error:
        raise OpenAIRequestError("OpenAI 返回的图片数据无效") from error
    return {"imageDataUrl": f"data:image/png;base64,{encoded}", "model": model}
