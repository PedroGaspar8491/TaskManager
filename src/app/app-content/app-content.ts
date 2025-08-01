import { Component, Input } from '@angular/core';
import { Topic } from '../topic';

@Component({
  selector: 'app-content',
  imports: [],
  templateUrl: './app-content.html',
  styleUrl: './app-content.css',
})
export class AppContent {
  @Input()
  selectedTopic!: Topic;

  constructor() {}
}
