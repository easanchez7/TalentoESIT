'use strict';

let profileMediaLoading=0;
// Temporal para pruebas: el avatar original satisface el requisito de fotografía
const USE_DEMO_PROFILE_PHOTO=true;
function profileImage(person,key,fallback=''){
  const value=person?.[key];
  if(typeof value==='string'&&/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=\r\n]+$/.test(value))return value;
  if(USE_DEMO_PROFILE_PHOTO&&person?.id===1&&key==='avatarImage')return 'icon/usuario-1.svg';
  return fallback;
}

// Restauración puntual solicitada: conservar el perfil y restablecer solo su avatar
function restoreOriginalAvatarOnce(storage){
  const marker='talento-original-avatar-restored-v1';
  try{
    storage=storage||localStorage;
    if(storage.getItem(marker)==='1')return;
    const saved=JSON.parse(storage.getItem('talento-profile')||'null');
    if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
      delete saved.avatarImage;
      storage.setItem('talento-profile',JSON.stringify(saved));
    }
    delete people[0].avatarImage;
    storage.setItem(marker,'1');
  }catch{/* Mantener los demás datos si el almacenamiento no está disponible */}
}
restoreOriginalAvatarOnce();
function profileCover(person,editable=false){const image=profileImage(person,'coverImage');const color=validCoverColor(person.coverColor);return `<div class="profile-cover" ${color?`style="background:${color}"`:''}>${image?`<img class="cover-image" src="${esc(image)}" alt="Portada del perfil">`:''}${editable?'<button type="button" class="media-edit cover-edit" data-edit-media="coverImage" aria-label="Editar banner"><img src="icon/pencil.svg" alt=""><span>Editar banner</span></button>':''}</div>`;}
function profileAvatarEditor(){return `<div class="avatar-editor"><img id="editor-avatar" class="profile-avatar" src="${esc(profileImage(profileDraft,'avatarImage','icon/usuario-1.svg'))}" alt="Foto de perfil" width="170" height="170"><button type="button" class="media-edit avatar-edit" data-edit-media="avatarImage" aria-label="Editar foto de perfil"><img src="icon/pencil.svg" alt=""></button></div>`;}

function readProfileFile(file){return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error('No se pudo leer la imagen'));
  reader.onload=()=>resolve(reader.result);
  reader.readAsDataURL(file);
});}
function loadProfileImage(url){return new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>resolve(image);
  image.onerror=()=>reject(new Error('El archivo no contiene una imagen válida'));
  image.src=url;
});}
function resizeProfileImage(image,key){
  const width=key==='avatarImage'?512:1600;
  const height=key==='avatarImage'?512:500;
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');
  if(!context)throw new Error('No se pudo preparar la imagen');
  const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
  const cropWidth=width/scale,cropHeight=height/scale;
  context.fillStyle='#ffffff';context.fillRect(0,0,width,height);
  context.drawImage(image,(image.naturalWidth-cropWidth)/2,(image.naturalHeight-cropHeight)/2,cropWidth,cropHeight,0,0,width,height);
  return canvas.toDataURL('image/jpeg',.85);
}

