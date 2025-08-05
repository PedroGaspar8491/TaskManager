import { Component, Input } from '@angular/core';
import { Topic } from '../topic';
import { DataService } from '../data-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content',
  imports: [CommonModule],
  templateUrl: './app-content.html',
  styleUrl: './app-content.css',
})
export class AppContent {
  selectedTopic!: Topic;
  topicList: Topic[] = [];

  constructor(private dataService: DataService) {
    this.dataService.topicList.subscribe((value) => {
      this.topicList = value;
    });
  }

  ngOnInit() {
    this.dataService.currentTopic.subscribe((value) => {
      this.selectedTopic = value;
    });
  }
  addTopic(topicName: string) {
    const newTopic: Topic = {
      id: this.topicList.length,
      name: topicName,
      checkList: [],
    };
    this.dataService.addTopicToList(newTopic);
    this.dataService.updateCurrentTopic(newTopic);
  }

  addCheckListItem(topicID: number, itemName: string) {
    this.dataService.addChecklistItem(topicID, itemName);
  }

  toggleItem(topicId: number, itemId: number) {
    this.dataService.toggleChecklistItem(topicId, itemId);
  }
}
