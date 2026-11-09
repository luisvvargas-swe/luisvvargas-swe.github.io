/* Banco de pruebas con imágenes sintéticas. La detección sólo recibe los píxeles de la muestra. */
(() => {
  const width = 720, height = 440, rows = 2, columns = 5;
  const cells = Array.from({length: rows * columns}, (_, i) => ({
    x: 140 + (i % columns) * 110, y: 157 + Math.floor(i / columns) * 115
  }));
  const scenarios = {
    completa: Array(10).fill('presente'),
    faltante: Array.from({length: 10}, (_, i) => i === 3 ? 'vacío' : 'presente'),
    mixta: Array.from({length: 10}, (_, i) => i === 3 ? 'vacío' : i === 6 ? 'fractura' : 'presente')
  };
  function rounded(ctx, x, y, w, h, radius, fill) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill();
  }
  function disc(ctx, x, y, r, fill) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fillStyle = fill; ctx.fill();
  }
  function gradient(ctx, x, y, r, stops) {
    const g = ctx.createRadialGradient(x-r*.25,y-r*.35,2,x,y,r);
    stops.forEach(([at,color]) => g.addColorStop(at,color)); return g;
  }
  function makeSample(scenario) {
    const sample = document.createElement('canvas'); sample.width = width; sample.height = height;
    const ctx = sample.getContext('2d', {willReadFrequently:true});
    ctx.fillStyle = '#152428'; ctx.fillRect(0,0,width,height);
    for (let y=0; y<height; y+=7) for(let x=0; x<width; x+=7) {
      ctx.fillStyle = (x+y)%3 ? '#253539' : '#304044'; ctx.fillRect(x,y,1,1);
    }
    ctx.save(); ctx.shadowColor = '#060e10'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
    const sheet = ctx.createLinearGradient(64,70,640,370);
    [[0,'#b2b9b4'],[.23,'#6d7e7c'],[.48,'#b8c2bc'],[.72,'#758789'],[1,'#b6c3c0']].forEach(([i,v])=>sheet.addColorStop(i,v));
    rounded(ctx,68,87,584,255,19,sheet); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(70,89,580,251,18); ctx.clip();
    for (let y=89; y<340;y+=4) {
      ctx.strokeStyle = 'rgba(249,255,242,.13)'; ctx.beginPath(); ctx.moveTo(68,y); ctx.lineTo(652,y+4); ctx.stroke();
      for(let x=70+((y%8)?2:0);x<652;x+=5) {ctx.fillStyle='rgba(12,34,33,.19)';ctx.fillRect(x,y,1,2);}
    }
    ctx.restore();
    cells.forEach(({x,y},i) => {
      const state=scenarios[scenario][i];
      disc(ctx,x,y,43,gradient(ctx,x,y,43,[[0,'#465552'],[.72,'#74827f'],[.82,'#c3cdc7'],[.88,'#e0e2d6'],[.95,'#82908a'],[1,'#586b67']]));
      disc(ctx,x,y,32,gradient(ctx,x,y,32,[[0,'#445351'],[.8,'#3b4948'],[1,'#697672']]));
      if(state==='vacío') return;
      ctx.save(); ctx.shadowColor='#263533'; ctx.shadowBlur=3; ctx.shadowOffsetY=3;
      disc(ctx,x,y,27,gradient(ctx,x,y,27,[[0,'#f5f4e9'],[.67,'#e5e6d7'],[.90,'#d5d7c8'],[1,'#aeb5aa']])); ctx.restore();
      ctx.beginPath();
      if(state==='fractura') {
        ctx.moveTo(x-23,y-16);ctx.lineTo(x-8,y-8);ctx.lineTo(x-2,y+1);ctx.lineTo(x+8,y+4);ctx.lineTo(x+22,y+16);
        ctx.strokeStyle='#42514c'; ctx.lineWidth=6;
      } else {
        ctx.moveTo(x-15,y+11);ctx.lineTo(x+15,y-11);ctx.strokeStyle='#c8cebf';ctx.lineWidth=2;
      }
      ctx.stroke();ctx.lineWidth=1;
    });
    return sample;
  }
  function inspect(sample) {
    const pix=sample.getContext('2d').getImageData(0,0,width,height).data;
    return cells.map(({x,y})=>{
      let dark=0, total=0;
      for(let cy=-19;cy<=19;cy++) for(let cx=-19;cx<=19;cx++) {
        if(cx*cx+cy*cy>19*19) continue;
        const offset=((y+cy)*width+x+cx)*4;
        if((pix[offset]+pix[offset+1]+pix[offset+2])/3<145) dark++;
        total++;
      }
      const ratio=dark/total;
      return ratio>.85 ? 'vacío' : ratio>.05 ? 'fractura' : 'presente';
    });
  }
  function render(canvas, scenario, annotations) {
    const sample=makeSample(scenario), result=inspect(sample);
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d'); ctx.drawImage(sample,0,0);
    if(annotations) cells.forEach(({x,y},i)=>{
      const s=result[i], size=46, tip=12;
      ctx.lineWidth=2;ctx.strokeStyle=s==='presente'?'#ccff80':'#ffbd70';
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>{
        const a=x+dx*size,b=y+dy*size;
        ctx.beginPath();ctx.moveTo(a-dx*tip,b);ctx.lineTo(a,b);ctx.lineTo(a,b-dy*tip);ctx.stroke();
      });
      if(s!=='presente') {
        const label=s==='vacío'?'VACÍO':'FRACTURA'; ctx.font='bold 13px monospace';
        rounded(ctx,x-size,y+size-2,ctx.measureText(label).width+12,17,2,'#ffc27b');
        ctx.fillStyle='#26302b';ctx.fillText(label,x-size+6,y+size+11);
      }
    });
    const marks=result.filter(s=>s!=='presente').length;
    canvas.setAttribute('aria-label','Blíster sintético con diez posiciones. '+marks+' requieren revisión.');
    return result;
  }
  document.querySelectorAll('[data-blister]').forEach(canvas=>{
    if(!canvas.closest('[data-lab]')) render(canvas,'faltante',true);
  });
  const lab=document.querySelector('[data-lab]');
  if(!lab) return;
  const canvas=lab.querySelector('canvas'), select=lab.querySelector('select'), marks=lab.querySelector('input');
  function update(){
    const result=render(canvas,select.value,marks.checked);
    const faults=result.map((state,i)=>({state,i})).filter(({state})=>state!=='presente');
    const line=(i)=>'Fila '+(Math.floor(i/columns)+1)+', columna '+(i%columns+1);
    lab.querySelector('[data-count]').textContent=String(10-faults.length)+'/10';
    lab.querySelector('[data-faults]').textContent=faults.length ? faults.map(({i,state})=>line(i)+' · '+(state==='vacío'?'cavidad vacía':'posible fractura')).join('. ')+'.' : 'Las diez cavidades contienen una tableta íntegra.';
  }
  select.addEventListener('change',update); marks.addEventListener('change',update); update();
})();
