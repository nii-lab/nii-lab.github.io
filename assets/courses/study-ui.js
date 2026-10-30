(() => {
 const init = () => {
  if (document.documentElement.dataset.studyReady) return;
  document.documentElement.dataset.studyReady = "true";
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const koreanDefs={notebook:'설명·코드·출력을 셀 단위로 묶어 보관하는 문서입니다. 파일 확장자는 .ipynb입니다.',colab:'브라우저에서 Notebook의 Python 코드를 실행하는 서비스입니다. 계산은 연결된 런타임에서 수행됩니다.',drive:'Notebook 파일을 보관하는 공간입니다. 실행 중인 변수와 임시 파일이 전부 자동 저장되는 것은 아닙니다.',markdown:'제목·목록·표 등 설명을 표시하는 셀입니다. 여기에 표시한 Python 코드는 자동 실행되지 않습니다.',codecell:'Python 코드를 실제로 실행하는 셀입니다. 실행 결과는 셀 아래에 나타납니다.',transfer:'영 초기조건에서 출력의 라플라스 변환을 입력의 라플라스 변환으로 나눈 관계입니다.',initial:'입력을 새로 가하기 직전 시스템의 상태입니다. 예: 물체의 위치·속도, 커패시터 전압.',step:'입력이 0에서 1로 바뀌어 유지될 때의 출력을 계산합니다. 입출력 단위는 모델마다 다릅니다.',steady:'충분히 시간이 지난 뒤의 상태입니다. 여기서는 안정한 모델에 일정 입력을 가한 경우를 살펴봅니다.'};
  const defs = english ? {"notebook": "A document that stores explanations, code and output in cells. Its file extension is .ipynb.", "colab": "A browser service for running Python code in notebooks. Computation takes place in the connected runtime.", "drive": "Storage for notebook files. Runtime variables and temporary files are not necessarily saved automatically.", "markdown": "A cell for displaying explanations, headings, lists and tables. Python code shown here is not executed.", "codecell": "A cell that executes Python code. Its output appears below the cell.", "transfer": "Under zero initial conditions, the ratio of the Laplace transform of the output to that of the input.", "initial": "The system state immediately before a new input is applied, such as position and velocity, or capacitor voltage.", "step": "Computes the output when the input changes from 0 to 1 and remains there. Input and output units depend on the model.", "steady": "The state after transients have settled. Here we consider a stable model driven by a constant input."} : koreanDefs;
  document.querySelectorAll('term[data-key]').forEach((el,i)=>{
    const wrap=document.createElement('span');wrap.className='term';
    const button=document.createElement('button');button.type='button';button.className='term-button';button.textContent=el.textContent;button.setAttribute('aria-expanded','false');
    const tip=document.createElement('span');tip.id='term-hint-'+i;tip.className='term-hint';tip.role='tooltip';tip.hidden=true;tip.textContent=defs[el.dataset.key]||'';
    button.setAttribute('aria-controls',tip.id);button.setAttribute('aria-describedby',tip.id);wrap.append(button,tip);el.replaceWith(wrap);
    let pinned=false;
    const show=()=>{tip.hidden=false;button.setAttribute('aria-expanded','true');tip.style.transform='';const r=tip.getBoundingClientRect();if(r.right>innerWidth-16)tip.style.transform=`translateX(${innerWidth-16-r.right}px)`;};
    const hide=()=>{tip.hidden=true;button.setAttribute('aria-expanded','false');};
    wrap.addEventListener('mouseenter',show);wrap.addEventListener('mouseleave',()=>{if(!pinned&&!wrap.contains(document.activeElement))hide();});
    button.addEventListener('focus',show);button.addEventListener('blur',()=>{if(!pinned)hide();});
    button.addEventListener('click',()=>{pinned=!pinned;pinned?show():hide();});
    button.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;hide();}});
    document.addEventListener('click',e=>{if(!wrap.contains(e.target)){pinned=false;hide();}});
  });
  const panels = Array.from(document.querySelectorAll('main details'));
  const header = document.querySelector('#title-block-header');
  if (header && panels.length) {
    const bar = document.createElement('div');
    bar.className = 'reading-tools';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', english ? 'Expand or collapse explanations and answers' : '설명과 확인 답변 펼치기');
    const status = document.createElement('span');
    status.className = 'reading-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const buttons = [];
    const sync = () => {
      const count = panels.filter(d => d.open).length;
      status.textContent = english ? `${count} of ${panels.length} expanded · includes answers` : `${panels.length}개 중 ${count}개 펼침 · 확인 답변 포함`;
      buttons[0].disabled = count === panels.length;
      buttons[1].disabled = count === 0;
    };
    for (const [label, expand] of [[english ? 'Expand all' : '모두 펼치기', true], [english ? 'Collapse all' : '모두 접기', false]]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => {
        panels.forEach(panel => { panel.open = expand; });
        sync();
      });
      buttons.push(button);
      bar.append(button);
    }
    panels.forEach(panel => panel.addEventListener('toggle', sync));
    bar.append(status);
    header.after(bar);
    sync();
  }
 };
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
 else init();
})();
