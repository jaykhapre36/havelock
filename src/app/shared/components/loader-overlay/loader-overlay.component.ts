import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader-overlay.component.html',
  styleUrl: './loader-overlay.component.scss'
})
export class LoaderOverlayComponent {}
