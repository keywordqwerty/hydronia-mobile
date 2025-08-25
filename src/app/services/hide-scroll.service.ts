import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HeaderScrollService {
  headerHidden = false;
  lastScrollTop = 0;

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    if (scrollTop > this.lastScrollTop && scrollTop > 50) {
      this.headerHidden = true;
    } else if (scrollTop < this.lastScrollTop) {
      this.headerHidden = false;
    }
    this.lastScrollTop = scrollTop;
  }
}