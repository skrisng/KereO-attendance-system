import os
import re
import json
import google.generativeai as genai
from django.conf import settings


def clean_base64(data):
    """Remove data URI prefix from base64 string"""
    return re.sub(r'^data:image/(png|jpeg|jpg|webp);base64,', '', data)


def recognize_face(target_image, known_users):
    """
    Facial recognition using Google Gemini AI
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt_parts = [
        "System: You are a high-security facial recognition engine. "
        "Compare the TARGET image against these REFERENCE students. "
        "Return JSON ONLY with format: "
        '{"isHuman": boolean, "match": boolean, "userId": string, "name": string, "confidence": number, "reasoning": string}'
    ]

    for user in known_users:
        prompt_parts.append(f"\nREF: {user['name']} (ID: {user['id']})")

    prompt_parts.append("\nNow analyze this TARGET image and identify if it matches any reference.")

    images = []
    for user in known_users:
        images.append({
            'mime_type': 'image/jpeg',
            'data': clean_base64(user.get('photoBase64', ''))
        })

    images.append({
        'mime_type': 'image/jpeg',
        'data': clean_base64(target_image)
    })

    try:
        response = model.generate_content([
            '\n'.join(prompt_parts),
            *[{'inline_data': img} for img in images]
        ])

        result_text = response.text.strip()
        result_text = re.sub(r'^```json\s*|\s*```$', '', result_text, flags=re.MULTILINE)

        result = json.loads(result_text)
        return result

    except Exception as e:
        print(f"Gemini Error: {e}")
        return {
            'match': False,
            'isHuman': True,
            'confidence': 0,
            'reasoning': f'System connection error: {str(e)}'
        }
