import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppContent } from './app-content/app-content';
import { AppMenu } from './app-menu/app-menu';
import { Topic } from './topic';

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
