'use strict';

const profileGroups = [
  {key:'education',title:'Formación académica',fields:[['title','Título / Programa'],['institution','Institución'],['year','Año de graduación']]},
  {key:'courses',title:'Cursos',fields:[['title','Título del curso'],['institution','Institución'],['status','Estado',['En curso','Finalizado']]]},
  {key:'skills',title:'Habilidades',fields:[['title','Habilidad'],['level','Nivel',['Básico','Intermedio','Avanzado']]]},
  {key:'projects',title:'Proyectos',fields:[['title','Nombre del proyecto'],['description','Descripción'],['technologies','Tecnologías']]},
  {key:'experience',title:'Experiencia',fields:[['title','Puesto'],['company','Empresa y período'],['description','Descripción']]},
  {key:'references',title:'Referencias laborales',fields:[['title','Nombre completo'],['company','Empresa'],['position','Cargo'],['phone','Teléfono']]}
];

function defaultDetails(){return {
  education:education.map(([title,institution,year])=>({title,institution,year:year.replace('Año de graduación: ','')})),
  courses:courses.map(([title,institution,status])=>({title,institution,status:status.replace('Estado: ','')})),
  skills:[{title:'Ciberseguridad',level:'Básico'},{title:'Redes',level:'Básico'}],
  projects:[{title:'Calculadora de Gastos Mensuales',description:'Un script de consola donde el usuario ingresa su presupuesto inicial y va registrando gastos por categoría',technologies:'Python'},{title:'Portafolio Web Personal',description:'Sitio web donde se presenta biografía, pasatiempos y proyectos escolares',technologies:'HTML · CSS · JavaScript'}],
  experience:[{title:'Analista de Automatización de Pruebas (QA Automation)',company:'Empresa Tecnológica ABC | Marzo 2024 - Presente',description:'Diseño y ejecución de scripts de pruebas automatizadas utilizando Playwright para validar la funcionalidad y el rendimiento de aplicaciones web\nOptimización de estrategias de carga de páginas y estructuración de localizadores de elementos, mejorando la estabilidad y reduciendo los tiempos de ejecución de las pruebas'},{title:'Administrador de Sistemas y Analista Funcional',company:'Soluciones Informáticas XYZ | Enero 2022 - Febrero 2024',description:'Administración y configuración de infraestructura en Active Directory, gestionando unidades organizativas, grupos de seguridad y cuentas\nAnálisis funcional y diseño de plataformas de control de acceso físico'}],
  references:[{title:'Juan Carlos Gómez',company:'STB Group',position:'Jefe de área de tecnología',phone:'7788-9655'}]
};}

// Regla editorial de la interfaz: ningún texto termina en punto
function cleanText(value){return String(value).trim().replace(/[.。…]+$/u,'');}
function finishInterface(){
  const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){const node=walker.currentNode;if(!['SCRIPT','STYLE'].includes(node.parentElement?.tagName))node.textContent=node.textContent.replace(/[.。…]+(?=\s*$)/u,'');}
  app.querySelectorAll('[placeholder],[title],[aria-label]').forEach(element=>{for(const attr of ['placeholder','title','aria-label'])if(element.hasAttribute(attr))element.setAttribute(attr,cleanText(element.getAttribute(attr)));});
}

function visibilityControl(){return `<label class="visibility-control" for="profile-visible"><span class="visibility-choice"><span class="visibility-label">${profileVisible?'Visible':'Privado'}</span><input id="profile-visible" type="checkbox" role="switch" aria-label="Perfil visible" ${profileVisible?'checked':''}><span class="switch-track" aria-hidden="true"></span></span></label>`;}

function editorField(key,label,value,options){
  const name=key.replace(/[^a-z0-9-]/gi,'-');
  return `<label class="editor-field" for="edit-${name}"><span>${label}</span>${options?`<select id="edit-${name}" data-field="${key}" required>${options.map(option=>`<option ${option===value?'selected':''}>${option}</option>`).join('')}</select>`:key.endsWith('description')||key==='bio'?`<textarea id="edit-${name}" data-field="${key}" rows="4" required maxlength="2000">${esc(cleanText(value||''))}</textarea>`:`<input id="edit-${name}" data-field="${key}" value="${esc(cleanText(value||''))}" required maxlength="${key==='name'?80:180}">`}</label>`;
}

function editorGroup(group){return `<section class="editor-section" id="edit-${group.key}"><div class="editor-section-heading"><h2>${group.title}</h2><button type="button" class="button small" data-add="${group.key}">Agregar</button></div><div class="editor-entries">${profileDraft.details[group.key].map((entry,index)=>`<article class="editor-entry" data-card-group="${group.key}" data-card-index="${index}"><div class="entry-heading"><button type="button" class="drag-handle" draggable="true" data-drag="${group.key}" data-index="${index}" aria-label="Arrastrar ${group.title.toLowerCase()} ${index+1}" title="Arrastra para cambiar el orden"><img src="icon/drag-handle.svg" alt=""></button><span class="entry-label">${group.title} ${index+1}</span><div class="entry-controls"><button type="button" class="move-entry" data-move="${group.key}" data-index="${index}" data-direction="-1" aria-label="Mover tarjeta ${index+1} hacia arriba" ${index===0?'disabled':''}>↑</button><button type="button" class="move-entry" data-move="${group.key}" data-index="${index}" data-direction="1" aria-label="Mover tarjeta ${index+1} hacia abajo" ${index===profileDraft.details[group.key].length-1?'disabled':''}>↓</button><button type="button" class="delete-entry" data-delete="${group.key}" data-index="${index}" aria-label="Eliminar ${group.title.toLowerCase()} ${index+1}"><img src="icon/delete.svg" alt=""></button></div></div>${group.fields.map(([key,label,options])=>editorField(`${group.key}-${index}-${key}`,label,entry[key],options)).join('')}</article>`).join('')||'<p class="empty">Agrega un registro para completar esta sección</p>'}</div></section>`;}

function profileEditor(){return `${header()}<main id="main" class="profile profile-editing"><form id="profile-editor"><div class="editor-toolbar"><h1>Editar perfil</h1></div><div class="profile-cover" aria-hidden="true"></div><div class="editor-identity"><img class="profile-avatar" src="icon/usuario-1.svg" alt="Imagen genérica del perfil" width="170" height="170"><h2>${esc(profileDraft.name)}</h2><div class="editor-actions">${visibilityControl()}<button type="button" class="button secondary small" data-action="discard">Descartar</button><button type="submit" class="button small">Guardar</button></div></div><div class="editor-layout"><nav class="editor-nav" aria-label="Secciones del perfil"><strong>General</strong><a href="#edit-general" data-editor-anchor="edit-general">Datos generales</a>${profileGroups.map(group=>`<a href="#edit-${group.key}" data-editor-anchor="edit-${group.key}">${group.title}</a>`).join('')}</nav><div class="editor-content"><section class="editor-section" id="edit-general"><h2>Datos generales</h2><div class="editor-entry">${editorField('name','Nombre completo',profileDraft.name)}${editorField('location','Ubicación',profileDraft.location)}${editorField('role','Profesión',profileDraft.role)}${editorField('bio','Acerca de mí',profileDraft.bio)}</div></section>${profileGroups.map(editorGroup).join('')}</div></div></form></main>${footer()}`;}

function beginEditing(){
  profileDraft=JSON.parse(JSON.stringify(people[0]));
  profileDraft.details=profileDraft.details||defaultDetails();
  profileEditing=true;
  render();
}

function updateDraft(field,value){
  if(['name','role','location','bio'].includes(field)){profileDraft[field]=value;return;}
  const [group,index,key]=field.split('-');
  if(profileDraft.details[group]?.[Number(index)])profileDraft.details[group][Number(index)][key]=value;
}

function saveProfile(form){
  // Read every field as well as input events to include autofilled values
  form.querySelectorAll('[data-field]').forEach(field=>updateDraft(field.dataset.field,field.value));
  for(const key of ['name','role','location','bio'])if(!profileDraft[key].trim()){form.querySelector(`[data-field="${key}"]`).focus();return;}
  for(const key of ['name','role','location','bio'])profileDraft[key]=cleanText(profileDraft[key]);
  for(const group of profileGroups)for(const entry of profileDraft.details[group.key])for(const key of Object.keys(entry))entry[key]=cleanText(entry[key]);
  let saved=true;
  try{localStorage.setItem('talento-profile',JSON.stringify(profileDraft));}catch{saved=false;}
  Object.assign(people[0],profileDraft);
  profileDraft=null;
  profileEditing=false;
  render();
  toast(saved?'Cambios guardados':'Cambios aplicados a esta visita, el navegador no permite guardarlos');
}

function savedSections(){
  const details=people[0].details||defaultDetails();
  return profileGroups.filter(group=>details[group.key]?.length).map(group=>section(group.title,details[group.key].map(entry=>{
    const lines=group.fields.slice(1).map(([key,label])=>entry[key]?(['year','level','status'].includes(key)?`${label}: ${entry[key]}`:entry[key]):'').filter(Boolean);
    return [entry.title,...lines];
  }))).join('');
}

app.addEventListener('input',event=>{if(profileEditing&&event.target.matches('[data-field]'))updateDraft(event.target.dataset.field,event.target.value);});
app.addEventListener('change',event=>{
  if(profileEditing&&event.target.matches('[data-field]'))updateDraft(event.target.dataset.field,event.target.value);
  if(event.target.id!=='profile-visible'||!authenticated)return;
  profileVisible=event.target.checked;
  let saved=true;
  try{localStorage.setItem('talento-visibility',String(profileVisible));}catch{saved=false;}
  app.querySelectorAll('.visibility-label').forEach(label=>label.textContent=profileVisible?'Visible':'Privado');
  toast(saved?(profileVisible?'Perfil visible en el directorio':'Perfil privado, oculto del directorio'):'Visibilidad aplicada a esta visita, el navegador no permite guardarla');
});
app.addEventListener('click',event=>{
  const anchor=event.target.closest('[data-editor-anchor]');
  if(anchor){event.preventDefault();document.getElementById(anchor.dataset.editorAnchor)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;}
  const add=event.target.closest('[data-add]');
  const remove=event.target.closest('[data-delete]');
  if(!profileEditing||(!add&&!remove))return;
  const key=(add||remove).dataset[add?'add':'delete'];
  const group=profileGroups.find(group=>group.key===key);
  if(!group)return;
  if(add){profileDraft.details[key].push(Object.fromEntries(group.fields.map(([field,,options])=>[field,options?.[0]||''])));}
  else profileDraft.details[key].splice(Number(remove.dataset.index),1);
  const scrollY=window.scrollY;
  const oldSection=document.getElementById(`edit-${key}`);
  oldSection.outerHTML=editorGroup(group);
  window.scrollTo(0,scrollY);
  if(add)document.getElementById(`edit-${key}`).querySelector('.editor-entry:last-child [data-field]')?.focus({preventScroll:true});
  finishInterface();
});
app.addEventListener('submit',event=>{if(event.target.id==='profile-editor'){event.preventDefault();saveProfile(event.target);}});

let draggedCard=null;

function moveProfileCard(groupKey,from,to){
  if(!profileEditing||!profileGroups.some(group=>group.key===groupKey))return false;
  const entries=profileDraft.details[groupKey];
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=entries.length||to>=entries.length||from===to)return false;
  // Capture current values before rebuilding and reindexing the moved cards
  app.querySelectorAll('[data-field]').forEach(field=>updateDraft(field.dataset.field,field.value));
  const [entry]=entries.splice(from,1);
  entries.splice(to,0,entry);
  const group=profileGroups.find(group=>group.key===groupKey);
  const scrollY=window.scrollY;
  document.getElementById(`edit-${groupKey}`).outerHTML=editorGroup(group);
  window.scrollTo(0,scrollY);
  finishInterface();
  toast(`Tarjeta movida a la posición ${to+1}, pulsa Guardar para conservar el orden`);
  return true;
}

app.addEventListener('click',event=>{
  const button=event.target.closest('[data-move]');
  if(!button||button.disabled)return;
  const from=Number(button.dataset.index);
  const to=from+Number(button.dataset.direction);
  if(moveProfileCard(button.dataset.move,from,to)){
    const card=app.querySelector(`[data-card-group="${button.dataset.move}"][data-card-index="${to}"]`);
    card?.querySelector('.drag-handle')?.focus({preventScroll:true});
  }
});

// Desktop drag starts only on the handle so editing text never moves a card
app.addEventListener('dragstart',event=>{
  const handle=event.target.closest('[data-drag]');
  if(!profileEditing||!handle)return;
  draggedCard={group:handle.dataset.drag,index:Number(handle.dataset.index)};
  event.dataTransfer.effectAllowed='move';
  event.dataTransfer.setData('text/plain',JSON.stringify(draggedCard));
  const card=handle.closest('[data-card-group]');
  event.dataTransfer.setDragImage(card,24,20);
  card.classList.add('is-dragging');
});

function clearDropMarkers(){app.querySelectorAll('.drop-before,.drop-after').forEach(card=>card.classList.remove('drop-before','drop-after'));}
app.addEventListener('dragover',event=>{
  const card=event.target.closest('[data-card-group]');
  if(!draggedCard||!card||card.dataset.cardGroup!==draggedCard.group)return;
  event.preventDefault();
  event.dataTransfer.dropEffect='move';
  clearDropMarkers();
  if(Number(card.dataset.cardIndex)===draggedCard.index)return;
  const bounds=card.getBoundingClientRect();
  card.classList.add(event.clientY<bounds.top+bounds.height/2?'drop-before':'drop-after');
});
app.addEventListener('drop',event=>{
  const card=event.target.closest('[data-card-group]');
  if(!draggedCard||!card||card.dataset.cardGroup!==draggedCard.group)return;
  event.preventDefault();
  const bounds=card.getBoundingClientRect();
  const target=Number(card.dataset.cardIndex);
  const insertion=target+(event.clientY>=bounds.top+bounds.height/2?1:0);
  const destination=insertion-(draggedCard.index<insertion?1:0);
  const {group,index}=draggedCard;
  draggedCard=null;
  clearDropMarkers();
  moveProfileCard(group,index,destination);
});
app.addEventListener('dragend',()=>{
  draggedCard=null;
  clearDropMarkers();
  app.querySelectorAll('.is-dragging').forEach(card=>card.classList.remove('is-dragging'));
});
