'use strict';

let profileModalState=null;
function getProfileDialog(){
  let dialog=document.querySelector('#profile-modal');
  if(dialog)return dialog;
  dialog=document.createElement('dialog');
  dialog.id='profile-modal';
  dialog.className='profile-modal';
  dialog.setAttribute('aria-labelledby','profile-modal-title');
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeProfileDialog();});
  document.body.append(dialog);
  return dialog;
}
function closeProfileDialog(force=false){
  if(profileModalState?.required&&!force){showModalError('Agrega una fotografía para continuar');return;}
  const dialog=document.querySelector('#profile-modal');
  if(dialog?.open)dialog.close();
  profileModalState=null;
}
function modalButtons(save='Guardar',required=false){return `<div class="profile-modal-actions">${required?'':'<button type="button" class="button secondary" data-modal-cancel>Cancelar</button>'}<button type="submit" class="button">${save}</button></div>`;}
function showModalError(message){const error=document.querySelector('#profile-modal-error');if(error){error.textContent=message;error.hidden=false;}}
function openProfileDialog(state,content,onSubmit){
  const dialog=getProfileDialog();
  if(dialog.open)dialog.close();
  profileModalState=state;
  dialog.ondragstart=null;dialog.ondragover=null;dialog.ondrop=null;dialog.ondragend=null;
  dialog.innerHTML=`<form id="profile-modal-form"><h2 id="profile-modal-title">${esc(state.title)}</h2>${content}<p id="profile-modal-error" class="form-error" role="alert" hidden></p>${modalButtons(state.save||'Guardar',state.required)}</form>`;
  dialog.onclick=event=>{if(event.target.closest('[data-modal-cancel]'))closeProfileDialog();};
  dialog.querySelector('form').onsubmit=event=>{event.preventDefault();if(profileModalState===state)onSubmit(state);};
  dialog.showModal();
  return dialog;
}
function confirmProfileAction(title,lines,onAccept){
  return openProfileDialog({kind:'confirm',title,save:'Aceptar'},`<div class="confirm-message">${lines.map(line=>`<p>${esc(line)}</p>`).join('')}</div>`,()=>{closeProfileDialog(true);onAccept();});
}
function publicationRequirements(person){
  const missing=[];
  if(!profileImage(person,'avatarImage'))missing.push('Agrega una fotografía de perfil');
  if(!cleanText(person?.bio||''))missing.push('Completa la descripción de tu perfil');
  if(!hasPublicSkills(person))missing.push('Ingresa al menos 3 habilidades distintas');
  return missing;
}
function canPublishProfile(person){return publicationRequirements(person).length===0;}
function requestProfileVisibility(requested){
  const person=profileEditing?profileDraft:people[0];
  const missing=requested?publicationRequirements(person):[];
  if(missing.length){
    const dialog=openProfileDialog({kind:'requirements',title:'Completa tu perfil para publicarlo',save:'Entendido'},`<ul class="publication-requirements">${missing.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`,()=>closeProfileDialog(true));
    return dialog;
  }
  confirmProfileAction(requested?'Publicar perfil':'Ocultar perfil',requested?['Tu perfil se hará visible en la plataforma','Puedes editarlo u ocultarlo en cualquier momento']:['Tu perfil se ocultará en la plataforma','Puedes editarlo o publicarlo en cualquier momento'],()=>{
    if(requested&&!canPublishProfile(profileEditing?profileDraft:people[0]))return;
    if(profileEditing)draftVisible=requested;
    else{profileVisible=requested;try{localStorage.setItem('talento-visibility',String(requested));}catch{}}
    app.querySelectorAll('#profile-visible').forEach(toggle=>toggle.checked=requested);
    app.querySelectorAll('.visibility-label').forEach(label=>label.textContent=requested?'Público':'Privado');
  });
}

function validCoverColor(value){return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value:'';}
function ensureInitialPhoto(){
  if(!authenticated||!profileEditing||!profileDraft||profileImage(profileDraft,'avatarImage')||profileModalState)return;
  openMediaModal('avatarImage',true);
}
function mediaPreview(state){
  const avatar=state.key==='avatarImage';
  const source=state.image||(avatar?'icon/usuario-1.svg':'');
  return `<div class="${avatar?'modal-avatar-preview':'modal-cover-preview'}" id="modal-media-preview" ${!avatar&&state.color?`style="background:${validCoverColor(state.color)}"`:''}>${source?`<img src="${esc(source)}" alt="Vista previa de ${avatar?'la foto':'la portada'}">`:''}</div>`;
}
function updateMediaModalPreview(state){const element=document.querySelector('#modal-media-preview');if(element)element.outerHTML=mediaPreview(state);}
function openMediaModal(key,required=false){
  if(!profileEditing||!profileDraft)return;
  const avatar=key==='avatarImage';
  const state={kind:'media',title:avatar?'Foto de perfil':'Editar banner',key,required,draft:profileDraft,image:profileImage(profileDraft,key),color:validCoverColor(profileDraft.coverColor),loading:false};
  const content=`${required?'<p class="photo-required-note">Antes de continuar, agrega tu fotografía de perfil</p>':''}${mediaPreview(state)}${avatar?'':'<button type="button" class="button restore-cover" data-restore-cover>Restaurar diseño ESIT</button>'}<label class="modal-upload ${avatar?'avatar-upload':''}"><span>${avatar?'Subir nueva foto':'Seleccionar imagen de portada'}</span><input class="sr-only" type="file" id="modal-media-file" accept="image/jpeg,image/png,image/webp"></label><p class="media-help">${avatar?'JPG, PNG o WebP, mínimo 400 × 400 px · Se recortará en círculo':'JPG, PNG o WebP · Tamaño recomendado 1600 × 500 px'} · Máximo 10 MB</p>${avatar?'':`<label class="modal-color-field">O elegir un color<span><input type="color" id="modal-cover-color" value="${state.color||'#223e69'}"><input type="text" id="modal-cover-hex" aria-label="Código hexadecimal del banner" value="${state.color||'#223e69'}" pattern="#[0-9A-Fa-f]{6}" maxlength="7"></span></label>`}`;
  const dialog=openProfileDialog(state,content,()=>{
    if(state.loading)return;
    if(avatar&&!state.image){showModalError('Selecciona una fotografía para continuar');return;}
    if(profileDraft!==state.draft){closeProfileDialog(true);return;}
    profileDraft[key]=state.image;
    if(!avatar)profileDraft.coverColor=state.color;
    closeProfileDialog(true);
    render();
  });
  dialog.querySelector('#modal-media-file').onchange=async event=>{
    const file=event.target.files?.[0];
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){showModalError('Selecciona una imagen JPG, PNG o WebP');return;}
    if(file.size>10*1024*1024){showModalError('La imagen debe pesar como máximo 10 MB');return;}
    state.loading=true;profileMediaLoading++;
    const submit=dialog.querySelector('[type="submit"]');submit.disabled=true;
    try{
      const image=await loadProfileImage(await readProfileFile(file));
      if(profileModalState!==state)return;
      if(avatar&&(image.naturalWidth<400||image.naturalHeight<400))throw new Error('La fotografía debe tener al menos 400 × 400 px');
      state.image=resizeProfileImage(image,key);state.color='';
      if(!avatar){dialog.querySelector('#modal-cover-color').value='#223e69';dialog.querySelector('#modal-cover-hex').value='#223e69';}
      updateMediaModalPreview(state);
      dialog.querySelector('#profile-modal-error').hidden=true;
    }catch(error){if(profileModalState===state)showModalError(error.message||'No se pudo cargar la imagen');}
    finally{state.loading=false;profileMediaLoading--;submit.disabled=false;event.target.value='';}
  };
  if(!avatar){
    dialog.querySelector('[data-restore-cover]').onclick=()=>{state.image='';state.color='';dialog.querySelector('#modal-cover-color').value='#223e69';dialog.querySelector('#modal-cover-hex').value='#223e69';updateMediaModalPreview(state);};
    const color=dialog.querySelector('#modal-cover-color');
    const hex=dialog.querySelector('#modal-cover-hex');
    const update=value=>{if(!validCoverColor(value))return;state.color=value;state.image='';color.value=value;hex.value=value;updateMediaModalPreview(state);};
    color.oninput=()=>update(color.value);hex.oninput=()=>update(hex.value);
  }
}

const socialNetworks={github:{label:'GitHub',host:'github.com',icon:'github.svg'},linkedin:{label:'LinkedIn',host:'linkedin.com',path:'in/',icon:'linkedin.svg'},X:{label:'X (Twitter)',host:'x.com',icon:'imgProperty1X.svg'},Whats:{label:'WhatsApp',host:'wa.me',icon:'imgProperty1Whats.svg'},Youtube:{label:'YouTube',host:'youtube.com',path:'@',icon:'imgProperty1Youtube.svg'},Insta:{label:'Instagram',host:'instagram.com',icon:'imgProperty1Insta.svg'},Facebook:{label:'Facebook',host:'facebook.com',icon:'imgProperty1Facebook.svg'}};
function socialHref(network,value){
  if(!Object.hasOwn(socialNetworks,network)||typeof value!=='string')return '';
  const raw=value.trim();if(!raw)return '';
  const config=socialNetworks[network];
  if(network==='Whats'){const digits=raw.replace(/\D/g,'');return /^\+?[\d\s()-]+$/.test(raw)&&digits.length>=8&&digits.length<=15?'https://wa.me/'+digits:'';}
  if(/^https?:\/\//i.test(raw)){
    try{const url=new URL(raw);const host=url.hostname.replace(/^www\./,'');const allowed=host===config.host||host.endsWith('.'+config.host)||(network==='X'&&host==='twitter.com')||(network==='Youtube'&&host==='youtu.be');return url.protocol==='https:'&&allowed&&!url.username&&!url.password?url.href:'';}catch{return '';}
  }
  const username=raw.replace(/^@/,'');
  return /^[a-zA-Z0-9_.-]+$/.test(username)?`https://${config.host}/${config.path||''}${encodeURIComponent(username)}`:'';
}
function renderProfileSocials(person,editable=false){
  const links=(person.socialLinks||[]).filter(item=>item&&socialHref(item.network,item.value));
  return `<div class="socials profile-socials">${links.map(item=>`<a href="${esc(socialHref(item.network,item.value))}" target="_blank" rel="noopener noreferrer" aria-label="${socialNetworks[item.network].label}"><img src="icon/${socialNetworks[item.network].icon}" alt=""></a>`).join('')}${editable?'<button type="button" class="social-edit-button" data-edit-socials aria-label="Agregar o editar redes sociales"><img src="icon/social-add.svg" alt=""></button>':''}</div>`;
}
function socialModalRows(state){return state.links.length?state.links.map((item,index)=>`<div class="social-modal-row" data-social-row="${index}"><button type="button" class="drag-handle" draggable="true" data-social-drag="${index}" aria-label="Arrastrar red social ${index+1}"><img src="icon/drag-handle.svg" alt=""></button><img class="social-network-icon" src="icon/${socialNetworks[item.network].icon}" alt=""><label><span>${socialNetworks[item.network].label}</span><input type="text" data-social-value="${index}" value="${esc(item.value)}" aria-label="Usuario o enlace de ${socialNetworks[item.network].label}"></label><div class="social-row-controls"><button type="button" data-social-move="${index}" data-step="-1" aria-label="Subir red social" ${index===0?'disabled':''}>↑</button><button type="button" data-social-move="${index}" data-step="1" aria-label="Bajar red social" ${index===state.links.length-1?'disabled':''}>↓</button><button type="button" data-social-delete="${index}" aria-label="Eliminar red social"><img src="icon/delete.svg" alt=""></button></div></div>`).join(''):'<p class="social-empty">Agrega las redes que deseas mostrar en tu perfil</p>';}
function openSocialModal(){
  if(!profileEditing||!profileDraft)return;
  const state={kind:'social',title:'Redes sociales',draft:profileDraft,links:JSON.parse(JSON.stringify(profileDraft.socialLinks||[])).filter(item=>item&&Object.hasOwn(socialNetworks,item.network))};
  const dialog=openProfileDialog(state,`<div id="social-modal-list">${socialModalRows(state)}</div><div class="social-add-fields"><label>Red social<select id="social-network">${Object.entries(socialNetworks).map(([key,network])=>`<option value="${key}">${network.label}</option>`).join('')}</select></label><label>Usuario, teléfono o enlace<input type="text" id="social-new-value" maxlength="250" placeholder="Usuario o enlace"></label><button type="button" class="button small" data-social-add>Agregar</button></div>`,()=>{
    sync();
    if(state.links.some(item=>!socialHref(item.network,item.value))){showModalError('Revisa los usuarios o enlaces de tus redes sociales');return;}
    if(profileDraft===state.draft)profileDraft.socialLinks=state.links;
    closeProfileDialog(true);render();
  });
  const sync=()=>dialog.querySelectorAll('[data-social-value]').forEach(input=>{state.links[Number(input.dataset.socialValue)].value=input.value.trim();});
  const redraw=()=>dialog.querySelector('#social-modal-list').innerHTML=socialModalRows(state);
  const move=(from,to)=>{if(to<0||to>=state.links.length||from===to)return;sync();state.links.splice(to,0,state.links.splice(from,1)[0]);redraw();};
  dialog.onclick=event=>{
    if(event.target.closest('[data-modal-cancel]')){closeProfileDialog();return;}
    const add=event.target.closest('[data-social-add]');
    if(add){const network=dialog.querySelector('#social-network').value;const value=dialog.querySelector('#social-new-value').value.trim();if(!socialHref(network,value)){showModalError('Ingresa un usuario o enlace válido para la red seleccionada');return;}sync();state.links.push({network,value});dialog.querySelector('#social-new-value').value='';redraw();dialog.querySelector('#profile-modal-error').hidden=true;return;}
    const remove=event.target.closest('[data-social-delete]');if(remove){sync();state.links.splice(Number(remove.dataset.socialDelete),1);redraw();return;}
    const reorder=event.target.closest('[data-social-move]');if(reorder)move(Number(reorder.dataset.socialMove),Number(reorder.dataset.socialMove)+Number(reorder.dataset.step));
  };
  let dragged=null;
  dialog.ondragstart=event=>{const handle=event.target.closest('[data-social-drag]');if(!handle)return;dragged=Number(handle.dataset.socialDrag);event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',String(dragged));};
  dialog.ondragover=event=>{if(dragged!==null&&event.target.closest('[data-social-row]'))event.preventDefault();};
  dialog.ondrop=event=>{const row=event.target.closest('[data-social-row]');if(dragged===null||!row)return;event.preventDefault();move(dragged,Number(row.dataset.socialRow));dragged=null;};
  dialog.ondragend=()=>dragged=null;
}

app.addEventListener('click',event=>{
  const media=event.target.closest('[data-edit-media]');
  if(media){openMediaModal(media.dataset.editMedia);return;}
  if(event.target.closest('[data-edit-socials]'))openSocialModal();
});
