import { Component, Input } from '@angular/core';
import { Topic } from '../topic';
import { DataService } from '../data-service';
import { CommonModule } from '@angular/common';
import { TopicItem } from '../topic-item';

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
  addTopic(text: string) {
    if (!text.trim()) return;

    const newTopic: Topic = {
      id: this.topicList.length,
      name: text,
      checkList: [],
    };
    this.dataService.addTopicToList(newTopic);
    this.dataService.updateCurrentTopic(newTopic);
  }

  addCheckListItem(topicId: number, text: string) {
    if (!text.trim()) return;
    this.dataService.addChecklistItem(topicId, text.trim());
  }

  toggleItem(topicId: number, itemId: number) {
    this.dataService.toggleChecklistItem(topicId, itemId);
  }

  trackByItem(index: number, item: TopicItem): number {
    return item.id;
  }

  getDoneCount(): number {
    return this.selectedTopic?.checkList.filter((i) => i.done).length || 0;
  }
}
