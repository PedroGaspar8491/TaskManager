import { Component } from '@angular/core';
import { Topic } from '../topic';
import { DataService } from '../data-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-menu.html',
  styleUrl: './app-menu.css',
})
export class AppMenu {
  topicList: Topic[] = [];
  selectedTopic = -1;

  showNewTopicInput = true;
  showTopics = true;

  newTopic: string = '';

  searchTerm: string = '';

  
  constructor(private dataService: DataService) {
    this.dataService.topicList.subscribe((value) => {
      this.topicList = value;
    });
    this.dataService.currentTopic.subscribe((value) => {
      this.selectedTopic = value.id;
    });
  }

  sendSelectedTopic() {
    const topic = this.topicList.find((t) => t.id === this.selectedTopic);
    if (topic) {
      this.dataService.updateCurrentTopic(topic);
    }
  }

  selectTopic(id: number): void {
    this.selectedTopic = this.selectedTopic === id ? -1 : id;
    if (this.selectedTopic === -1) {
      this.dataService.updateCurrentTopic({ id: -1, name: '', checkList: [] });
    } else {
      this.sendSelectedTopic();
    }
  }

  get filteredTopics() {
    if (this.searchTerm.length != 0) {
      return this.topicList.filter((topic) =>
        topic.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      return this.topicList;
    }
  }

  addTopic(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    this.dataService.addTopic(trimmedName);
    this.newTopic = '';
  }

  toggleNewTopic(): void {
    this.showNewTopicInput = !this.showNewTopicInput;
  }

  toggleTopicsList(): void {
    this.showTopics = !this.showTopics;
  }
}
