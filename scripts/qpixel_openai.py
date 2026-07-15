#!/usr/bin/env python3
"""Small, dependency-free OpenAI Images API client for the local QPixel service."""

import base64
import json
import os
import ssl
import subprocess
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def _ssl_context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except (ImportError, OSError):
        return ssl.create_default_context()


class OpenAIConfigError(Exception):
    pass


class OpenAIRequestError(Exception):
    pass


OPENAI_KEYCHAIN_SERVICE = "qpixel-openai-api-key"
HF_KEYCHAIN_SERVICE = "qpixel-hf-token"


def _friendly_error(detail, status):
    text = str(detail or "")
    lowered = text.lower()
    if "billing hard limit" in lowered or "insufficient_quota" in lowered or "quota" in lowered:
        return "OpenAI API 账户已达到消费上限，请在 API 控制台提高预算或充值后重试"
    if "invalid api key" in lowered or "incorrect api key" in lowered:
        return "OpenAI API Key 无效，请重新配置密钥"
    if "organization" in lowered and "verif" in lowered:
        return "OpenAI 账户需要完成组织验证后才能使用图片模型"
    return text or f"OpenAI 返回 HTTP {status}"


def _read_keychain_key(service):
    if os.name != "posix" or not os.path.exists("/usr/bin/security"):
        return ""
    try:
        result = subprocess.run(
            ["/usr/bin/security", "find-generic-password", "-s", service, "-w"],
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.SubprocessError):
        return ""
    return result.stdout.strip() if result.returncode == 0 else ""


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


SUBJECT_TRANSLATIONS = {
    "蝴蝶结": "a centered symmetrical ribbon bow",
    "小蝴蝶": "a small butterfly",
    "蝴蝶": "a butterfly",
    "小猪": "a small piglet",
    "猪": "a pig",
    "小猫": "a small kitten",
    "猫": "a cat",
    "小狗": "a small puppy",
    "狗": "a dog",
    "老虎": "a tiger",
    "兔子": "a rabbit",
    "小兔": "a small rabbit",
    "熊猫": "a panda",
    "小鸟": "a small bird",
    "鸟": "a bird",
    "花": "a flower",
    "蘑菇": "a mushroom",
}


def _subject_hint(prompt):
    for phrase, translation in sorted(SUBJECT_TRANSLATIONS.items(), key=lambda item: len(item[0]), reverse=True):
        if phrase in prompt:
            blocked = "butterfly" if phrase == "蝴蝶结" else "tiger, cat, dog, pig, beetle"
            return translation, f"Do not replace it with {blocked} or any other subject."
    return prompt, "Follow the requested subject exactly; do not substitute another animal or object."


def _composition_hint(prompt):
    hints = []
    if "左右对称" in prompt or "对称" in prompt:
        hints.append("perfect bilateral left-right symmetry, mirrored left and right halves")
    if "蓝黑" in prompt or "蓝黑色" in prompt:
        hints.append("a restricted navy blue, royal blue, and black palette with no pink, orange, green, or purple")
    if "居中" in prompt or "正面" in prompt:
        hints.append("front-facing, centered, isolated composition")
    if "蝴蝶结" in prompt:
        hints.append("two matching loops, two matching tails, and a small central knot")
    return "; ".join(hints)


def _negative_prompt(prompt):
    wrong_subjects = "butterfly" if "蝴蝶结" in prompt else "tiger, cat, dog, pig, beetle"
    return f"wrong subject, {wrong_subjects}, asymmetry, tilted view, extra loops, blur, gradients, anti-aliasing, noise, tiny details, watermark, text"


def _build_prompt(prompt, style, width, height, color_limit):
    style_text = {
        "cute": "可爱卡通像素画",
        "retro": "复古掌机游戏像素画",
        "pixel": "清晰现代像素画",
    }.get(style, "清晰现代像素画")
    subject, subject_guard = _subject_hint(prompt)
    composition = _composition_hint(prompt)
    return (
        f"Create a {style_text} for a fuse-bead and pixel-grid pattern. "
        f"The ONLY main subject must be {subject}. Original user request: {prompt}. {subject_guard} "
        f"{composition}. "
        f"Target composition is a {width} by {height} grid with at most {color_limit} dominant colors. "
        "Use a clean light background, strong continuous dark outlines, "
        "large flat solid color regions, intentional 1-pixel highlights and facial details, "
        "crisp block edges, and a centered full subject. Avoid gradients, blur, anti-aliasing, "
        "photorealistic texture, noise, tiny speckles, soft shadows, text, watermark, and broken outlines. "
        "The result must read clearly when downsampled to a fuse-bead grid."
    )


def _generate_openai(request):
    prompt, width, height, color_limit, style = validate_request(request)
    api_key = os.environ.get("OPENAI_API_KEY", "").strip() or _read_keychain_key(OPENAI_KEYCHAIN_SERVICE)
    if not api_key:
        raise OpenAIConfigError("未配置 OpenAI API Key，请先运行“配置OpenAI密钥.command”")
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
        with urlopen(request_obj, timeout=130, context=_ssl_context()) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        try:
            detail = json.loads(error.read().decode("utf-8")).get("error", {}).get("message", "")
        except Exception:
            detail = ""
        raise OpenAIRequestError(_friendly_error(detail, error.code)) from error
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
    return {"imageDataUrl": f"data:image/png;base64,{encoded}", "model": model, "provider": "openai"}


def _generate_huggingface(request):
    prompt, width, height, color_limit, style = validate_request(request)
    token = os.environ.get("HF_TOKEN", "").strip() or _read_keychain_key(HF_KEYCHAIN_SERVICE)
    if not token:
        raise OpenAIConfigError("未配置 Hugging Face Token，请先运行“配置HuggingFace令牌.command”")
    model = os.environ.get("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell").strip()
    image_width, image_height = (768, 512) if width > height * 1.18 else ((512, 768) if height > width * 1.18 else (512, 512))
    body = json.dumps({
        "inputs": _build_prompt(prompt, style, width, height, color_limit),
        "parameters": {
            "width": image_width,
            "height": image_height,
            "num_inference_steps": 4,
            "negative_prompt": _negative_prompt(prompt),
        },
    }).encode("utf-8")
    request_obj = Request(
        f"https://router.huggingface.co/hf-inference/models/{model}",
        data=body,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request_obj, timeout=180, context=_ssl_context()) as response:
            image_bytes = response.read()
            content_type = response.headers.get("Content-Type", "image/png").split(";", 1)[0]
    except HTTPError as error:
        try:
            detail = error.read().decode("utf-8", errors="replace")
        except Exception:
            detail = ""
        if "exceeded" in detail.lower() or "quota" in detail.lower() or error.code == 429:
            detail = "Hugging Face 免费额度或请求频率已用完，请稍后重试或更换 Token"
        raise OpenAIRequestError(detail or f"Hugging Face 返回 HTTP {error.code}") from error
    except (URLError, TimeoutError, OSError) as error:
        raise OpenAIRequestError("无法连接 Hugging Face，请检查网络或代理设置") from error
    if not image_bytes or not content_type.startswith("image/"):
        raise OpenAIRequestError("Hugging Face 未返回有效图片")
    encoded = base64.b64encode(image_bytes).decode("ascii")
    return {"imageDataUrl": f"data:{content_type};base64,{encoded}", "model": model, "provider": "huggingface"}


def generate_image(request):
    provider = os.environ.get("QPIXEL_AI_PROVIDER", "huggingface").strip().lower()
    return _generate_openai(request) if provider == "openai" else _generate_huggingface(request)
