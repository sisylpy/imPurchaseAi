

const ENTRY_PAGE = '/pages/index/index'; // 项目首页

Page({
  data: {
    show: { brand:false, l1:false, l2:false, ul:false, glint:false, s1:false, s2:false },
    autoNavigated: false
  },

  onLoad() {
    // 首次进入才显示，之后 24 小时内自动跳过（可改为永久）
    const seenAt = wx.getStorageSync('seenSplashV1') || 0;
    const now = Date.now();
    if (now - seenAt < 24*60*60*1000) {
      this.quickGo();
      return;
    }
  },

  onReady() {
    // 如果 quickGo 了，这里不会执行
    this.kickoff();
    this.startSpark();
  },

  kickoff() {
    // 按时间线触发布尔位 → 让 WXSS 动画跑起来
    setTimeout(() => this.setData({ 'show.brand': true }), 80);
    setTimeout(() => this.setData({ 'show.l1': true   }), 120);
    setTimeout(() => this.setData({ 'show.l2': true   }), 520);
    setTimeout(() => this.setData({ 'show.ul': true   }), 640);
    setTimeout(() => this.setData({ 'show.glint': true}), 760);
    setTimeout(() => this.setData({ 'show.s1': true   }), 980);
    setTimeout(() => this.setData({ 'show.s2': true   }), 2000);

    // 完成后自动进入首页
    setTimeout(() => this.goHome(), 3000);
  },

  handleSkip() { this.goHome(); },

  goHome() {
    if (this.data.autoNavigated) return;
    this.setData({ autoNavigated: true });
    wx.setStorageSync('seenSplashV1', Date.now());
    // 推荐 reLaunch 清空历史栈，避免返回到开屏
    wx.reLaunch({ url: ENTRY_PAGE });
  },

  quickGo() {
    this.setData({ autoNavigated: true });
    wx.reLaunch({ url: ENTRY_PAGE });
  },

  /* ====== 轻量“星光”画布特效（性能友好） ====== */
  startSpark() {
    const query = this.createSelectorQuery();
    query.select('#spark').fields({ node: true, size: true }).exec((res) => {
      const canvas = res && res[0] && res[0].node;
      if (!canvas || !canvas.getContext) return;

      const dpr = wx.getSystemInfoSync().pixelRatio || 1;
      const ctx = canvas.getContext('2d');

      const width = res[0].width;
      const height = res[0].height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const sparks = [];
      const maxSparks = 24;

      function spawn() {
        if (sparks.length >= maxSparks) return;
        sparks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1 + Math.random() * 2.2,
          life: 600 + Math.random() * 900,
          age: 0,
          vx: (Math.random() - .5) * .2,
          vy: (Math.random() - .5) * .2,
          hue: 175 + Math.random()*20 // 靠近 #20afb8 的青绿
        });
      }

      let last = Date.now();
      let animId;

      const loop = () => {
        const now = Date.now();
        const dt = now - last; last = now;

        ctx.clearRect(0, 0, width, height);

        // 微弱径向晕光
        const g = ctx.createRadialGradient(width*0.7, height*0.2, 10, width*0.7, height*0.2, Math.max(width,height)*0.8);
        g.addColorStop(0, 'rgba(32,175,184,0.08)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,width,height);

        // 更新/绘制星光
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.age += dt;
          s.x += s.vx * dt * 0.06;
          s.y += s.vy * dt * 0.06;

          const t = s.age / s.life;
          const alpha = Math.max(0, 0.6 - t);  // 渐隐
          if (alpha <= 0) { sparks.splice(i,1); continue; }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * (1 + 0.5*Math.sin(t*6.28)), 0, Math.PI*2);
          ctx.fillStyle = `hsla(${s.hue}, 60%, 55%, ${alpha})`;
          ctx.fill();
        }

        // 偶发生成
        if (Math.random() < 0.4) spawn();

        animId = canvas.requestAnimationFrame(loop);
      };

      // 先播 3.2s，随后停止（进入首页）
      loop();
      setTimeout(() => { if (animId && canvas.cancelAnimationFrame) canvas.cancelAnimationFrame(animId); }, 3200);
    });
  }
});

