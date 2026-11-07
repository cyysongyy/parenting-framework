// 親子教育架構 v2：依「情境 × 年段」產生六個層次的內容，並處理家長／學生問卷統計
// 用法：const plan = ParentingFramework.buildPlan(fw, { situation: 'procrastination', audience: 'junior' });
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ParentingFramework = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const AUDIENCES = ['elementary', 'junior', 'senior'];
  const LAYER_IDS = ['behavior', 'feeling', 'belief'];

  function getSituation(fw, id) {
    const s = fw.situations.find(x => x.id === id);
    if (!s) throw new Error('找不到情境：' + id);
    return s;
  }
  function pickAudience(fw, a) { return fw.audiences[a] ? a : fw.settings.defaultAudience; }
  function selLabel(fw, id) { const x = fw.core.sel.find(s => s.id === id); return x ? x.label : id; }
  function icebergLabel(fw, id) { const x = fw.core.iceberg.layers.find(l => l.id === id); return x ? x.label : id; }

  // ───────── 六個層次的內容 ─────────
  function buildCoherence(fw, s, aud) {
    const f = fw.core;
    return {
      storyline: s.storyline,
      chain: [
        { label: '水面上（行為）', text: s.chain.surface },
        { label: '水面下（感受與需求）', text: s.chain.below },
        { label: '最深處（價值信念）', text: s.chain.deep },
        { label: '用到的能力', text: s.chain.skill },
        { label: '約定', text: s.chain.agreement }
      ],
      fourFPath: f.fourFOrder.map(id => ({
        id, step: f.fourF.find(x => x.id === id).label,
        icebergId: f.fourFToIceberg[id], iceberg: icebergLabel(fw, f.fourFToIceberg[id]),
        selIds: f.fourFToSEL[id], sel: f.fourFToSEL[id].map(x => selLabel(fw, x))
      })),
      rules: f.coherenceRules
    };
  }

  function buildIceberg(fw, s, a) {
    const v = s.byAudience[a], ic = fw.core.iceberg, qb = fw.core.questionBank[a];
    return {
      note: ic.note, layers: ic.layers, displayOrder: ic.displayOrder,
      child: v.childIceberg, parent: s.parentIceberg,
      interplay: ic.interplay, rule: ic.rule,
      depthNote: fw.audiences[a].icebergDepth,
      questions: { behavior: qb.behavior, feeling: qb.feeling, belief: qb.belief }
    };
  }

  function buildFourF(fw, s, a) {
    const f = fw.core, v = s.byAudience[a], st = fw.audiences[a].fourFStyle;
    return f.fourFOrder.map(id => {
      const meta = f.fourF.find(x => x.id === id);
      return {
        id, label: meta.label, prompt: meta.prompt, avoid: meta.avoid,
        script: id === 'future' ? v.future : s.wedoScript[id],
        stem: st[id],
        iceberg: icebergLabel(fw, f.fourFToIceberg[id]), icebergId: f.fourFToIceberg[id],
        sel: f.fourFToSEL[id].map(x => selLabel(fw, x)), selIds: f.fourFToSEL[id],
        questions: f.questionBank[a][id === 'facts' ? 'behavior' : id === 'feelings' ? 'feeling' : id === 'findings' ? 'belief' : 'future']
      };
    });
  }

  function buildStages(fw, s, a) {
    const v = s.byAudience[a];
    return fw.core.stages.map(st => {
      const base = Object.assign({}, st);
      if (st.id === 'ido') base.content = { trigger: s.triggerForParent, model: s.idoModel, experience: s.lecturerExperience, parentIceberg: s.parentIceberg };
      if (st.id === 'youdo') base.content = { example: v.example, questions: v.youDoQuestions, reasons: s.reasonsToCheck || null, referral: s.referralNote || null };
      if (st.id === 'wedo') base.content = { future: v.future, contractStyle: fw.audiences[a].contractStyle };
      return base;
    });
  }

  function buildAudience(fw, a) {
    const x = fw.audiences[a];
    return { id: a, label: x.label, grades: x.grades, developmental: x.developmental, autonomy: x.autonomy,
      parentRole: x.parentRole, language: x.language, contractStyle: x.contractStyle, cautions: x.cautions, interactionStyle: x.interactionStyle };
  }

  // ───────── 提問與互動 ─────────
  function buildInteractions(fw, sid, audience) {
    const s = getSituation(fw, sid), a = pickAudience(fw, audience), v = s.byAudience[a];
    const T = id => fw.core.interactionTemplates.find(t => t.id === id);
    const out = [];
    const pollOptions = [];
    Object.keys(s.surveyLink).forEach(g => s.surveyLink[g].forEach(item => pollOptions.push({ group: g, item })));
    out.push(Object.assign({}, T('poll'), { data: { options: pollOptions } }));
    out.push(Object.assign({}, T('ido_scale'), { data: { min: 1, max: 5, labels: ['很平靜', '很激動'] } }));
    out.push(Object.assign({}, T('ido_reflect'), { data: { model: s.idoModel, experience: s.lecturerExperience } }));
    out.push(Object.assign({}, T('youdo_guess'), { data: { example: v.example, steps: [
      { layer: 'behavior', label: '看到的行為', text: v.childIceberg.behavior },
      { layer: 'feeling', label: '感受與需求', text: v.childIceberg.feeling },
      { layer: 'belief', label: '價值信念', text: v.childIceberg.belief }] } }));
    out.push(Object.assign({}, T('youdo_match'), { data: { layers: fw.core.iceberg.layers, items: [
      { text: v.childIceberg.behavior, answer: 'behavior' },
      { text: v.childIceberg.feeling, answer: 'feeling' },
      { text: v.childIceberg.belief, answer: 'belief' }] } }));
    out.push(Object.assign({}, T('youdo_roleswap'), { data: { roles: [
      { role: '孩子', hint: v.childIceberg.belief },
      { role: '家長', hint: s.parentIceberg.belief }] } }));
    out.push(Object.assign({}, T('wedo_order'), { data: { items: fw.core.fourFOrder.map((id, i) => ({
      text: id === 'future' ? v.future : s.wedoScript[id], answer: i + 1,
      label: fw.core.fourF.find(x => x.id === id).label })) } }));
    out.push(Object.assign({}, T('wedo_commit'), { data: { fields: ['時間', '地點', '誰', '做什麼'], example: v.future } }));
    out.push(Object.assign({}, T('closing_reflect'), { data: { options: fw.core.closingSteps } }));
    // 提問階梯：由水面上往水面下，再回到水面
    const qb = fw.core.questionBank[a];
    out.push({ id: 'ladder', type: 'ladder', stage: 'all', title: '提問階梯（' + fw.audiences[a].label + '）',
      instruction: '依序往水面下問，最後回到水面訂約定。',
      data: { rungs: [
        { layer: '行為表層', questions: qb.behavior },
        { layer: '感受與需求', questions: qb.feeling },
        { layer: '價值信念', questions: qb.belief },
        { layer: '回到水面（約定）', questions: qb.future },
        { layer: '這個情境專用', questions: v.youDoQuestions }] } });
    return out;
  }

  // ───────── 組合：整個情境 ─────────
  function buildPlan(fw, opts) {
    const s = getSituation(fw, opts.situation), a = pickAudience(fw, opts.audience);
    const rd = opts.resultsDisplay || fw.settings.resultsDisplay;
    const layers = {
      coherence: buildCoherence(fw, s, a),
      iceberg: buildIceberg(fw, s, a),
      stages: buildStages(fw, s, a),
      fourF: buildFourF(fw, s, a),
      audience: buildAudience(fw, a),
      interaction: buildInteractions(fw, s.id, a)
    };
    const extras = {
      leadIn: s.leadIn || null,
      system: s.systemView ? { layers: fw.core.systemLayers, question: fw.core.systemQuestion } : null,
      sel: fw.core.sel.map(x => ({ id: x.id, label: x.label, desc: x.desc, inThisCase: s.selMap[x.id] })),
      closing: fw.core.closingSteps,
      results: { display: rd, text: rd === 'phone' ? '家長（或學生）用手機掃描 QR Code，在自己的手機上看到大家的選項。' : '講師投影結果，大家看大螢幕，不需要看手機。' },
      referral: s.referralNote || null
    };
    const todos = [];
    if (s.lecturerExperience && s.lecturerExperience.status === 'TODO') todos.push('講師經驗（' + s.title + '）');
    if (s.id === 'phone_conflict' || s.id === 'procrastination') todos.push('3C 定義');
    return { situation: s.id, title: s.title, domain: s.domain, audience: a, audienceLabel: fw.audiences[a].label,
      example: s.byAudience[a].example, layers, extras, todos, deck: opts.deck || fw.settings.deckVariant };
  }

  // ───────── 問卷：家長／學生 ─────────
  function surveySpec(fw, role) {
    const resp = fw.survey.respondents.find(r => r.id === role) || fw.survey.respondents[0];
    return { role: resp.id, label: resp.label, stem: resp.stem,
      groups: fw.survey.groups.map(g => ({ key: g.key, name: g.name,
        items: g.items.map(item => ({ value: item, text: resp.id === 'student' ? fw.survey.studentItems[item] : item, none: fw.survey.noneItems.indexOf(item) > -1 })) })),
      optionalQuestions: fw.survey.optionalQuestions };
  }

  function emptyTally(fw) {
    const t = {};
    fw.survey.respondents.forEach(r => { t[r.id] = { total: 0, counts: {} }; });
    return t;
  }

  // responses: [{ role: 'parent'|'student', picks: { emotion: [...], behavior: [...], social: [...] } }]
  function tally(fw, responses) {
    const t = emptyTally(fw);
    const valid = {};
    fw.survey.groups.forEach(g => g.items.forEach(i => { valid[g.key + '|' + i] = true; }));
    (responses || []).forEach(r => {
      if (!t[r.role]) return;
      t[r.role].total++;
      fw.survey.groups.forEach(g => (r.picks && r.picks[g.key] || []).forEach(item => {
        if (!valid[g.key + '|' + item]) return;
        const k = g.key + '|' + item;
        t[r.role].counts[k] = (t[r.role].counts[k] || 0) + 1;
      }));
    });
    return t;
  }

  function pct(t, role, group, item) {
    const total = t[role].total; if (!total) return null;
    return (t[role].counts[group + '|' + item] || 0) / total;
  }

  // 家長與學生並排比較，標出落差
  function compare(fw, t) {
    const th = fw.survey.gapThreshold;
    return fw.survey.groups.map(g => ({ key: g.key, name: g.name, items: g.items.map(item => {
      const p = pct(t, 'parent', g.key, item), st = pct(t, 'student', g.key, item);
      const none = fw.survey.noneItems.indexOf(item) > -1;
      let gap = null, tag = 'na';
      if (p !== null && st !== null) {
        gap = st - p;
        tag = none ? 'aligned' : gap >= th ? 'student_more' : gap <= -th ? 'parent_more' : 'aligned';
      }
      return { item, studentText: fw.survey.studentItems[item], none,
        parentCount: t.parent.counts[g.key + '|' + item] || 0, studentCount: t.student.counts[g.key + '|' + item] || 0,
        parentPct: p, studentPct: st, gap, tag };
    }) }));
  }

  function fmt(x) { return Math.round(x * 100) + '%'; }

  function insights(fw, t) {
    const out = [];
    compare(fw, t).forEach(g => g.items.forEach(i => {
      if (i.tag === 'student_more') out.push({ tag: i.tag, group: g.name, item: i.item,
        text: '學生勾選「' + i.studentText + '」（' + fmt(i.studentPct) + '）高於家長勾選（' + fmt(i.parentPct) + '）：孩子的感受，家長可能還沒看見。' });
      if (i.tag === 'parent_more') out.push({ tag: i.tag, group: g.name, item: i.item,
        text: '家長勾選「' + i.item + '」（' + fmt(i.parentPct) + '）高於學生勾選（' + fmt(i.studentPct) + '）：家長很擔心，但孩子不一定這樣覺得。' });
    }));
    return out.sort((a, b) => a.tag.localeCompare(b.tag));
  }

  // 依問卷結果，把八個情境排序：兩邊的勾選比例 + 落差加權
  function recommendFromSurvey(fw, t, opts) {
    opts = opts || {};
    const cmp = compare(fw, t), flat = {};
    cmp.forEach(g => g.items.forEach(i => { flat[g.key + '|' + i.item] = i; }));
    const th = fw.survey.gapThreshold;
    const list = fw.situations.map(s => {
      let score = 0; const evidence = [];
      Object.keys(s.surveyLink).forEach(g => s.surveyLink[g].forEach(item => {
        const e = flat[g + '|' + item]; if (!e || e.none) return;
        const p = e.parentPct || 0, st = e.studentPct || 0;
        let w = p + st;
        if (e.gap !== null && Math.abs(e.gap) >= th) w += Math.abs(e.gap) * 0.5;
        score += w;
        evidence.push({ group: g, item, parentPct: e.parentPct, studentPct: e.studentPct, gap: e.gap, tag: e.tag });
      }));
      return { situation: s.id, title: s.title, domain: s.domain, score: Math.round(score * 1000) / 1000, evidence };
    });
    list.sort((x, y) => y.score - x.score);
    return opts.topN ? list.slice(0, opts.topN) : list;
  }

  function toPayload(role, picks) {
    return { role, emotion: picks.emotion || [], behavior: picks.behavior || [], social: picks.social || [] };
  }

  // 示範資料（固定種子，每次產生一樣的結果）
  function demoResponses(fw, nParent, nStudent) {
    nParent = nParent || 20; nStudent = nStudent || 20;
    const rates = {
      parent: { '容易生氣、煩躁': .45, '焦慮、緊張': .35, '難過、低落': .20, '課業升學壓力大': .60, '不說出自己的感受': .50, '沒有明顯困擾': .10,
        '衝動、頂嘴': .35, '拖延、要一直催': .65, '過度使用手機網路': .75, '不遵守規範': .35, '遇到困難就逃避': .40, '沒有明顯困擾#b': .05,
        '與孩子溝通時，經常演變成責備、爭吵或冷戰': .55, '與同學容易發生爭執或意見衝突': .25, '覺得自己沒有知心朋友，或常感到被孤立': .15,
        '曾遭遇言語嘲諷、排擠、欺負或網路霸凌': .10, '不容易表達自己的想法，也不敢拒絕他人的要求': .40, '家長與教師對孩子的管教方式或期待不同': .30, '近期沒有明顯的人際互動困擾': .15 },
      student: { '容易生氣、煩躁': .30, '焦慮、緊張': .55, '難過、低落': .40, '課業升學壓力大': .70, '不說出自己的感受': .65, '沒有明顯困擾': .05,
        '衝動、頂嘴': .20, '拖延、要一直催': .55, '過度使用手機網路': .60, '不遵守規範': .25, '遇到困難就逃避': .55, '沒有明顯困擾#b': .05,
        '與孩子溝通時，經常演變成責備、爭吵或冷戰': .60, '與同學容易發生爭執或意見衝突': .30, '覺得自己沒有知心朋友，或常感到被孤立': .35,
        '曾遭遇言語嘲諷、排擠、欺負或網路霸凌': .25, '不容易表達自己的想法，也不敢拒絕他人的要求': .60, '家長與教師對孩子的管教方式或期待不同': .45, '近期沒有明顯的人際互動困擾': .10 }
    };
    let seed = 20261107;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const out = [];
    [['parent', nParent], ['student', nStudent]].forEach(([role, n]) => {
      for (let k = 0; k < n; k++) {
        const picks = {};
        fw.survey.groups.forEach(g => {
          picks[g.key] = g.items.filter((item, idx) => {
            const key = (item === '沒有明顯困擾' && g.key === 'behavior') ? '沒有明顯困擾#b' : item;
            return rnd() < (rates[role][key] || 0.1);
          });
        });
        out.push({ role, picks });
      }
    });
    return out;
  }

  // ───────── 一致性檢查 ─────────
  function checkCoherence(fw) {
    const errors = [], warns = [];
    const E = m => errors.push(m);
    const f = fw.core, selIds = f.sel.map(x => x.id);
    // 輔導式內容（啟發性提問與可選做法）
    (fw.situations || []).forEach(sit => {
      selIds.forEach(id => { if (!sit.selQuestions || !sit.selQuestions[id]) E(sit.id + ' 缺少 SEL 提問：' + id); });
      ['exception', 'scale', 'hope', 'resource'].forEach(k => { if (!sit.counselorQuestions || !sit.counselorQuestions[k]) E(sit.id + ' 缺少輔導提問：' + k); });
      ['facts', 'feelings', 'findings', 'future'].forEach(k => { if (!sit.wedoScript || !sit.wedoScript[k]) E(sit.id + ' 缺少 4F 句子：' + k); });
      Object.keys(sit.byAudience || {}).forEach(a => { const o = sit.byAudience[a].options; if (!o || o.length < 2) E(sit.id + '/' + a + ' 可選做法少於 2 個'); });
    });
    // core
    if (JSON.stringify(f.fourFOrder) !== JSON.stringify(f.fourF.map(x => x.id))) E('4F 順序與定義不一致');
    f.fourFOrder.forEach(id => {
      if (!f.fourFToIceberg[id] || LAYER_IDS.indexOf(f.fourFToIceberg[id]) < 0) E('4F→冰山對應缺少或不合法：' + id);
      (f.fourFToSEL[id] || []).forEach(x => { if (selIds.indexOf(x) < 0) E('4F→SEL 未知核心：' + x); });
      if (!(f.fourFToSEL[id] || []).length) E('4F→SEL 缺少：' + id);
    });
    AUDIENCES.forEach(a => {
      const x = fw.audiences[a];
      if (!x) return E('缺少年段：' + a);
      ['label', 'grades', 'developmental', 'autonomy', 'parentRole', 'icebergDepth', 'language', 'fourFStyle', 'interactionStyle', 'contractStyle', 'cautions'].forEach(k => { if (!x[k]) E('年段 ' + a + ' 缺少 ' + k); });
      f.fourFOrder.forEach(id => { if (!x.fourFStyle || !x.fourFStyle[id]) E('年段 ' + a + ' 的 4F 語氣缺 ' + id); });
      const qb = f.questionBank[a];
      if (!qb) return E('提問庫缺少年段：' + a);
      ['behavior', 'feeling', 'belief', 'future'].forEach(k => { if (!qb[k] || !qb[k].length) E('提問庫 ' + a + ' 缺 ' + k); });
    });
    // 色彩：4F、SEL、冰山每一項都要有顏色
    const col = f.colors || {};
    f.fourFOrder.forEach(id => { if (!col.fourF || !col.fourF[id]) E('缺少 4F 顏色：' + id); });
    selIds.forEach(id => { if (!col.sel || !col.sel[id]) E('缺少 SEL 顏色：' + id); });
    LAYER_IDS.forEach(id => { if (!col.iceberg || !col.iceberg[id]) E('缺少冰山顏色：' + id); });
    // survey
    const items = {};
    fw.survey.groups.forEach(g => g.items.forEach(i => { items[g.key + '|' + i] = true; if (!fw.survey.studentItems[i]) E('學生版問卷缺少：' + i); }));
    fw.survey.noneItems.forEach(i => { if (!Object.keys(items).some(k => k.split('|')[1] === i)) E('noneItems 不在問卷中：' + i); });
    ['parent', 'student'].forEach(r => { if (!fw.survey.respondents.some(x => x.id === r)) E('缺少問卷身分：' + r); });
    // situations
    const ids = {}, examples = {};
    fw.situations.forEach(s => {
      const p = s.id + '：';
      if (ids[s.id]) E('重複 id：' + s.id); ids[s.id] = true;
      ['id', 'domain', 'title', 'storyline', 'surveyLink', 'chain', 'triggerForParent', 'parentIceberg', 'idoModel', 'lecturerExperience', 'byAudience', 'wedoScript', 'selMap'].forEach(k => { if (s[k] === undefined) E(p + '缺少欄位 ' + k); });
      if (['emotion', 'behavior', 'interpersonal'].indexOf(s.domain) < 0) E(p + 'domain 不合法');
      ['surface', 'below', 'deep', 'skill', 'agreement'].forEach(k => { if (!s.chain || !s.chain[k]) E(p + '邏輯主線缺 ' + k); });
      LAYER_IDS.forEach(k => { if (!s.parentIceberg || !s.parentIceberg[k]) E(p + '父母冰山缺 ' + k); });
      ['facts', 'feelings', 'findings'].forEach(k => { if (!s.wedoScript || !s.wedoScript[k]) E(p + '4F 缺 ' + k); });
      selIds.forEach(k => { if (!s.selMap || !s.selMap[k]) E(p + 'SEL 對應缺 ' + k); });
      Object.keys(s.surveyLink || {}).forEach(g => (s.surveyLink[g] || []).forEach(i => { if (!items[g + '|' + i]) E(p + '問卷連結不存在：' + g + '／' + i); }));
      if (!Object.keys(s.surveyLink || {}).length) E(p + '沒有連結任何問卷選項');
      const seen = {};
      AUDIENCES.forEach(a => {
        const v = s.byAudience && s.byAudience[a];
        if (!v) return E(p + '缺少年段內容 ' + a);
        ['example', 'future'].forEach(k => { if (!v[k]) E(p + a + ' 缺 ' + k); });
        LAYER_IDS.forEach(k => { if (!v.childIceberg || !v.childIceberg[k]) E(p + a + ' 孩子冰山缺 ' + k); });
        if (!v.youDoQuestions || v.youDoQuestions.length < 2) E(p + a + ' 提問少於 2 題');
        if (seen[v.example]) E(p + '不同年段的例子重複'); seen[v.example] = true;
        if (examples[v.example]) warns.push(p + '例子與 ' + examples[v.example] + ' 重複'); examples[v.example] = s.id + '/' + a;
      });
    });
    // 實際產生一次，確認每個情境×年段都能組出完整六層與必要互動
    const need = ['poll', 'scale', 'reflect', 'guess', 'match', 'roleswap', 'order', 'commit', 'ladder'];
    fw.situations.forEach(s => AUDIENCES.forEach(a => {
      try {
        const plan = buildPlan(fw, { situation: s.id, audience: a });
        ['coherence', 'iceberg', 'stages', 'fourF', 'audience', 'interaction'].forEach(l => { if (!plan.layers[l]) E(s.id + '/' + a + ' 缺少層次 ' + l); });
        const types = plan.layers.interaction.map(x => x.type);
        need.forEach(t => { if (types.indexOf(t) < 0) E(s.id + '/' + a + ' 缺少互動 ' + t); });
        plan.layers.fourF.forEach(x => { if (!x.script) E(s.id + '/' + a + ' 4F ' + x.id + ' 沒有內容'); });
      } catch (e) { E(s.id + '/' + a + ' 產生失敗：' + e.message); }
    }));
    // 問卷統計能跑
    try {
      const t = tally(fw, demoResponses(fw));
      if (t.parent.total !== 20 || t.student.total !== 20) E('示範問卷筆數不正確');
      if (recommendFromSurvey(fw, t).length !== fw.situations.length) E('問卷推薦數量不正確');
    } catch (e) { E('問卷統計失敗：' + e.message); }
    return { errors, warns };
  }

  return { buildPlan, buildInteractions, getSituation, surveySpec, tally, compare, insights, recommendFromSurvey, toPayload, demoResponses, checkCoherence, AUDIENCES };
});
