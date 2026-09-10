import {icons} from './control-icons.js';
const $=s=>document.querySelector(s);
export function button(el,label,{variant='outline',icon,busy=false,pressed,disabled}={}){
 el.classList.add('control');
 for(const v of ['primary','outline','ghost'])el.classList.toggle('control-'+v,v===variant);
 const key=label+'|'+icon;
 if(el.dataset.controlContent!==key){el.replaceChildren();if(icon&&icons[icon]){const t=document.createElement('template');t.innerHTML=icons[icon];el.append(t.content.cloneNode(true));}const span=document.createElement('span');span.textContent=label;el.append(span);el.dataset.controlContent=key;}
 el.setAttribute('aria-busy',String(busy));
 if(pressed!==undefined)el.setAttribute('aria-pressed',String(pressed));
 if(disabled!==undefined)el.disabled=disabled;
}
export function initializeControls(){
 const controls=[['#select-mode','Select a light','Crosshair','ghost'],['#investigate-stop','Investigate a resource stop · 3 credits',undefined,'ghost'],['#help-plan','Help me plan · 6 credits','Sparkle','outline'],['#brush-mode','Preview a push','Cursor','ghost'],['#look-mode','Move view','Hand','ghost'],['#recenter','Recenter','Crosshair','ghost'],['#undo','Undo field edit','ArrowCounterClockwise','ghost'],['#reset','Reset sky','ArrowCounterClockwise','ghost'],['#details-toggle','Evidence & ledger','List','ghost'],['#interrupt','Interrupt','Pause','outline'],['#skip-stop','Skip the stop','ArrowUpRight','ghost'],['#close-details','Close details','X','ghost'],['#export-ledger','Export record','DownloadSimple','outline'],['#random-sky','Random sky · original defaults','Sparkle','outline'],['#demo-sky','Restore comparison preset','ArrowCounterClockwise','outline']];
 for(const [id,label,icon,variant] of controls)button($(id),label,{icon,variant});
 button($('#chat-form button[type=submit]'),'',{icon:'ArrowUp',variant:'outline'});$('#chat-form button[type=submit]').classList.add('control-icon-only');
}
export function actionButton(el,label){
 const fuel=label==='Use less fuel';el.dataset.action=fuel?'less-fuel':/Apply/.test(label)?'apply':'support';
 button(el,label,{variant:label==='Select a bright light'||label.startsWith('Identify light')||label.startsWith('Locate ourselves')?'primary':'outline',icon:fuel?'SlidersHorizontal':/Apply/.test(label)?'ArrowBendUpRight':/Advance/.test(label)?'ArrowRight':/receipt/.test(label)?'List':undefined});
}
export function syncControls({interaction,view:v,delegated,planning,request,pending,accepted,quote,editing,error}){
 const arrived=v.phase==='arrived',active=v.active,busy=Boolean(request),settingEconomy=document.body.classList.contains('handle-busy')&&v.preference==='less-fuel';
 const state=arrived?'arrived':error?'error':pending?'revising':busy?'investigating':editing?'editing':!active&&delegated?'interrupted':v.target?'travelling':quote?.kind.startsWith('gravity-')?'proposal':active?'executing':'ready';
 document.body.dataset.journeyState=state;
 document.querySelector('.astra-light').classList.toggle('working',active||busy);
 const workLabel=pending?'Revising the route':busy?(v.calibration?'Considering the route':'Finding our position'):v.target?'Following the route':quote?.kind.startsWith('gravity-')?'Field preview':'Astra has the helm';
 button($('#delegate'),arrived?'Home, verified':active||busy?workLabel:'Astra, take the helm',{variant:active||busy||arrived||v.mode==='plan'?'outline':'primary',icon:arrived?'Check':active||busy?'SpinnerGap':delegated?'Play':'Sparkle',busy:active||busy,disabled:active||busy||arrived});
 button($('#interrupt'),'Interrupt',{icon:'Pause',variant:'outline',disabled:!active&&!busy&&!planning});
 $('#driver-status').textContent=arrived?'Arrival verified.':pending?'Revising your quote…':busy?'Live Astra is considering…':editing?'You are shaping the field.':!active&&delegated?(error?'Paused · needs a change':'Paused · you have the helm'):active?(delegated?'Helm: Astra · Driving':'Helm: You · Driving'):'Helm: You';
 for(const el of document.querySelectorAll('#less-fuel,[data-action="less-fuel"]'))button(el,pending?'Revising…':settingEconomy?'Setting less-fuel route…':accepted&&!error?'Less fuel selected':'Use less fuel',{variant:'outline',icon:pending||settingEconomy?'SpinnerGap':accepted&&!error?'Check':'SlidersHorizontal',busy:pending||settingEconomy,pressed:accepted&&!pending&&!error&&!settingEconomy,disabled:pending||settingEconomy||arrived||(accepted&&!error)});
 $('#chat-form button[type=submit]').disabled=busy||arrived;$('#message').disabled=arrived;$('#skip-stop').disabled=arrived;$('#skip-stop').hidden=!v.report||!!v.target||arrived;$('#less-fuel').hidden=!quote?.kind.startsWith('gravity-');
 for(const el of document.querySelectorAll('[data-action="apply"]')){el.disabled=busy||pending;el.hidden=false;el.classList.toggle('control-primary',v.mode==='plan');el.classList.toggle('control-outline',v.mode!=='plan');}
 $('#journey-map').setAttribute('aria-label',interaction==='look'?'Move view. Drag to rotate the camera; this does not select or push.':interaction==='select'&&!quote?.kind.startsWith('gravity-')?'Select a catalogue light. Ringed bright lights are suggested targets; hover any catalogue star to highlight it. Selection is free.':v.target?'Ship in computed flight. Use Move view to rotate the camera.':quote?.kind.startsWith('gravity-')?'Gravity proposal. Drag the separate glowing Bend gravity handle to change the field, route and cost. Release follows the selected Plan or Drive mode.':'Preview a push. Drag outward from the ship; direction and length set a free impulse preview. Move view rotates the camera.');
 $('#gravity-handle').setAttribute('aria-busy',String(document.body.classList.contains('handle-busy')));
}
