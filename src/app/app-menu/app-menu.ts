import { Component, EventEmitter, Output } from '@angular/core';
import { Topic } from '../topic';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './app-menu.html',
  styleUrl: './app-menu.css',
})
export class AppMenu {
  topicList: Topic[] = [];
  selectedTopic = 0;

  @Output() topicEvent = new EventEmitter<Topic>();

  constructor() {
    this.topicList = [];
  }

  addTopic(topicName: string) {
    const newTopic: Topic = {
      id: this.topicList.length,
      name: topicName,
      checkList: [],
    };
    this.topicList.push(newTopic);
  }

  sendSelectedTopic() {
    this.topicEvent.emit(this.topicList.at(this.selectedTopic));
  }
}
