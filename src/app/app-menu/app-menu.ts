import { Component, EventEmitter, Output } from '@angular/core';
import { Topic } from '../topic';
import { DataService } from '../data-service';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './app-menu.html',
  styleUrl: './app-menu.css',
})
export class AppMenu {
  topicList: Topic[] = [];
  selectedTopic = -1;

  @Output() topicEvent = new EventEmitter<Topic>();

  constructor(private dataService: DataService) {
    this.dataService.topicList.subscribe((value) => {
      this.topicList = value;
    });
    this.dataService.currentTopic.subscribe((value) => {
      this.selectedTopic = value.id;
    });
  }

  sendSelectedTopic() {
    this.dataService.updateCurrentTopic(this.topicList.at(this.selectedTopic)!);
  }
}
