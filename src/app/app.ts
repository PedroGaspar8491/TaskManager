import { Component, signal } from '@angular/core';
import { AppContent } from './app-content/app-content';
import { AppMenu } from './app-menu/app-menu';

@Component({
  selector: 'app-root',
  imports: [AppContent, AppMenu],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('TaskManager');
  constructor() {}
}
