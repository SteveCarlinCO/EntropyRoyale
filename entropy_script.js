(function(){
  var cv = document.getElementById('cv10');
  var ctx = cv.getContext('2d');
  var meter = document.getElementById('meter10');
  var dotsLabel = document.getElementById('dotsLabel10');
  var statusEl = document.getElementById('status10');
  var guessInput = document.getElementById('guessInput10');
  var guessBtn = document.getElementById('guessBtn10');
  var dotsInput = document.getElementById('dotsInput');
  var simTitle = document.getElementById('simTitle');
  var guessLabel = document.getElementById('guessLabel');
  var H = 260, W = 300, START = 1000, CELL = 14, FINAL = 2;
  var parts = [], debris = [], rings = [];
  var PALETTE = ['#4aa3ff','#ff6b4a','#ffd24a','#7de08a','#c58aff','#4adfd8'];
  var textColor = '#e8eaed', mutedColor = '#9aa0a6';
  var started = false, guess = null;
  var guessAlive = false, guessDeadAt = 0, verdictShown = false, guessingClosed = false;
  function resize(){
    var r = cv.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    W = Math.max(60, r.width);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function reset(){
    parts = []; debris = []; rings = [];
    started = false; guess = null;
    verdictShown = false; guessingClosed = false;
    guessAlive = false; guessDeadAt = 0;
    var want = parseInt(dotsInput.value, 10);
    if (isNaN(want)) want = 1000;
    START = Math.max(2, Math.min(1000, want));
    dotsInput.value = START;
    guessInput.max = START;
    guessInput.placeholder = 'e.g. ' + Math.min(437, START);
    simTitle.textContent = START + '-DOT ENTROPY ROYALE: FINAL TWO';
    guessLabel.innerHTML = 'Your pick (1&ndash;' + START + '):';
    var cols = Math.floor(W / 11), rows = Math.floor(H / 11);
    var cells = [];
    for (var cy = 0; cy < rows; cy++)
      for (var cx = 0; cx < cols; cx++)
        cells.push([cx, cy]);
    for (var i = cells.length - 1; i > 0; i--){
      var k = Math.floor(Math.random() * (i + 1));
      var tmp = cells[i]; cells[i] = cells[k]; cells[k] = tmp;
    }
    var n = Math.min(START, cells.length);
    for (var i = 0; i < n; i++){
      var a = Math.random() * Math.PI * 2;
      var sp = 0.8 + Math.random() * 1.4;
      parts.push({
        num: i + 1,
        x: cells[i][0] * 11 + 5.5 + (Math.random() - 0.5) * 4,
        y: cells[i][1] * 11 + 5.5 + (Math.random() - 0.5) * 4,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 2.6 + Math.random() * 1.8,
        c: PALETTE[i % PALETTE.length]
      });
    }
    guessInput.disabled = false;
    guessBtn.disabled = false;
    guessInput.style.opacity = '1';
    guessBtn.style.opacity = '1';
    guessBtn.textContent = 'Lock in guess & start';
    updateStatus();
  }
  function detonate(x, y, color, big){
    var n = big ? 22 : 5;
    for (var i = 0; i < n && debris.length < 500; i++){
      var a = Math.random() * Math.PI * 2;
      var sp = 1.2 + Math.random() * (big ? 4.5 : 2.6);
      debris.push({
        x: x, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: 0.8 + Math.random() * 1.6,
        c: color, life: 1
      });
    }
    if (big || parts.length <= 12) rings.push({x: x, y: y, r: 3, life: 1, big: !!big});
  }
  function capSpeed(p, max){
    var s = Math.hypot(p.vx, p.vy);
    if (s > max){ p.vx = p.vx / s * max; p.vy = p.vy / s * max; }
  }
  function buildGrid(){
    var cols = Math.ceil(W / CELL);
    var rows = Math.ceil(H / CELL);
    var grid = new Array(cols * rows);
    for (var i = 0; i < parts.length; i++){
      var p = parts[i];
      var cx = Math.max(0, Math.min(cols - 1, Math.floor(p.x / CELL)));
      var cy = Math.max(0, Math.min(rows - 1, Math.floor(p.y / CELL)));
      var k = cy * cols + cx;
      if (!grid[k]) grid[k] = [];
      grid[k].push(i);
    }
    return {grid: grid, cols: cols, rows: rows};
  }
  function updateStatus(){
    if (!started){
      statusEl.textContent = 'The dots are frozen. Lock in your guess to start the simulation.';
      return;
    }
    if (guess == null){
      statusEl.textContent = 'Simulation running.';
      return;
    }
    if (verdictShown) return;
    if (!guessAlive && guessDeadAt > 0){
      statusEl.textContent = 'Your pick #' + guess + ' was vaporized with ' + guessDeadAt + ' dots still standing.';
      return;
    }
    statusEl.textContent = 'Your pick: #' + guess + ' — still alive.' + (guessingClosed ? ' (guessing closed)' : ' (you can change it until ' + Math.max(FINAL + 1, Math.min(10, Math.ceil(START * 0.25))) + ' remain)');
  }
  function lockGuess(){
    var val = parseInt(guessInput.value, 10);
    if (isNaN(val) || val < 1 || val > START){
      statusEl.textContent = 'Pick a whole number between 1 and ' + START + '.';
      return;
    }
    var firstLock = !started;
    guess = val;
    started = true;
    guessAlive = parts.some(function(p){ return p.num === val; });
    if (firstLock){
      guessDeadAt = 0;
      guessBtn.textContent = 'Update guess';
    }
    updateStatus();
  }
  function frame(t){
    if (started){
      for (var i = 0; i < parts.length; i++){
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < p.r){ p.x = p.r; p.vx = Math.abs(p.vx); }
        if (p.x > W - p.r){ p.x = W - p.r; p.vx = -Math.abs(p.vx); }
        if (p.y < p.r){ p.y = p.r; p.vy = Math.abs(p.vy); }
        if (p.y > H - p.r){ p.y = H - p.r; p.vy = -Math.abs(p.vy); }
      }
      if (parts.length > FINAL && parts.length <= 8){
        for (var i = 0; i < parts.length; i++){
          var p = parts[i], best = null, bd = 1e9;
          for (var j = 0; j < parts.length; j++){
            if (i === j) continue;
            var q = parts[j];
            var d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y);
            if (d < bd){ bd = d; best = q; }
          }
          if (best){
            var dlen = Math.sqrt(bd) || 1;
            p.vx += (best.x - p.x) / dlen * 0.07;
            p.vy += (best.y - p.y) / dlen * 0.07;
            capSpeed(p, 3.4);
          }
        }
      }
      var di = -1, dj = -1;
      if (parts.length > FINAL){
        var G = buildGrid(), grid = G.grid, gcols = G.cols, grows = G.rows;
        outer:
        for (var i = 0; i < parts.length; i++){
          var a = parts[i];
          var ccx = Math.max(0, Math.min(gcols - 1, Math.floor(a.x / CELL)));
          var ccy = Math.max(0, Math.min(grows - 1, Math.floor(a.y / CELL)));
          for (var oy = -1; oy <= 1; oy++){
            for (var ox = -1; ox <= 1; ox++){
              var nx = ccx + ox, ny = ccy + oy;
              if (nx < 0 || ny < 0 || nx >= gcols || ny >= grows) continue;
              var cell = grid[ny * gcols + nx];
              if (!cell) continue;
              for (var c = 0; c < cell.length; c++){
                var j = cell[c];
                if (j <= i) continue;
                var b = parts[j];
                var dx = b.x - a.x, dy = b.y - a.y;
                var rr = a.r + b.r;
                if (dx * dx + dy * dy < rr * rr){ di = i; dj = j; break outer; }
              }
            }
          }
        }
      } else if (parts.length === FINAL){
        var a = parts[0], b = parts[1];
        var dx = b.x - a.x, dy = b.y - a.y;
        var rr = a.r + b.r;
        var d2 = dx * dx + dy * dy;
        if (d2 < rr * rr && d2 > 0.01){
          var d = Math.sqrt(d2);
          var nx = dx / d, ny = dy / d;
          var push = (rr - d) / 2;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
          var tx = a.vx; a.vx = b.vx; b.vx = tx;
          var ty = a.vy; a.vy = b.vy; b.vy = ty;
        }
      }
      if (di >= 0){
        var a = parts[di], b = parts[dj];
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var dead = {};
        if (parts.length === 3){
          // odd endgame: single elimination so exactly two survive
          var li = a.r <= b.r ? di : dj;
          detonate(parts[li].x, parts[li].y, parts[li].c, true);
          dead[li] = true;
          rings.push({x: mx, y: my, r: 6, life: 1, big: true});
        } else {
          detonate(a.x, a.y, a.c, false);
          detonate(b.x, b.y, b.c, false);
          dead[di] = true; dead[dj] = true;
          if (parts.length <= 12) rings.push({x: mx, y: my, r: 4, life: 1, big: false});
        }
        parts = parts.filter(function(p, k){ return !dead[k]; });
        if (guess != null && guessAlive){
          guessAlive = parts.some(function(p){ return p.num === guess; });
          if (!guessAlive){ guessDeadAt = parts.length; updateStatus(); }
        }
      }
      var closeAt = Math.max(FINAL + 1, Math.min(10, Math.ceil(START * 0.25)));
      if (!guessingClosed && parts.length <= closeAt && parts.length > FINAL){
        guessingClosed = true;
        guessInput.disabled = true;
        guessBtn.disabled = true;
        guessInput.style.opacity = '0.5';
        guessBtn.style.opacity = '0.5';
        updateStatus();
      }
      for (var i = debris.length - 1; i >= 0; i--){
        var d = debris[i];
        d.x += d.vx; d.y += d.vy;
        d.vx *= 0.985; d.vy *= 0.985;
        d.life -= 0.014;
        if (d.life <= 0) debris.splice(i, 1);
      }
      for (var i = rings.length - 1; i >= 0; i--){
        var g = rings[i];
        g.r += g.big ? 3.2 : 2.2;
        g.life -= g.big ? 0.03 : 0.05;
        if (g.life <= 0) rings.splice(i, 1);
      }
    }
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < debris.length; i++){
      var d = debris[i];
      ctx.globalAlpha = Math.max(0, d.life) * 0.85;
      ctx.fillStyle = d.c;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * d.life + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (var i = 0; i < rings.length; i++){
      var g = rings[i];
      ctx.globalAlpha = Math.max(0, g.life) * 0.7;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = g.big ? 3 : 2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    var done = started && parts.length === FINAL;
    var showNums = started && parts.length <= 40 && parts.length > FINAL;
    for (var i = 0; i < parts.length; i++){
      var p = parts[i];
      if (done){
        var pulse = 1 + 0.18 * Math.sin(t / 280 + i * 2);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(10, p.r * 2.2) * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, done ? Math.max(9, p.r) : p.r, 0, Math.PI * 2);
      ctx.fill();
      if (showNums || done){
        ctx.font = done ? '700 10px Orbitron, system-ui, sans-serif' : '700 8px Orbitron, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.75)';
        var label = String(p.num);
        ctx.strokeText(label, p.x, p.y + 0.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, p.x, p.y + 0.5);
      }
    }
    if (!started){
      ctx.fillStyle = mutedColor;
      ctx.globalAlpha = 0.9;
      ctx.font = '700 14px Orbitron, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PLACE YOUR GUESS TO BEGIN', W / 2, H / 2);
      ctx.globalAlpha = 1;
    }
    if (done){
      var s1 = parts[0].num, s2 = parts[1].num;
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.9;
      ctx.font = '700 15px Orbitron, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('DOTS #' + s1 + ' AND #' + s2 + ' SURVIVE', W / 2, 30);
      ctx.globalAlpha = 1;
      if (!verdictShown){
        verdictShown = true;
        if (guess == null){
          statusEl.textContent = 'Dots #' + s1 + ' and #' + s2 + ' walk out of the rubble.';
        } else if (guess === s1 || guess === s2){
          statusEl.textContent = 'NAILED IT. Your pick #' + guess + ' survived — one of the final two. Take a bow.';
        } else {
          statusEl.textContent = 'Dots #' + s1 + ' and #' + s2 + ' survive. Your pick #' + guess + ' is debris. Better luck next reset.';
        }
      }
    }
    var frac = (parts.length - FINAL) / (START - FINAL);
    meter.style.width = Math.max(0, frac * 100).toFixed(1) + '%';
    dotsLabel.textContent = 'dots: ' + parts.length;
    requestAnimationFrame(frame);
  }
  guessBtn.addEventListener('click', lockGuess);
  guessInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter') lockGuess();
  });
  document.getElementById('reset10').addEventListener('click', reset);
  resize();
  reset();
  if (window.ResizeObserver){ new ResizeObserver(function(){ resize(); }).observe(cv); }
  requestAnimationFrame(frame);
})();
