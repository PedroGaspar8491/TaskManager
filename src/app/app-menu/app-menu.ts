import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Topic } from '../topic';
import { DataService } from '../data-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const NO_SELECTION = -1;

@Component({
  selector: 'app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-menu.css',
})
export class AppMenu {
  topicList: Topic[] = [];
  selectedTopic = NO_SELECTION;

  showNewTopicInput = true;
  showTopics = true;

  newTopic = '';

  searchTerm = '';

  
  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {
    this.dataService.topicList
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        this.topicList = value;
        this.cdr.markForCheck();
      });
    this.dataService.currentTopic
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        this.selectedTopic = value.id;
        this.cdr.markForCheck();
      });
  }

  sendSelectedTopic() {
    const topic = this.topicList.find((t) => t.id === this.selectedTopic);
    if (topic) {
      this.dataService.updateCurrentTopic(topic);
    }
  }

  selectTopic(id: number): void {
    this.selectedTopic = this.selectedTopic === id ? NO_SELECTION : id;
    if (this.selectedTopic === NO_SELECTION) {
      this.dataService.updateCurrentTopic({ id: NO_SELECTION, name: '', checkList: [] });
    } else {
      this.sendSelectedTopic();
    }
  }

  get filteredTopics(): Topic[] {
    if (this.searchTerm.length !== 0) {
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

  removeTopic(id: number): void {
    this.dataService.removeTopic(id);
    if (this.selectedTopic === id) {
      this.selectedTopic = NO_SELECTION;
    }
  }
}
