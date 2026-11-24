/* ==========================================================================
   好記 HAOJI — 九宮格極簡全能記帳核心引擎 (app.js)
   融合台灣前三大記帳神軟精髓：
   1. 簡單記帳：九宮格大按鈕直覺點按 × 免打字智慧子標籤 × 內建四則運算算盤
   2. MOZE 4.0：台灣日常／出國旅遊獨立帳本 × 10國即時/離線匯率 × 預算水位條
   3. CWMoney：多帳戶資產連動 × 互動收支月曆 × 發票極速對獎 × 旅伴AA分帳LINE結算
   ========================================================================== */

const HaojiApp = (() => {
  const STORAGE_KEY = 'HAOJI_GRID_LEDGER_V1';
  const BACKUP_KEY = 'HAOJI_GRID_LEDGER_V1_BACKUP';

  // ==================== BESPOKE GEOMETRIC VECTOR ICONS (ZERO EMOJI SLOP) ====================
  const ICONS = {
    food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18a9 9 0 0 1-9 9 9 9 0 0 1-9-9Z"/><path d="M7 21h10"/><path d="M6 8l12-3"/><path d="M8 5l10 2"/></svg>`,
    drink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8h10l-1.2 12.2a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8L7 8Z"/><path d="M5 8h14"/><path d="M12 8V3l3-1"/><circle cx="10.5" cy="16.5" r="1" fill="currentColor"/><circle cx="13.5" cy="15.5" r="1" fill="currentColor"/></svg>`,
    transport: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-5l-2-5H7L5 12v5Z"/><circle cx="7.5" cy="14.5" r="1.3" fill="currentColor"/><circle cx="16.5" cy="14.5" r="1.3" fill="currentColor"/><path d="M6 17v2M18 17v2"/></svg>`,
    shopping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10.5h18"/><path d="M7 15h4"/><circle cx="16.5" cy="15" r="1.5"/></svg>`,
    telecom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    bills: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13.5C7 10.5 10 7 10 7s3 3.5 3 6.5a3 3 0 0 1-6 0Z"/><path d="M16.5 7a3.5 3.5 0 0 1 1.8 6.5V16h-3.6v-2.5A3.5 3.5 0 0 1 16.5 7Z"/><path d="M15 19h3"/></svg>`,
    fun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5L3 8Z"/><path d="M5 21h14"/></svg>`,
    travel_shop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="7" width="14" height="14" rx="2.5"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M9.5 12v5M14.5 12v5"/></svg>`,
    stay_flight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
    medical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M12 9v7M8.5 12.5h7"/></svg>`,
    salary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2.5"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>`,
    bonus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    invest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    refund: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
    transfer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10h14l-4-4"/><path d="M17 14H3l4 4"/></svg>`,
    star_box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="3.5"/></svg>`
  };

  // ==================== CURRENCY METADATA ====================
  const CURRENCIES = {
    TWD: { symbol: 'NT$', name: '台幣', rateToTwd: 1 },
    JPY: { symbol: '¥', name: '日圓', rateToTwd: 0.214 },
    KRW: { symbol: '₩', name: '韓元', rateToTwd: 0.0235 },
    THB: { symbol: '฿', name: '泰銖', rateToTwd: 0.94 },
    USD: { symbol: '$', name: '美金', rateToTwd: 32.45 },
    EUR: { symbol: '€', name: '歐元', rateToTwd: 34.80 },
    HKD: { symbol: 'HK$', name: '港幣', rateToTwd: 4.17 },
    CNY: { symbol: '¥', name: '人民幣', rateToTwd: 4.48 },
    SGD: { symbol: 'S$', name: '新幣', rateToTwd: 24.20 },
    VND: { symbol: '₫', name: '越南盾', rateToTwd: 0.00128 }
  };

  // ==================== DEFAULT 9-GRID CATEGORIES (FOOLPROOF + SUBTAGS) ====================
  const DEFAULT_EXPENSE_CATS = [
    { id: 'c_food', name: '餐飲美食', color: '#E56A36', icon: 'food', tags: ['早餐', '午餐', '晚餐', '宵夜', '便利商店', '聚餐餐廳', '拉麵/燒肉'] },
    { id: 'c_drink', name: '飲品手搖', color: '#D68934', icon: 'drink', tags: ['手搖飲', '超商咖啡', '星巴克', '居酒屋/酒', '甜點下午茶', '販賣機'] },
    { id: 'c_trans', name: '交通通勤', color: '#DFB034', icon: 'transport', tags: ['捷運/地鐵', '計程車/Uber', '公車', '加油停車', '高鐵/新幹線', 'Suica儲值'] },
    { id: 'c_shop', name: '日常購物', color: '#76A043', icon: 'shopping', tags: ['全聯超市', '日用雜貨', '網購蝦皮', '服飾鞋包', '3C配件', '家居好物'] },
    { id: 'c_fun', name: '娛樂休閒', color: '#CE5A62', icon: 'fun', tags: ['電影展覽', '門票樂園', '遊戲課金', '運動健身', 'KTV聚會', '扭蛋周邊'] },
    { id: 'c_telecom', name: '電信訂閱', color: '#4B96A4', icon: 'telecom', tags: ['手機電信費', '出國eSIM網卡', 'Netflix', 'YouTube/Spotify', 'iCloud/AI', '市話網路'] },
    { id: 'c_bills', name: '居家帳單', color: '#4377B8', icon: 'bills', tags: ['房租/房貸', '水電瓦斯', '管理費', '保險貸款', '稅金規費', '醫療看診'] },
    { id: 'c_travel_buy', name: '出國血拚', color: '#7E62A8', icon: 'travel_shop', tags: ['藥妝店', '伴手禮零食', '免稅店精品', '唐吉訶德', '電器百貨', '幫親友代買'] },
    { id: 'c_flight_stay', name: '機票住宿', color: '#4E6299', icon: 'stay_flight', tags: ['飯店住宿', '來回機票', '機場快線', '行李託運', '旅遊保險', '簽證護照'] }
  ];

  const DEFAULT_INCOME_CATS = [
    { id: 'i_salary', name: '薪資入帳', color: '#217A5D', icon: 'salary', tags: ['本月本薪', '加班津貼', '績效獎金'] },
    { id: 'i_bonus', name: '獎金紅包', color: '#D68934', icon: 'bonus', tags: ['年終獎金', '三節禮金', '發票中獎', '刷卡現金回饋'] },
    { id: 'i_invest', name: '投資股息', color: '#4377B8', icon: 'invest', tags: ['ETF配息', '股票價差', '定存利息'] },
    { id: 'i_side', name: '兼職接案', color: '#76A043', icon: 'shopping', tags: ['外包接案', '二手拍賣', '代購收入'] },
    { id: 'i_repay', name: '旅伴還款', color: '#4B96A4', icon: 'refund', tags: ['AA分帳收款', '代墊歸還', '公司報銷入帳'] },
    { id: 'i_fx_fund', name: '旅遊公積金', color: '#7E62A8', icon: 'travel_shop', tags: ['出國換匯入金', '旅伴公積金', '退稅現金'] }
  ];

  const TRANSFER_TILES = [
    { id: 'tr_atm', name: 'ATM提領現金', color: '#E56A36', icon: 'salary', fromId: 'acc_bank', toId: 'acc_cash', tags: ['ATM提款', '超商提款'] },
    { id: 'tr_card', name: '繳信用卡費', color: '#4377B8', icon: 'shopping', fromId: 'acc_bank', toId: 'acc_card', tags: ['繳清本期卡費', '自動扣繳卡費'] },
    { id: 'tr_fx', name: '外幣換匯提領', color: '#4B96A4', icon: 'transfer', fromId: 'acc_bank', toId: 'acc_fx_cash', tags: ['外幣ATM提領', '機場臨櫃換匯', '網銀換匯'] },
    { id: 'tr_topup', name: '儲值交通/電支', color: '#76A043', icon: 'transport', fromId: 'acc_cash', toId: 'acc_iccard', tags: ['悠遊卡加值', 'Suica西瓜卡儲值', '電支儲值'] },
    { id: 'tr_custom', name: '自訂帳戶互轉', color: '#6E675C', icon: 'transfer', fromId: 'acc_bank', toId: 'acc_linepay', tags: ['帳戶調度', '轉帳儲蓄'] }
  ];

  const DEFAULT_ACCOUNTS = [
    { id: 'acc_cash', name: '錢包現金', kind: 'asset', initBalance: 8000 },
    { id: 'acc_card', name: '信用卡', kind: 'credit', initBalance: 0 },
    { id: 'acc_linepay', name: 'LINE Pay / 電支', kind: 'asset', initBalance: 3500 },
    { id: 'acc_bank', name: '銀行存款', kind: 'asset', initBalance: 85000 },
    { id: 'acc_iccard', name: '悠遊卡 / Suica', kind: 'asset', initBalance: 1200 },
    { id: 'acc_fx_cash', name: '外幣現金袋', kind: 'asset', initBalance: 15000 }
  ];

  // ==================== STATE ====================
  let state = null;
  let ui = {
    activeView: 'home',
    historySub: 'list',
    gridMode: 'expense', // 'expense' | 'income' | 'transfer'
    historyFilter: 'all',
    selectedCalDate: todayStr(),
    calc: {
      open: false,
      editingTxId: null,
      mode: 'expense',
      catId: 'c_food',
      expr: '',
      currency: 'TWD',
      fxFee: false,
      note: '',
      selectedTag: '',
      accountId: 'acc_cash',
      fromAccId: 'acc_bank',
      toAccId: 'acc_cash',
      splitMode: 'none', // 'none' | 'aa2' | 'aa3' | 'aa4' | 'advance'
      buddy: '',
      invoice3: '',
      photoData: ''
    },
    undoAction: null,
    toastTimer: null
  };

  let audioCtx = null;

  function todayStr(offsetDays = 0) {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function currentYm() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // ==================== MECHANICAL KEYCAP SOUND & HAPTICS ====================
  function playTick(pitch = 680, duration = 0.016) {
    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }
    if (!state || !state.settings.soundOn) return;
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.11, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  // ==================== BUILD INITIAL / DEMO DATA ====================
  function buildSampleTransactions() {
    const t0 = todayStr(0);
    const t1 = todayStr(-1);
    const t2 = todayStr(-2);
    return [
      // Taiwan Daily Ledger samples
      {
        id: 'tx_demo_1', ledgerId: 'led_tw', type: 'expense', catId: 'c_food',
        date: t0, origAmount: 135, currency: 'TWD', rate: 1, fxFee: false, twdAmount: 135,
        note: '雞腿便當＋滷蛋', accountId: 'acc_linepay', splitMode: 'none', buddy: '', settled: false, receivableTwd: 0, invoice3: '168', photoData: ''
      },
      {
        id: 'tx_demo_2', ledgerId: 'led_tw', type: 'expense', catId: 'c_drink',
        date: t0, origAmount: 65, currency: 'TWD', rate: 1, fxFee: false, twdAmount: 65,
        note: '四季春珍波椰', accountId: 'acc_linepay', splitMode: 'none', buddy: '', settled: false, receivableTwd: 0, invoice3: '542', photoData: ''
      },
      {
        id: 'tx_demo_3', ledgerId: 'led_tw', type: 'expense', catId: 'c_trans',
        date: t1, origAmount: 1200, currency: 'TWD', rate: 1, fxFee: false, twdAmount: 1200,
        note: 'TPASS通勤月票', accountId: 'acc_card', splitMode: 'none', buddy: '', settled: false, receivableTwd: 0, invoice3: '', photoData: ''
      },
      {
        id: 'tx_demo_4', ledgerId: 'led_tw', type: 'expense', catId: 'c_bills',
        date: t2, origAmount: 1480, currency: 'TWD', rate: 1, fxFee: false, twdAmount: 1480,
        note: '水電瓦斯費', accountId: 'acc_bank', splitMode: 'aa2', buddy: '室友小傑', settled: false, receivableTwd: 740, invoice3: '892', photoData: ''
      },
      {
        id: 'tx_demo_5', ledgerId: 'led_tw', type: 'income', catId: 'i_salary',
        date: t2, origAmount: 58000, currency: 'TWD', rate: 1, fxFee: false, twdAmount: 58000,
        note: '本月薪資入帳', accountId: 'acc_bank', splitMode: 'none', buddy: '', settled: false, receivableTwd: 0, invoice3: '', photoData: ''
      },
      // Japan Travel Ledger samples (Ready for going abroad!)
      {
        id: 'tx_jp_1', ledgerId: 'led_jp', type: 'expense', catId: 'c_food',
        date: t0, origAmount: 3200, currency: 'JPY', rate: 0.214, fxFee: false, twdAmount: 685,
        note: '一蘭拉麵＋替玉', accountId: 'acc_fx_cash', splitMode: 'aa2', buddy: '旅伴阿明', settled: false, receivableTwd: 343, invoice3: '', photoData: ''
      },
      {
        id: 'tx_jp_2', ledgerId: 'led_jp', type: 'expense', catId: 'c_travel_buy',
        date: t0, origAmount: 5480, currency: 'JPY', rate: 0.214, fxFee: true, twdAmount: 1190,
        note: '松本清合利他命代買', accountId: 'acc_card', splitMode: 'advance', buddy: '旅伴阿明', settled: false, receivableTwd: 1190, invoice3: '', photoData: ''
      },
      {
        id: 'tx_jp_3', ledgerId: 'led_jp', type: 'expense', catId: 'c_trans',
        date: t1, origAmount: 2000, currency: 'JPY', rate: 0.214, fxFee: false, twdAmount: 428,
        note: 'Suica儲值', accountId: 'acc_iccard', splitMode: 'none', buddy: '', settled: false, receivableTwd: 0, invoice3: '', photoData: ''
      }
    ];
  }

  function buildZeroedAccounts(currency = 'TWD') {
    if (currency !== 'TWD') {
      return [
        { id: 'acc_fx_cash', name: '外幣現金袋', kind: 'asset', initBalance: 0 },
        { id: 'acc_card', name: '信用卡', kind: 'credit', initBalance: 0 },
        { id: 'acc_iccard', name: '交通卡 / Suica', kind: 'asset', initBalance: 0 },
        { id: 'acc_bank', name: '銀行存款', kind: 'asset', initBalance: 0 }
      ];
    }
    return [
      { id: 'acc_cash', name: '錢包現金', kind: 'asset', initBalance: 0 },
      { id: 'acc_card', name: '信用卡', kind: 'credit', initBalance: 0 },
      { id: 'acc_linepay', name: 'LINE Pay / 電支', kind: 'asset', initBalance: 0 },
      { id: 'acc_bank', name: '銀行存款', kind: 'asset', initBalance: 0 },
      { id: 'acc_iccard', name: '悠遊卡 / 交通卡', kind: 'asset', initBalance: 0 }
    ];
  }

  function ensurePerLedgerAccounts(targetState) {
    if (!targetState || !Array.isArray(targetState.ledgers)) return;
    const legacyTwAccounts = Array.isArray(targetState.accounts) && targetState.accounts.length
      ? targetState.accounts
      : DEFAULT_ACCOUNTS;

    targetState.ledgers.forEach(l => {
      if (!Array.isArray(l.accounts) || l.accounts.length === 0) {
        if (l.id === 'led_tw') {
          l.accounts = JSON.parse(JSON.stringify(legacyTwAccounts));
        } else {
          // Every project / travel ledger starts cleanly with $0 accounts!
          l.accounts = buildZeroedAccounts(l.defaultCurrency || 'TWD');
        }
      }
    });
  }

  function getDefaultState() {
    const rates = {};
    Object.keys(CURRENCIES).forEach(k => { rates[k] = CURRENCIES[k].rateToTwd; });
    const s = {
      version: 2,
      settings: {
        skin: 'braun',
        gridCols: 3, // 3 = 九宮格 3x3, 2 = 超大按鈕 2x2
        soundOn: true,
        activeLedgerId: 'led_tw',
        activeYm: currentYm(),
        winningInvoiceCodes: ['809', '542', '168', '991', '307'],
        rates,
        customLockedRates: {},
        lastRateSync: null
      },
      ledgers: [
        { id: 'led_tw', name: '🇹🇼 台灣日常帳本', defaultCurrency: 'TWD', budgetTwd: 25000, accounts: JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS)) },
        { id: 'led_jp', name: '🇯🇵 日本東京旅帳', defaultCurrency: 'JPY', budgetTwd: 45000, accounts: buildZeroedAccounts('JPY') },
        { id: 'led_kr', name: '🇰🇷 韓國首爾旅帳', defaultCurrency: 'KRW', budgetTwd: 35000, accounts: buildZeroedAccounts('KRW') }
      ],
      expenseCats: JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATS)),
      incomeCats: JSON.parse(JSON.stringify(DEFAULT_INCOME_CATS)),
      presets: [
        { id: 'p1', title: '超商冰拿鐵', catId: 'c_drink', amount: 55, currency: 'TWD', accountId: 'acc_linepay' },
        { id: 'p2', title: '美味早餐', catId: 'c_food', amount: 75, currency: 'TWD', accountId: 'acc_cash' },
        { id: 'p3', title: '商業午餐便當', catId: 'c_food', amount: 120, currency: 'TWD', accountId: 'acc_linepay' },
        { id: 'p4', title: '手搖珍珠奶茶', catId: 'c_drink', amount: 65, currency: 'TWD', accountId: 'acc_linepay' },
        { id: 'p5', title: '捷運公車通勤', catId: 'c_trans', amount: 35, currency: 'TWD', accountId: 'acc_iccard' },
        { id: 'p6', title: '日本超商宵夜', catId: 'c_food', amount: 680, currency: 'JPY', accountId: 'acc_fx_cash' }
      ],
      recurring: [
        { id: 'r1', title: '手機5G電信費', catId: 'c_telecom', amount: 599, accountId: 'acc_card', postedYms: [] },
        { id: 'r2', title: 'Netflix / 串流訂閱', catId: 'c_telecom', amount: 390, accountId: 'acc_card', postedYms: [] },
        { id: 'r3', title: '房租／管理費', catId: 'c_bills', amount: 12500, accountId: 'acc_bank', postedYms: [] }
      ],
      transactions: buildSampleTransactions()
    };
    ensurePerLedgerAccounts(s);
    return s;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(BACKUP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const def = getDefaultState();
        state = Object.assign(def, parsed);
        state.settings = Object.assign(def.settings, parsed.settings || {});
        state.settings.rates = Object.assign(def.settings.rates, (parsed.settings && parsed.settings.rates) || {});
        ensurePerLedgerAccounts(state);
        saveState();
        return;
      }
    } catch (e) {
      console.warn('State load fallback:', e);
    }
    state = getDefaultState();
    saveState();
  }

  function saveState() {
    try {
      const json = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(BACKUP_KEY, json);
    } catch (e) {
      showToast('儲存空間已滿，建議匯出備份並清理收據照片');
    }
  }

  // ==================== LIVE EXCHANGE RATE SYNC (SILENT + OFFLINE SAFE) ====================
  async function syncLiveRates(manualNotify = false) {
    try {
      const resp = await fetch('https://open.er-api.com/v6/latest/TWD', { cache: 'no-store' });
      if (!resp.ok) throw new Error('Network status ' + resp.status);
      const data = await resp.json();
      if (data && data.rates) {
        Object.keys(CURRENCIES).forEach(code => {
          if (code === 'TWD') {
            state.settings.rates.TWD = 1;
          } else if (data.rates[code] && !state.settings.customLockedRates[code]) {
            const inv = 1 / data.rates[code];
            state.settings.rates[code] = Number(inv.toPrecision(4));
          }
        });
        state.settings.lastRateSync = new Date().toLocaleString('zh-TW', { hour12: false });
        saveState();
        if (ui.calc.open) updateCalcDisplay();
        if (manualNotify) showToast('已更新全球即時匯率！');
      }
    } catch (_) {
      if (manualNotify) showToast('目前離線中，已自動使用內建快取匯率');
    }
  }

  // ==================== HELPERS ====================
  function getActiveLedger() {
    return state.ledgers.find(l => l.id === state.settings.activeLedgerId) || state.ledgers[0];
  }

  function getCategoryById(catId) {
    return (
      state.expenseCats.find(c => c.id === catId) ||
      state.incomeCats.find(c => c.id === catId) ||
      TRANSFER_TILES.find(c => c.id === catId) ||
      { id: catId, name: '未分類', color: '#7A7267', icon: 'star_box', tags: [] }
    );
  }

  function getActiveAccounts() {
    const ledger = getActiveLedger();
    if (!Array.isArray(ledger.accounts) || ledger.accounts.length === 0) {
      ledger.accounts = buildZeroedAccounts(ledger.defaultCurrency || 'TWD');
    }
    return ledger.accounts;
  }

  function getAccountById(accId, ledgerId = null) {
    const targetLedger = ledgerId ? (state.ledgers.find(l => l.id === ledgerId) || getActiveLedger()) : getActiveLedger();
    const list = (targetLedger && Array.isArray(targetLedger.accounts) && targetLedger.accounts.length)
      ? targetLedger.accounts
      : getActiveAccounts();
    return list.find(a => a.id === accId) || list[0] || { id: 'acc_cash', name: '現金', kind: 'asset', initBalance: 0 };
  }

  function getSvg(iconKey) {
    return ICONS[iconKey] || ICONS.star_box;
  }

  function fmtNum(n) {
    const val = Math.round(Number(n) || 0);
    return val.toLocaleString('en-US');
  }

  function fmtOrigCurrency(amount, code) {
    const meta = CURRENCIES[code] || { symbol: code + ' ' };
    const rounded = (code === 'USD' || code === 'EUR' || code === 'SGD')
      ? Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2 })
      : Math.round(Number(amount)).toLocaleString('en-US');
    return `${meta.symbol}${rounded}`;
  }

  function getLedgerMonthTxs(ledgerId = state.settings.activeLedgerId, ym = state.settings.activeYm) {
    return state.transactions.filter(tx => tx.ledgerId === ledgerId && tx.date && tx.date.startsWith(ym));
  }

  // ==================== SAFE ARITHMETIC EVALUATOR ====================
  function evaluateMathExpr(exprStr) {
    if (!exprStr) return 0;
    const cleaned = String(exprStr).replace(/[^0-9.+\-*/]/g, '').replace(/[+\-*/.]+$/, '');
    if (!cleaned) return 0;
    const tokens = cleaned.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g);
    if (!tokens || !tokens.length) return 0;

    // Pass 1: * and /
    const stack = [];
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if ((t === '*' || t === '/') && stack.length > 0 && i + 1 < tokens.length) {
        const prev = parseFloat(stack.pop()) || 0;
        const next = parseFloat(tokens[i + 1]) || 0;
        const res = t === '*' ? prev * next : (next === 0 ? 0 : prev / next);
        stack.push(res);
        i += 2;
      } else {
        stack.push(t);
        i += 1;
      }
    }

    // Pass 2: + and -
    let total = parseFloat(stack[0]) || 0;
    let j = 1;
    while (j < stack.length) {
      const op = stack[j];
      const val = parseFloat(stack[j + 1]) || 0;
      if (op === '+') total += val;
      if (op === '-') total -= val;
      j += 2;
    }
    return Math.max(0, Number.isFinite(total) ? total : 0);
  }

  function hasOperator(exprStr) {
    return /[+\-*/]/.test(String(exprStr).slice(1));
  }

  // ==================== SKIN & SOUND & DENSITY CONTROLS ====================
  function applySkin() {
    const skin = state.settings.skin || 'braun';
    document.documentElement.setAttribute('data-skin', skin);
    const meta = document.getElementById('metaThemeColor');
    if (meta) {
      meta.setAttribute('content', skin === 'opdark' ? '#161614' : (skin === 'taiwan' ? '#F2EBDD' : '#ECE8DF'));
    }
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.style.opacity = state.settings.soundOn ? '1' : '0.45';
    }
  }

  function cycleSkin() {
    playTick(760);
    const order = ['braun', 'opdark', 'taiwan'];
    const names = { braun: '暖石和紙（百靈經典）', opdark: '消光墨黑（機械限定）', taiwan: '台灣感性（郵政海棠綠）' };
    const idx = order.indexOf(state.settings.skin);
    state.settings.skin = order[(idx + 1) % order.length];
    saveState();
    applySkin();
    showToast(`外觀已切換：${names[state.settings.skin]}`);
  }

  function toggleSound() {
    state.settings.soundOn = !state.settings.soundOn;
    saveState();
    applySkin();
    if (state.settings.soundOn) playTick(820);
    showToast(state.settings.soundOn ? '機械按鍵音效：已開啟' : '機械按鍵音效：已靜音');
  }

  function toggleGridDensity() {
    playTick(700);
    state.settings.gridCols = state.settings.gridCols === 3 ? 2 : 3;
    saveState();
    renderHomeGrid();
    showToast(state.settings.gridCols === 2 ? '已切換：2×2 超大傻瓜按鈕模式' : '已切換：3×3 經典九宮格模式');
  }

  function setGridMode(mode) {
    playTick(720);
    ui.gridMode = mode;
    document.querySelectorAll('.rocker-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === mode);
    });
    renderHomeGrid();
  }

  function shiftMonth(delta) {
    playTick(650);
    const [y, m] = state.settings.activeYm.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    state.settings.activeYm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    ui.selectedCalDate = `${state.settings.activeYm}-01`;
    saveState();
    renderAll();
  }

  // ==================== RENDER LCD SUMMARY & HOME 9-GRID ====================
  function renderTopSummary() {
    const ledger = getActiveLedger();
    document.getElementById('activeLedgerName').textContent = ledger.name;
    document.getElementById('activeLedgerCurrency').textContent = ledger.defaultCurrency;

    const [yy, mm] = state.settings.activeYm.split('-');
    document.getElementById('currentMonthText').textContent = `${yy} / ${mm}月`;
    document.getElementById('winningCodesInput').value = (state.settings.winningInvoiceCodes || []).join(', ');

    const monthTxs = getLedgerMonthTxs();
    let totalExp = 0;
    let totalInc = 0;
    monthTxs.forEach(tx => {
      if (tx.type === 'expense') totalExp += tx.twdAmount;
      if (tx.type === 'income') totalInc += tx.twdAmount;
    });

    document.getElementById('lcdMainLabel').textContent =
      ledger.defaultCurrency === 'TWD' ? '本月總支出 (TWD)' : `本帳本支出折合台幣 (預設 ${ledger.defaultCurrency})`;
    document.getElementById('lcdMonthExpense').textContent = `NT$ ${fmtNum(totalExp)}`;
    document.getElementById('lcdMonthIncome').textContent = `收入 +$${fmtNum(totalInc)}`;
    const bal = totalInc - totalExp;
    document.getElementById('lcdMonthBalance').textContent = `結餘 ${bal >= 0 ? '' : '-'}$${fmtNum(Math.abs(bal))}`;
    document.getElementById('homeRecordCountBadge').textContent = String(monthTxs.length);

    // Budget Fuel Gauge + Safe Daily Spend
    const budget = Number(ledger.budgetTwd) || 0;
    const fillEl = document.getElementById('budgetFuelFill');
    const textEl = document.getElementById('budgetFuelText');
    const safeEl = document.getElementById('safeDailyText');

    if (budget > 0) {
      const pct = Math.min(100, Math.round((totalExp / budget) * 100));
      fillEl.style.width = `${pct}%`;
      fillEl.className = 'budget-fuel-fill' + (pct >= 100 ? ' over' : pct >= 80 ? ' warn' : '');
      const remain = budget - totalExp;
      textEl.textContent = remain >= 0 ? `預算剩 $${fmtNum(remain)} (${pct}%)` : `超支 $${fmtNum(Math.abs(remain))}!`;

      // Days left in active month
      const now = new Date();
      const [ay, am] = state.settings.activeYm.split('-').map(Number);
      const lastDay = new Date(ay, am, 0).getDate();
      let daysLeft = lastDay;
      if (now.getFullYear() === ay && now.getMonth() + 1 === am) {
        daysLeft = Math.max(1, lastDay - now.getDate() + 1);
      }
      const safePerDay = Math.max(0, Math.floor(remain / daysLeft));
      safeEl.textContent = remain >= 0 ? `今日可花 $${fmtNum(safePerDay)}` : `已超支 ✎`;
    } else {
      fillEl.style.width = '0%';
      textEl.textContent = '點擊設定預算 ✎';
      safeEl.textContent = '設定月預算 ✎';
    }

    // Live Net Worth & Default Payment Account Balance right on Home LCD (Scoped to Active Ledger!)
    const activeAccounts = getActiveAccounts();
    const balances = computeAccountBalances();
    let netWorth = 0;
    let totalCardDebt = 0;
    activeAccounts.forEach(a => {
      const b = balances[a.id] || 0;
      netWorth += b;
      if (a.kind === 'credit' && b < 0) totalCardDebt += Math.abs(b);
    });
    const fallbackAccId = (activeAccounts[0] && activeAccounts[0].id) || 'acc_cash';
    const prefAccId = (state.settings.lastAccountId && activeAccounts.some(a => a.id === state.settings.lastAccountId))
      ? state.settings.lastAccountId
      : fallbackAccId;
    const prefAcc = getAccountById(prefAccId);
    const prefBal = balances[prefAcc.id] || 0;

    const nwEl = document.getElementById('lcdLiveNetWorth');
    const qaEl = document.getElementById('lcdLiveQuickAcc');
    if (nwEl) nwEl.textContent = `淨資產 ${netWorth < 0 ? '-' : ''}NT$${fmtNum(Math.abs(netWorth))}`;
    if (qaEl) {
      const cardPart = totalCardDebt > 0 ? `｜待繳卡費 -$${fmtNum(totalCardDebt)}` : '';
      qaEl.textContent = `${prefAcc.name} ${prefBal < 0 ? '-' : ''}$${fmtNum(Math.abs(prefBal))}${cardPart} ›`;
    }
  }

  function renderHomeGrid() {
    const gridEl = document.getElementById('categoryGrid');
    const is2Col = state.settings.gridCols === 2;
    gridEl.classList.toggle('grid-2col', is2Col);
    document.getElementById('gridDensityLabel').textContent = is2Col ? '九宮格 3×3' : '大格 2×2';

    const monthTxs = getLedgerMonthTxs();
    const catTotals = {};
    monthTxs.forEach(tx => {
      if (tx.type === ui.gridMode) {
        catTotals[tx.catId] = (catTotals[tx.catId] || 0) + tx.twdAmount;
      }
    });

    let items = [];
    if (ui.gridMode === 'expense') items = state.expenseCats;
    else if (ui.gridMode === 'income') items = state.incomeCats;
    else items = TRANSFER_TILES;

    gridEl.innerHTML = items.map(cat => {
      const sub = catTotals[cat.id] || 0;
      const subText = ui.gridMode === 'transfer'
        ? '點擊互轉'
        : (sub > 0 ? `$${fmtNum(sub)}` : '點一下記帳');
      return `
        <button type="button" class="cat-tile" onclick="HaojiApp.openCalcForTile('${cat.id}')">
          <div class="cat-medallion" style="background:${cat.color};">
            ${getSvg(cat.icon)}
          </div>
          <div class="cat-title">${escapeHtml(cat.name)}</div>
          <div class="cat-subtotal num-mono ${sub > 0 ? 'has-val' : ''}">${subText}</div>
        </button>
      `;
    }).join('');
  }

  // ==================== HARDWARE CALCULATOR SHEET ====================
  function openCalcForTile(catId, customDate = null) {
    playTick(780, 0.02);
    const ledger = getActiveLedger();
    const mode = ui.gridMode;
    const cat = getCategoryById(catId);

    const activeAccounts = getActiveAccounts();
    const firstAccId = (activeAccounts[0] && activeAccounts[0].id) || 'acc_cash';
    const secondAccId = (activeAccounts[1] && activeAccounts[1].id) || firstAccId;
    const defaultAcc = (state.settings.lastAccountId && activeAccounts.some(a => a.id === state.settings.lastAccountId))
      ? state.settings.lastAccountId
      : firstAccId;

    ui.calc = {
      open: true,
      editingTxId: null,
      mode,
      catId,
      expr: '',
      currency: mode === 'transfer' ? 'TWD' : ledger.defaultCurrency,
      fxFee: false,
      note: '',
      selectedTag: '',
      accountId: defaultAcc,
      fromAccId: activeAccounts.some(a => a.id === cat.fromId) ? cat.fromId : firstAccId,
      toAccId: activeAccounts.some(a => a.id === cat.toId) ? cat.toId : secondAccId,
      splitMode: 'none',
      buddy: '',
      invoice3: '',
      photoData: ''
    };

    document.getElementById('calcDateInput').value = customDate || todayStr();
    document.getElementById('calcNoteInput').value = '';
    document.getElementById('splitBuddyInput').value = '';
    document.getElementById('calcInvoiceInput').value = '';
    document.getElementById('calcPhotoPreview').style.display = 'none';
    document.getElementById('calcPhotoRemoveBtn').style.display = 'none';
    document.getElementById('calcDeleteBtn').style.display = 'none';
    document.getElementById('calcSplitPanel').classList.remove('show');

    populateCalcSheetUI();
    document.getElementById('calcBackdrop').classList.add('open');
    document.getElementById('calcSheet').classList.add('open');
    if (document.body && document.body.classList) document.body.classList.add('sheet-locked');
  }

  function openCalcToEdit(txId) {
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;
    playTick(740);

    ui.calc = {
      open: true,
      editingTxId: tx.id,
      mode: tx.type,
      catId: tx.catId,
      expr: String(tx.origAmount),
      currency: tx.currency || 'TWD',
      fxFee: !!tx.fxFee,
      note: tx.note || '',
      selectedTag: tx.note || '',
      accountId: tx.accountId || 'acc_cash',
      fromAccId: tx.fromAccId || 'acc_bank',
      toAccId: tx.toAccId || 'acc_cash',
      splitMode: tx.splitMode || 'none',
      buddy: tx.buddy || '',
      invoice3: tx.invoice3 || '',
      photoData: tx.photoData || ''
    };

    document.getElementById('calcDateInput').value = tx.date || todayStr();
    document.getElementById('calcNoteInput').value = tx.note || '';
    document.getElementById('splitBuddyInput').value = tx.buddy || '';
    document.getElementById('calcInvoiceInput').value = tx.invoice3 || '';
    const imgEl = document.getElementById('calcPhotoPreview');
    const rmPhotoBtn = document.getElementById('calcPhotoRemoveBtn');
    if (tx.photoData) {
      imgEl.src = tx.photoData;
      imgEl.style.display = 'inline-block';
      rmPhotoBtn.style.display = 'inline-flex';
    } else {
      imgEl.style.display = 'none';
      rmPhotoBtn.style.display = 'none';
    }
    document.getElementById('calcDeleteBtn').style.display = 'inline-flex';
    document.getElementById('calcSplitPanel').classList.toggle('show', tx.splitMode && tx.splitMode !== 'none');

    populateCalcSheetUI();
    document.getElementById('calcBackdrop').classList.add('open');
    document.getElementById('calcSheet').classList.add('open');
    if (document.body && document.body.classList) document.body.classList.add('sheet-locked');
  }

  function populateCalcSheetUI() {
    const cat = getCategoryById(ui.calc.catId);
    const dot = document.getElementById('calcCatDot');
    dot.style.background = cat.color;
    dot.innerHTML = getSvg(cat.icon);
    document.getElementById('calcCatName').textContent = cat.name;
    document.getElementById('calcCurrencySelect').value = ui.calc.currency;

    // Transfer vs Expense/Income rows
    const isTransfer = ui.calc.mode === 'transfer';
    document.getElementById('transferAccountRow').style.display = isTransfer ? 'flex' : 'none';
    document.getElementById('calcAccountStrip').style.display = isTransfer ? 'none' : 'flex';
    document.getElementById('calcSplitToggleBtn').style.display = ui.calc.mode === 'expense' ? 'inline-flex' : 'none';

    if (isTransfer) {
      const opts = getActiveAccounts().map(a => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('');
      const fromSel = document.getElementById('transferFromSelect');
      const toSel = document.getElementById('transferToSelect');
      fromSel.innerHTML = opts;
      toSel.innerHTML = opts;
      fromSel.value = ui.calc.fromAccId;
      toSel.value = ui.calc.toAccId;
      fromSel.onchange = () => { ui.calc.fromAccId = fromSel.value; };
      toSel.onchange = () => { ui.calc.toAccId = toSel.value; };
    } else {
      renderCalcAccountPills();
    }

    renderCalcQuickTags(cat);
    renderSavedBuddyChips();
    syncSplitButtons();
    updateCalcDisplay();
  }

  function cycleCalcCategory() {
    playTick(740);
    const list = ui.calc.mode === 'income'
      ? state.incomeCats
      : (ui.calc.mode === 'transfer' ? TRANSFER_TILES : state.expenseCats);
    if (!list.length) return;
    const idx = list.findIndex(c => c.id === ui.calc.catId);
    const next = list[(idx + 1) % list.length];
    ui.calc.catId = next.id;
    populateCalcSheetUI();
  }

  function renderCalcQuickTags(cat) {
    const strip = document.getElementById('calcQuickTags');
    const tags = cat.tags || [];
    strip.innerHTML = tags.map(tag => `
      <button type="button" class="subtag-chip ${ui.calc.selectedTag === tag ? 'selected' : ''}" onclick="HaojiApp.pickQuickTag('${escapeAttr(tag)}')">
        ${escapeHtml(tag)}
      </button>
    `).join('') + `<button type="button" class="subtag-chip" style="border-style:dashed;color:var(--ink-muted);" onclick="HaojiApp.addQuickTagToCat()">＋常用詞</button>`;
  }

  function pickQuickTag(tag) {
    playTick(760);
    const noteEl = document.getElementById('calcNoteInput');
    if (ui.calc.selectedTag === tag) {
      ui.calc.selectedTag = '';
      if (noteEl.value === tag) noteEl.value = '';
    } else {
      ui.calc.selectedTag = tag;
      noteEl.value = tag;
    }
    renderCalcQuickTags(getCategoryById(ui.calc.catId));
  }

  function addQuickTagToCat() {
    const word = prompt('新增此分類的免打字常用詞（例如：鼎泰豐、高鐵票、松本清）：');
    if (!word || !word.trim()) return;
    const clean = word.trim();
    const cat = state.expenseCats.find(c => c.id === ui.calc.catId) || state.incomeCats.find(c => c.id === ui.calc.catId);
    if (cat) {
      if (!cat.tags.includes(clean)) cat.tags.unshift(clean);
      saveState();
      pickQuickTag(clean);
    }
  }

  function renderCalcAccountPills() {
    const strip = document.getElementById('calcAccountStrip');
    const balances = computeAccountBalances();
    strip.innerHTML = getActiveAccounts().map(acc => {
      const bal = balances[acc.id] || 0;
      const balTag = acc.kind === 'credit'
        ? (bal < 0 ? ` (待繳$${fmtNum(Math.abs(bal))})` : ' ($0)')
        : ` (${bal < 0 ? '-' : ''}$${fmtNum(Math.abs(bal))})`;
      return `
        <button type="button" class="pay-pill num-mono ${ui.calc.accountId === acc.id ? 'active' : ''}" onclick="HaojiApp.selectCalcAccount('${acc.id}')">
          ${escapeHtml(acc.name)}${balTag}
        </button>
      `;
    }).join('');
  }

  function selectCalcAccount(accId) {
    playTick(700);
    ui.calc.accountId = accId;
    if (accId === 'acc_card' && ui.calc.currency !== 'TWD') {
      ui.calc.fxFee = true;
    }
    renderCalcAccountPills();
    updateCalcDisplay();
  }

  function toggleSplitPanel() {
    playTick(680);
    const panel = document.getElementById('calcSplitPanel');
    const willOpen = !panel.classList.contains('show');
    panel.classList.toggle('show', willOpen);
    if (willOpen && ui.calc.splitMode === 'none') {
      // Auto-select AA平分÷2 on first open for 1-tap convenience!
      ui.calc.splitMode = 'aa2';
      syncSplitButtons();
    }
  }

  function setSplitMode(mode) {
    playTick(720);
    ui.calc.splitMode = mode;
    syncSplitButtons();
  }

  function promptCustomSplit() {
    const val = prompt('輸入平分總人數（例如 5 人平分請輸入 5）：', '5');
    if (val === null) return;
    const n = parseInt(val, 10);
    if (n >= 2 && n <= 30) {
      playTick(740);
      ui.calc.splitMode = `aa${n}`;
      syncSplitButtons();
    } else {
      showToast('請輸入 2～30 之間的人數');
    }
  }

  function renderSavedBuddyChips() {
    const box = document.getElementById('savedBuddyChips');
    if (!box) return;
    const names = [...new Set(state.transactions.map(t => (t.buddy || '').trim()).filter(Boolean))].slice(0, 6);
    if (!names.length) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML = names.map(n => `
      <button type="button" class="mini-pill" onclick="HaojiApp.pickBuddyChip('${escapeAttr(n)}')">👤 ${escapeHtml(n)}</button>
    `).join('');
  }

  function pickBuddyChip(name) {
    playTick(700);
    document.getElementById('splitBuddyInput').value = name;
  }

  function syncSplitButtons() {
    const mode = ui.calc.splitMode || 'none';
    const isCustomAA = /^aa(\d+)$/.test(mode) && !['aa2', 'aa3', 'aa4'].includes(mode);
    document.querySelectorAll('#calcSplitPanel .mini-pill[data-split]').forEach(btn => {
      if (btn.dataset.split === 'aacustom') {
        btn.classList.toggle('active', isCustomAA);
        btn.textContent = isCustomAA ? `平分÷${mode.slice(2)}` : '自訂÷N';
      } else {
        btn.classList.toggle('active', btn.dataset.split === mode);
      }
    });
    const toggleBtn = document.getElementById('calcSplitToggleBtn');
    const txtSpan = document.getElementById('calcSplitBtnText');
    let label = '平分・代墊';
    if (mode === 'advance') label = '代買100%';
    else if (/^aa(\d+)$/.test(mode)) label = `平分÷${mode.slice(2)}`;
    if (txtSpan) txtSpan.textContent = label;
    else toggleBtn.textContent = label;
    toggleBtn.classList.toggle('active', mode !== 'none');
  }

  function setCalcYesterday() {
    playTick(660);
    document.getElementById('calcDateInput').value = todayStr(-1);
    showToast('日期已切換為昨天');
  }

  function onCalcCurrencyChange() {
    playTick(700);
    ui.calc.currency = document.getElementById('calcCurrencySelect').value;
    if (ui.calc.currency !== 'TWD' && ui.calc.accountId === 'acc_card') {
      ui.calc.fxFee = true;
    } else if (ui.calc.currency === 'TWD') {
      ui.calc.fxFee = false;
    }
    updateCalcDisplay();
  }

  function toggleFxFee() {
    playTick(720);
    ui.calc.fxFee = !ui.calc.fxFee;
    updateCalcDisplay();
  }

  function promptCustomRate() {
    const code = ui.calc.currency;
    if (code === 'TWD') return;
    const cur = state.settings.rates[code] || CURRENCIES[code].rateToTwd;
    const input = prompt(`設定 1 ${code} 兌換多少台幣 (TWD)：\n（留空可恢復自動即時匯率）`, String(cur));
    if (input === null) return;
    if (input.trim() === '') {
      delete state.settings.customLockedRates[code];
      syncLiveRates(true);
    } else {
      const val = parseFloat(input);
      if (val > 0) {
        state.settings.rates[code] = val;
        state.settings.customLockedRates[code] = true;
        saveState();
        showToast(`已鎖定匯率：1 ${code} = ${val} TWD`);
      }
    }
    updateCalcDisplay();
  }

  function pressKey(key) {
    playTick(key === '+' || key === '-' || key === '*' || key === '/' ? 610 : 730);
    let expr = ui.calc.expr;

    if (key === 'CLEAR') {
      ui.calc.expr = '';
    } else if (key === 'BACK') {
      ui.calc.expr = expr.slice(0, -1);
    } else if (['+', '-', '*', '/'].includes(key)) {
      if (!expr) return;
      if (/[+\-*/]$/.test(expr)) {
        ui.calc.expr = expr.slice(0, -1) + key;
      } else {
        ui.calc.expr = expr + key;
      }
    } else if (key === '.') {
      const parts = expr.split(/[+\-*/]/);
      const last = parts[parts.length - 1];
      if (!last.includes('.')) {
        ui.calc.expr = (expr === '' ? '0' : expr) + '.';
      }
    } else {
      // Digit 0-9
      if (expr === '0') ui.calc.expr = key;
      else if (expr.length < 18) ui.calc.expr = expr + key;
    }
    updateCalcDisplay();
  }

  function updateCalcDisplay() {
    const expr = ui.calc.expr;
    const val = evaluateMathExpr(expr);
    const code = ui.calc.currency;
    const sym = (CURRENCIES[code] && CURRENCIES[code].symbol) || '';

    const prettyExpr = expr
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' − ');

    const isCompound = hasOperator(expr);
    document.getElementById('calcExprPreview').textContent = isCompound ? `${prettyExpr} =` : '';
    document.getElementById('calcDigitsDisplay').textContent = expr
      ? (isCompound ? `${sym}${fmtDecimal(val)}` : `${sym}${prettyExpr}`)
      : `${sym}0`;

    // FX Live Bar
    const fxBar = document.getElementById('calcFxBar');
    if (code !== 'TWD') {
      fxBar.style.display = 'flex';
      const rate = state.settings.rates[code] || CURRENCIES[code].rateToTwd;
      const feeFactor = ui.calc.fxFee ? 1.015 : 1;
      const twdVal = Math.round(val * rate * feeFactor);
      document.getElementById('calcFxRateLabel').textContent = `1 ${code} = ${rate} TWD`;
      document.getElementById('fxFeeBtn').classList.toggle('active', ui.calc.fxFee);
      document.getElementById('calcTwdConverted').textContent = `≈ NT$ ${fmtNum(twdVal)}`;
    } else {
      fxBar.style.display = 'none';
    }

    // Submit Button Label
    const submitLbl = document.getElementById('calcSubmitLabel');
    if (ui.calc.editingTxId) {
      submitLbl.textContent = '儲存修改';
    } else if (ui.calc.mode === 'transfer') {
      submitLbl.textContent = '確認轉帳／換匯';
    } else if (ui.calc.mode === 'income') {
      submitLbl.textContent = '完成收入記帳';
    } else {
      submitLbl.textContent = '完成記帳';
    }
  }

  function fmtDecimal(n) {
    if (!Number.isFinite(n)) return '0';
    return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  function closeCalcSheet() {
    ui.calc.open = false;
    document.getElementById('calcBackdrop').classList.remove('open');
    document.getElementById('calcSheet').classList.remove('open');
    if (document.body && document.body.classList && !document.getElementById('universalModal').classList.contains('open')) {
      document.body.classList.remove('sheet-locked');
    }
  }

  // ==================== RECEIPT PHOTO COMPRESSION ====================
  function handleReceiptPhoto(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 460;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.68);
        ui.calc.photoData = compressed;
        const preview = document.getElementById('calcPhotoPreview');
        preview.src = compressed;
        preview.style.display = 'inline-block';
        document.getElementById('calcPhotoRemoveBtn').style.display = 'inline-flex';
        showToast('已附加收據縮圖（點照片可放大檢視）');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function previewReceiptPhoto() {
    if (!ui.calc.photoData) return;
    openModalWithHtml(`
      <div class="sheet-grabber"></div>
      <div class="section-header">
        <div class="section-title">📷 收據照片檢視</div>
        <button type="button" class="close-sheet-btn" onclick="HaojiApp.closeModal()">✕</button>
      </div>
      <div style="text-align:center;">
        <img src="${ui.calc.photoData}" alt="收據大圖" style="max-width:100%;border-radius:14px;border:1.5px solid var(--border-ink);" />
      </div>
    `);
  }

  function clearReceiptPhoto() {
    ui.calc.photoData = '';
    document.getElementById('calcPhotoPreview').style.display = 'none';
    document.getElementById('calcPhotoRemoveBtn').style.display = 'none';
    showToast('已移除收據照片');
  }

  // ==================== SUBMIT / SAVE / DELETE TRANSACTION ====================
  function submitCalc() {
    const origAmount = evaluateMathExpr(ui.calc.expr);
    if (origAmount <= 0) {
      playTick(240, 0.05);
      showToast('請先輸入大於 0 的金額！');
      return;
    }

    playTick(920, 0.03);
    const code = ui.calc.currency;
    const rate = code === 'TWD' ? 1 : (state.settings.rates[code] || CURRENCIES[code].rateToTwd);
    const feeFactor = (code !== 'TWD' && ui.calc.fxFee) ? 1.015 : 1;
    const twdAmount = Math.max(1, Math.round(origAmount * rate * feeFactor));

    const dateVal = document.getElementById('calcDateInput').value || todayStr();
    const cat = getCategoryById(ui.calc.catId);
    const noteVal = document.getElementById('calcNoteInput').value.trim() || cat.name;
    const buddyVal = document.getElementById('splitBuddyInput').value.trim() || '旅伴朋友';
    const invVal = document.getElementById('calcInvoiceInput').value.trim();

    let receivableTwd = 0;
    if (ui.calc.mode === 'expense' && ui.calc.splitMode !== 'none') {
      const aaMatch = /^aa(\d+)$/.exec(ui.calc.splitMode);
      if (aaMatch) {
        const n = Math.max(2, parseInt(aaMatch[1], 10));
        receivableTwd = Math.round((twdAmount * (n - 1)) / n);
      } else if (ui.calc.splitMode === 'advance') {
        receivableTwd = twdAmount;
      }
    }

    if (ui.calc.mode === 'transfer' && ui.calc.fromAccId === ui.calc.toAccId) {
      showToast('轉出與轉入帳戶不能相同喔！');
      return;
    }

    const record = {
      id: ui.calc.editingTxId || ('tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
      ledgerId: state.settings.activeLedgerId,
      type: ui.calc.mode,
      catId: ui.calc.catId,
      date: dateVal,
      origAmount: Number(origAmount.toFixed(2)),
      currency: code,
      rate,
      fxFee: ui.calc.fxFee,
      twdAmount,
      note: noteVal,
      accountId: ui.calc.accountId,
      fromAccId: ui.calc.mode === 'transfer' ? ui.calc.fromAccId : undefined,
      toAccId: ui.calc.mode === 'transfer' ? ui.calc.toAccId : undefined,
      splitMode: ui.calc.mode === 'expense' ? ui.calc.splitMode : 'none',
      buddy: (ui.calc.mode === 'expense' && ui.calc.splitMode !== 'none') ? buddyVal : '',
      settled: false,
      receivableTwd,
      invoice3: invVal,
      photoData: ui.calc.photoData
    };

    if (ui.calc.mode !== 'transfer') {
      state.settings.lastAccountId = ui.calc.accountId;
    }

    if (ui.calc.editingTxId) {
      const idx = state.transactions.findIndex(t => t.id === ui.calc.editingTxId);
      if (idx >= 0) {
        record.settled = state.transactions[idx].settled;
        state.transactions[idx] = record;
      }
      showToast(`已更新：${noteVal} NT$${fmtNum(twdAmount)}`);
    } else {
      state.transactions.unshift(record);
      // Sync active month to the newly recorded date so user sees it immediately
      state.settings.activeYm = dateVal.slice(0, 7);

      const newBals = computeAccountBalances();
      const usedAcc = getAccountById(record.accountId);
      const afterBal = newBals[usedAcc.id] || 0;
      const accHint = record.type === 'transfer'
        ? `（${getAccountById(record.fromAccId).name}➔${getAccountById(record.toAccId).name}）`
        : (usedAcc.kind === 'credit'
            ? `（${usedAcc.name} 待繳 $${fmtNum(Math.abs(afterBal))}）`
            : `（${usedAcc.name} 剩 $${fmtNum(afterBal)}）`);

      // Instant Invoice Prize Check if 3 digits entered!
      const winHit = invVal.length === 3 && (state.settings.winningInvoiceCodes || []).includes(invVal);
      if (winHit) {
        showToast(`🎉 發票 #${invVal} 中獎！${accHint}`);
      } else {
        showToast(`✓ ${noteVal} NT$${fmtNum(twdAmount)}${accHint}`, () => {
          state.transactions = state.transactions.filter(t => t.id !== record.id);
          saveState();
          renderAll();
        });
      }
    }

    saveState();
    closeCalcSheet();
    renderAll();
  }

  function deleteEditingTx() {
    const id = ui.calc.editingTxId;
    if (!id) return;
    const removed = state.transactions.find(t => t.id === id);
    if (!removed) return;
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState();
    closeCalcSheet();
    renderAll();
    showToast(`已刪除：${removed.note}`, () => {
      state.transactions.unshift(removed);
      saveState();
      renderAll();
    });
  }

  // ==================== VIEW NAVIGATION ====================
  function switchView(viewName) {
    playTick(680);
    ui.activeView = viewName;
    document.querySelectorAll('.view-panel').forEach(el => {
      el.classList.toggle('active', el.id === `view-${viewName}`);
    });
    document.querySelectorAll('.dock-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    renderAll();
  }

  function switchHistorySub(sub) {
    playTick(680);
    ui.historySub = sub;
    document.querySelectorAll('#view-history .subview-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sub === sub);
    });
    document.getElementById('histSubList').style.display = sub === 'list' ? 'block' : 'none';
    document.getElementById('histSubCalendar').style.display = sub === 'calendar' ? 'block' : 'none';
    document.getElementById('histSubInvoice').style.display = sub === 'invoice' ? 'block' : 'none';
    renderHistory();
  }

  // ==================== VIEW 2: RECEIPT TIMELINE + CALENDAR + INVOICE ====================
  function renderHistory() {
    const monthTxs = getLedgerMonthTxs();

    // Filter Bar (Including Active Account Filter Pill if selected!)
    const filterBar = document.getElementById('historyFilterBar');
    const filters = [
      { id: 'all', label: '全部紀錄' },
      { id: 'expense', label: '僅支出' },
      { id: 'income', label: '僅收入' },
      { id: 'fx', label: '外幣消費' },
      { id: 'aa', label: '分帳/待收' }
    ];
    if (ui.historyFilter.startsWith('acc:')) {
      const acc = getAccountById(ui.historyFilter.slice(4));
      filters.push({ id: ui.historyFilter, label: `帳戶：${acc.name} ✕` });
    }
    filterBar.innerHTML = filters.map(f => `
      <button type="button" class="subtag-chip ${ui.historyFilter === f.id ? 'selected' : ''}" onclick="HaojiApp.setHistoryFilter('${f.id === ui.historyFilter && f.id.startsWith('acc:') ? 'all' : f.id}')">
        ${escapeHtml(f.label)}
      </button>
    `).join('');

    const q = (document.getElementById('historySearchInput').value || '').trim().toLowerCase();
    const filtered = monthTxs.filter(tx => {
      if (ui.historyFilter === 'expense' && tx.type !== 'expense') return false;
      if (ui.historyFilter === 'income' && tx.type !== 'income') return false;
      if (ui.historyFilter === 'fx' && tx.currency === 'TWD') return false;
      if (ui.historyFilter === 'aa' && (!tx.receivableTwd || tx.settled)) return false;
      if (ui.historyFilter.startsWith('acc:')) {
        const targetAcc = ui.historyFilter.slice(4);
        const matchAcc = tx.type === 'transfer'
          ? (tx.fromAccId === targetAcc || tx.toAccId === targetAcc)
          : tx.accountId === targetAcc;
        if (!matchAcc) return false;
      }
      if (q) {
        const cat = getCategoryById(tx.catId);
        const hay = `${tx.note} ${cat.name} ${tx.buddy || ''} ${tx.invoice3 || ''} ${tx.currency}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));

    // Group by Date
    const groups = {};
    filtered.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });

    const container = document.getElementById('receiptTimelineContainer');
    const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    if (!dates.length) {
      container.innerHTML = `<div class="empty-state">本月尚無符合條件的收支紀錄<br/>點擊底部「九宮格記帳」2 秒記一筆！</div>`;
    } else {
      container.innerHTML = dates.map(date => {
        const list = groups[date];
        const dayExp = list.filter(t => t.type === 'expense').reduce((s, t) => s + t.twdAmount, 0);
        const dayInc = list.filter(t => t.type === 'income').reduce((s, t) => s + t.twdAmount, 0);
        return `
          <div class="receipt-day-group">
            <div class="receipt-day-head num-mono">
              <span>${formatDateWithWeekday(date)}</span>
              <span>${dayInc > 0 ? `+${fmtNum(dayInc)} / ` : ''}-${fmtNum(dayExp)}</span>
            </div>
            ${list.map(renderTxRowHtml).join('')}
          </div>
        `;
      }).join('');
    }

    if (ui.historySub === 'calendar') renderCalendarSubview(monthTxs);
    if (ui.historySub === 'invoice') checkAllLedgerInvoices();
  }

  function renderTxRowHtml(tx) {
    const cat = getCategoryById(tx.catId);
    let accText = '';
    if (tx.type === 'transfer') {
      accText = `${getAccountById(tx.fromAccId).name} ➔ ${getAccountById(tx.toAccId).name}`;
    } else {
      accText = getAccountById(tx.accountId).name;
    }

    const sign = tx.type === 'income' ? '+' : (tx.type === 'transfer' ? '⇄ ' : '-');
    const valClass = tx.type === 'income' ? 'tx-twd-val income num-mono' : 'tx-twd-val num-mono';
    const fxLine = tx.currency !== 'TWD'
      ? `<div class="tx-fx-orig num-mono">${fmtOrigCurrency(tx.origAmount, tx.currency)}${tx.fxFee ? ' (+1.5%)' : ''}</div>`
      : '';
    const aaBadge = tx.receivableTwd > 0
      ? `<span class="tx-tag-mini aa">${tx.settled ? '已結清' : `待收 ${escapeHtml(tx.buddy)} $${fmtNum(tx.receivableTwd)}`}</span>`
      : '';
    const invBadge = tx.invoice3 ? `<span class="tx-tag-mini num-mono">發票#${escapeHtml(tx.invoice3)}</span>` : '';
    const photoBadge = tx.photoData ? `<span class="tx-tag-mini">📷收據</span>` : '';

    return `
      <div class="tx-row" onclick="HaojiApp.openCalcToEdit('${tx.id}')">
        <div class="tx-icon-circle" style="background:${cat.color};">
          ${getSvg(cat.icon)}
        </div>
        <div class="tx-info">
          <div class="tx-title-line">
            <span>${escapeHtml(tx.note || cat.name)}</span>
          </div>
          <div class="tx-meta-line">
            <span class="tx-tag-mini">${escapeHtml(cat.name)}</span>
            <span class="tx-tag-mini">${escapeHtml(accText)}</span>
            ${aaBadge}${invBadge}${photoBadge}
          </div>
        </div>
        <div class="tx-amount-col">
          <div class="${valClass}">${sign}NT$${fmtNum(tx.twdAmount)}</div>
          ${fxLine}
        </div>
      </div>
    `;
  }

  function setHistoryFilter(f) {
    playTick(680);
    ui.historyFilter = f;
    renderHistory();
  }

  function renderCalendarSubview(monthTxs) {
    const [yy, mm] = state.settings.activeYm.split('-').map(Number);
    const firstDayWeek = new Date(yy, mm - 1, 1).getDay();
    const daysInMonth = new Date(yy, mm, 0).getDate();

    const byDay = {};
    monthTxs.forEach(tx => {
      if (!byDay[tx.date]) byDay[tx.date] = { exp: 0, inc: 0, items: [] };
      if (tx.type === 'expense') byDay[tx.date].exp += tx.twdAmount;
      if (tx.type === 'income') byDay[tx.date].inc += tx.twdAmount;
      byDay[tx.date].items.push(tx);
    });

    if (!ui.selectedCalDate.startsWith(state.settings.activeYm)) {
      ui.selectedCalDate = todayStr().startsWith(state.settings.activeYm) ? todayStr() : `${state.settings.activeYm}-01`;
    }

    let cellsHtml = '';
    for (let i = 0; i < firstDayWeek; i++) {
      cellsHtml += `<div class="cal-cell empty"></div>`;
    }
    const tStr = todayStr();
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${state.settings.activeYm}-${String(d).padStart(2, '0')}`;
      const info = byDay[dStr];
      const classes = ['cal-cell'];
      if (dStr === tStr) classes.push('today');
      if (dStr === ui.selectedCalDate) classes.push('selected');
      cellsHtml += `
        <div class="${classes.join(' ')}" onclick="HaojiApp.selectCalDate('${dStr}')">
          <span class="cal-day-num num-mono">${d}</span>
          ${info && info.inc > 0 ? `<span class="cal-day-inc num-mono">+${compactNum(info.inc)}</span>` : ''}
          <span class="cal-day-amt num-mono">${info && info.exp > 0 ? `-${compactNum(info.exp)}` : ''}</span>
        </div>
      `;
    }
    document.getElementById('calendarGrid').innerHTML = cellsHtml;
    document.getElementById('selectedCalDateLabel').textContent = `${formatDateWithWeekday(ui.selectedCalDate)} 明細`;

    const dayItems = (byDay[ui.selectedCalDate] && byDay[ui.selectedCalDate].items) || [];
    document.getElementById('calendarDayList').innerHTML = dayItems.length
      ? `<div class="receipt-day-group">${dayItems.map(renderTxRowHtml).join('')}</div>`
      : `<div class="empty-state" style="padding:18px;">這天沒有消費紀錄，真省錢！</div>`;
  }

  function selectCalDate(dStr) {
    playTick(680);
    ui.selectedCalDate = dStr;
    renderCalendarSubview(getLedgerMonthTxs());
  }

  function quickAddOnSelectedDate() {
    openCalcForTile(state.expenseCats[0].id, ui.selectedCalDate);
  }

  // ==================== TAIWAN INVOICE PRIZE CHECKER ====================
  function saveWinningCodes() {
    const raw = document.getElementById('winningCodesInput').value;
    const codes = raw.split(/[\s,，、]+/).map(s => s.trim()).filter(s => /^\d{3}$/.test(s));
    state.settings.winningInvoiceCodes = codes;
    saveState();
    checkAllLedgerInvoices();
    showToast(`已儲存 ${codes.length} 組開獎末三碼`);
  }

  function onManualInvoiceInput(val) {
    const clean = val.replace(/\D/g, '');
    const resEl = document.getElementById('manualInvoiceResult');
    if (clean.length < 3) {
      resEl.textContent = '請輸入完整 3 碼數字...';
      resEl.style.color = 'var(--lcd-sub)';
      return;
    }
    const hit = (state.settings.winningInvoiceCodes || []).includes(clean);
    if (hit) {
      playTick(1040, 0.06);
      resEl.textContent = `🎉 賓果！末三碼【${clean}】中獎啦！請留意核對前五碼！`;
      resEl.style.color = '#D6453A';
    } else {
      playTick(420, 0.02);
      resEl.textContent = `末三碼 ${clean} 未中獎，下一張繼續！`;
      resEl.style.color = 'var(--lcd-ink)';
    }
    setTimeout(() => {
      const inp = document.getElementById('manualInvoiceCheckInput');
      if (inp && inp.value.length === 3) inp.select();
    }, 80);
  }

  function checkAllLedgerInvoices() {
    const codes = state.settings.winningInvoiceCodes || [];
    const withInv = state.transactions.filter(t => t.invoice3 && t.invoice3.length === 3);
    const hits = withInv.filter(t => codes.includes(t.invoice3));
    const box = document.getElementById('ledgerInvoiceMatchList');
    if (!withInv.length) {
      box.innerHTML = `<div style="font-size:0.78rem;color:var(--ink-muted);text-align:center;">目前帳本尚無登記發票末三碼的紀錄</div>`;
      return;
    }
    box.innerHTML = `
      <div style="font-size:0.82rem;font-weight:800;margin-bottom:6px;">
        帳本共登記 ${withInv.length} 張發票，對中 <span style="color:var(--signal-accent);">${hits.length}</span> 張：
      </div>
      ${hits.map(t => `<div class="account-row-card" style="margin-bottom:6px;">
        <div><strong>🎉 #${escapeHtml(t.invoice3)}</strong> — ${escapeHtml(t.note)} (${t.date})</div>
        <span class="num-mono" style="font-weight:900;">NT$${fmtNum(t.twdAmount)}</span>
      </div>`).join('')}
    `;
  }

  // ==================== VIEW 3: ANALYTICS, DONUT, FX SUMMARY & AA LINE SPLIT ====================
  function renderAnalytics() {
    const monthTxs = getLedgerMonthTxs();
    const expTxs = monthTxs.filter(t => t.type === 'expense');
    const totalExp = expTxs.reduce((s, t) => s + t.twdAmount, 0);

    document.getElementById('analyticsMonthTag').textContent = state.settings.activeYm;
    document.getElementById('donutCenterAmt').textContent = `$${compactNum(totalExp)}`;

    // Aggregate by category
    const byCat = {};
    expTxs.forEach(t => {
      byCat[t.catId] = (byCat[t.catId] || 0) + t.twdAmount;
    });
    const ranked = Object.keys(byCat)
      .map(catId => ({ cat: getCategoryById(catId), amt: byCat[catId] }))
      .sort((a, b) => b.amt - a.amt);

    // SVG Donut Ring
    const svg = document.getElementById('donutSvg');
    const r = 44;
    const circ = 2 * Math.PI * r;
    if (totalExp <= 0) {
      svg.innerHTML = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--border-ink)" stroke-width="18"/>`;
      document.getElementById('top3SummaryBox').innerHTML = `<div style="font-size:0.82rem;color:var(--ink-muted);font-weight:700;">尚無本月支出數據</div>`;
      document.getElementById('catRankList').innerHTML = '';
    } else {
      let offset = 0;
      svg.innerHTML = ranked.map(item => {
        const frac = item.amt / totalExp;
        const dash = frac * circ;
        const seg = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${item.cat.color}" stroke-width="18"
          stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"/>`;
        offset += dash;
        return seg;
      }).join('');

      document.getElementById('top3SummaryBox').innerHTML = ranked.slice(0, 3).map(item => {
        const pct = Math.round((item.amt / totalExp) * 100);
        return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:0.8rem;font-weight:800;">
          <span style="display:inline-flex;align-items:center;gap:6px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${item.cat.color};display:inline-block;"></span>
            ${escapeHtml(item.cat.name)}
          </span>
          <span class="num-mono">${pct}%</span>
        </div>`;
      }).join('');

      document.getElementById('catRankList').innerHTML = ranked.map(item => {
        const pct = Math.max(2, Math.round((item.amt / totalExp) * 100));
        return `
          <div class="cat-rank-item">
            <div class="cat-rank-top">
              <span>${escapeHtml(item.cat.name)} (${pct}%)</span>
              <span class="num-mono">NT$ ${fmtNum(item.amt)}</span>
            </div>
            <div class="cat-rank-bar">
              <div class="cat-rank-fill" style="width:${pct}%;background:${item.cat.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Daily Trend Bar Chart
    const [yy, mm] = state.settings.activeYm.split('-').map(Number);
    const daysCount = new Date(yy, mm, 0).getDate();
    const dailyTotals = Array(daysCount).fill(0);
    expTxs.forEach(t => {
      const d = Number(t.date.slice(8, 10));
      if (d >= 1 && d <= daysCount) dailyTotals[d - 1] += t.twdAmount;
    });
    const maxDay = Math.max(1, ...dailyTotals);
    const activeDays = dailyTotals.filter(v => v > 0).length || 1;
    document.getElementById('dailyAvgLabel').textContent = `消費日均 $${fmtNum(Math.round(totalExp / activeDays))}`;
    document.getElementById('dailyTrendBars').innerHTML = dailyTotals.map((val, idx) => {
      const hPct = val > 0 ? Math.max(6, Math.round((val / maxDay) * 70)) : 2;
      const showLbl = (idx + 1) === 1 || (idx + 1) % 5 === 0 || (idx + 1) === daysCount;
      return `
        <div class="trend-bar-col" title="${idx + 1}日: NT$${fmtNum(val)}">
          <div class="trend-bar-stick" style="height:${hPct}px;opacity:${val > 0 ? 1 : 0.22};"></div>
          <span class="trend-bar-lbl num-mono">${showLbl ? (idx + 1) : ''}</span>
        </div>
      `;
    }).join('');

    // Currency & Payment Breakdown
    const byCurr = {};
    const byPay = {};
    expTxs.forEach(t => {
      if (!byCurr[t.currency]) byCurr[t.currency] = { orig: 0, twd: 0 };
      byCurr[t.currency].orig += t.origAmount;
      byCurr[t.currency].twd += t.twdAmount;
      const accName = getAccountById(t.accountId).name;
      byPay[accName] = (byPay[accName] || 0) + t.twdAmount;
    });

    const currHtml = Object.keys(byCurr).map(c => `
      <div class="account-row-card" style="margin-bottom:6px;">
        <div><strong>${c} ${CURRENCIES[c] ? CURRENCIES[c].name : ''}</strong></div>
        <div class="num-mono" style="text-align:right;font-weight:800;">
          ${fmtOrigCurrency(byCurr[c].orig, c)} <span style="color:var(--ink-muted);font-size:0.76rem;">(NT$${fmtNum(byCurr[c].twd)})</span>
        </div>
      </div>
    `).join('');

    const payHtml = Object.keys(byPay).map(p => `
      <span class="subtag-chip num-mono" style="cursor:default;">${escapeHtml(p)}：$${fmtNum(byPay[p])}</span>
    `).join(' ');

    document.getElementById('fxAndPaymentBreakdown').innerHTML = expTxs.length
      ? `${currHtml}<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${payHtml}</div>`
      : `<div class="empty-state" style="padding:14px;">尚無支付資料</div>`;

    // AA Split & Buddy Settlement (Across Entire Active Ledger so multi-month trips stay intact!)
    renderAASettlement();
  }

  function renderAASettlement() {
    const ledgerTxs = state.transactions.filter(t => t.ledgerId === state.settings.activeLedgerId && t.receivableTwd > 0);
    const box = document.getElementById('aaSettlementContainer');
    if (!ledgerTxs.length) {
      box.innerHTML = `<div class="empty-state" style="padding:16px;">目前帳本沒有待分帳或代墊款項<br/>記帳時點備註旁的「平分・代墊」即可自動累計！</div>`;
      return;
    }

    const byBuddy = {};
    ledgerTxs.forEach(tx => {
      const name = tx.buddy || '旅伴朋友';
      if (!byBuddy[name]) byBuddy[name] = { pending: 0, items: [] };
      if (!tx.settled) byBuddy[name].pending += tx.receivableTwd;
      byBuddy[name].items.push(tx);
    });

    box.innerHTML = Object.keys(byBuddy).map(name => {
      const group = byBuddy[name];
      return `
        <div class="account-row-card" style="flex-direction:column;align-items:stretch;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:0.94rem;">👤 ${escapeHtml(name)}</strong>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="num-mono" style="font-weight:900;color:${group.pending > 0 ? 'var(--signal-accent)' : 'var(--jade-income)'};">
                ${group.pending > 0 ? `待收 NT$${fmtNum(group.pending)}` : '✓ 已全數結清'}
              </span>
              ${group.pending > 0 ? `<button type="button" class="mini-pill" onclick="HaojiApp.settleBuddy('${escapeAttr(name)}')">標記收款</button>` : ''}
            </div>
          </div>
          <div style="margin-top:6px;font-size:0.75rem;color:var(--ink-secondary);display:flex;flex-direction:column;gap:3px;">
            ${group.items.map(it => `
              <div style="display:flex;justify-content:space-between;opacity:${it.settled ? 0.5 : 1};">
                <span>・${it.date.slice(5)} ${escapeHtml(it.note)} (${it.splitMode === 'advance' ? '代墊' : String(it.splitMode || '').replace(/^aa/i, '平分÷')})</span>
                <span class="num-mono">應收 $${fmtNum(it.receivableTwd)}${it.currency !== 'TWD' ? ` (${fmtOrigCurrency(it.origAmount, it.currency)})` : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  function settleBuddy(buddyName) {
    playTick(880);
    state.transactions.forEach(tx => {
      if (tx.ledgerId === state.settings.activeLedgerId && (tx.buddy || '旅伴朋友') === buddyName && !tx.settled) {
        tx.settled = true;
      }
    });
    saveState();
    renderAll();
    showToast(`已將「${buddyName}」款項標記為已結清！`);
  }

  function copyLineSplitSummary() {
    const ledger = getActiveLedger();
    const pendingTxs = state.transactions.filter(t => t.ledgerId === ledger.id && t.receivableTwd > 0 && !t.settled);
    if (!pendingTxs.length) {
      showToast('目前沒有未結清的分帳款項喔！');
      return;
    }
    const byBuddy = {};
    let grandTotal = 0;
    pendingTxs.forEach(tx => {
      const name = tx.buddy || '旅伴朋友';
      if (!byBuddy[name]) byBuddy[name] = { sum: 0, lines: [] };
      byBuddy[name].sum += tx.receivableTwd;
      grandTotal += tx.receivableTwd;
      const fxNote = tx.currency !== 'TWD' ? ` [原幣 ${fmtOrigCurrency(tx.origAmount, tx.currency)}]` : '';
      byBuddy[name].lines.push(`  ・${tx.date.slice(5)} ${tx.note}：NT$ ${fmtNum(tx.receivableTwd)}${fxNote}`);
    });

    const lines = [`🧾【${ledger.name}】分帳結算單`, '━━━━━━━━━━━━━━'];
    Object.keys(byBuddy).forEach(name => {
      lines.push(`👤 ${name} 應付：NT$ ${fmtNum(byBuddy[name].sum)}`);
      lines.push(...byBuddy[name].lines);
      lines.push('--------------');
    });
    lines.push(`💰 待收總計：NT$ ${fmtNum(grandTotal)}`);
    lines.push('（由《好記 HAOJI 九宮格記帳》自動產生）');

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      showToast('已複製超整齊結算單，可直接貼到 LINE 群組！');
    }).catch(() => {
      prompt('請複製以下 LINE 結算明細：', lines.join('\n'));
    });
  }

  // ==================== VIEW 4: ACCOUNTS, NET WORTH, LEDGERS & BACKUP ====================
  function computeAccountStats() {
    const stats = {};
    const activeAccounts = getActiveAccounts();
    const activeLedgerId = state.settings.activeLedgerId;
    activeAccounts.forEach(a => {
      const init = Number(a.initBalance) || 0;
      stats[a.id] = { init, exp: 0, expCount: 0, inc: 0, trNet: 0, bal: init };
    });
    // Strictly scoped to the active ledger so each project/travel ledger has independent $0-clean balances!
    state.transactions.forEach(tx => {
      if (tx.ledgerId !== activeLedgerId) return;
      if (tx.type === 'expense' && stats[tx.accountId]) {
        stats[tx.accountId].exp += tx.twdAmount;
        stats[tx.accountId].expCount += 1;
        stats[tx.accountId].bal -= tx.twdAmount;
      } else if (tx.type === 'income' && stats[tx.accountId]) {
        stats[tx.accountId].inc += tx.twdAmount;
        stats[tx.accountId].bal += tx.twdAmount;
      } else if (tx.type === 'transfer') {
        if (stats[tx.fromAccId]) {
          stats[tx.fromAccId].trNet -= tx.twdAmount;
          stats[tx.fromAccId].bal -= tx.twdAmount;
        }
        if (stats[tx.toAccId]) {
          stats[tx.toAccId].trNet += tx.twdAmount;
          stats[tx.toAccId].bal += tx.twdAmount;
        }
      }
    });
    return stats;
  }

  function computeAccountBalances() {
    const stats = computeAccountStats();
    const map = {};
    Object.keys(stats).forEach(id => { map[id] = stats[id].bal; });
    return map;
  }

  function renderAccountsAndLedgers() {
    const activeAccounts = getActiveAccounts();
    const statsMap = computeAccountStats();
    let netWorth = 0;
    Object.keys(statsMap).forEach(id => { netWorth += statsMap[id].bal; });

    document.getElementById('netWorthDisplay').textContent = `${netWorth < 0 ? '-' : ''}NT$ ${fmtNum(Math.abs(netWorth))}`;

    document.getElementById('accountListContainer').innerHTML = activeAccounts.map(acc => {
      const st = statsMap[acc.id] || { init: 0, exp: 0, expCount: 0, inc: 0, trNet: 0, bal: 0 };
      const bal = st.bal;
      const isCredit = acc.kind === 'credit';
      const unpaid = isCredit && bal < 0 ? Math.abs(bal) : 0;

      const formulaParts = [];
      if (!isCredit || st.init !== 0) formulaParts.push(`起始 $${fmtNum(st.init)}`);
      if (st.inc > 0) formulaParts.push(`收入 +$${fmtNum(st.inc)}`);
      formulaParts.push(`日常消費 -$${fmtNum(st.exp)} (${st.expCount}筆)`);
      if (st.trNet !== 0) formulaParts.push(`轉帳 ${st.trNet > 0 ? '+' : '-'}$${fmtNum(Math.abs(st.trNet))}`);

      return `
        <div class="account-row-card" style="flex-direction:column;align-items:stretch;gap:7px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <strong style="font-size:0.93rem;">${escapeHtml(acc.name)}</strong>
              <span class="acc-badge-type">${isCredit ? '信用卡（記帳累計卡費）' : '現金/存款（記帳扣款）'}</span>
            </div>
            <span class="num-mono" style="font-weight:900;font-size:1.04rem;color:${bal < 0 ? 'var(--danger-red)' : 'var(--ink-primary)'};">
              ${bal < 0 ? `-NT$${fmtNum(Math.abs(bal))}` : `NT$${fmtNum(bal)}`}
            </span>
          </div>

          <div class="num-mono" style="font-size:0.72rem;color:var(--ink-secondary);font-weight:700;">
            ${formulaParts.join(' ｜ ')}
          </div>

          <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
            <button type="button" class="mini-pill" onclick="HaojiApp.filterByAccount('${acc.id}')">明細</button>
            <button type="button" class="mini-pill" onclick="HaojiApp.editAccountInit('${acc.id}')">✎ 校正餘額</button>
            ${unpaid > 0 ? `<button type="button" class="mini-pill" style="background:var(--signal-accent);color:#fff;border:none;" onclick="HaojiApp.payOffCreditCard('${acc.id}', ${unpaid})">⚡ 一鍵繳清</button>` : ''}
            <button type="button" class="mini-pill" style="color:var(--danger-red);border-color:rgba(214,69,58,0.35);" onclick="HaojiApp.deleteAccount('${acc.id}')">刪除</button>
          </div>
        </div>
      `;
    }).join('');

    // Ledger Quick Pills
    document.getElementById('ledgerQuickList').innerHTML = state.ledgers.map(l => `
      <button type="button" class="subtag-chip ${l.id === state.settings.activeLedgerId ? 'selected' : ''}" onclick="HaojiApp.selectLedger('${l.id}')">
        ${escapeHtml(l.name)} (${l.defaultCurrency})
      </button>
    `).join('');
  }

  function editAccountInit(accId) {
    const acc = getAccountById(accId);
    const stats = computeAccountStats()[accId] || { init: 0, bal: 0 };
    const txDelta = stats.bal - stats.init; // net change from all daily expenses/incomes/transfers
    const promptMsg = acc.kind === 'credit'
      ? `輸入「${acc.name}」目前實際未繳卡費金額（例如欠款 3500 請輸入 -3500，無欠款輸入 0）：`
      : `輸入「${acc.name}」你手邊【現在實際剩餘】的金額 (TWD)：\n（之後每記一筆日常消費，都會從這個金額直接往下扣！）`;
    const val = prompt(promptMsg, String(stats.bal));
    if (val === null) return;
    const targetCurrentBal = parseFloat(val);
    if (Number.isFinite(targetCurrentBal)) {
      acc.initBalance = Math.round(targetCurrentBal - txDelta);
      saveState();
      renderAll();
      showToast(`已校正「${acc.name}」目前餘額為 NT$${fmtNum(Math.round(targetCurrentBal))}`);
    }
  }

  function filterByAccount(accId) {
    playTick(700);
    ui.historyFilter = `acc:${accId}`;
    ui.historySub = 'list';
    switchView('history');
    switchHistorySub('list');
  }

  function deleteAccount(accId) {
    const accounts = getActiveAccounts();
    if (accounts.length <= 1) {
      showToast('每個帳本至少需保留 1 個預設帳戶（可直接點校正餘額改為 0）');
      return;
    }
    const target = accounts.find(a => a.id === accId);
    if (!target) return;

    const activeLedgerId = state.settings.activeLedgerId;
    const fallback = accounts.find(a => a.id !== accId) || accounts[0];
    const usedTxs = state.transactions.filter(tx =>
      tx.ledgerId === activeLedgerId &&
      (tx.accountId === accId || tx.fromAccId === accId || tx.toAccId === accId)
    );

    const msg = usedTxs.length > 0
      ? `確定要刪除帳戶「${target.name}」嗎？\n（此帳本內有 ${usedTxs.length} 筆紀錄使用該帳戶，刪除後將自動改掛至「${fallback.name}」）`
      : `確定要刪除不必要的帳戶「${target.name}」嗎？`;
    if (!confirm(msg)) return;

    playTick(540);
    const snapshotAccounts = JSON.parse(JSON.stringify(accounts));
    const snapshotTxs = JSON.parse(JSON.stringify(state.transactions));

    const ledger = getActiveLedger();
    ledger.accounts = accounts.filter(a => a.id !== accId);
    state.transactions.forEach(tx => {
      if (tx.ledgerId !== activeLedgerId) return;
      if (tx.accountId === accId) tx.accountId = fallback.id;
      if (tx.fromAccId === accId) tx.fromAccId = fallback.id;
      if (tx.toAccId === accId) tx.toAccId = fallback.id;
    });
    if (state.settings.lastAccountId === accId) {
      state.settings.lastAccountId = fallback.id;
    }

    saveState();
    renderAll();
    showToast(`已刪除帳戶：${target.name}`, () => {
      ledger.accounts = snapshotAccounts;
      state.transactions = snapshotTxs;
      saveState();
      renderAll();
    });
  }

  function zeroAllAccountsPrompt() {
    const ledger = getActiveLedger();
    if (!confirm(`要將「${ledger.name}」內所有帳戶的起始金額全部歸零嗎？`)) return;
    getActiveAccounts().forEach(a => { a.initBalance = 0; });
    saveState();
    renderAll();
    showToast('已將本帳本所有帳戶起始金額歸零！');
  }

  function payOffCreditCard(cardId, unpaidAmount) {
    playTick(840);
    const card = getAccountById(cardId);
    const accounts = getActiveAccounts();
    const payFrom = accounts.find(a => a.id === 'acc_bank') || accounts.find(a => a.kind !== 'credit' && a.id !== cardId) || accounts[0];
    const tx = {
      id: 'tx_' + Date.now(),
      ledgerId: state.settings.activeLedgerId,
      type: 'transfer',
      catId: 'tr_card',
      date: todayStr(),
      origAmount: unpaidAmount,
      currency: 'TWD',
      rate: 1,
      fxFee: false,
      twdAmount: unpaidAmount,
      note: `繳清${card.name}帳單`,
      accountId: payFrom.id,
      fromAccId: payFrom.id,
      toAccId: cardId,
      splitMode: 'none',
      buddy: '',
      settled: false,
      receivableTwd: 0,
      invoice3: '',
      photoData: ''
    };
    state.transactions.unshift(tx);
    saveState();
    renderAll();
    showToast(`✓ 已從「${payFrom.name}」自動扣繳 NT$${fmtNum(unpaidAmount)} 卡費！`);
  }

  // ==================== MODALS: PRESETS/RECURRING, LEDGERS, FX CONVERTER, BUDGET, CUSTOM CAT ====================
  function openModalWithHtml(html) {
    document.getElementById('universalModalBody').innerHTML = html;
    document.getElementById('universalModal').classList.add('open');
    if (document.body && document.body.classList) document.body.classList.add('sheet-locked');
  }

  function closeModal() {
    document.getElementById('universalModal').classList.remove('open');
    if (document.body && document.body.classList && !ui.calc.open) {
      document.body.classList.remove('sheet-locked');
    }
  }

  // 1. Instant 1-Tap Presets + Monthly Recurring Subscriptions Modal
  function openPresetsModal() {
    playTick(740);
    const ym = state.settings.activeYm;
    const presetsHtml = state.presets.map(p => `
      <div class="preset-btn" onclick="HaojiApp.firePreset('${p.id}')" style="position:relative;">
        <div style="min-width:0;flex:1;">
          <div style="font-size:0.86rem;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(p.title)}</div>
          <div class="num-mono" style="font-size:0.75rem;color:var(--signal-accent);font-weight:800;">
            ${fmtOrigCurrency(p.amount, p.currency)}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
          <span style="font-size:0.72rem;font-weight:900;background:var(--signal-accent);color:#fff;padding:3px 7px;border-radius:99px;">秒記</span>
          <button type="button" class="mini-pill" style="padding:2px 6px;color:var(--ink-muted);" title="刪除此秒記按鈕" onclick="event.stopPropagation();HaojiApp.deletePreset('${p.id}')">✕</button>
        </div>
      </div>
    `).join('');

    const recHtml = state.recurring.map(r => {
      const done = (r.postedYms || []).includes(ym);
      return `
        <div class="account-row-card" style="margin-bottom:7px;">
          <div style="min-width:0;flex:1;">
            <strong style="font-size:0.88rem;">${escapeHtml(r.title)}</strong>
            <div class="num-mono" style="font-size:0.75rem;color:var(--ink-secondary);">每月固定 NT$ ${fmtNum(r.amount)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <button type="button" class="mini-pill" style="${done ? 'opacity:0.55;' : 'background:var(--ink-primary);color:var(--surface-card);'}" onclick="HaojiApp.postRecurring('${r.id}')">
              ${done ? '已入帳 ✓' : '一鍵入帳'}
            </button>
            <button type="button" class="mini-pill" style="color:var(--danger-red);" onclick="HaojiApp.deleteRecurring('${r.id}')">刪除</button>
          </div>
        </div>
      `;
    }).join('');

    openModalWithHtml(`
      <div class="sheet-grabber"></div>
      <div class="section-header">
        <div class="section-title">⚡ 一鍵秒記常用消費</div>
        <button type="button" class="close-sheet-btn" onclick="HaojiApp.closeModal()">✕</button>
      </div>
      <p style="font-size:0.76rem;color:var(--ink-secondary);margin-bottom:10px;font-weight:700;">點一下免輸入金額立即入帳！</p>
      <div class="preset-grid" style="margin-bottom:12px;">${presetsHtml}</div>
      <button type="button" class="density-toggle-btn" style="margin-bottom:16px;" onclick="HaojiApp.addNewPresetPrompt()">＋新增一鍵秒記按鈕</button>

      <div class="section-header" style="margin-top:4px;">
        <div class="section-title">📅 每月固定代繳／訂閱帳單 (${ym})</div>
        <button type="button" class="density-toggle-btn" onclick="HaojiApp.addNewRecurringPrompt()">＋新增固定帳</button>
      </div>
      <div>${recHtml}</div>
    `);
  }

  function firePreset(presetId) {
    const p = state.presets.find(x => x.id === presetId);
    if (!p) return;
    playTick(920, 0.03);
    const rate = p.currency === 'TWD' ? 1 : (state.settings.rates[p.currency] || CURRENCIES[p.currency].rateToTwd);
    const twdAmount = Math.round(p.amount * rate);
    const tx = {
      id: 'tx_' + Date.now(),
      ledgerId: state.settings.activeLedgerId,
      type: 'expense',
      catId: p.catId,
      date: todayStr(),
      origAmount: p.amount,
      currency: p.currency,
      rate,
      fxFee: false,
      twdAmount,
      note: p.title,
      accountId: p.accountId || 'acc_cash',
      splitMode: 'none',
      buddy: '',
      settled: false,
      receivableTwd: 0,
      invoice3: '',
      photoData: ''
    };
    state.transactions.unshift(tx);
    saveState();
    closeModal();
    renderAll();
    const acc = getAccountById(tx.accountId);
    const afterBal = computeAccountBalances()[acc.id] || 0;
    showToast(`⚡ ${p.title} -$${fmtNum(twdAmount)}（${acc.name} 剩 $${fmtNum(afterBal)}）`, () => {
      state.transactions = state.transactions.filter(t => t.id !== tx.id);
      saveState();
      renderAll();
    });
  }

  function addNewPresetPrompt() {
    const title = prompt('輸入常用消費名稱（例如：美式咖啡、公司停車費）：');
    if (!title || !title.trim()) return;
    const amt = parseFloat(prompt('輸入固定金額（台幣）：', '60'));
    if (!amt || amt <= 0) return;
    state.presets.push({
      id: 'p_' + Date.now(),
      title: title.trim(),
      catId: 'c_food',
      amount: amt,
      currency: getActiveLedger().defaultCurrency,
      accountId: 'acc_cash'
    });
    saveState();
    openPresetsModal();
  }

  function postRecurring(recId) {
    const r = state.recurring.find(x => x.id === recId);
    if (!r) return;
    playTick(880);
    const ym = state.settings.activeYm;
    if (!r.postedYms) r.postedYms = [];
    if (!r.postedYms.includes(ym)) r.postedYms.push(ym);

    const tx = {
      id: 'tx_' + Date.now(),
      ledgerId: state.settings.activeLedgerId,
      type: 'expense',
      catId: r.catId,
      date: todayStr().startsWith(ym) ? todayStr() : `${ym}-01`,
      origAmount: r.amount,
      currency: 'TWD',
      rate: 1,
      fxFee: false,
      twdAmount: r.amount,
      note: r.title,
      accountId: r.accountId || 'acc_card',
      splitMode: 'none',
      buddy: '',
      settled: false,
      receivableTwd: 0,
      invoice3: '',
      photoData: ''
    };
    state.transactions.unshift(tx);
    saveState();
    openPresetsModal();
    renderAll();
    showToast(`✓ 已入帳固定支出：${r.title} NT$${fmtNum(r.amount)}`);
  }

  function addNewRecurringPrompt() {
    const title = prompt('輸入每月固定支出名稱（如：健身房月費、車位租金）：');
    if (!title || !title.trim()) return;
    const amt = parseFloat(prompt('輸入每月台幣金額：', '1000'));
    if (!amt || amt <= 0) return;
    state.recurring.push({
      id: 'r_' + Date.now(),
      title: title.trim(),
      catId: 'c_bills',
      amount: Math.round(amt),
      accountId: 'acc_card',
      postedYms: []
    });
    saveState();
    openPresetsModal();
  }

  function deletePreset(presetId) {
    state.presets = state.presets.filter(p => p.id !== presetId);
    saveState();
    openPresetsModal();
    showToast('已移除常用秒記按鈕');
  }

  function deleteRecurring(recId) {
    state.recurring = state.recurring.filter(r => r.id !== recId);
    saveState();
    openPresetsModal();
    showToast('已移除固定帳單項目');
  }

  // 2. Multi-Ledger Switcher & Travel Trip Creator Modal
  function openLedgerModal() {
    playTick(720);
    const currOpts = Object.keys(CURRENCIES).map(c =>
      `<option value="${c}">${c} — ${CURRENCIES[c].name} (${CURRENCIES[c].symbol})</option>`
    ).join('');

    openModalWithHtml(`
      <div class="sheet-grabber"></div>
      <div class="section-header">
        <div class="section-title">✈️ 切換台灣日常／出國旅遊帳本</div>
        <button type="button" class="close-sheet-btn" onclick="HaojiApp.closeModal()">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
        ${state.ledgers.map(l => `
          <div class="account-row-card" style="cursor:pointer;border-color:${l.id === state.settings.activeLedgerId ? 'var(--signal-accent)' : 'var(--border-ink)'};" onclick="HaojiApp.selectLedger('${l.id}')">
            <div style="flex:1;min-width:0;">
              <strong style="font-size:0.95rem;">${escapeHtml(l.name)}</strong>
              <div style="font-size:0.74rem;color:var(--ink-secondary);">預設幣別：${l.defaultCurrency}｜預算：NT$${fmtNum(l.budgetTwd)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-weight:900;font-size:0.82rem;color:var(--signal-accent);">${l.id === state.settings.activeLedgerId ? '使用中 ●' : '切換'}</span>
              ${state.ledgers.length > 1 ? `<button type="button" class="mini-pill" style="color:var(--danger-red);border-color:rgba(214,69,58,0.35);" onclick="event.stopPropagation();HaojiApp.deleteLedger('${l.id}')">刪除</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="border-top:1.5px dashed var(--border-ink);padding-top:12px;">
        <div style="font-size:0.88rem;font-weight:900;margin-bottom:4px;">＋ 建立新出國旅遊／專案帳本</div>
        <div style="font-size:0.74rem;color:var(--ink-secondary);font-weight:700;margin-bottom:9px;">新帳本將自動配置獨立且全部歸零 ($0) 的乾淨帳戶與總淨資產！</div>
        <div class="form-field">
          <label>帳本名稱</label>
          <input type="text" id="newLedgerNameInput" class="form-input" placeholder="例如：🇹🇭 曼谷跨年自由行、🇪🇺 歐洲蜜月" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="form-field">
            <label>當地預設外幣</label>
            <select id="newLedgerCurrSelect" class="form-select">${currOpts}</select>
          </div>
          <div class="form-field">
            <label>總預算上限 (台幣)</label>
            <input type="number" id="newLedgerBudgetInput" class="form-input num-mono" value="40000" />
          </div>
        </div>
        <button type="button" class="action-btn primary" style="width:100%;" onclick="HaojiApp.createLedger()">建立並切換至此帳本</button>
      </div>
    `);
    document.getElementById('newLedgerCurrSelect').value = 'JPY';
  }

  function selectLedger(ledgerId) {
    playTick(780);
    state.settings.activeLedgerId = ledgerId;
    state.settings.lastAccountId = null;
    saveState();
    closeModal();
    renderAll();
    const l = getActiveLedger();
    showToast(`已切換至：${l.name}（預設 ${l.defaultCurrency}）`);
  }

  function createLedger() {
    const name = document.getElementById('newLedgerNameInput').value.trim();
    const curr = document.getElementById('newLedgerCurrSelect').value;
    const budget = parseFloat(document.getElementById('newLedgerBudgetInput').value) || 30000;
    if (!name) {
      showToast('請輸入帳本名稱！');
      return;
    }
    const id = 'led_' + Date.now();
    state.ledgers.push({
      id,
      name,
      defaultCurrency: curr,
      budgetTwd: Math.round(budget),
      accounts: buildZeroedAccounts(curr)
    });
    state.settings.activeLedgerId = id;
    state.settings.lastAccountId = null;
    saveState();
    closeModal();
    renderAll();
    showToast(`已建立全新帳本「${name}」（淨資產與帳戶已全新歸零 $0）`);
  }

  function deleteLedger(ledgerId) {
    if (state.ledgers.length <= 1) {
      showToast('至少需保留 1 本帳本！');
      return;
    }
    const target = state.ledgers.find(l => l.id === ledgerId);
    if (!target) return;
    if (!confirm(`確定要刪除帳本「${target.name}」及其內部紀錄嗎？`)) return;
    playTick(540);
    state.ledgers = state.ledgers.filter(l => l.id !== ledgerId);
    state.transactions = state.transactions.filter(t => t.ledgerId !== ledgerId);
    if (state.settings.activeLedgerId === ledgerId) {
      state.settings.activeLedgerId = state.ledgers[0].id;
      state.settings.lastAccountId = null;
    }
    saveState();
    openLedgerModal();
    renderAll();
    showToast(`已刪除帳本：${target.name}`);
  }

  // 3. Travel Instant FX + Tax-Free (-8% / -10%) Calculator Modal
  function openFxConverterModal() {
    playTick(740);
    const ledgerCurr = getActiveLedger().defaultCurrency === 'TWD' ? 'JPY' : getActiveLedger().defaultCurrency;
    const currOpts = Object.keys(CURRENCIES).filter(c => c !== 'TWD').map(c =>
      `<option value="${c}" ${c === ledgerCurr ? 'selected' : ''}>${c} ${CURRENCIES[c].name} (1 ${c} = ${state.settings.rates[c]} TWD)</option>`
    ).join('');

    openModalWithHtml(`
      <div class="sheet-grabber"></div>
      <div class="section-header">
        <div class="section-title">🌍 出國血拚即時匯率＆免稅試算</div>
        <button type="button" class="close-sheet-btn" onclick="HaojiApp.closeModal()">✕</button>
      </div>
      <div class="form-field">
        <label>選擇外幣（上次更新：${state.settings.lastRateSync || '內建離線基準匯率'}）</label>
        <select id="fxModalCurr" class="form-select num-mono" onchange="HaojiApp.recalcFxModal()">${currOpts}</select>
      </div>
      <div class="form-field">
        <label>輸入商品外幣標價</label>
        <input type="number" id="fxModalAmt" class="form-input num-mono" value="5500" style="font-size:1.35rem;" oninput="HaojiApp.recalcFxModal()" />
      </div>
      <div class="calc-lcd-box num-mono" id="fxModalResultBox"></div>
      <div style="display:flex;gap:8px;">
        <button type="button" class="action-btn" style="flex:1;" onclick="HaojiApp.syncLiveRates(true);setTimeout(HaojiApp.openFxConverterModal,500);">🔄 連網更新匯率</button>
        <button type="button" class="action-btn primary" style="flex:1;" onclick="HaojiApp.recordFromFxModal()">直接記一筆血拚</button>
      </div>
    `);
    recalcFxModal();
  }

  function recalcFxModal() {
    const code = document.getElementById('fxModalCurr').value || 'JPY';
    const amt = parseFloat(document.getElementById('fxModalAmt').value) || 0;
    const rate = state.settings.rates[code] || (CURRENCIES[code] && CURRENCIES[code].rateToTwd) || 1;
    const twdNormal = Math.round(amt * rate);
    const twdCardFee = Math.round(amt * rate * 1.015);
    const twdTaxFree10 = Math.round((amt / 1.1) * rate);
    const box = document.getElementById('fxModalResultBox');
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:0.8rem;color:var(--lcd-sub);">一般現金折合台幣</span>
        <strong style="font-size:1.3rem;">NT$ ${fmtNum(twdNormal)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--lcd-sub);margin-bottom:4px;">
        <span>海外刷卡含 +1.5% 手續費</span>
        <strong>NT$ ${fmtNum(twdCardFee)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--signal-accent);">
        <span>退稅 10% 免稅價折合台幣</span>
        <strong>≈ NT$ ${fmtNum(twdTaxFree10)}</strong>
      </div>
    `;
  }

  function recordFromFxModal() {
    const code = document.getElementById('fxModalCurr').value || 'JPY';
    const amt = parseFloat(document.getElementById('fxModalAmt').value) || 0;
    closeModal();
    ui.gridMode = 'expense';
    openCalcForTile('c_travel_buy');
    ui.calc.currency = code;
    ui.calc.expr = amt > 0 ? String(amt) : '';
    document.getElementById('calcCurrencySelect').value = code;
    updateCalcDisplay();
  }

  // 4. Budget Modal
  function openBudgetModal() {
    const ledger = getActiveLedger();
    const val = prompt(`設定「${ledger.name}」的預算上限 (台幣 NT$)：`, String(ledger.budgetTwd || 25000));
    if (val === null) return;
    const num = parseFloat(val);
    if (Number.isFinite(num) && num >= 0) {
      ledger.budgetTwd = Math.round(num);
      saveState();
      renderAll();
      showToast(`已更新預算上限：NT$${fmtNum(ledger.budgetTwd)}`);
    }
  }

  // 5. Custom Category Creator & Manager Modal
  function openCustomCatModal() {
    playTick(720);
    const swatches = ['#E56A36', '#D68934', '#DFB034', '#76A043', '#217A5D', '#4B96A4', '#4377B8', '#7E62A8', '#CE5A62', '#5C646D'];
    const expListHtml = state.expenseCats.map(c => `
      <span class="subtag-chip" style="display:inline-flex;align-items:center;gap:5px;">
        <span style="width:9px;height:9px;border-radius:50%;background:${c.color};display:inline-block;"></span>
        ${escapeHtml(c.name)}
        ${state.expenseCats.length > 1 ? `<span style="color:var(--danger-red);padding-left:3px;" onclick="HaojiApp.deleteCategory('expense','${c.id}')">✕</span>` : ''}
      </span>
    `).join('');

    openModalWithHtml(`
      <div class="sheet-grabber"></div>
      <div class="section-header">
        <div class="section-title">九宮格分類新增＆管理</div>
        <button type="button" class="close-sheet-btn" onclick="HaojiApp.closeModal()">✕</button>
      </div>
      <div class="form-field">
        <label>分類類型</label>
        <select id="customCatType" class="form-select">
          <option value="expense">支出分類</option>
          <option value="income">收入分類</option>
        </select>
      </div>
      <div class="form-field">
        <label>按鈕顯示名稱（建議 2～4 字最美觀）</label>
        <input type="text" id="customCatName" class="form-input" placeholder="例如：毛孩寵物、孝親費、醫美保養" />
      </div>
      <div class="form-field">
        <label>圓章代表色</label>
        <div class="color-swatch-row" id="customSwatchRow">
          ${swatches.map((c, idx) => `<button type="button" class="color-swatch ${idx === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c};" onclick="HaojiApp.pickSwatch(this)"></button>`).join('')}
        </div>
      </div>
      <div class="form-field">
        <label>免打字常用子標籤（以逗號分隔）</label>
        <input type="text" id="customCatTags" class="form-input" placeholder="飼料罐頭, 獸醫看診, 美容洗澡" />
      </div>
      <button type="button" class="action-btn primary" style="width:100%;margin-bottom:14px;" onclick="HaojiApp.saveCustomCat()">＋ 新增至九宮格面板</button>

      <div style="border-top:1.5px dashed var(--border-ink);padding-top:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:0.8rem;font-weight:900;">現有支出分類（點 ✕ 可移除）</span>
          <button type="button" class="mini-pill" onclick="HaojiApp.restoreDefaultCats()">恢復預設九宮格</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${expListHtml}</div>
      </div>
    `);
  }

  function deleteCategory(type, catId) {
    const arr = type === 'income' ? state.incomeCats : state.expenseCats;
    if (arr.length <= 1) {
      showToast('至少需保留 1 個分類！');
      return;
    }
    const target = arr.find(c => c.id === catId);
    if (!target) return;
    if (!confirm(`確定要從九宮格移除「${target.name}」分類嗎？`)) return;
    if (type === 'income') state.incomeCats = state.incomeCats.filter(c => c.id !== catId);
    else state.expenseCats = state.expenseCats.filter(c => c.id !== catId);
    saveState();
    openCustomCatModal();
    renderAll();
    showToast(`已移除分類：${target.name}`);
  }

  function restoreDefaultCats() {
    if (!confirm('要恢復原廠預設的 9 個支出分類與 6 個收入分類嗎？')) return;
    state.expenseCats = JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATS));
    state.incomeCats = JSON.parse(JSON.stringify(DEFAULT_INCOME_CATS));
    saveState();
    closeModal();
    renderAll();
    showToast('已恢復預設九宮格分類！');
  }

  function pickSwatch(el) {
    document.querySelectorAll('#customSwatchRow .color-swatch').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  }

  function saveCustomCat() {
    const type = document.getElementById('customCatType').value;
    const name = document.getElementById('customCatName').value.trim();
    if (!name) {
      showToast('請輸入分類名稱！');
      return;
    }
    const sw = document.querySelector('#customSwatchRow .color-swatch.selected');
    const color = sw ? sw.dataset.color : '#E56A36';
    const rawTags = document.getElementById('customCatTags').value;
    const tags = rawTags ? rawTags.split(/[,，、]+/).map(s => s.trim()).filter(Boolean) : [name];

    const newCat = {
      id: 'cat_' + Date.now(),
      name,
      color,
      icon: type === 'income' ? 'bonus' : 'medical',
      tags
    };
    if (type === 'income') state.incomeCats.push(newCat);
    else state.expenseCats.push(newCat);

    ui.gridMode = type;
    saveState();
    closeModal();
    setGridMode(type);
    showToast(`已新增九宮格按鈕：${name}`);
  }

  // 6. Add New Account Modal (Scoped to Current Active Ledger)
  function openAddAccountModal() {
    const name = prompt('新增支付／資產帳戶名稱（例如：國泰CUBE卡、玉山熊本熊卡、PayPay）：');
    if (!name || !name.trim()) return;
    const isCard = confirm('這是一張「信用卡（先消費後繳款）」嗎？\n按「確定」設為信用卡，按「取消」設為一般現金/存款帳戶。');
    const init = isCard ? 0 : (parseFloat(prompt('請輸入目前初始餘額 (台幣，預設 0)：', '0')) || 0);
    getActiveAccounts().push({
      id: 'acc_' + Date.now(),
      name: name.trim(),
      kind: isCard ? 'credit' : 'asset',
      initBalance: Math.round(init)
    });
    saveState();
    renderAll();
    showToast(`已在此帳本新增帳戶：${name.trim()}`);
  }

  // ==================== BACKUP, EXCEL CSV EXPORT, SHARE & DEMO ====================
  function exportCSV() {
    const ledger = getActiveLedger();
    const rows = [
      ['帳本', '日期', '類型', '分類', '品項備註', '原幣金額', '幣別', '匯率', '折合台幣(TWD)', '支付帳戶', '分帳模式', '分帳對象', '待收金額(TWD)', '發票末三碼']
    ];
    state.transactions.forEach(tx => {
      const l = state.ledgers.find(x => x.id === tx.ledgerId);
      const cat = getCategoryById(tx.catId);
      const acc = tx.type === 'transfer'
        ? `${getAccountById(tx.fromAccId, tx.ledgerId).name}->${getAccountById(tx.toAccId, tx.ledgerId).name}`
        : getAccountById(tx.accountId, tx.ledgerId).name;
      rows.push([
        l ? l.name : '',
        tx.date,
        tx.type === 'expense' ? '支出' : (tx.type === 'income' ? '收入' : '轉帳'),
        cat.name,
        tx.note || '',
        tx.origAmount,
        tx.currency,
        tx.rate,
        tx.twdAmount,
        acc,
        tx.splitMode || 'none',
        tx.buddy || '',
        tx.receivableTwd || 0,
        tx.invoice3 || ''
      ]);
    });

    // UTF-8 BOM for Taiwan Excel zero garbled characters
    const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    downloadBlob(csvContent, `好記帳報表_${ledger.name}_${todayStr()}.csv`, 'text/csv;charset=utf-8;');
    showToast('已匯出 Excel CSV 報表！');
  }

  function exportJSON() {
    const json = JSON.stringify(state, null, 2);
    downloadBlob(json, `好記HAOJI完整備份_${todayStr()}.json`, 'application/json');
    showToast('已下載完整備份檔 (.json)！');
  }

  function importJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || !Array.isArray(parsed.transactions)) throw new Error('Invalid format');
        state = Object.assign(getDefaultState(), parsed);
        ensurePerLedgerAccounts(state);
        saveState();
        applySkin();
        renderAll();
        showToast(`成功還原 ${state.transactions.length} 筆帳務紀錄！`);
      } catch (_) {
        showToast('備份檔案格式不正確，無法還原');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  async function shareBackupNative() {
    const json = JSON.stringify(state);
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], `HAOJI_Backup_${todayStr()}.json`, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: '好記 HAOJI 帳本備份',
          text: `備份日期：${todayStr()}（共 ${state.transactions.length} 筆紀錄）`,
          files: [file]
        });
        return;
      } catch (_) {}
    }
    exportJSON();
  }

  function loadDemoData() {
    if (!confirm('要載入「台灣日常＋日本東京旅遊」範例資料嗎？（會保留您現有自訂設定並加入範例紀錄）')) return;
    const samples = buildSampleTransactions();
    const existingIds = new Set(state.transactions.map(t => t.id));
    samples.forEach(s => {
      if (!existingIds.has(s.id)) state.transactions.unshift(s);
    });
    saveState();
    renderAll();
    showToast('已載入台灣＋日本旅遊展示帳務！');
  }

  function resetCurrentLedger() {
    const ledger = getActiveLedger();
    if (!confirm(`確定要清空「${ledger.name}」內的所有記帳紀錄嗎？`)) return;
    const backup = [...state.transactions];
    state.transactions = state.transactions.filter(t => t.ledgerId !== ledger.id);
    saveState();
    renderAll();
    showToast(`已清空 ${ledger.name}`, () => {
      state.transactions = backup;
      saveState();
      renderAll();
    });
  }

  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ==================== TOAST WITH UNDO ====================
  function showToast(msg, undoCallback = null) {
    const banner = document.getElementById('toastBanner');
    const txt = document.getElementById('toastText');
    const undoBtn = document.getElementById('toastUndoBtn');
    txt.textContent = msg;
    ui.undoAction = undoCallback;
    undoBtn.style.display = undoCallback ? 'inline-block' : 'none';
    banner.classList.add('show');
    if (ui.toastTimer) clearTimeout(ui.toastTimer);
    ui.toastTimer = setTimeout(() => {
      banner.classList.remove('show');
    }, 3400);
  }

  // ==================== FORMATTERS & ESCAPING ====================
  function formatDateWithWeekday(dStr) {
    const [y, m, d] = dStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const w = ['日', '一', '二', '三', '四', '五', '六'][dt.getDay()];
    return `${m}/${String(d).padStart(2, '0')} (週${w})`;
  }

  function compactNum(n) {
    const v = Math.round(n);
    if (v >= 100000) return `${(v / 1000).toFixed(0)}k`;
    return v.toLocaleString('en-US');
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return String(str ?? '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // ==================== RENDER ALL ====================
  function renderAll() {
    renderTopSummary();
    renderHomeGrid();
    if (ui.activeView === 'history') renderHistory();
    if (ui.activeView === 'analytics') renderAnalytics();
    if (ui.activeView === 'accounts') renderAccountsAndLedgers();
  }

  // ==================== KEYBOARD SHORTCUTS & PWA SW REGISTRATION ====================
  function bindGlobalEvents() {
    document.getElementById('toastUndoBtn').addEventListener('click', () => {
      if (ui.undoAction) {
        ui.undoAction();
        ui.undoAction = null;
        document.getElementById('toastBanner').classList.remove('show');
        showToast('已復原上一筆操作！');
      }
    });

    window.addEventListener('keydown', e => {
      if (!ui.calc.open) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitCalc();
        } else if (e.key === 'Escape') {
          closeCalcSheet();
        }
        return;
      }
      if (/^[0-9.]$/.test(e.key) || ['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        pressKey(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        pressKey('BACK');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitCalc();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCalcSheet();
      }
    });

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  function init() {
    loadState();
    applySkin();
    bindGlobalEvents();
    renderAll();
    syncLiveRates(false);
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    cycleSkin,
    toggleSound,
    toggleGridDensity,
    setGridMode,
    shiftMonth,
    switchView,
    switchHistorySub,
    renderHistory,
    setHistoryFilter,
    selectCalDate,
    quickAddOnSelectedDate,
    openCalcForTile,
    openCalcToEdit,
    cycleCalcCategory,
    closeCalcSheet,
    pickQuickTag,
    addQuickTagToCat,
    selectCalcAccount,
    toggleSplitPanel,
    setSplitMode,
    promptCustomSplit,
    pickBuddyChip,
    setCalcYesterday,
    onCalcCurrencyChange,
    toggleFxFee,
    promptCustomRate,
    pressKey,
    handleReceiptPhoto,
    previewReceiptPhoto,
    clearReceiptPhoto,
    submitCalc,
    deleteEditingTx,
    saveWinningCodes,
    onManualInvoiceInput,
    checkAllLedgerInvoices,
    settleBuddy,
    copyLineSplitSummary,
    editAccountInit,
    deleteAccount,
    filterByAccount,
    zeroAllAccountsPrompt,
    payOffCreditCard,
    openPresetsModal,
    firePreset,
    addNewPresetPrompt,
    deletePreset,
    postRecurring,
    addNewRecurringPrompt,
    deleteRecurring,
    openLedgerModal,
    selectLedger,
    createLedger,
    deleteLedger,
    openFxConverterModal,
    recalcFxModal,
    recordFromFxModal,
    openBudgetModal,
    openCustomCatModal,
    deleteCategory,
    restoreDefaultCats,
    pickSwatch,
    saveCustomCat,
    openAddAccountModal,
    closeModal,
    syncLiveRates,
    exportCSV,
    exportJSON,
    importJSON,
    shareBackupNative,
    loadDemoData,
    resetCurrentLedger
  };
})();
