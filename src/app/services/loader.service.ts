import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LoaderOverlayComponent } from '../shared/components/loader-overlay/loader-overlay.component';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private overlayRef: OverlayRef | null = null;
  private count = 0;

  constructor(private overlay: Overlay) {}

  show(): void {
    if (++this.count === 1) {
      if (!this.overlayRef) {
        this.overlayRef = this.overlay.create();
      }
      this.overlayRef.attach(new ComponentPortal(LoaderOverlayComponent));
    }
  }

  hide(): void {
    if (this.count > 0 && --this.count === 0 && this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
