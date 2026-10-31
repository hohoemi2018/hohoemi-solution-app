import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScenario, scenarioToText } from '../generator.js';

test('必須項目がない場合はシナリオを作らない', () => {
  assert.throws(() => buildScenario({ who: ' ', situation: '朝の支度' }), /誰と話しますか/);
  assert.throws(() => buildScenario({ who: '子ども', situation: '' }), /どんなこと/);
});

test('子ども向けのシナリオに入力場面・例外・望む変化を反映する', () => {
  const scenario = buildScenario({
    who: '小学生の子ども',
    when: '平日の朝',
    where: '自宅',
    situation: '朝の支度が進まない',
    goal: '落ち着いて準備する',
    exception: '前日に用意した朝は早くできた',
    how: '急がずに聞く',
    audience: 'child',
  });
  assert.deepEqual(scenario.context.map((item) => item.value), ['小学生の子ども', '平日の朝', '自宅']);
  assert.match(scenario.steps[0].lines[0].text, /朝の支度が進まない/);
  assert.match(scenario.steps[1].lines[1].text, /前日に用意した朝は早くできた/);
  assert.match(scenario.steps[4].lines[0].text, /落ち着いて準備する/);
  assert.match(scenario.steps[3].lines[0].text, /ありがとう/);
  assert.match(scenarioToText(scenario), /急がずに聞く/);
  assert.match(scenarioToText(scenario), /返答例/);
});

test('例外が未入力でも大人向けの質問と見つからない場合のヒントを表示する', () => {
  const scenario = buildScenario({ who: '受講生', situation: '会話に迷う', audience: 'adult' });
  assert.equal(scenario.steps.length, 5);
  assert.match(scenario.steps[1].lines[0].text, /ありましたか/);
  assert.match(scenario.steps[1].tip, /思い浮かばなければ無理に探さず/);
  assert.match(scenario.steps[2].subtitle, /間接的なコンプリメント/);
  assert.match(scenario.steps[3].lines[0].text, /ありがとうございます/);
});

test('別の言い回しを選んでも場面と会話の流れを保つ', () => {
  const input = { who: '保護者', situation: '子どもへの声かけ', audience: 'adult' };
  const first = buildScenario(input, 0);
  const second = buildScenario(input, 1);
  assert.notEqual(first.steps[0].lines[0].text, second.steps[0].lines[0].text);
  assert.match(second.steps[0].lines[0].text, /子どもへの声かけ/);
  assert.deepEqual(first.steps.map((step) => step.title), second.steps.map((step) => step.title));
});
