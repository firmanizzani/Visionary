import {describe,it,expect} from 'vitest';
import {fitOverlayLabel} from './overlay-label';
const measure=(value:string)=>Array.from(value).length*10;
describe('overlay labels stay inside narrow images',()=>{
 it('keeps short names and confidence unchanged',()=>expect(fitOverlayLabel('cup',' 87%',200,measure)).toBe('cup 87%'));
 it('truncates long names while retaining the score',()=>{const text=fitOverlayLabel('very long category name',' 87%',140,measure);expect(text).toMatch(/… 87%$/);expect(measure(text)).toBeLessThanOrEqual(140);});
 it('handles extremely narrow images and Unicode names without splitting characters',()=>{expect(fitOverlayLabel('🌿🌿🌿','',20,measure)).toBe('🌿…');expect(fitOverlayLabel('cup',' 87%',5,measure)).toBe('');});
});
