'use strict';
document.documentElement.classList.add('js');
const header = document.querySelector('.site-header');
const headerShell = document.querySelector('.header-shell');
let headerFrame = false;
function updateHeader() {
  headerFrame = false;
  const compact = headerShell.getBoundingClientRect().bottom <= 0;
  if (compact === header.classList.contains('is-compact')) return;
  // Appear in the final position. Only the menu button animates the fold.
  header.classList.add('island-arriving');
  header.classList.toggle('is-compact', compact);
  setIslandCollapsed(compact && desktopLayout.matches);
  requestAnimationFrame(() => requestAnimationFrame(() => header.classList.remove('island-arriving')));
}
window.addEventListener('scroll', () => {
  if (!headerFrame) {headerFrame = true; requestAnimationFrame(updateHeader);}
}, {passive:true});
window.addEventListener('resize', updateHeader);
window.addEventListener('pageshow', updateHeader);
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const phoneLayout = matchMedia('(width < 1101px)');
menu.hidden = false;
function setMenu(open) {
  navigation.classList.toggle('is-open',open);
  menu.setAttribute('aria-expanded',String(open));
  const fullscreen = open && phoneLayout.matches;
  document.body.classList.toggle('phone-menu-open',fullscreen);
  document.querySelector('main').inert=fullscreen;
  document.querySelector('.site-footer').inert=fullscreen;
  header.querySelector('.wordmark').inert=fullscreen;
  if(fullscreen)header.querySelector('.phone-menu-close').focus({preventScroll:true});
  if (!open) {
    document.querySelector('#theme-menu').hidden=true;
    document.querySelector('#theme-trigger').setAttribute('aria-expanded','false');
  }
}
function closeMenu(){setMenu(false);}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
header.querySelector('.phone-menu-close').addEventListener('click',()=>{closeMenu();menu.focus();});
document.addEventListener('keydown',event=>{
  if(event.key!=='Tab'||!document.body.classList.contains('phone-menu-open'))return;
  const focusable=[...header.querySelectorAll('a,button')].filter(el=>!el.closest('[inert]')&&!el.disabled&&el.getClientRects().length);
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
// Put appearance controls inside the phone's logo dropdown.
const appearance = header.querySelector('.theme-control');
const headerTools = header.querySelector('.header-tools');
const phoneAppearance = document.createElement('div');
phoneAppearance.className = 'phone-appearance';
const appearanceLabel = document.createElement('span');
appearanceLabel.textContent = 'Appearance';
phoneAppearance.append(appearanceLabel);
function placeAppearance() {
  closeMenu();
  if (phoneLayout.matches) {
    phoneAppearance.append(appearance);
    navigation.append(phoneAppearance);
  } else {
    headerTools.prepend(appearance);
    phoneAppearance.remove();
  }
}
phoneLayout.addEventListener('change',placeAppearance);
placeAppearance();

// The right-hand button opens the desktop menu toward the left.
const islandToggle = header.querySelector('.island-toggle');
const desktopLayout = matchMedia('(min-width:1101px)');
function setIslandCollapsed(collapsed) {
  header.classList.toggle('is-collapsed', collapsed);
  navigation.inert = collapsed;
  headerTools.inert = collapsed;
  islandToggle.setAttribute('aria-expanded', String(!collapsed));
  const label = collapsed ? 'Expand navigation' : 'Collapse navigation';
  islandToggle.setAttribute('aria-label', label);
  islandToggle.title = label;
  if (collapsed) closeMenu();
}
islandToggle.addEventListener('click', () => setIslandCollapsed(!header.classList.contains('is-collapsed')));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || event.defaultPrevented || !desktopLayout.matches ||
      !header.classList.contains('is-compact') || header.classList.contains('is-collapsed') ||
      document.querySelector('.lightbox').open) return;
  setIslandCollapsed(true);
  islandToggle.focus({preventScroll:true});
});
function measureIsland() {
  if (!desktopLayout.matches) { setIslandCollapsed(false); return; }
  header.style.setProperty('--navigation-width', `${navigation.scrollWidth}px`);
  setIslandCollapsed(header.classList.contains('is-compact') && header.classList.contains('is-collapsed'));
}
window.addEventListener('resize', measureIsland);
document.fonts.ready.then(measureIsland);
updateHeader();
measureIsland();

// Treat the Spaces gallery as part of Portfolio, and the introduction as Home.
const navigationRegions = [
  ['#home', '#home'],
  ['#introduction', '#home'],
  ['.spaces', '#portfolio'],
  ['#portfolio', '#portfolio'],
  ['#about', '#about'],
  ['#collaborations', '#collaborations'],
  ['#contact', '#contact']
].map(([selector, destination]) => ({element:document.querySelector(selector), destination}));
let navigationFramePending = false;
function updateCurrentSection() {
  navigationFramePending = false;
  const readingLine = header.getBoundingClientRect().bottom + 80;
  let current = '#home';
  for (const region of navigationRegions) {
    if (region.element.getBoundingClientRect().top <= readingLine) current = region.destination;
  }
  if (Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2) current = '#contact';
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function scheduleCurrentSection() {
  if (!navigationFramePending) {
    navigationFramePending = true;
    requestAnimationFrame(updateCurrentSection);
  }
}
window.addEventListener('scroll', scheduleCurrentSection, {passive:true});
window.addEventListener('resize', scheduleCurrentSection);
window.addEventListener('load', scheduleCurrentSection);
updateCurrentSection();
const strip=document.querySelector('.photo-strip');
const spaces = document.querySelector('.spaces');
const runway = document.querySelector('.spaces-runway');
const stage = document.querySelector('.spaces-stage');
const controls = document.querySelector('.strip-controls');
const spacesPhotos = [...strip.querySelectorAll('.photo')];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const previousPhoto = controls.querySelector('[data-scroll="previous"]');
const nextPhoto = controls.querySelector('[data-scroll="next"]');
let galleryTravel = 0;
let framePending = false;

function galleryStart() {
  return scrollY + runway.getBoundingClientRect().top - parseFloat(spaces.style.getPropertyValue('--spaces-top'));
}

function updateSpacesScroll() {
  framePending = false;
  if (!spaces.classList.contains('spaces-scroll')) return;
  const position = Math.max(0, Math.min(galleryTravel, scrollY - galleryStart()));
  strip.scrollLeft = position;
  const reachedEnd = position >= galleryTravel - 1;
  previousPhoto.disabled = position < 1;
  nextPhoto.disabled = reachedEnd;
}

function scheduleSpacesScroll() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateSpacesScroll);
  }
}

function sizeSpacesScroll() {
  // Reduced motion and short landscape windows show every photo in a static grid.
  // Stable compact-header clearance avoids moving the runway during header animation.
  const top = innerWidth > 1100 ? 92 : 88;
  const height = innerHeight - top - 24;
  const enabled = !motionPreference.matches && height >= 360;
  spaces.classList.toggle('spaces-scroll', enabled);
  spaces.classList.toggle('spaces-static', !enabled);
  controls.hidden = !enabled;
  if (!enabled) {
    strip.scrollLeft = 0;
    previousPhoto.disabled = false;
    nextPhoto.disabled = false;
    return;
  }
  spaces.style.setProperty('--spaces-top', `${top}px`);
  spaces.style.setProperty('--spaces-stage-height', `${height}px`);
  galleryTravel = Math.max(0, strip.scrollWidth - strip.clientWidth);
  spaces.style.setProperty('--spaces-runway-height', `${height + galleryTravel}px`);
  updateSpacesScroll();
}

controls.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => {
  const direction = button.dataset.scroll === 'next' ? 1 : -1;
  const step = spacesPhotos[0].getBoundingClientRect().width + parseFloat(getComputedStyle(strip).gap);
  if (spaces.classList.contains('spaces-scroll')) {
    const position = Math.max(0, Math.min(galleryTravel, strip.scrollLeft + direction * step));
    window.scrollTo({top:galleryStart() + position, behavior:'smooth'});
  } else {
    strip.scrollBy({left:direction * step, behavior:'smooth'});
  }
}));

strip.addEventListener('focusin', event => {
  const photo = event.target.closest('.photo');
  if (!photo || !spaces.classList.contains('spaces-scroll') || document.body.classList.contains('modal-open')) return;
  const left = photo.offsetLeft - spacesPhotos[0].offsetLeft;
  const right = left + photo.getBoundingClientRect().width;
  const position = Math.max(0, Math.min(galleryTravel, scrollY - galleryStart()));
  if (left < position || right > position + strip.clientWidth) {
    window.scrollTo({top:galleryStart() + Math.min(galleryTravel, left), behavior:'instant'});
  }
});

window.addEventListener('scroll', scheduleSpacesScroll, {passive:true});
window.addEventListener('resize', sizeSpacesScroll);
window.addEventListener('pageshow', sizeSpacesScroll);
motionPreference.addEventListener('change', sizeSpacesScroll);
// Card sizes can settle after the first measurement without a window resize.
// Recalculate both the horizontal travel and the sticky section's scroll distance.
const galleryResize = new ResizeObserver(sizeSpacesScroll);
galleryResize.observe(strip);
spacesPhotos.forEach(photo => galleryResize.observe(photo));
sizeSpacesScroll();
const dialog=document.querySelector('.lightbox');
const lightboxImage=document.querySelector('#lightbox-image');
const photoTitle = document.querySelector('#lightbox-title');
const photoLocation = document.querySelector('#photo-location');
const photoCountryRow = document.querySelector('#photo-country-row');
const photoCountryShape = document.querySelector('#photo-country-shape');
const photoCountryMarker = document.querySelector('#photo-country-marker');
const photoEquipment = document.querySelector('#photo-equipment');
const photoDescription = document.querySelector('#photo-description');
const counter=document.querySelector('#lightbox-counter');
let collection=[],index=0,opener;
let openedWithKeyboard = false;
function showPhoto() {
  const image = collection[index].querySelector('img');
  const key = new URL(image.src).pathname.split('/').pop().replace(/\.(webp|jpe?g|png)$/i, '');
  const details = window.photoDetails?.[key] || {};
  lightboxImage.src = details.fullSrc || image.src;
  lightboxImage.alt = image.alt;
  photoTitle.textContent = details.title || 'Selected photograph';
  photoLocation.textContent = details.location || '';
  const country = ['India','France','Morocco','Canada'].find(name=>(details.location||'').endsWith(name));
  photoCountryRow.hidden = !country;
  if(country)photoCountryShape.setAttribute('href', `./assets/country_outlines.svg#${country.toLowerCase()}`);
  else photoCountryShape.removeAttribute('href');
  const marker = country && window.photoLocationMarkers?.[details.location];
  photoCountryMarker.classList.toggle('is-visible', Boolean(marker));
  if (marker) {
    photoCountryMarker.setAttribute('cx', marker[0]);
    photoCountryMarker.setAttribute('cy', marker[1]);
  }
  document.querySelector('#photo-location-row').hidden = !details.location;
  photoEquipment.textContent = details.equipment || '';
  document.querySelector('#photo-equipment-row').hidden = !details.equipment;
  photoDescription.textContent = details.description || '';
  photoDescription.hidden = !details.description;
  counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(collection.length).padStart(2, '0');
}
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',event=>{openedWithKeyboard=event.detail===0;opener=button;collection=[...document.querySelectorAll(`[data-gallery="${button.dataset.gallery}"]`)];index=collection.indexOf(button);showPhoto();dialog.showModal();document.body.classList.add('modal-open');dialog.focus({preventScroll:true});}));
document.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lightboxImage.removeAttribute('src');if(!openedWithKeyboard)opener?.classList.add('returned-from-viewer');opener?.focus({preventScroll:true});});
function movePhoto(direction){index=(index+direction+collection.length)%collection.length;showPhoto();}
document.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>movePhoto(button.dataset.lightbox==='next'?1:-1)));
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();movePhoto(1);}if(event.key==='ArrowLeft'){event.preventDefault();movePhoto(-1);}});
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
document.querySelector('#year').textContent=new Date().getFullYear();

// A pointer-opened photo should not retain a focus ring or hover effect on return.
document.querySelectorAll('[data-gallery]').forEach(button => {
  button.addEventListener('pointerleave', () => button.classList.remove('returned-from-viewer'));
  button.addEventListener('pointerdown', () => button.classList.remove('returned-from-viewer'));
});
document.addEventListener('keydown', () => {
  document.querySelectorAll('.returned-from-viewer').forEach(button => button.classList.remove('returned-from-viewer'));
});

// Desktop About uses native scrolling through a sticky photograph, without wheel interception.
const aboutSection = document.querySelector('#about');
const aboutDesktop = matchMedia('(min-width:1101px) and (min-height:640px)');
let aboutFrame = false;
function updateAboutReveal() {
  aboutFrame = false;
  if (!aboutSection.classList.contains('about-scroll')) return;
  const rect = aboutSection.getBoundingClientRect();
  const travel = rect.height - innerHeight;
  // Begin just before the photograph fills the viewport, then ease into full visibility.
  const progress = Math.max(0, Math.min(1, (-rect.top + innerHeight * .08) / Math.max(1, travel * .45)));
  const reveal = progress * progress * (3 - 2 * progress);
  aboutSection.style.setProperty('--about-reveal', reveal.toFixed(4));
}
function scheduleAboutReveal() {
  if (!aboutFrame) {aboutFrame = true; requestAnimationFrame(updateAboutReveal);}
}
function sizeAboutReveal() {
  aboutSection.classList.toggle('about-scroll', aboutDesktop.matches && !motionPreference.matches);
  aboutSection.style.removeProperty('--about-reveal');
  updateAboutReveal();
}
window.addEventListener('scroll', scheduleAboutReveal, {passive:true});
window.addEventListener('resize', sizeAboutReveal);
motionPreference.addEventListener('change', sizeAboutReveal);
sizeAboutReveal();
