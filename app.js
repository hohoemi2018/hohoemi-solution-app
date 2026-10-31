import { buildScenario, scenarioToText } from './generator.js';

const form = document.querySelector('#scenario-form');
const result = document.querySelector('#result');
const resultBody = document.querySelector('#result-body');
const copyStatus = document.querySelector('#copy-status');
const fields = ['who', 'when', 'where', 'situation', 'goal', 'exception', 'how'];
let lastInput = null;
let currentScenario = null;
let variation = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function currentInput() {
  const data = Object.fromEntries(fields.map((name) => [name, form.elements[name].value.trim()]));
  data.audience = form.elements.audience.value;
  return data;
}

function renderScenario(scenario) {
  const fragment = document.createDocumentFragment();
  const context = element('div', 'context-card');
  context.append(element('h3', 'context-heading', '✳　今回の練習場面'));

  const tags = element('div', 'context-tags');
  scenario.context.forEach((item) => tags.append(element('span', 'context-tag', `${item.label}：${item.value}`)));
  tags.append(element('span', 'context-tag', scenario.audience === 'child' ? '子どもに向けた言葉づかい' : '大人に向けた言葉づかい'));
  context.append(tags);

  function addContext(label, text) {
    if (!text) return;
    const paragraph = element('p', 'context-text');
    paragraph.append(element('strong', '', label), document.createTextNode(text));
    context.append(paragraph);
  }
  addContext('どんなこと', scenario.situation);
  addContext('望む変化', scenario.goal);
  addContext('大切にしたいこと', scenario.how);
  context.append(element('p', 'context-note', 'まずは、役になりきって読んでみましょう。'));
  fragment.append(context);

  const dialogueGrid = element('div', 'dialogue-grid');
  scenario.steps.forEach((step, index) => {
    const card = element('article', 'dialogue-step');
    const heading = element('div', 'dialogue-step-header');
    heading.append(element('span', 'dialogue-step-num', String(index + 1).padStart(2, '0')));
    const headingText = element('div');
    headingText.append(element('h3', '', step.title), element('p', 'dialogue-step-subtitle', step.subtitle));
    heading.append(headingText);
    card.append(heading);

    step.lines.forEach((item) => {
      const partner = item.role === 'partner';
      const row = element('div', 'dialogue-line');
      const avatar = element('div', `dialogue-avatar${partner ? ' partner' : ''}`, partner ? '○' : '✳');
      avatar.setAttribute('aria-hidden', 'true');
      const content = element('div', 'dialogue-line-body');
      content.append(
        element('p', 'dialogue-speaker', partner ? `${scenario.who}（返答例）` : 'あなた'),
        element('p', `dialogue-bubble${partner ? ' partner' : ''}`, item.text),
      );
      row.append(avatar, content);
      card.append(row);
    });
    const tip = element('p', 'dialogue-tip');
    tip.append(element('strong', '', 'POINT'), document.createTextNode(step.tip));
    card.append(tip);
    dialogueGrid.append(card);
  });
  fragment.append(dialogueGrid);

  const reflection = element('div', 'reflection-card');
  reflection.append(element('h3', '', '✳　練習のあとに、ふりかえってみましょう'));
  const questions = element('ul');
  [
    '相手の話を、決めつけずに聴けましたか？',
    '少しうまくいったときや、相手の工夫に気づけましたか？',
    '相手の言葉を使って、感謝や関心を伝えられましたか？',
  ].forEach((text) => questions.append(element('li', '', text)));
  reflection.append(questions);
  fragment.append(reflection);
  resultBody.replaceChildren(fragment);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  for (const name of ['who', 'situation']) {
    const field = form.elements[name];
    field.setCustomValidity(field.value.trim() ? '' : 'この項目を入力してください。');
  }
  if (!form.reportValidity()) return;
  lastInput = currentInput();
  variation = 0;
  currentScenario = buildScenario(lastInput, variation);
  renderScenario(currentScenario);
  copyStatus.textContent = '';
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  result.focus({ preventScroll: true });
});

for (const name of ['who', 'situation']) {
  form.elements[name].addEventListener('input', () => form.elements[name].setCustomValidity(''));
}

document.querySelector('#sample-button').addEventListener('click', () => {
  const hasInput = fields.some((name) => form.elements[name].value.trim());
  if (hasInput && !window.confirm('入力中の内容を入力例に入れ替えますか？')) return;
  const sample = {
    who: '小学２年生の子ども',
    when: '平日の朝、学校へ出かける前',
    where: '自宅のリビング',
    situation: '朝の支度に時間がかかり、声をかける回数が増えている',
    goal: '親子で落ち着いて朝の準備ができる',
    exception: '前の晩に一緒に持ち物をそろえた朝は、少し早く準備できた',
    how: '急がせずに、子どもの気持ちを聞きたい',
  };
  for (const [name, value] of Object.entries(sample)) {
    form.elements[name].value = value;
    form.elements[name].setCustomValidity('');
  }
  form.querySelector('input[name="audience"][value="child"]').checked = true;
  form.elements.who.focus();
});

document.querySelector('#regenerate-button').addEventListener('click', () => {
  if (!lastInput) return;
  variation += 1;
  currentScenario = buildScenario(lastInput, variation);
  renderScenario(currentScenario);
  copyStatus.textContent = '会話の言い回しを変えました。';
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#copy-button').addEventListener('click', async () => {
  if (!currentScenario) return;
  const text = scenarioToText(currentScenario);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = element('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-10000px;top:0';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) {
      copyStatus.textContent = 'コピーできませんでした。本文を選択してコピーしてください。';
      return;
    }
  }
  copyStatus.textContent = 'シナリオをコピーしました。';
});

document.querySelector('#print-button').addEventListener('click', () => window.print());
