import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Topic } from './topic';
import { TopicItem } from './topic-item';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _currentTopic = new BehaviorSubject<Topic>({
    id: -1,
    name: '',
    checkList: [],
  });

  private _topicList = new BehaviorSubject<Topic[]>([]);

  currentTopic = this._currentTopic.asObservable();
  topicList = this._topicList.asObservable();

  private readonly storage: Storage | null =
    typeof localStorage !== 'undefined' ? localStorage : null;
  private readonly STORAGE_KEYS = {
    list: 'tm.topicList',
    current: 'tm.currentTopic',
  };

  constructor() {
    // hydrate from storage if available
    try {
      const listRaw = this.storage?.getItem(this.STORAGE_KEYS.list);
      const currentRaw = this.storage?.getItem(this.STORAGE_KEYS.current);

      if (listRaw) {
        const list = JSON.parse(listRaw) as Topic[];
        if (Array.isArray(list)) {
          this._topicList.next(list);
        }
      }

      if (currentRaw) {
        const current = JSON.parse(currentRaw) as Topic;
        if (current && typeof current.id === 'number') {
          this._currentTopic.next(current);
        }
      }
    } catch {
      // this can happen in tests or if localStorage is not available
      console.warn(
        'Failed to load initial state from storage, using defaults.'
      );
      this._currentTopic.next({ id: -1, name: '', checkList: [] });
      this._topicList.next([]);
    }
  }

  private persistState(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(
        this.STORAGE_KEYS.list,
        JSON.stringify(this._topicList.value)
      );
      this.storage.setItem(
        this.STORAGE_KEYS.current,
        JSON.stringify(this._currentTopic.value)
      );
    } catch {
      // ignore quota or serialization errors in tests
    }
  }

  updateCurrentTopic(data: Topic) {
    this._currentTopic.next(data);
    this.persistState();
  }

  addTopicToList(data: Topic) {
    const updated = [...this._topicList.value, data];
    this._topicList.next(updated);
    this.persistState();
  }

  addTopic(name: string): Topic {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Topic name cannot be empty');
    }

    const topics = this._topicList.getValue();
    const newId = topics.length ? Math.max(...topics.map((t) => t.id)) + 1 : 1;
    const newTopic: Topic = { id: newId, name: trimmed, checkList: [] };

    this._topicList.next([...topics, newTopic]);
    this._currentTopic.next(newTopic);
    this.persistState();

    return newTopic;
  }

  addChecklistItem(topicID: number, itemName: string): void {
    const topics = this._topicList.getValue();
    const topicIndex = topics.findIndex((t) => t.id === topicID);
    if (topicIndex === -1) return;

    const topic = topics[topicIndex];

    const newItemId = topic.checkList.length
      ? Math.max(...topic.checkList.map((i) => i.id)) + 1
      : 1;

    const newItem = { id: newItemId, text: itemName, done: false };

    const updatedChecklist = [...topic.checkList, newItem];

    const updatedTopic = { ...topic, checkList: updatedChecklist };
    const updatedTopics = [...topics];
    updatedTopics[topicIndex] = updatedTopic;

    this._topicList.next(updatedTopics);

    if (this._currentTopic.getValue().id === topicID) {
      this._currentTopic.next(updatedTopic);
    }
    this.persistState();
  }

  toggleChecklistItem(topicId: number, itemId: number): void {
    const topics = this._topicList.getValue();

    const topicIndex = topics.findIndex((t) => t.id === topicId);
    if (topicIndex === -1) return;

    const topic = topics[topicIndex];

    const itemIndex = topic.checkList.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    topic.checkList[itemIndex].done = !topic.checkList[itemIndex].done;

    const updatedTopics = [...topics];
    updatedTopics[topicIndex] = { ...topic };

    this._topicList.next(updatedTopics);

    if (this._currentTopic.getValue().id === topicId) {
      this._currentTopic.next(updatedTopics[topicIndex]);
    }
    this.persistState();
  }
}
