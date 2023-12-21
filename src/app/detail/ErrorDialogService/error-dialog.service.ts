// src/app/services/error-dialog.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorDialogService {
  private openErrorDialogs: Set<string> = new Set();

  openDialogForEvent(eventId: string) {
    this.openErrorDialogs.add(eventId);
  }

  isDialogOpenForEvent(eventId: string): boolean {
    return this.openErrorDialogs.has(eventId);
  }

  closeDialogForEvent(eventId: string) {
    this.openErrorDialogs.delete(eventId);
  }
}
