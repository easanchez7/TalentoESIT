'use strict';

let cvDraft=null;
const cvIdeas=[['trayectoria','Resaltar mi trayectoria profesional'],['certificaciones','Dar énfasis a mis certificaciones'],['habilidades','Destacar mis puntos fuertes']];

function curriculumPage(){return `${header()}<main id="main" class="cv-page"><section class="cv-hero"><div><span class="cv-eyebrow">TU PRÓXIMA OPORTUNIDAD EMPIEZA AQUÍ</span><h1>Generar mi currículum</h1><p>Transforma tu perfil en un currículum profesional, elige una plantilla y personaliza lo que quieres destacar antes de compartirlo</p></div></section><div class="cv-workspace"><section class="cv-config" aria-labelledby="cv-config-title"><div class="cv-step">01 · Personaliza</div><h2 id="cv-config-title">¿Cómo quieres enfocar tu currículum?</h2><p class="cv-description">Usaremos la información guardada en tu perfil, sin inventar estudios ni experiencia</p><form id="cv-form"><fieldset class="cv-fieldset"><legend>Ideas rápidas para comenzar</legend><div class="cv-ideas">${cvIdeas.map(([value,label],i)=>`<button type="button" data-cv-focus="${value}" aria-pressed="${i===0}" class="cv-idea ${i===0?'selected':''}">${label}</button>`).join('')}</div></fieldset><label class="cv-field">Puesto al que quieres aplicar<input name="target" maxlength="120" placeholder="Ejemplo: Analista de automatización de pruebas"></label><label class="cv-field">Indicaciones o enfoque deseado<textarea name="instructions" rows="4" maxlength="700" placeholder="Describe las fortalezas o proyectos que quieres destacar"></textarea></label><fieldset class="cv-fieldset"><legend>Selecciona una plantilla</legend><div class="cv-templates">${[['moderna','Moderna'],['clasica','Clásica'],['esencial','Esencial']].map(([value,label],i)=>`<label class="cv-template"><input type="radio" name="template" value="${value}" ${i===0?'checked':''}><span class="template-sample ${value}" aria-hidden="true"><i></i><i></i><i></i></span><span>${label}</span></label>`).join('')}</div></fieldset><p class="cv-local-note">Generador local basado en tu perfil · Esta versión no está conectada a un servicio de IA</p><button class="button cv-generate" type="submit">Generar currículum <span aria-hidden="true">→</span></button></form></section><section class="cv-output" aria-labelledby="cv-output-title"><div class="cv-output-heading"><div><span class="cv-step">02 · Revisa y comparte</span><h2 id="cv-output-title">Tu vista previa</h2></div><a href="#perfil1" class="cv-profile-link">Revisar mi perfil</a></div><div id="cv-result"><div class="cv-empty"><div class="cv-document-icon" aria-hidden="true"><span></span><span></span><span></span></div><h3>Un currículum que habla de ti</h3><p>Elige el enfoque y genera una primera versión con tus estudios, habilidades y experiencia</p><ul><li>Información de tu perfil ESIT</li><li>Diseño listo para imprimir</li><li>Textos editables antes de compartir</li></ul></div></div></section></div></main>${footer()}`;}

function buildCurriculum(person,options){
  const details=person.details||defaultDetails();
  const focus=options.focus||'trayectoria';
  const brief=options.length==='breve';
  const take=items=>brief?items.slice(0,2):items;
  const sections={
    education:{title:'Formación académica',items:take(details.education||[]).map(item=>[item.title,item.institution,item.year?`Graduación: ${item.year}`:''])},
    courses:{title:'Cursos y formación complementaria',items:take(details.courses||[]).map(item=>[item.title,item.institution,item.status])},
    experience:{title:'Experiencia profesional',items:take(details.experience||[]).map(item=>[item.title,item.company,brief?'':item.description])},
    skills:{title:'Habilidades',items:(details.skills||[]).map(item=>[item.title,item.level])},
    projects:{title:'Proyectos',items:take(details.projects||[]).map(item=>[item.title,brief?'':item.description,item.technologies])}
  };
  // The focus changes the order using actual profile data
  const order=focus==='certificaciones'?['education','courses','skills','experience','projects']:focus==='habilidades'?['skills','projects','experience','education','courses']:['experience','education','courses','skills','projects'];
  const bio=cleanText(person.bio||'');
  return {name:cleanText(person.name),role:cleanText(person.role),location:cleanText(person.location),target:cleanText(options.target||''),instructions:cleanText(options.instructions||''),summary:brief?cleanText(bio.split(/\n|\.\s/)[0]):bio,template:['moderna','clasica','esencial'].includes(options.template)?options.template:'moderna',color:['azul','verde','vino'].includes(options.color)?options.color:'azul',sections:order.map(key=>sections[key]).filter(section=>section.items.length)};
}

function curriculumResult(cv){
  const editable=(tag,text,className='')=>`<${tag} class="${className}" contenteditable="plaintext-only" spellcheck="true">${esc(cleanText(text))}</${tag}>`;
  return `<div class="cv-result-actions"><p>Haz clic en los textos para ajustarlos</p><div><button type="button" class="button secondary small" data-cv-action="copy">Copiar texto</button><button type="button" class="button small" data-cv-action="print">Guardar PDF</button></div></div>${cv.instructions?`<aside class="cv-editor-note"><strong>Tu guía de edición</strong><p>${esc(cv.instructions)}</p><span>Usa estas indicaciones al revisar los textos de la vista previa</span></aside>`:''}<article id="cv-preview" class="cv-paper cv-${cv.template} cv-${cv.color}" aria-label="Currículum editable"><header class="cv-paper-header">${editable('h2',cv.name)}${editable('p',cv.role,'cv-paper-role')}${editable('p',cv.location,'cv-paper-location')}</header>${cv.target?`<section class="cv-paper-section"><h3>Objetivo profesional</h3>${editable('p','Aplicar al puesto de '+cv.target)}</section>`:''}${cv.summary?`<section class="cv-paper-section"><h3>Perfil profesional</h3>${editable('p',cv.summary)}</section>`:''}${cv.sections.map(section=>`<section class="cv-paper-section"><h3>${section.title}</h3>${section.items.map(([title,...lines])=>`<div class="cv-paper-entry">${editable('h4',title)}${lines.filter(Boolean).map(text=>editable('p',text)).join('')}</div>`).join('')}</section>`).join('')}</article>`;
}

app.addEventListener('click',event=>{
  const idea=event.target.closest('[data-cv-focus]');
  if(idea){app.querySelectorAll('[data-cv-focus]').forEach(button=>{const selected=button===idea;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});return;}
  const action=event.target.closest('[data-cv-action]');
  if(!action)return;
  if(action.dataset.cvAction==='print'){document.body.classList.add('printing-cv');window.print();return;}
  if(action.dataset.cvAction==='copy'){
    const text=document.querySelector('#cv-preview')?.innerText;
    if(!text)return;
    if(!navigator.clipboard){toast('Selecciona el texto de la vista previa y cópialo con Ctrl + C');return;}
    navigator.clipboard.writeText(text).then(()=>toast('Currículum copiado')).catch(()=>toast('Selecciona el texto de la vista previa y cópialo con Ctrl + C'));
  }
});
app.addEventListener('submit',event=>{
  if(event.target.id!=='cv-form')return;
  event.preventDefault();
  const form=event.target;
  const options={focus:form.querySelector('[data-cv-focus][aria-pressed="true"]').dataset.cvFocus};
  for(const name of ['target','instructions','template'])options[name]=form.elements[name].value;
  cvDraft=buildCurriculum(people[0],options);
  document.querySelector('#cv-result').innerHTML=curriculumResult(cvDraft);
  finishInterface();
  toast('Currículum generado, revisa y ajusta los textos antes de compartirlo');
});
app.addEventListener('focusout',event=>{
  if(event.target.matches('#cv-preview [contenteditable]'))event.target.textContent=cleanText(event.target.textContent);
});
window.addEventListener('afterprint',()=>document.body.classList.remove('printing-cv'));
