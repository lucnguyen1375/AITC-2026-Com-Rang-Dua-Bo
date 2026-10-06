import json
import unittest
from unittest.mock import AsyncMock, patch
import httpx
from app import app
from onboarding import validate_turn, CollectedProfile
import chatbot

def result(profile=None, questions=None):
 return json.dumps({'reply':'Vi hỏi theo thông tin bạn chia sẻ.','profile':profile or {},'questions':questions if questions is not None else [{'field':'age','label':'Bạn bao nhiêu tuổi?','placeholder':'Nhập số tuổi','input_type':'number','options':[]}],'blocked':False},ensure_ascii=False)
PROFILE={'age':25,'weightKg':65,'heightCm':170,'sex':'unspecified','goal':'gainMuscle','trainingType':'Tập sức mạnh','trainingIntensity':'Vừa','weekSchedule':[{'weekday':day,'isRestDay':day not in [1,3,5],'startTime':'00:00' if day not in [1,3,5] else '18:00','durationMinutes':10 if day not in [1,3,5] else 60} for day in range(1,8)]}
class OnboardingTests(unittest.IsolatedAsyncioTestCase):
 async def post(self,payload,origin=None):
  async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
   return await client.post('/api/onboarding',json=payload,headers={'Origin':origin} if origin else {})
 async def test_llm_fields_and_options(self):
  question={'field':'goal','label':'Bạn hướng tới điều gì?','placeholder':'Viết mục tiêu','input_type':'text','options':[{'label':'Tăng cơ','value':'Tăng cơ'}]}
  with patch.object(chatbot,'ask_assistant',AsyncMock(return_value=result({'age':25},[question]))) as ask:
   response=await self.post({'messages':[{'role':'user','content':'Tôi 25 tuổi'}],'answers':{'age':'25'}})
  self.assertEqual(response.status_code,200);self.assertEqual(response.json()['questions'],[question]);self.assertFalse(response.json()['ready'])
  self.assertIn('CHỈ trả một đối tượng JSON',ask.call_args.kwargs['instructions']);self.assertIn('"age": "25"',ask.call_args.args[0][-1]['content'])
 def test_complete_valid_week_is_required(self):
  self.assertTrue(validate_turn(result(PROFILE,[]))['ready'])
  for week in [PROFILE['weekSchedule'][:-1],[PROFILE['weekSchedule'][0]]*7]:
   turn=validate_turn(result({**PROFILE,'weekSchedule':week},[]))
   self.assertFalse(turn['ready']);self.assertEqual(turn['questions'][0]['field'],'weekSchedule')
 def test_underage_is_blocked(self):
  turn=validate_turn(result({**PROFILE,'age':17},[]));self.assertTrue(turn['blocked']);self.assertFalse(turn['ready']);self.assertEqual(turn['questions'],[])
 def test_partial_model_update_preserves_prior_profile(self):
  turn=validate_turn(result({'weightKg':68},[]),CollectedProfile.model_validate(PROFILE))
  self.assertTrue(turn['ready']);self.assertEqual(turn['profile']['age'],25);self.assertEqual(turn['profile']['weightKg'],68)
 def test_invalid_ui_or_json_uses_next_question(self):
  turn=validate_turn('not json')
  self.assertFalse(turn['ready']);self.assertEqual(turn['questions'][0]['field'],'age')
  turn=validate_turn(result({},[{'field':'html','label':'x','input_type':'text','options':[]}]))
  self.assertEqual(turn['questions'][0]['field'],'age')
 async def test_selected_answer_survives_malformed_model_response(self):
  with patch.object(chatbot,'ask_assistant',AsyncMock(return_value='not json')):
   response=await self.post({'messages':[{'role':'user','content':'Mục tiêu: Tăng cơ'}],'profile':{'age':25,'weightKg':65,'heightCm':170},'answers':{'goal':'Tăng cơ'}})
  self.assertEqual(response.status_code,200)
  self.assertEqual(response.json()['profile']['goal'],'gainMuscle')
  self.assertEqual(response.json()['profile']['age'],25)
  self.assertNotEqual(response.json()['questions'][0]['field'],'goal')
 async def test_selected_answer_overrides_stale_model_value(self):
  with patch.object(chatbot,'ask_assistant',AsyncMock(return_value=result({'goal':'maintain'},[]))):
   response=await self.post({'messages':[{'role':'user','content':'Mục tiêu: Giảm mỡ'}],'answers':{'goal':'Giảm mỡ'}})
  self.assertEqual(response.status_code,200)
  self.assertEqual(response.json()['profile']['goal'],'loseFat')
 def test_wrapped_json_and_missing_questions_keep_flow_moving(self):
  raw='Vi sẽ hỏi tiếp nhé.\n```json\n'+json.dumps({'reply':'Mình hỏi thêm nhé.','profile':{},'questions':[]},ensure_ascii=False)+'\n```'
  turn=validate_turn(raw)
  self.assertEqual(turn['questions'][0]['field'],'age')
  self.assertEqual(turn['questions'][0]['input_type'],'number')
 def test_string_age_and_invalid_optional_field_do_not_discard_turn(self):
  raw=result({'age':'25','weightKg':'not-a-number'},[])
  turn=validate_turn(raw)
  self.assertEqual(turn['profile']['age'],25)
  self.assertEqual(turn['questions'][0]['field'],'weightKg')
 def test_missing_reply_uses_short_fallback(self):
  turn=validate_turn(json.dumps({'profile':{},'questions':[]}))
  self.assertTrue(turn['reply'])
  self.assertEqual(turn['questions'][0]['field'],'age')
 async def test_no_fake_fallback_on_failure(self):
  with patch.object(chatbot,'ask_assistant',AsyncMock(side_effect=chatbot.ChatbotError(504,'Chờ phản hồi quá lâu.'))):
   response=await self.post({'messages':[{'role':'user','content':'Bắt đầu'}]})
  self.assertEqual(response.status_code,504);self.assertNotIn('questions',response.json())
 async def test_bad_answers_and_origin_rejected_before_llm(self):
  with patch.object(chatbot,'ask_assistant',AsyncMock()) as ask:
   response=await self.post({'messages':[{'role':'user','content':'Bắt đầu'}],'answers':{'secret':'x'}});self.assertEqual(response.status_code,400)
   response=await self.post({'messages':[{'role':'user','content':'Bắt đầu'}]},origin='http://other');self.assertEqual(response.status_code,403);ask.assert_not_awaited()
if __name__=='__main__':unittest.main()
