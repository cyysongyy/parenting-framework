// 親子教育架構：依情境（situation）與設定產生講座內容
// 用法：const plan = buildPlan(FRAMEWORK, { situation: 'procrastination', resultsDisplay: 'phone' });
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ParentingFramework = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  function getSituation(fw, id) {
    const s = fw.situations.find(x => x.id === id);
    if (!s) throw new Error('找不到情境：' + id);
    return s;
  }

  function selLabels(fw, ids) {
    return (ids || []).map(id => fw.core.sel.find(x => x.id === id)).filter(Boolean).map(x => x.label);
  }

  // 每個情境產生的段落：一律依「I do → You do → We do」，4F 固定順序，結尾也固定 Facts→Feelings→Findings→Future
  function buildPlan(fw, opts) {
    const s = getSituation(fw, opts.situation);
    const sections = [];

    sections.push({ type: 'example', title: '情境例子', text: s.example });

    if (s.leadIn) sections.push({ type: 'leadIn', text: s.leadIn });

    sections.push({
      type: 'ido',
      title: 'I do：' + s.title,
      prompt: s.triggerForParent || null,
      experience: s.lecturerExperience || { status: 'TODO', text: '[講師自己的經驗]' }
    });

    if (s.parentIceberg || s.childIceberg) {
      sections.push({
        type: 'youdo',
        title: 'You do：冰山（先孩子，後父母）',
        child: s.childIceberg || null,
        parent: s.parentIceberg || null,
        layers: fw.core.icebergLayers,
        note: fw.core.icebergNote
      });
    }

    if (s.reasonsToCheck) {
      sections.push({ type: 'reasons', title: '可能的原因（先問原因，再談策略）', items: s.reasonsToCheck, referral: s.referralNote || null });
    }

    if (s.youDoQuestions) {
      sections.push({ type: 'questions', title: '家長可以問的問題', items: s.youDoQuestions });
    }

    sections.push({
      type: 'wedo',
      title: 'We do：4F 一起找解方',
      steps: fw.core.fourFOrder.map(id => {
        const meta = fw.core.fourF.find(x => x.id === id);
        return { id, label: meta.label, text: s.wedoScript[id] };
      })
    });

    if (s.systemView) {
      sections.push({ type: 'system', title: '系統觀', layers: fw.core.systemLayers, question: fw.core.systemQuestion });
    }

    sections.push({ type: 'sel', title: '對應的 SEL 核心', items: selLabels(fw, s.selFocus) });

    sections.push({ type: 'closing', title: '今天帶走一個行動', steps: fw.core.closingSteps });

    // 結果顯示方式（對應第 8 點）
    const rd = opts.resultsDisplay || fw.settings.resultsDisplay;
    sections.push({
      type: 'results',
      display: rd,
      text: rd === 'phone'
        ? '家長用手機掃描 QR Code，即時看到大家的選項。'
        : '講師投影結果，觀眾不需要看手機。'
    });

    // 待確認欄位，產生時一併列出，避免漏掉
    const todos = [];
    if (s.lecturerExperience && s.lecturerExperience.status === 'TODO') todos.push('講師經驗（' + s.title + '）');
    if (fw.tbdFields['3C'] && s.id === 'procrastination') todos.push('3C 定義');

    return { situation: s.id, title: s.title, deck: opts.deck || fw.settings.deckVariant, sections, todos };
  }

  return { buildPlan, getSituation };
});
