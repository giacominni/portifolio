import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// ESTILOS GLOBAIS
// ============================================================
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=Noto+Sans+JP:wght@100;400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

/* ---- TOKENS ---- */
:root {
  --bg-cream:        #FAF9F0;
  --wine-red:        #722F37;
  --wine-light:      #9c404b;
  --military-green:  #556B2F;
  --white:           #ffffff;
  --text-primary:    #722F37;
  --terminal-bg:     #0d0d0d;
  --terminal-accent: #00ff41;
  --terminal-error:  #ff3333;
  --folder-paper:    #f4ecd8;
  --stamp-color:     #722F37;
}

/* ---- MODO INVESTIGAÇÃO ---- */
body.investigation-mode {
  --bg-cream:       #050505 !important;
  --wine-red:       #00ff41 !important;
  --wine-light:     #008F11 !important;
  --military-green: #00ff41 !important;
  --text-primary:   #00ff41 !important;
  --white:          #000000 !important;
  --folder-paper:   #111111 !important;
  --stamp-color:    #00ff41 !important;
}

body.investigation-mode .p-image,
body.investigation-mode .card-image,
body.investigation-mode .dossier-photo {
  filter: grayscale(100%) contrast(1.5) brightness(0.8) sepia(1) hue-rotate(90deg) !important;
  border-color: #00ff41 !important;
}

/* ---- MATRIX RAIN ---- */
.matrix-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0; opacity: 0; pointer-events: none;
  transition: opacity 2s; mix-blend-mode: screen;
}
body.investigation-mode .matrix-canvas { opacity: 0.3; }

/* ---- RESET & BASE ---- */
* { box-sizing: border-box; cursor: none !important; }

body, html, #root {
  background-color: var(--bg-cream);
  color: var(--wine-red);
  margin: 0; padding: 0; width: 100%; min-height: 100vh;
  font-family: 'Space Grotesk', sans-serif;
  overflow-x: hidden;
  scroll-behavior: smooth;
  transition: background-color 1.5s ease, color 1s ease;
}

/* ---- GLITCH ---- */
@keyframes glitch-anim {
  0%   { transform: translate(0); }
  20%  { transform: translate(-2px,  2px); }
  40%  { transform: translate(-2px, -2px); }
  60%  { transform: translate( 2px,  2px); }
  80%  { transform: translate( 2px, -2px); }
  100% { transform: translate(0); }
}

.clue-spot {
  cursor: help !important;
  display: inline-block;
  position: relative;
  transition: all 0.3s;
  border-bottom: 1px dashed transparent;
}
.clue-spot:not(.found) {
  animation: glitch-anim 2s infinite alternate-reverse;
  color: var(--military-green);
  font-weight: 500;
}
.clue-spot:not(.found):hover {
  animation: none;
  text-shadow: 2px 2px 0 rgba(114,47,55,0.3);
  letter-spacing: 2px;
}
.clue-spot.found {
  color: var(--wine-red);
  font-weight: bold;
  animation: none;
  border-bottom: 2px solid var(--wine-red);
}

.clue-feedback {
  position: absolute;
  top: -30px; left: 50%; transform: translateX(-50%);
  font-size: 0.7rem; background: var(--wine-red); color: var(--bg-cream);
  padding: 4px 8px; border-radius: 2px; pointer-events: none;
  white-space: nowrap; animation: fadeUp 1s forwards;
  font-family: 'Fira Code', monospace;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.2);
  z-index: 100;
}
@keyframes fadeUp {
  0%   { opacity: 1; top: -30px; }
  100% { opacity: 0; top: -50px; }
}

/* ---- CARIMBO ---- */
.access-granted-stamp {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(3) rotate(-30deg);
  border: 6px solid var(--stamp-color);
  color: var(--stamp-color);
  padding: 15px 30px;
  font-size: 2.5rem; font-weight: 900;
  font-family: 'Space Grotesk', sans-serif;
  text-transform: uppercase;
  opacity: 0; pointer-events: none; z-index: 10000;
  background: rgba(250,249,240,0.95);
  backdrop-filter: blur(2px);
  text-align: center;
  mix-blend-mode: multiply;
  white-space: nowrap;
  transition: all 0.5s;
}
body.investigation-mode .access-granted-stamp {
  mix-blend-mode: normal;
  background: rgba(0,0,0,0.8);
  box-shadow: 0 0 30px var(--stamp-color);
}
.access-granted-stamp.visible {
  animation: stampIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes stampIn {
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-15deg); }
}

/* ---- EVIDENCE TRACKER ---- */
.evidence-tracker {
  position: fixed; top: 30px; right: 30px;
  width: 200px;
  background: rgba(255,255,255,0.5);
  border: 1px solid var(--wine-red);
  z-index: 9900; backdrop-filter: blur(5px);
  padding: 10px;
  display: flex; flex-direction: column; gap: 5px;
}
.et-label {
  font-family: 'Fira Code', monospace; font-size: 0.7rem;
  color: var(--wine-red); letter-spacing: 1px;
  display: flex; justify-content: space-between;
}
.et-bar-container {
  width: 100%; height: 6px;
  background: rgba(114,47,55,0.1);
  border: 1px solid var(--wine-red);
}
.et-bar-fill {
  height: 100%; background: var(--wine-red);
  transition: width 0.5s cubic-bezier(0.22,1,0.36,1);
}

/* ---- DOSSIÊ ---- */
.dossier-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(114,47,55,0.4); backdrop-filter: blur(5px);
  z-index: 10000; display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.3s forwards;
  padding: 20px;
}
.dossier-file {
  width: 100%; max-width: 700px; background: var(--folder-paper);
  padding: 40px; position: relative; color: #333;
  font-family: 'Courier Prime', monospace;
  box-shadow: 10px 10px 30px rgba(0,0,0,0.3);
  transform: rotate(-1deg);
  border: 1px solid #d4c5a9;
  transition: all 0.5s;
  max-height: 90vh; overflow-y: auto;
}
.dossier-header {
  border-bottom: 2px solid var(--wine-red);
  margin-bottom: 20px; padding-bottom: 10px;
  display: flex; justify-content: space-between; align-items: flex-end;
}
.dossier-stamp {
  border: 3px solid var(--wine-red); color: var(--wine-red);
  padding: 5px 10px; font-weight: bold; text-transform: uppercase;
  transform: rotate(-5deg); font-size: 1rem; opacity: 0.8;
}
.dossier-grid { display: flex; gap: 30px; }
.dossier-photo {
  width: 150px; height: 200px; background: #e0e0e0;
  border: 5px solid #fff; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  object-fit: cover; filter: sepia(0.3) contrast(1.1);
  transition: all 0.5s; flex-shrink: 0;
}
.dossier-info p { margin: 8px 0; font-size: 0.95rem; line-height: 1.4; color: #444; }
.dossier-info strong { text-transform: uppercase; font-weight: bold; margin-right: 10px; color: var(--wine-red); }
.paper-clip {
  position: absolute; top: -15px; right: 40px;
  width: 30px; height: 80px;
  border: 4px solid #888; border-bottom: none;
  border-radius: 20px 20px 0 0; z-index: 2; opacity: 0.7;
}
.close-dossier {
  position: absolute; top: 10px; right: 10px;
  cursor: pointer; font-weight: bold; font-size: 1.2rem; color: var(--wine-red);
}

/* ---- TERMINAL ---- */
.terminal-wrapper {
  position: fixed; bottom: 30px; right: 30px;
  z-index: 9990; display: flex; flex-direction: column; align-items: flex-end;
}
.terminal-toggle {
  width: 50px; height: 50px; background: var(--wine-red);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.2s;
  color: #fff; font-size: 1.5rem;
}
.terminal-window {
  width: 400px; height: 300px; background: var(--terminal-bg);
  border: 1px solid var(--terminal-accent); border-radius: 4px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  margin-bottom: 15px; font-family: 'Fira Code', monospace;
  animation: slideUp 0.3s ease-out;
}
.terminal-window.locked { border-color: var(--terminal-error); }
.terminal-window.locked .terminal-body  { color: var(--terminal-error); }
.terminal-window.locked .terminal-input { color: var(--terminal-error); }
.terminal-header {
  background: #111; padding: 5px 10px; font-size: 0.8rem; color: #666;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #333;
}
.terminal-body { flex: 1; padding: 15px; overflow-y: auto; color: var(--terminal-accent); font-size: 0.9rem; }
.terminal-input-line { display: flex; align-items: center; margin-top: 10px; }
.terminal-prompt { margin-right: 8px; color: #fff; }
.terminal-input {
  background: transparent; border: none;
  color: var(--terminal-accent); font-family: 'Fira Code', monospace;
  flex: 1; outline: none;
}
.terminal-log { margin-bottom: 5px; line-height: 1.4; }

/* ---- CURSOR ---- */
.custom-cursor {
  position: fixed; top: 0; left: 0; width: 20px; height: 20px;
  background: var(--wine-red); border-radius: 50%; pointer-events: none;
  z-index: 10001; transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, background-color 0.5s;
  mix-blend-mode: multiply;
}
body.investigation-mode .custom-cursor { mix-blend-mode: normal; box-shadow: 0 0 10px var(--wine-red); }
.custom-cursor.hovered {
  width: 80px; height: 80px;
  background: rgba(114,47,55,0.1);
  border: 1px solid var(--wine-red);
  mix-blend-mode: normal;
}

/* ---- DECORAÇÃO ---- */
.vertical-line {
  position: fixed; left: 40px; top: 0; bottom: 0; width: 1px;
  background-color: rgba(114,47,55,0.2); z-index: 0; transition: 0.5s;
}
body.investigation-mode .vertical-line { background-color: rgba(0,255,65,0.2); }

.vertical-text {
  position: fixed; left: 10px; top: 50%; transform: translateY(-50%);
  writing-mode: vertical-rl; text-orientation: mixed;
  font-family: 'Noto Sans JP', sans-serif; color: var(--military-green);
  opacity: 0.6; letter-spacing: 0.5rem; font-size: 0.8rem; z-index: 1; transition: 0.5s;
}
.circle-bg {
  position: absolute; top: -10%; right: -10%;
  width: 600px; height: 600px;
  background-color: var(--wine-red); border-radius: 50%;
  opacity: 0.04; pointer-events: none; transition: 0.5s;
}
body.investigation-mode .circle-bg { opacity: 0.1; }

/* ---- LAYOUT ---- */
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 2; }
section { padding: 100px 0; border-bottom: 1px solid rgba(114,47,55,0.05); position: relative; transition: 0.5s; }
body.investigation-mode section { border-bottom-color: rgba(0,255,65,0.2); }

/* ---- HERO ---- */
.hero { min-height: 90vh; display: flex; flex-direction: column; justify-content: center; }
.hero h1 { font-size: clamp(3rem, 10vw, 6rem); line-height: 1; margin: 0; font-weight: 700; }
.hero-jp-name { display: block; font-size: 1rem; color: var(--military-green); font-family: 'Noto Sans JP'; letter-spacing: 5px; margin-bottom: 5px; }

/* ---- TYPEWRITER ---- */
.typewriter {
  font-size: 2rem; color: var(--military-green);
  border-right: 3px solid var(--wine-red); padding-right: 10px;
  animation: blink 1s infinite; display: inline-block; margin-top: 20px;
}
@keyframes blink { 50% { border-color: transparent; } }

/* ---- TECH STACK ---- */
.tech-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
.tech-badge {
  background: transparent; border: 1px solid var(--wine-red); color: var(--wine-red);
  padding: 12px 10px; font-family: 'Space Grotesk', monospace; font-weight: bold;
  font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
  position: relative; overflow: hidden; text-transform: uppercase;
  text-align: center; display: flex; align-items: center; justify-content: center;
}

/* ---- SERVIÇOS ---- */
.services-list { display: flex; flex-direction: column; margin-top: 50px; }
.service-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 40px 0; border-bottom: 1px solid rgba(114,47,55,0.2);
  transition: all 0.4s; position: relative;
}
body.investigation-mode .service-row { border-bottom-color: rgba(0,255,65,0.2); }
.service-row:hover {
  padding-left: 30px; border-color: var(--military-green);
  background: linear-gradient(to right, rgba(85,107,47,0.05), transparent);
}
body.investigation-mode .service-row:hover { background: linear-gradient(to right, rgba(0,255,65,0.1), transparent); }
.service-num { font-family: 'Space Grotesk', monospace; font-weight: 700; font-size: 1.2rem; color: var(--military-green); margin-right: 40px; opacity: 0.6; }
.service-content { flex: 1; }
.service-content h3 { margin: 0; font-size: 2rem; font-weight: 500; color: var(--wine-red); margin-bottom: 10px; }
.service-content p  { margin: 0; font-size: 1rem; color: var(--wine-red); opacity: 0.7; max-width: 500px; }
.service-arrow { font-size: 2.5rem; color: var(--military-green); opacity: 0; transform: translateX(-20px); transition: all 0.3s; }
.service-row:hover .service-arrow { opacity: 1; transform: translateX(0); }

/* ---- PROJETOS ---- */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 50px; margin-top: 50px; margin-bottom: 50px; }
.project-card-clean { display: flex; flex-direction: column; text-decoration: none; color: inherit; position: relative; }
.p-image-container { width: 100%; height: 280px; overflow: hidden; border: 1px solid var(--wine-red); position: relative; background-color: #000; transition: 0.5s; }
.p-image { width: 100%; height: 100%; background-size: cover; background-position: top center; transition: transform 0.6s, opacity 0.3s, filter 0.5s; opacity: 0.9; }
.project-card-clean:hover .p-image { transform: scale(1.08); opacity: 0.6; }
.p-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; z-index: 2; }
.project-card-clean:hover .p-overlay { opacity: 1; }
.p-btn {
  background: var(--bg-cream); color: var(--wine-red); padding: 10px 20px;
  font-family: 'Space Grotesk'; font-weight: 700; border: 1px solid var(--wine-red);
  transform: translateY(20px); transition: transform 0.3s;
  text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem;
}
.project-card-clean:hover .p-btn { transform: translateY(0); }
.p-info { margin-top: 20px; border-left: 2px solid rgba(114,47,55,0.1); padding-left: 15px; transition: border-color 0.3s; }
body.investigation-mode .p-info { border-left-color: rgba(0,255,65,0.2); }
.project-card-clean:hover .p-info { border-left-color: var(--military-green); }
.p-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.p-title { font-size: 1.6rem; font-weight: 700; margin: 0; text-transform: uppercase; }
.p-jp { font-family: 'Noto Sans JP'; font-size: 0.8rem; color: var(--military-green); letter-spacing: 1px; }
.p-desc { font-size: 0.95rem; opacity: 0.7; margin-bottom: 15px; line-height: 1.5; max-width: 90%; }
.p-tags { display: flex; flex-wrap: wrap; gap: 10px; font-family: 'Space Grotesk', monospace; font-size: 0.75rem; color: var(--wine-red); }

/* ---- TIMELINE ---- */
.timeline-container { position: relative; max-width: 800px; margin: 50px auto 0; padding-left: 30px; }
.timeline-line { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: rgba(114,47,55,0.2); transition: 0.5s; }
body.investigation-mode .timeline-line { background: rgba(0,255,65,0.2); }
.timeline-item { position: relative; padding-bottom: 60px; }
.timeline-item::before {
  content: ''; position: absolute; left: -36px; top: 5px;
  width: 14px; height: 14px;
  background: var(--bg-cream); border: 2px solid var(--military-green); border-radius: 50%;
  z-index: 2; transition: transform 0.3s, background-color 0.5s, border-color 0.5s;
}
.timeline-item:hover::before { transform: scale(1.5); background: var(--military-green); }
.t-year   { font-family: 'Space Grotesk', monospace; font-weight: 700; color: var(--military-green); font-size: 1.1rem; margin-bottom: 5px; display: inline-block; }
.t-title  { font-size: 1.5rem; color: var(--wine-red); margin: 5px 0; font-weight: 700; }
.t-company { font-family: 'Noto Sans JP'; font-size: 0.9rem; color: #666; margin-bottom: 10px; display: block; letter-spacing: 1px; }
body.investigation-mode .t-company { color: rgba(0,255,65,0.7); }
.t-desc { font-size: 1rem; color: #555; line-height: 1.6; max-width: 600px; }
body.investigation-mode .t-desc { color: rgba(0,255,65,0.8); }

/* ---- CONTATO ---- */
.contact-section { background-color: var(--bg-cream); position: relative; z-index: 10; padding-top: 100px; transition: 0.5s; }
.form-line {
  width: 100%; padding: 15px 0; background: transparent;
  border: none; border-bottom: 2px solid var(--wine-red);
  font-family: 'Space Grotesk'; font-size: 1rem; margin-bottom: 20px;
  outline: none; transition: 0.3s; color: var(--wine-red);
}
.btn-send {
  background: var(--wine-red); color: white; border: none;
  padding: 15px 40px; font-size: 1rem; margin-top: 10px;
  font-family: 'Space Grotesk'; transition: 0.3s;
}

/* ---- RESPONSIVIDADE ---- */
@media (max-width: 768px) {
  * { cursor: auto !important; }
  .custom-cursor { display: none; }
  .container { padding: 0 15px; }
  .hero h1 { font-size: 3rem; }
  .tech-container { grid-template-columns: repeat(2, 1fr); }
  .service-row { flex-direction: column; padding: 30px 0; align-items: flex-start; }
  .service-row:hover { padding-left: 10px; }
  .service-arrow { display: none; }
  .service-num { margin-bottom: 15px; display: block; }
  .dossier-grid { flex-direction: column; }
  .dossier-photo { margin: 0 auto 20px auto; }
  .dossier-file { width: 95%; max-height: 80vh; overflow-y: scroll; }
  .terminal-window { width: 100%; height: 50vh; }
  .terminal-wrapper { bottom: 10px; right: 10px; left: 10px; width: auto; align-items: flex-end; }
  .vertical-line, .vertical-text { display: none; }
  .evidence-tracker { top: 10px; right: 10px; width: 150px; font-size: 0.7rem; }
  .access-granted-stamp { font-size: 1.5rem; padding: 15px; width: 90%; white-space: normal; }
}
`;

// ============================================================
// DADOS
// ============================================================
const PROJECTS = [
  {
    title: "ProtecGera",
    jp: "保護システム",
    desc: "Solução completa para serviços de geradores. Design focado em conversão.",
    tags: ["React", "SEO"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    link: "https://protecgera.com.br",
  },
  {
    title: "Landing Page para Social Media",
    jp: "電子商取引",
    desc: "Landing page criada para centralizar informações essenciais da rotina de social media — links importantes, diretrizes de conteúdo e materiais de apoio, otimizando organização e produtividade no dia a dia.",
    tags: ["React", "Node"],
    image: "https://formulario-six-xi.vercel.app/Ilustrac%CC%A7a%CC%83o_Sem_Ti%CC%81tulo%201.png",
    link: "https://formulario-six-xi.vercel.app/",
  },
  {
    title: "App Financeiro",
    jp: "金融アプリ",
    desc: "Sistema de controle financeiro com gráficos interativos.",
    tags: ["Vue", "Firebase"],
    image: "https://i.imgur.com/o0guQM5.png",
    link: "https://sulmidiadash.vercel.app/",
  },
];

const SERVICES = [
  { id: "01", title: "Desenvolvimento Web", desc: "Sites institucionais e sistemas robustos." },
  { id: "02", title: "UI/UX Design",        desc: "Interfaces que encantam e convertem." },
  { id: "03", title: "SEO & Performance",   desc: "Otimização técnica para o Google." },
];

const TIMELINE = [
  { year: "Atualmente", title: "Customer Success Pleno",    company: "Sul Mídia",        desc: "Responsável pela retenção e sucesso de clientes estratégicos." },
  { year: "Em Curso",   title: "Análise e Des. de Sistemas", company: "Faculdade",        desc: "Transição de carreira focada em engenharia de software." },
  { year: "Março 2023", title: "Analista CS Jr",             company: "Sul Mídia",        desc: "Início da jornada na Sul Mídia." },
  { year: "Concluído",  title: "Bacharel em Criminologia",   company: "Ensino Superior",  desc: "Formação analítica focada em investigação." },
];

const TECH_LIST = ["JavaScript", "React.js", "Node.js", "TypeScript", "SQL", "Git", "CSS3", "Tailwind"];

const GREETINGS = ["Olá", "Hello", "Konnichiwa (こんにちは)", "Hola"];

const SKILLS = [
  "Customer Success Pleno",
  "Criminologia & Tech",
  "React & Frontend",
  "Resolução de Problemas",
];

// ============================================================
// COMPONENTES UTILITÁRIOS
// ============================================================

/** Embaralha o texto letra por letra no hover */
const ScrambleText = ({ text, as: Component = 'span', className, style, onClick }) => {
  const [display, setDisplay] = useState(text);
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

  const scramble = () => {
    let iter = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split('').map((_, i) =>
          i < iter ? text[i] : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
      );
      if (iter >= text.length) clearInterval(interval);
      iter += 1 / 3;
    }, 30);
  };

  return (
    <Component
      className={className}
      style={style}
      onMouseEnter={scramble}
      onClick={(e) => { scramble(); onClick?.(e); }}
    >
      {display}
    </Component>
  );
};

/** Ponto interativo de pista */
const ClueSpot = ({ id, children, onFound, foundList }) => {
  const isFound = foundList.includes(id);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleInteraction = () => {
    if (isFound) return;
    onFound(id);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  return (
    <span
      className={`clue-spot ${isFound ? 'found' : ''}`}
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
    >
      {children}
      {showFeedback && (
        <div className="clue-feedback">
          EVIDÊNCIA #0{foundList.length + 1} DETECTADA
        </div>
      )}
    </span>
  );
};

/** Efeito Matrix Rain no canvas */
const MatrixRain = ({ isActive }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const CHARS   = "0123456789ABCDEFラファエルCRIMECODE";
    const SIZE    = 14;
    const columns = Math.floor(canvas.width / SIZE);
    const drops   = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = `${SIZE}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * SIZE, y * SIZE);
        if (y * SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      style={{ display: isActive ? 'block' : 'none' }}
    />
  );
};

/** Modal de dossiê */
const Dossier = ({ onClose }) => (
  <div className="dossier-overlay" onClick={onClose}>
    <div className="dossier-file" onClick={(e) => e.stopPropagation()}>
      <div className="paper-clip" />
      <span className="close-dossier" onClick={onClose}>X</span>
      <div className="dossier-header">
        <div>
          <h3>CONFIDENTIAL FILE #8492</h3>
          <small>TOP SECRET // CLEARANCE LEVEL 5</small>
        </div>
        <div className="dossier-stamp">CLASSIFIED</div>
      </div>
      <div className="dossier-grid">
        <img
          src="https://lh3.googleusercontent.com/a/ACg8ocK4BnCJ0_Zs74-55HgYJ_khUZmagwpdeGRyoMIAWZ6Z0vA_juSs9g=s360-c-no"
          alt="Suspeito"
          className="dossier-photo"
        />
        <div className="dossier-info">
          <p><strong>Nome:</strong> Rafael Carneiro</p>
          <p><strong>Idade:</strong> 23 Anos</p>
          <p><strong>Codinome:</strong> "Fuguetim"</p>
          <p><strong>Status:</strong> Ativo (CS Pleno)</p>
          <p><strong>Background:</strong> Criminologia (Análise Comportamental)</p>
          <p style={{ marginTop: 20, borderTop: '1px dashed currentColor', paddingTop: 10 }}>
            <em>"Sujeito migrou da análise forense para a engenharia de software. Aplica métodos investigativos para otimizar códigos."</em>
          </p>
        </div>
      </div>
    </div>
  </div>
);

/** Cursor personalizado */
const CustomCursor = () => {
  const ref = useRef(null);
  useEffect(() => {
    const move = (e) => {
      ref.current?.animate(
        { left: `${e.clientX}px`, top: `${e.clientY}px` },
        { duration: 500, fill: 'forwards' }
      );
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={ref} className="custom-cursor" />;
};

/** Efeito magnético no hover */
const Magnetic = ({ children }) => {
  const ref = useRef(null);
  const onMove  = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    ref.current.style.transform = `translate(${(e.clientX - (left + width / 2)) * 0.3}px, ${(e.clientY - (top + height / 2)) * 0.3}px)`;
  };
  const onLeave = () => { ref.current.style.transform = 'translate(0,0)'; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: 'transform 0.1s linear', display: 'inline-block' }}>
      {children}
    </div>
  );
};

/** Expande o cursor ao hover */
const HoverScale = ({ children }) => {
  const getCursor = () => document.querySelector('.custom-cursor');
  return (
    <div
      onMouseEnter={() => getCursor()?.classList.add('hovered')}
      onMouseLeave={() => getCursor()?.classList.remove('hovered')}
    >
      {children}
    </div>
  );
};

/** Badge com efeito scramble */
const TechBadge = ({ name }) => {
  const [display, setDisplay] = useState(name);
  const CHARS = "!<>-_\\/[]{}—=+*^?#";

  const onEnter = () => {
    let i = 0;
    const iv = setInterval(() => {
      setDisplay(name.split('').map((_, idx) => idx < i ? name[idx] : CHARS[Math.floor(Math.random() * CHARS.length)]).join(''));
      if (i >= name.length) clearInterval(iv);
      i += 1 / 3;
    }, 30);
  };

  return (
    <Magnetic>
      <div className="tech-badge" onMouseEnter={onEnter} onMouseLeave={() => setDisplay(name)}>
        {display}
      </div>
    </Magnetic>
  );
};

/** Digita o texto letra por letra */
const Typewriter = ({ text, delay = 100 }) => {
  const [current, setCurrent] = useState('');
  const [index, setIndex]     = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const t = setTimeout(() => { setCurrent(p => p + text[index]); setIndex(p => p + 1); }, delay);
      return () => clearTimeout(t);
    }
  }, [index, delay, text]);

  useEffect(() => { setCurrent(''); setIndex(0); }, [text]);

  return <span className="typewriter">{current}</span>;
};

/** Terminal interativo */
const Terminal = ({ solved, onOpenDossier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input,  setInput]  = useState('');
  const [logs,   setLogs]   = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    setLogs(
      solved
        ? ["PROTOCOL: MATRIX... [OK]", "ACCESS: GRANTED.", "Bem-vindo ao Rafael_OS v2.0", "Digite 'help' para iniciar."]
        : ["*** ALERTA DE SEGURANÇA ***", "Acesso negado. Sistema criptografado.", "Localize as 3 evidências para desbloquear."]
    );
  }, [solved]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim().toLowerCase();
    const responses = {
      help:          "Comandos: about, contact, clear, investigation",
      investigation: "Acesso autorizado. Protocolo Matrix ativado.",
      contact:       "Email: rflgccontato@gmail.com",
    };

    if (cmd === 'about') {
      setLogs(p => [...p, `> ${input}`, "Carregando dossiê..."]);
      setTimeout(onOpenDossier, 800);
    } else if (cmd === 'clear') {
      setLogs(["Bem-vindo ao Rafael_OS v2.0", "Digite 'help' para iniciar."]);
    } else {
      setLogs(p => [...p, `> ${input}`, responses[cmd] ?? `Comando desconhecido: ${cmd}`]);
    }
    setInput('');
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs, isOpen]);

  return (
    <div className="terminal-wrapper">
      {isOpen && (
        <div className={`terminal-window ${!solved ? 'locked' : ''}`}>
          <div className="terminal-header">
            <span>{solved ? 'admin' : 'guest'}@rafael-portfolio:~</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)}>_</span>
          </div>
          <div className="terminal-body">
            {logs.map((log, i) => <div key={i} className="terminal-log">{log}</div>)}
            <div className="terminal-input-line">
              <span className="terminal-prompt">$</span>
              <input
                className="terminal-input"
                value={solved ? input : 'BLOQUEADO'}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleCommand}
                autoFocus
                disabled={!solved}
              />
            </div>
            <div ref={endRef} />
          </div>
        </div>
      )}
      <Magnetic>
        <div className="terminal-toggle" onClick={() => setIsOpen(p => !p)}>
          {isOpen ? 'X' : '>_'}
        </div>
      </Magnetic>
    </div>
  );
};

// ============================================================
// APP PRINCIPAL
// ============================================================
function App() {
  const [foundClues,  setFoundClues]  = useState([]);
  const [isSolved,    setIsSolved]    = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [greetIndex,  setGreetIndex]  = useState(0);
  const [skillIndex,  setSkillIndex]  = useState(0);

  // Pistas
  const handleClueFound = (id) => {
    if (foundClues.includes(id)) return;
    const next = [...foundClues, id];
    setFoundClues(next);
    if (next.length === 3) setTimeout(() => setIsSolved(true), 1000);
  };

  useEffect(() => {
    if (isSolved) document.body.classList.add('investigation-mode');
  }, [isSolved]);

  // Rotação de saudações e skills
  useEffect(() => {
    const t = setInterval(() => setGreetIndex(p => (p + 1) % GREETINGS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSkillIndex(p => (p + 1) % SKILLS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{globalStyles}</style>
      <CustomCursor />
      <MatrixRain isActive={isSolved} />

      <div className={`access-granted-stamp ${isSolved ? 'visible' : ''}`}>
        INVESTIGATION AUTHORIZED
      </div>

      {showDossier && <Dossier onClose={() => setShowDossier(false)} />}

      <div className="evidence-tracker">
        <div className="et-label">
          <span>DECRIPTAÇÃO</span>
          <span>{foundClues.length}/3</span>
        </div>
        <div className="et-bar-container">
          <div className="et-bar-fill" style={{ width: `${(foundClues.length / 3) * 100}%` }} />
        </div>
      </div>

      <div className="App">
        <Terminal solved={isSolved} onOpenDossier={() => setShowDossier(true)} />
        <div className="vertical-line" />
        <div className="vertical-text">ラファエル // 2026</div>

        {/* ── HERO ── */}
        <section className="hero container">
          <div className="circle-bg" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem', color: '#556B2F' }}>
            <span style={{ width: 10, height: 10, background: '#556B2F', borderRadius: '50%' }} />
            {GREETINGS[greetIndex]}
          </div>
          <HoverScale>
            <h1>
              <span className="hero-jp-name">ラファエル・カルネイロ</span>
              <ScrambleText text="RAFAEL" />
              <ClueSpot id="clue-dot" onFound={handleClueFound} foundList={foundClues}>.</ClueSpot>
              <br />
            </h1>
          </HoverScale>
          <div style={{ minHeight: 60 }}>
            <Typewriter text={SKILLS[skillIndex]} delay={80} />
          </div>
        </section>

        {/* ── SOBRE & TECH ── */}
        <section className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60 }}>
            <div>
              <HoverScale>
                <h2 style={{ fontSize: '2rem' }}>
                  <ScrambleText text="SOBRE" />{' '}
                  <span style={{ fontSize: '1rem', fontFamily: 'Noto Sans JP' }}>私について</span>
                </h2>
              </HoverScale>
              <p style={{ marginTop: 20, color: '#444' }}>
                Me chamo <strong>Rafael Carneiro</strong>. Minha trajetória é marcada pela análise: comecei na{' '}
                <ClueSpot id="clue-crimino" onFound={handleClueFound} foundList={foundClues}>Criminologia</ClueSpot>{' '}
                e hoje aplico essa visão crítica no desenvolvimento de software.
              </p>
              <p style={{ marginTop: 15, color: '#444' }}>
                Atualmente sou <strong>CS Pleno na Sul Mídia</strong> e estudante de Análise e Desenvolvimento de Sistemas.
              </p>
            </div>
            <div>
              <h3 style={{ color: '#556B2F', marginBottom: 20 }}><ScrambleText text="TECH STACK" /></h3>
              <div className="tech-container">
                {TECH_LIST.map(tech => <TechBadge key={tech} name={tech} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVIÇOS ── */}
        <section className="container">
          <h2 style={{ textAlign: 'right', marginBottom: 40 }}>
            <ScrambleText text="SERVIÇOS" />{' '}
            <span style={{ fontSize: '1rem', fontFamily: 'Noto Sans JP' }}>サービス</span>
          </h2>
          <div className="services-list">
            {SERVICES.map(({ id, title, desc }) => (
              <div className="service-row" key={id}>
                <span className="service-num">{id} //</span>
                <div className="service-content">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <span className="service-arrow">→</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROJETOS ── */}
        <section className="container" style={{ paddingBottom: 120 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 50, borderBottom: '2px solid #722F37', display: 'inline-block' }}>
            <ScrambleText text="PROJETOS" />{' '}
            <span style={{ fontSize: '1rem', fontFamily: 'Noto Sans JP' }}>プロジェクト</span>
          </h2>
          <div className="projects-grid">
            {PROJECTS.map((project, idx) => (
              <a href={project.link} key={idx} className="project-card-clean" target="_blank" rel="noreferrer">
                <div className="p-image-container">
                  <div className="p-image" style={{ backgroundImage: `url(${project.image})` }} />
                  <div className="p-overlay">
                    <Magnetic><button className="p-btn">Ver Projeto</button></Magnetic>
                  </div>
                </div>
                <div className="p-info">
                  <div className="p-header">
                    <h3 className="p-title">{project.title}</h3>
                    <span className="p-jp">{project.jp}</span>
                  </div>
                  <p className="p-desc">{project.desc}</p>
                  <div className="p-tags">
                    {project.tags.map((tag, i) => <span key={i} className="p-tag-item">[{tag}]</span>)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="container">
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 20 }}>
              <ScrambleText text="TRAJETÓRIA" />{' '}
              <span style={{ fontSize: '1rem', fontFamily: 'Noto Sans JP' }}>キャリア</span>
            </h2>
            <div className="timeline-container">
              <div className="timeline-line" />
              {TIMELINE.map(({ year, title, company, desc }, i) => (
                <div className="timeline-item" key={i}>
                  <span className="t-year">{year}</span>
                  <h3 className="t-title">{title}</h3>
                  <span className="t-company">{company}</span>
                  <p className="t-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTATO ── */}
        <section className="container contact-section">
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 30 }}>
              <ClueSpot id="clue-contact" onFound={handleClueFound} foundList={foundClues}>
                <ScrambleText text="VAMOS CONVERSAR?" />
              </ClueSpot>
            </h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <input  type="text"  className="form-line" placeholder="Seu Nome" />
              <input  type="email" className="form-line" placeholder="Seu Email" />
              <textarea className="form-line" rows="3"   placeholder="Sua Mensagem..." />
              <Magnetic><button className="btn-send">ENVIAR MENSAGEM &gt;&gt;</button></Magnetic>
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', opacity: 0.7 }}>
                Ou mande direto para: <strong>rflgccontato@gmail.com</strong>
              </p>
            </form>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer>
          <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 10 }}>RAFAEL CARNEIRO</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
              <a href="#" style={{ color: '#722F37' }}>LinkedIn</a>
              <a href="#" style={{ color: '#722F37' }}>GitHub</a>
              <a href="mailto:rflgccontato@gmail.com" style={{ color: '#722F37' }}>Email</a>
            </div>
            <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>© 2025 Rafael.dev</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
