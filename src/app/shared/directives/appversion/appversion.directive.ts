import { Directive, ElementRef, Renderer2 } from '@angular/core';
const packageJson = require('../../../../../package.json');
@Directive({
  selector: '[appVersion]'
})
export class AppVersionDirective {
  constructor(renderer: Renderer2, elmRef: ElementRef) {
   elmRef.nativeElement.insertAdjacentHTML('beforeend',' v'+ packageJson.version);
  }
}
