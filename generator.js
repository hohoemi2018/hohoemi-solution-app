// The conversation is a practice example, assembled locally from the learner's
// context. It never treats an imagined reply as a fact about the real person.
const clean = (value) => String(value ?? '').trim();

export function buildScenario(input, variation = 0) {
  const data = {
    who: clean(input.who),
    when: clean(input.when),
    where: clean(input.where),
    situation: clean(input.situation),
    goal: clean(input.goal),
    exception: clean(input.exception),
    how: clean(input.how),
    audience: input.audience === 'child' ? 'child' : 'adult',
  };
  if (!data.who || !data.situation) {
    throw new Error('「誰と話しますか？」と「どんなことについて話しますか？」を入力してください。');
  }

  const version = Math.abs(Number.isFinite(Number(variation)) ? Math.trunc(Number(variation)) : 0);
  const choose = (choices) => choices[version % choices.length];
  const child = data.audience === 'child';
  const line = (role, text) => ({ role, text });
  const context = [
    { label: '誰と', value: data.who },
    { label: 'いつ', value: data.when },
    { label: 'どこで', value: data.where },
  ].filter((item) => item.value);

  const opening = child
    ? choose([
      `「${data.situation}」のこと、少し聞かせてくれる？ どんな気持ちだったかな？`,
      `「${data.situation}」のこと、あなたはどう感じている？ よかったら教えてね。`,
      `「${data.situation}」について、話せることから教えてくれるかな？`,
    ])
    : choose([
      `「${data.situation}」について、話せる範囲で聞かせてもらえますか？`,
      `「${data.situation}」のことを、あなたはどんなふうに感じていますか？`,
      `「${data.situation}」について、今のお気持ちを少し聞かせていただけますか？`,
    ]);

  const askException = child
    ? choose([
      'そんな中でも、少しだけうまくいったり、楽だったりしたときはあったかな？',
      'いつもより少しよかったな、と思えたときはあるかな？',
      '最近、ほんの少しでも「できたかも」と思えたときはあった？',
    ])
    : choose([
      'そんな中でも、少しうまくいったり、いつもより楽だったりしたときはありましたか？',
      '最近、ほんの少しでも「よかった」と思えたときはありましたか？',
      'いつもより少しでも望む状態に近かったときは、思い浮かびますか？',
    ]);

  const exampleException = data.exception
    ? child
      ? `うん。「${data.exception}」ってことがあったよ。`
      : `そうですね。「${data.exception}」ということがありました。`
    : child
      ? 'そういえば、少しよかったときがあったかもしれない。'
      : 'そういえば、少しよかったときがあったかもしれません。';

  const deepenException = child
    ? choose(['そのとき、いつもと何か違っていたことはある？', 'そのときは、どんなことをしていたのかな？', 'そのとき、何が役に立っていたと思う？'])
    : choose(['そのとき、いつもと少し違っていたことは何でしょう？', 'そのときは、どんなことをされていましたか？', 'そのとき、何が役に立っていたと思いますか？']);

  const nextStep = data.goal
    ? child
      ? `「${data.goal}」に少し近づくために、次にできそうな小さなことはあるかな？`
      : `「${data.goal}」に向けて、次に無理なく試せそうな小さなことはありますか？`
    : child
      ? choose(['また似た場面があったら、次にできそうな小さなことはあるかな？', '次は、どんなことを少しやってみたい？', 'またやってみてもいいかな、と思うことはある？'])
      : choose(['また似た場面があったとき、次に無理なく試せそうな小さなことはありますか？', '次に向けて、続けてみたいことや試してみたいことはありますか？', 'あなたにとって、次の小さな一歩はどんなことでしょう？']);

  const steps = [
    {
      title: 'まずは、相手の話を聴く',
      subtitle: '安心して話せるところから',
      lines: [
        line('supporter', opening),
        line('partner', child ? 'うん。ちょっと困っているんだ。' : 'そうですね。少し困っていて、どうしようかと思っていました。'),
        line('supporter', child ? 'そうだったんだね。話してくれてありがとう。' : 'そうだったのですね。お話ししてくださって、ありがとうございます。'),
      ],
      tip: 'まずは相手の言葉を受け止めます。気持ちや状況を決めつけず、話すペースを大切に。',
    },
    {
      title: '小さな「例外」をさがす',
      subtitle: '少しでもよかったときに目を向ける',
      lines: [
        line('supporter', askException),
        line('partner', exampleException),
        line('supporter', deepenException),
      ],
      tip: child
        ? '思い浮かばなければ無理に探さず、「少し楽になるとしたら、どんな感じかな？」と聞いてみましょう。'
        : '思い浮かばなければ無理に探さず、「少し楽になるとしたら、どんな変化がありそうですか？」と聞いてみましょう。',
    },
    {
      title: '工夫をたずねる',
      subtitle: '「どうやって？」という間接的なコンプリメント',
      lines: [
        line('supporter', child
          ? choose(['そのとき、どうやってできたの？ 役に立ったことはあった？', 'そのときにしてみたこと、もう少し教えてくれる？', 'どうやってそのやり方を思いついたのかな？'])
          : choose(['そのとき、どんなふうに工夫されたのですか？ 何が役に立ったのでしょう？', 'そのときにされたことを、もう少し教えていただけますか？', 'どうやって、そのやり方を思いつかれたのですか？'])),
        line('partner', child ? 'うん、そのときは、ちょっとやり方を変えてみたよ。' : '自分なりに、少し工夫してみたんです。'),
      ],
      tip: '相手のしたことに関心を向け、具体的な行動やその人らしい工夫を尋ねます。',
    },
    {
      title: '工夫を認め、感謝を伝える',
      subtitle: '相手が話してくれたことを、そのまま大切に',
      lines: [
        line('supporter', child
          ? choose(['そうやって工夫したんだね。教えてくれてありがとう。', '自分で考えてやってみたんだね。聞かせてくれてありがとう。', 'そのときのことを話してくれて、ありがとう。'])
          : choose(['そのように工夫されたのですね。お話ししてくださって、ありがとうございます。', 'ご自身で考えて試されたのですね。聞かせてくださって、ありがとうございます。', 'そのときのことを教えてくださり、ありがとうございます。'])),
        line('partner', child ? 'うん、聞いてくれてありがとう。' : '話を聞いてもらえて、よかったです。'),
      ],
      tip: '相手が実際に話した工夫に触れましょう。「すごい」などの評価を押しつけず、感謝を伝えることもできます。',
    },
    {
      title: '次の小さな一歩を一緒に考える',
      subtitle: '相手自身が選べる、無理のない一歩へ',
      lines: [
        line('supporter', nextStep),
        line('partner', child ? 'できそうなことを、少しやってみたいな。' : '自分にできそうなことを、少し試してみたいです。'),
        line('supporter', child ? 'いいね。できそうなことから、ゆっくり考えてみよう。' : 'ありがとうございます。ご自身のペースで考えてみてくださいね。'),
      ],
      tip: '答えを急がず、相手が選んだ小さな一歩を大切にします。',
    },
  ];

  return { ...data, context, steps };
}

export function scenarioToText(scenario) {
  const lines = ['ほほえみシナリオノート', '', '【場面】'];
  for (const item of scenario.context) lines.push(`${item.label}：${item.value}`);
  lines.push(`どんなこと：${scenario.situation}`);
  if (scenario.goal) lines.push(`望む変化：${scenario.goal}`);
  if (scenario.how) lines.push(`大切にしたいこと：${scenario.how}`);
  lines.push('');
  scenario.steps.forEach((step, index) => {
    lines.push(`【${String(index + 1).padStart(2, '0')} ${step.title}】`);
    for (const item of step.lines) lines.push(`${item.role === 'supporter' ? 'あなた' : scenario.who + '（返答例）'}：${item.text}`);
    lines.push(`ヒント：${step.tip}`, '');
  });
  lines.push('※ 相手の返答は練習用の一例です。実際の会話では相手の気持ちや言葉に合わせましょう。');
  return lines.join('\n');
}
