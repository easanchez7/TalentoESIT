'use strict';

function closeAccountMenu(restoreFocus=false){
  const trigger=app.querySelector('[data-action="account-menu"]');
  const dropdown=document.querySelector('#account-dropdown');
  if(dropdown)dropdown.hidden=true;
  if(trigger){trigger.setAttribute('aria-expanded','false');if(restoreFocus)trigger.focus();}
}

app.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-action="account-menu"]');
  if(trigger){
    const dropdown=document.querySelector('#account-dropdown');
    if(!dropdown)return;
    const open=trigger.getAttribute('aria-expanded')!=='true';
    trigger.setAttribute('aria-expanded',String(open));
    dropdown.hidden=!open;
    return;
  }
  if(event.target.closest('#account-dropdown a'))closeAccountMenu();
});
document.addEventListener('click',event=>{if(!event.target.closest('.account-menu'))closeAccountMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeAccountMenu(true);});
