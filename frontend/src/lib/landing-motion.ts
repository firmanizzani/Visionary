// One-shot entrances only: no scroll handlers, animation loop, or inference on the landing page.
export function animateLanding(root: HTMLElement) {
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 if (!('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;
 const active = new Set<Animation>();
 const seen = new WeakSet<Element>();
 const options = new Map<Element, {delay:number;kind:string}>();
 const groups = [
  {selector:'.hero-copy > *',stagger:80,kind:'rise'},
  {selector:'.sample-scene',stagger:0,kind:'picture'},
  {selector:'.studio-principles > *',stagger:60,kind:'rise'},
  {selector:'.studio-section-intro > *',stagger:80,kind:'rise'},
  {selector:'.studio-feature-list > a',stagger:90,kind:'side'},
  {selector:'.studio-vocabulary > div:first-child > *',stagger:60,kind:'rise'},
  {selector:'.object-study > figure',stagger:75,kind:'picture'},
  {selector:'.vocabulary-preview > p',stagger:0,kind:'rise'},
  {selector:'.studio-privacy > div:first-child > *',stagger:60,kind:'rise'},
  {selector:'.studio-flow > div',stagger:90,kind:'side'},
  {selector:'.final-cta > *',stagger:80,kind:'rise'}
 ];
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.isIntersecting) continue;
   observer.unobserve(entry.target);
   if (preference.matches || seen.has(entry.target)) continue;
   seen.add(entry.target);
   const {delay,kind} = options.get(entry.target)!;
   const transform = kind === 'picture' ? 'translateY(12px) scale(.98)' : kind === 'side' ? 'translateX(18px)' : 'translateY(20px)';
   const animation = entry.target.animate([
    {opacity:0,transform}, {opacity:1,transform:'none'}
   ], {duration:kind === 'picture' ? 1000 : 720,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
   active.add(animation);
   animation.onfinish = () => { active.delete(animation); animation.cancel(); };
  }
 }, {threshold:.12});
 if (!preference.matches) for (const group of groups) {
  root.querySelectorAll(group.selector).forEach((node,index) => {
   options.set(node,{delay:index*group.stagger,kind:group.kind});
   observer.observe(node);
  });
 }
 const stop = () => {
  observer.disconnect();
  for (const animation of active) animation.cancel();
  active.clear();
 };
 // Respect a preference change immediately, including while an entrance is running.
 preference.addEventListener('change',stop);
 return () => { stop(); preference.removeEventListener('change',stop); };
}
