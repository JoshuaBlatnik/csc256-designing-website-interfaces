document.documentElement.classList.add('js'); // Add "js" class to <html> so CSS can style JS-enabled mode

// Wrap entire app logic in an IIFE (Immediately Invoked Function Expression) to avoid polluting global scope
const App = (() => {
  'use strict'; // Use strict mode for cleaner, safer JavaScript

  // ===== STATE AND DATA =====
  const state = {
    reduceMotion: false, // Tracks whether animations should be minimized
    features: [ // Array of feature objects that describe each feature card
      {
        id: 'editor', // Unique ID
        title: 'Live Code Editor', // Title shown on card
        text: 'Type JavaScript directly in the browser, run it instantly, and see results update in real time.', // Description
        sample: `// Basic console log
    log("Welcome to ScriptSense!")

    // Simple math
    log("2 + 2 =", 2 + 2)` // Code sample inserted into editor when button clicked
      },
      {
        id: 'errors',
        title: 'Error Helper',
        text: 'See plain-language explanations for common errors like typos, missing brackets, or undefined values.',
        sample: `// This triggers a ReferenceError
    log(myUndefinedVar)` // Sample error code
      },
      {
        id: 'objects',
        title: 'Object Explorer',
        text: 'Experiment with objects and arrays, add new data, and instantly view updates in the console.',
        sample: `const car = { make: "Toyota", model: "Tacoma" }
    car.year = 2023
    car.mods = ["lift kit", "roof rack"]
    log(car)`
      },
      {
        id: 'functions',
        title: 'Helper Functions',
        text: 'Use built-in helpers like clamp, lerp, and more to simplify your math and logic.',
        sample: `log("Clamp 120 to range 0–100:", clamp(120,0,100))
    log("Lerp from 0 to 10 at 0.35:", lerp(0,10,0.35).toFixed(2))`
      },
      {
        id: 'dom',
        title: 'DOM Builder',
        text: 'Learn how to create and style elements dynamically with just a few lines of JavaScript.',
        sample: `const box = document.createElement("div")
    box.textContent = "Dynamic Box"
    box.style.cssText = "padding:10px;background:#4fd1c5;color:#fff;border-radius:8px"
    document.body.appendChild(box)`
      },
      {
        id: 'events',
        title: 'Event Listeners',
        text: 'Attach click, hover, or keyboard events to elements to make pages interactive.',
        sample: `const btn = document.createElement("button")
    btn.textContent = "Click Me"
    document.body.appendChild(btn)

    btn.addEventListener("click", () => {
      log("Button was clicked!")
    })`
      },
      {
        id: 'animations',
        title: 'Animations',
        text: 'Create smooth animations using requestAnimationFrame and JavaScript transforms.',
        sample: `const ball = document.createElement("div")
    ball.style.cssText = "width:40px;height:40px;border-radius:50%;background:#ff6b6b;position:relative"
    document.body.appendChild(ball)

    let t = 0
    function animate(){
      t += 0.05
      ball.style.transform = "translateX(" + Math.sin(t) * 80 + "px)"
      requestAnimationFrame(animate)
    }
    animate()`
      },
      {
        id: 'snippets',
        title: 'Quick Snippets',
        text: 'Insert ready-made code snippets to explore arrays, loops, and string methods with one click.',
        sample: `const fruits = ["apple","banana","cherry"]
    log("Uppercase:", fruits.map(f => f.toUpperCase()))
    log("Filtered:", fruits.filter(f => f.startsWith("b")))`
      }
    ]
  };

  // ===== UTILITIES =====
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max); // Restrict value to range
  const lerp = (a, b, t) => a + (b - a) * t; // Linear interpolation
  const qs = (sel, el = document) => el.querySelector(sel); // Shorthand querySelector
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)]; // Shorthand querySelectorAll
  const on = (el, type, fn, opts) => el.addEventListener(type, fn, opts); // Add event listener

  // ===== CURSOR BLOB =====
  function initCursorBlob(){
    const blob = qs('#cursorBlob'); // Grab the blob element
    let x = -100, y = -100, tx = -100, ty = -100; // Track positions
    let raf = null; // Animation frame ID

    function loop(){ // Animation loop
      const speed = state.reduceMotion ? 0.35 : 0.18; // Adjust speed if reduce motion enabled
      x = lerp(x, tx, speed); // Smoothly update x
      y = lerp(y, ty, speed); // Smoothly update y
      blob.style.transform = `translate3d(${x - 28}px, ${y - 28}px, 0)`; // Move blob
      raf = requestAnimationFrame(loop); // Repeat
    }
    loop();

    on(window, 'pointermove', (e)=>{ tx = e.clientX; ty = e.clientY; }); // Update target on mouse move
    on(window, 'blur', ()=> cancelAnimationFrame(raf)); // Stop animating when tab not focused
    on(window, 'focus', ()=> { raf = requestAnimationFrame(loop); }); // Resume animating when refocused
  }

  // ===== HEADER MENU (MOBILE) =====
  function initMenu(){
    const btn = qs('#menuToggle'); // Menu button
    const list = qs('#navList'); // Navigation list
    on(btn, 'click', ()=>{ // Toggle menu on click
      const open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ===== FEATURE CARDS =====
  function renderFeatures(){
    const grid = qs('#featureGrid'); // Container for feature cards
    grid.innerHTML = ''; // Clear existing content
    state.features.forEach(f => { // Loop through features
      const card = document.createElement('article'); // Create card
      card.className = 'featureCard';
      card.innerHTML = `
        <div class="glow"></div>
        <h3>${f.title}</h3>
        <p>${f.text}</p>
        <div class="actions">
          <button class="btn" data-insert="${f.id}">Insert sample</button>
        </div>
      `;

      // Tilt/glow effect on hover
      on(card, 'pointermove', (e)=>{
        const r = card.getBoundingClientRect();
        const mx = clamp((e.clientX - r.left) / r.width, 0, 1);
        const my = clamp((e.clientY - r.top) / r.height, 0, 1);
        const rx = (0.5 - my) * 6;
        const ry = (mx - 0.5) * 8;
        card.style.setProperty('--mx', (mx * 100) + '%');
        card.style.setProperty('--my', (my * 100) + '%');
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      });
      on(card, 'pointerleave', ()=> card.style.transform = 'translateZ(0)'); // Reset tilt
      grid.appendChild(card); // Add to grid
    });

    // Click handler for Insert Sample buttons
    grid.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-insert]');
      if(!btn) return;
      const id = btn.getAttribute('data-insert');
      const f = state.features.find(x => x.id === id); // Find matching feature
      if(f){
        const ta = qs('#code'); // Code textarea
        ta.value = f.sample.replaceAll('\\n','\n'); // Insert sample
        goToEditor(); // Scroll to editor
      }
    });
  }

  // ===== EDITOR AND PREVIEW =====
  function initEditor(){
    const code = qs('#code'); // Code textarea
    const iframe = qs('#preview'); // Sandbox iframe
    const consoleEl = qs('#console'); // Console panel
    const btnRun = qs('#btnRun'); // Run button
    const btnReset = qs('#btnReset'); // Reset button
    const btnExplain = qs('#btnExplain'); // Explain error button
    const reduce = qs('#reduceMotion'); // Reduce motion toggle

    // Default starter code
    code.value = `// Welcome to ScriptSense
// Use log(value) to print to the console panel.

log('2 + 2 =', 2 + 2)`;

    // Sync reduceMotion with system preference
    reduce.checked = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.reduceMotion = reduce.checked;
    on(reduce, 'change', ()=> state.reduceMotion = reduce.checked);

    // Write user code into iframe safely
    function writePreview(js){
      if(!iframe) return;
      const html = `
        <!doctype html><html><head><meta charset="utf-8">
        <style>body{font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:12px;margin:0}</style>
        </head><body><div id="root"></div>
        <script>
          function log(){ parent.postMessage({type:'ok', data:[...arguments].map(String)}, '*') }
          window.onerror = function(msg){ parent.postMessage({type:'err', data:[String(msg)]}, '*') }
        <\/script>
        <script>
          try {${'\n'}${js}${'\n'}} catch(e){ parent.postMessage({type:'err', data:[String(e.message)]}, '*') }
        <\/script>
        </body></html>`;
      iframe.srcdoc = html; // Set iframe content
    }

    function clearConsole(){ consoleEl.innerHTML = ''; } // Clear console
    function printLine(type, parts){ // Print new line to console
      const div = document.createElement('div');
      div.className = 'line ' + type;
      div.textContent = parts.join(' ');
      consoleEl.appendChild(div);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    // Listen for messages from iframe
    on(window, 'message', (e)=>{
      if(!e.data || !e.data.type) return;
      printLine(e.data.type, e.data.data);
    });

    // Button handlers
    on(btnRun, 'click', ()=>{ clearConsole(); writePreview(code.value); });
    on(btnReset, 'click', ()=>{
      code.value = `// Welcome to ScriptSense
// Use log(value) to print to the console panel.

log('2 + 2 =', 2 + 2)`;
      clearConsole();
      writePreview(code.value);
    });
    on(btnExplain, 'click', ()=>{
      const msg = guessErrorHint(code.value);
      printLine('err', [msg]);
    });

    writePreview(code.value); // Run default code once
  }

  // ===== ERROR HELPER =====
  function guessErrorHint(src){
    const patterns = [
      { re: /ReferenceError:\s*(\w+)/i, hint: (m)=>`Looks like ${m[1]} is not defined. Did you spell it right or declare it first with const or let` },
      { re: /SyntaxError: Unexpected token '([^']+)'/i, hint: (m)=>`There is an unexpected token ${m[1]}. Check for a missing comma or bracket` },
      { re: /TypeError:\s*([\w.]+)\s*is not a function/i, hint: (m)=>`Tried to call ${m[1]} as a function. Check the value or its type` },
      { re: /Cannot read properties of undefined/i, hint: ()=>`Tried to read a property of undefined. Make sure the object exists before you access it` }
    ];
    for(const p of patterns){
      const m = src.match(p.re);
      if(m) return p.hint(m); // Return first matching hint
    }
    return 'If you see an error in the console, read the first line and check for missing commas, braces, or typos.';
  }

  // ===== BACKGROUND PARTICLE CANVAS =====
  function initCanvas(){
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let w, h, raf;
    const dots = [];
    const dotCount = 42;

    function size(){ // Resize canvas to match container
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    }
    size();
    window.addEventListener('resize', size);

    // Create random dots
    for(let i=0;i<dotCount;i++){
      dots.push({
        x: Math.random()*w,
        y: Math.random()*h,
        vx: (Math.random()*2-1)*0.4,
        vy: (Math.random()*2-1)*0.4,
        r: 1.5 + Math.random()*2.5
      });
    }

    // Animation loop for dots
    function draw(){
      ctx.clearRect(0,0,w,h);
      for(const d of dots){
        d.x += d.vx * (state.reduceMotion ? 0.4 : 1);
        d.y += d.vy * (state.reduceMotion ? 0.4 : 1);
        if(d.x < 0 || d.x > w) d.vx *= -1;
        if(d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r*4);
        g.addColorStop(0, 'rgba(25,125,255,0.35)');
        g.addColorStop(1, 'rgba(255,130,90,0)');
        ctx.fillStyle = g;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
        ctx.fill();
      }
      // Draw link lines between close dots
      for(let i=0;i<dots.length;i++){
        for(let j=i+1;j<dots.length;j++){
          const a = dots[i], b = dots[j];
          const dx = a.x-b.x, dy=a.y-b.y, dist = Math.hypot(dx,dy);
          if(dist < 120){
            ctx.strokeStyle = 'rgba(60,90,130,' + (1 - dist/120) * 0.25 + ')';
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('blur', ()=> cancelAnimationFrame(raf)); // Pause when not focused
    window.addEventListener('focus', ()=> raf = requestAnimationFrame(draw)); // Resume
  }

  // ===== ELEVATE HEADER =====
  function initElevate(){
    const head = qsa('[data-elevate]');
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e => {
        e.target.classList.toggle('isElevated', !e.isIntersecting);
      });
    }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 });
    head.forEach(el => obs.observe(el));
  }

  // ===== CONTACT FORM =====
  function initForm(){
    const form = qs('#contactForm');
    const msg = qs('#formMsg');
    on(form, 'submit', (e)=>{
      e.preventDefault();
      const email = qs('#email').value.trim();
      const text = qs('#feedback').value.trim();
      if(!email){
        msg.textContent = 'Please enter an email';
        return;
      }
      msg.textContent = 'Thanks. Message received.';
      form.reset();
    });
  }

  // ===== SCROLL EFFECTS =====
  function initScrollFX(){
    const bar = document.createElement('div'); // Progress bar
    bar.id = 'scrollBar';
    document.body.appendChild(bar);

    // Reveal sections on scroll
    const sections = qsa('[data-section]');
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    sections.forEach(s => io.observe(s));

    // Hero parallax references
    const heroTitle = qs('.hero .brand'); 
    const heroSub   = qs('.hero .subtitle'); 
    const heroWrap  = qs('.hero .wrap'); 

    let ticking = false;
    function onScroll(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(()=>{
        const y = window.scrollY || 0;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const p = y / max;
        bar.style.transform = `scaleX(${p})`; // Progress bar width

        if(!state.reduceMotion){
          if(heroWrap)  heroWrap.style.transform  = `translateY(${y * 0.04}px)`;
          if(heroSub)   heroSub.style.transform   = `translateY(${y * 0.06}px)`;
          if(heroTitle) heroTitle.style.transform = `translateY(${y * 0.08}px)`;
          const can = document.getElementById('bgCanvas'); // Fade canvas as you scroll
          if(can){
            const h = window.innerHeight || 1;
            const t = Math.max(0, 1 - y / (h * 0.9));
            can.style.opacity = String(t);
          }
        }
        ticking = false;
      });
    }

    if(state.reduceMotion){ // Skip animations
      sections.forEach(s => s.classList.add('in'));
    }else{
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Fallback if IntersectionObserver is not supported in the browser
if (!('IntersectionObserver' in window)) {
  // If the browser does not support IntersectionObserver,
  // mark all sections as "in" so they are always visible.
  sections.forEach(s => s.classList.add('in'));
} else {
  // If IntersectionObserver exists:
  io.takeRecords?.(); // Flush any pending observation records (optional chaining used for safety)

  // Use requestAnimationFrame so DOM is fully updated before checking
  requestAnimationFrame(() => {
    // Loop through all sections manually
    sections.forEach(s => {
      const r = s.getBoundingClientRect(); // Get section’s position on screen
      // If the section is at least partly visible, add the "in" class
      if (r.top < innerHeight * 0.9 && r.bottom > 0) s.classList.add('in');
    });
  });
}
}

// ===== Expose helpers globally =====
// Make clamp() and lerp() available globally so preview iframe can use them
window.clamp = clamp; 
window.lerp = lerp;

// ===== INIT FUNCTION =====
function init(){
  initCursorBlob();   // Enable animated cursor blob
  initMenu();         // Set up mobile nav menu toggle
  renderFeatures();   // Render feature cards dynamically
  initEditor();       // Initialize live editor + preview
  initCanvas();       // Start background particle animation
  initElevate();      // Make header elevate on scroll
  initForm();         // Fake contact form submission
  initScrollFX();     // Scroll effects: progress bar, parallax, reveals
  initAnchors();      // Smooth anchor scrolling

  // Extra polish: tilt effect for the About highlights card
  (function(){
    const card = document.querySelector('.about .card.accent'); // Select the special About card
    if(!card) return; // If it doesn’t exist, skip

    // Add tilt on pointer move
    card.addEventListener('pointermove', e=>{
      const r = card.getBoundingClientRect(); // Get card size + position
      const mx = (e.clientX - r.left) / r.width; // Mouse X % inside card
      const my = (e.clientY - r.top) / r.height; // Mouse Y % inside card
      const rx = (0.5 - my) * 6; // Rotate X based on Y position
      const ry = (mx - 0.5) * 8; // Rotate Y based on X position
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; // Apply tilt
    });

    // Reset tilt when mouse leaves card
    card.addEventListener('pointerleave', ()=> card.style.transform = '');
  })();
}

// ===== Jump to the Editor Section =====
function goToEditor() {
  const editorSection = document.getElementById('playground'); // Get editor section
  const ta = document.getElementById('code'); // Grab code textarea
  if (editorSection) {
    // Smoothly scroll to the editor section
    editorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Update URL to #playground without causing a jump
    history.pushState(null, '', '#playground');
  }
}

// ===== Smooth anchor scrolling =====
function initAnchors(){
  const header = document.querySelector('.siteHeader'); // Header element

  // Function: update CSS variable with current header height
  function setHeaderVar(){
    const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--headerH', h + 'px');
  }
  setHeaderVar(); // Run once at load
  window.addEventListener('resize', setHeaderVar); // Update on resize

  // Listen for clicks on any anchor link
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]'); // Only anchors with hashes
    if (!link) return;

    const raw = link.getAttribute('href');     // e.g. "#about"
    const id = decodeURIComponent(raw).slice(1); // Remove the "#" to get ID
    if (!id) return;

    const target = document.getElementById(id); // Get section element
    if (!target) return; // If section doesn’t exist, let browser handle it

    e.preventDefault(); // Stop default jump scroll

    // Smooth scroll to the section (CSS scroll-padding-top handles header offset)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update URL hash without triggering an extra jump
    history.pushState(null, '', `#${id}`);

    // Close mobile menu if it’s open
    const navList = document.getElementById('navList');
    const menuBtn = document.getElementById('menuToggle');
    if (navList && navList.classList.contains('open')) {
      navList.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== Return public API =====
return { init };
})();

// ===== BOOT APP =====
// Wait for DOM to load, then run init()
document.addEventListener('DOMContentLoaded', App.init);