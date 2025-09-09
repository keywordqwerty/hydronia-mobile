import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HeaderScrollService {
  headerHidden = false;
  lastScrollTop = 0;

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    console.log('Scroll event:', scrollTop, 'Last:', this.lastScrollTop, 'Hidden:', this.headerHidden);
    if (scrollTop > this.lastScrollTop && scrollTop > 50) {
      this.headerHidden = true;
      console.log('Header hidden');
    } else if (scrollTop < this.lastScrollTop) {
      this.headerHidden = false;
      console.log('Header shown');
    }
    this.lastScrollTop = scrollTop;
  }
}