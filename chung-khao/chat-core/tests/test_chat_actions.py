import json
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from app import app
from chatbot import ChatbotError
from plan_actions import PlanContext, extract_plan_updates

PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRksAAAAASUVORK5CYII='


def context():
    return {
        'today': '2026-10-07', 'selected_date': '2026-10-06',
        'days': [{'date': f'2026-10-{day:02}', 'label': 'Ngày trong tuần', 'is_rest_day': False, 'nutrition': False, 'training': False} for day in range(5, 12)],
    }


def reply(updates):
    return 'Mình ghi nhận theo lời bạn.\n[[PLAN_UPDATES]]\n' + json.dumps(updates, ensure_ascii=False) + '\n[[/PLAN_UPDATES]]'


class ChatActionsTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_image_becomes_provider_vision_input_and_notes_are_returned(self):
        update = {'date': '2026-10-07', 'category': 'nutrition', 'note': 'Cơm và ức gà; người dùng xác nhận đã ăn.'}
        mock = AsyncMock(return_value=reply([update]))
        with patch('chatbot.ask_assistant', mock):
            response = self.client.post('/api/chat', json={'messages': [{'role': 'user', 'content': 'Mình đã ăn bữa này, thêm ghi chú thôi.', 'image': PNG}], 'plan_context': context()})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['plan_updates'], [update])
        self.assertNotIn('PLAN_UPDATES', response.json()['reply'])
        messages = mock.call_args.args[0]
        self.assertEqual(messages[-1]['content'][1], {'type': 'input_image', 'image_url': PNG})
        self.assertIn('selected_date', mock.call_args.kwargs['instructions'])
        self.assertIn('Ước lượng từ ảnh', mock.call_args.kwargs['instructions'])

    def test_plain_chat_remains_compatible(self):
        with patch('chatbot.ask_assistant', AsyncMock(return_value='Phản hồi văn bản.')):
            response = self.client.post('/api/chat', json={'messages': [{'role': 'user', 'content': 'Chào Vi'}]})
        self.assertEqual(response.json(), {'reply': 'Phản hồi văn bản.'})

    def test_malformed_future_and_unknown_updates_are_rejected(self):
        invalid = [
            [{'date': '2026-10-08', 'category': 'training', 'checked': True}],
            [{'date': '2026-10-04', 'category': 'nutrition', 'checked': True}],
            [{'date': '2026-10-07', 'category': 'delete_profile', 'checked': True}],
            [{'date': '2026-10-07', 'category': 'training', 'checked': 'true'}],
            [{'date': '2026-10-07', 'category': 'training', 'note': 'x' * 241}],
        ]
        for updates in invalid:
            with self.subTest(updates=updates), self.assertRaises(ChatbotError):
                extract_plan_updates(reply(updates), PlanContext.model_validate(context()))
        with self.assertRaises(ChatbotError):
            extract_plan_updates('[[PLAN_UPDATES]]not JSON[[/PLAN_UPDATES]]', PlanContext.model_validate(context()))

    def test_bad_images_and_historical_images_do_not_reach_provider(self):
        for image in ['https://example.org/photo.png', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,YmFk']:
            with patch('chatbot.ask_assistant', AsyncMock()) as mock:
                response = self.client.post('/api/chat', json={'messages': [{'role': 'user', 'content': 'Ảnh', 'image': image}]})
                self.assertEqual(response.status_code, 400)
                mock.assert_not_called()
        response = self.client.post('/api/chat', json={'messages': [{'role': 'user', 'content': 'Ảnh cũ', 'image': PNG}, {'role': 'user', 'content': 'Câu hỏi mới'}]})
        self.assertEqual(response.status_code, 400)

    def test_provider_failure_is_reported_without_actions(self):
        with patch('chatbot.ask_assistant', AsyncMock(side_effect=ChatbotError(504, 'Chờ phản hồi quá lâu.'))):
            response = self.client.post('/api/chat', json={'messages': [{'role': 'user', 'content': 'Tick hôm nay'}], 'plan_context': context()})
        self.assertEqual(response.status_code, 504)
        self.assertNotIn('plan_updates', response.json())


if __name__ == '__main__':
    unittest.main()
