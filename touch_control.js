// タッチ操作用仮想パッドUIとイベント処理
(function() {
  const canvas = document.getElementById('game-canvas');
  const ui = document.getElementById('ui');
  // 仮想パッドUIを追加
  const pad = document.createElement('div');
  pad.id = 'touch-pad';
  pad.style.position = 'absolute';
  pad.style.left = '0';
  pad.style.bottom = '0';
  pad.style.width = '50vw';
  pad.style.height = '40vh';
  pad.style.zIndex = '10';
  pad.style.touchAction = 'none';
  pad.innerHTML = '<div id="stick" style="position:absolute;left:40vw;bottom:20vh;width:80px;height:80px;border-radius:50%;background:rgba(0,128,255,0.2);border:2px solid #0af;transform:translate(-50%,-50%);"></div>';
  document.body.appendChild(pad);

  // ショットボタン
  const shotBtn = document.createElement('button');
  shotBtn.textContent = 'SHOT';
  shotBtn.id = 'touch-shot';
  shotBtn.style.position = 'absolute';
  // GAME OVER時は画面中央やや上、普段は非表示
  // ドラッグ移動用座標
  let dragOffsetX = 0, dragOffsetY = 0, isDragging = false;
  let shotBtnX = 555, shotBtnY = 506; // 初期座標を指定

  const updateShotBtnPos = () => {
    shotBtn.style.left = shotBtnX + 'px';
    shotBtn.style.top = shotBtnY + 'px';
  };


  // ドラッグ操作
  shotBtn.addEventListener('mousedown', function(e){
    isDragging = true;
    dragOffsetX = e.clientX - shotBtn.offsetLeft;
    dragOffsetY = e.clientY - shotBtn.offsetTop;
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', function(e){
    if(isDragging) {
      shotBtnX = e.clientX - dragOffsetX;
      shotBtnY = e.clientY - dragOffsetY;
      shotBtn.style.left = shotBtnX + 'px';
      shotBtn.style.top = shotBtnY + 'px';
    }
  });
  window.addEventListener('mouseup', function(e){
    if(isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
    }
  });




  window.addEventListener('resize', updateShotBtnPos);
  window.addEventListener('orientationchange', updateShotBtnPos);
  setTimeout(updateShotBtnPos, 100); // 初期配置
  shotBtn.style.width = '80px';
  shotBtn.style.height = '80px';
  shotBtn.style.borderRadius = '50%';
  shotBtn.style.background = 'linear-gradient(135deg,#f44,#faa)';
  shotBtn.style.color = '#fff';
  shotBtn.style.fontSize = '1.5em';
  shotBtn.style.border = '2px solid #f44';
  shotBtn.style.zIndex = '10';
  shotBtn.style.opacity = '0.85';
  shotBtn.style.pointerEvents = 'auto';
  shotBtn.style.touchAction = 'none';
  shotBtn.style.position = 'absolute';
  document.body.appendChild(shotBtn);

  // 常に表示
  shotBtn.style.display = '';
  updateShotBtnPos();

  // タッチパッドの動作
  let touchId = null, startX = 0, startY = 0, moveX = 0, moveY = 0;
  let stick = document.getElementById('stick');

  // タッチ操作
  pad.addEventListener('touchstart', function(e) {
    if(touchId!==null) return;
    const t = e.changedTouches[0];
    touchId = t.identifier;
    startX = t.clientX;
    startY = t.clientY;
    stick.style.left = (startX/window.innerWidth*100)+'vw';
    stick.style.bottom = (40-(startY/window.innerHeight*40))+'vh';
    stick.style.background = 'rgba(0,128,255,0.4)';
    moveX = moveY = 0;
    e.preventDefault();
  }, {passive:false});
  pad.addEventListener('touchmove', function(e) {
    if(touchId===null) return;
    for(const t of e.changedTouches) {
      if(t.identifier===touchId) {
        moveX = t.clientX - startX;
        moveY = t.clientY - startY;
        stick.style.left = (t.clientX/window.innerWidth*100)+'vw';
        stick.style.bottom = (40-(t.clientY/window.innerHeight*40))+'vh';
        break;
      }
    }
    e.preventDefault();
  }, {passive:false});
  pad.addEventListener('touchend', function(e) {
    for(const t of e.changedTouches) {
      if(t.identifier===touchId) {
        touchId = null;
        stick.style.left = '40vw';
        stick.style.bottom = '20vh';
        stick.style.background = 'rgba(0,128,255,0.2)';
        moveX = moveY = 0;
        break;
      }
    }
    e.preventDefault();
  }, {passive:false});

  // マウス操作（デバッグ用）
  let mouseDown = false;
  pad.addEventListener('mousedown', function(e) {
    mouseDown = true;
    startX = e.clientX;
    startY = e.clientY;
    stick.style.left = (startX/window.innerWidth*100)+'vw';
    stick.style.bottom = (40-(startY/window.innerHeight*40))+'vh';
    stick.style.background = 'rgba(0,128,255,0.4)';
    moveX = moveY = 0;
    e.preventDefault();
  });
  pad.addEventListener('mousemove', function(e) {
    if(!mouseDown) return;
    moveX = e.clientX - startX;
    moveY = e.clientY - startY;
    stick.style.left = (e.clientX/window.innerWidth*100)+'vw';
    stick.style.bottom = (40-(e.clientY/window.innerHeight*40))+'vh';
    e.preventDefault();
  });
  pad.addEventListener('mouseup', function(e) {
    mouseDown = false;
    stick.style.left = '40vw';
    stick.style.bottom = '20vh';
    stick.style.background = 'rgba(0,128,255,0.2)';
    moveX = moveY = 0;
    e.preventDefault();
  });
  pad.addEventListener('mouseleave', function(e) {
    if(mouseDown) {
      mouseDown = false;
      stick.style.left = '40vw';
      stick.style.bottom = '20vh';
      stick.style.background = 'rgba(0,128,255,0.2)';
      moveX = moveY = 0;
    }
  });

  // ゲーム本体のキー状態に反映
  function updateTouchKeys() {
    // 方向
    if(touchId!==null || mouseDown) {
      const dx = moveX, dy = moveY;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist>16) {
        // 八方向判定
        const angle = Math.atan2(dy, dx) * 180 / Math.PI; // -180～180度（左右正しく）
        keys['ArrowUp'] = keys['ArrowDown'] = keys['ArrowLeft'] = keys['ArrowRight'] = false;
        if(angle >= -22.5 && angle < 22.5) {
          keys['ArrowRight'] = true;
        } else if(angle >= 22.5 && angle < 67.5) {
          keys['ArrowRight'] = true; keys['ArrowDown'] = true;
        } else if(angle >= 67.5 && angle < 112.5) {
          keys['ArrowDown'] = true;
        } else if(angle >= 112.5 && angle < 157.5) {
          keys['ArrowDown'] = true; keys['ArrowLeft'] = true;
        } else if(angle >= 157.5 || angle < -157.5) {
          keys['ArrowLeft'] = true;
        } else if(angle >= -157.5 && angle < -112.5) {
          keys['ArrowLeft'] = true; keys['ArrowUp'] = true;
        } else if(angle >= -112.5 && angle < -67.5) {
          keys['ArrowUp'] = true;
        } else if(angle >= -67.5 && angle < -22.5) {
          keys['ArrowUp'] = true; keys['ArrowRight'] = true;
        }
      } else {
        keys['ArrowUp']=keys['ArrowDown']=keys['ArrowLeft']=keys['ArrowRight']=false;
      }
    } else {
      keys['ArrowUp']=keys['ArrowDown']=keys['ArrowLeft']=keys['ArrowRight']=false;
    }
    requestAnimationFrame(updateTouchKeys);
  }
  updateTouchKeys();

  // ショットボタン
  // タッチ
  shotBtn.addEventListener('touchstart', function(e){
    keys[' ']=true;
    e.preventDefault();
  },{passive:false});
  shotBtn.addEventListener('touchend', function(e){
    keys[' ']=false;
    e.preventDefault();
  },{passive:false});
  // マウス
  shotBtn.addEventListener('mousedown', function(e){
    keys[' ']=true;
    e.preventDefault();
  });
  shotBtn.addEventListener('mouseup', function(e){
    keys[' ']=false;
    e.preventDefault();
  });
})();
