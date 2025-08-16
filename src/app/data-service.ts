import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Topic } from './topic';

const NO_SELECTION = -1;

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _currentTopic = new BehaviorSubject<Topic>({
    id: NO_SELECTION,
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
      console.warn(
        'Failed to load initial state from storage, using defaults.'
      );
      this._currentTopic.next({ id: NO_SELECTION, name: '', checkList: [] });
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
      console.warn('Failed to persist state to storage.');
    }
  }

  updateCurrentTopic(data: Topic) {
    this._currentTopic.next(data);
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

  addChecklistItem(topicId: number, itemName: string): void {
    const topics = this._topicList.getValue();
    const topicIndex = topics.findIndex((t) => t.id === topicId);
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

    if (this._currentTopic.getValue().id === topicId) {
      this._currentTopic.next(updatedTopic);
    }
    this.persistState();
  }

  toggleChecklistItem(topicId: number, itemId: number): void {
    const topics = this._topicList.getValue();

    const topicIndex = topics.findIndex((t) => t.id === topicId);
    if (topicIndex === -1) return;

    const topic = topics[topicIndex];

    const updatedChecklist = topic.checkList.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    // If nothing changed (item not found), no-op
    if (updatedChecklist === topic.checkList) return;

    const updatedTopic = { ...topic, checkList: updatedChecklist };
    const updatedTopics = [...topics];
    updatedTopics[topicIndex] = updatedTopic;

    this._topicList.next(updatedTopics);

    if (this._currentTopic.getValue().id === topicId) {
      this._currentTopic.next(updatedTopic);
    }
    this.persistState();
  }

  removeChecklistItem(topicId: number, itemId: number): void {
    const topics = this._topicList.getValue();
    const topicIndex = topics.findIndex((t) => t.id === topicId);
    if (topicIndex === -1) return;

    const topic = topics[topicIndex];
    const updatedChecklist = topic.checkList.filter((i) => i.id !== itemId);

    if (updatedChecklist.length === topic.checkList.length) return; // no change

    const updatedTopic: Topic = { ...topic, checkList: updatedChecklist };
    const updatedTopics = [...topics];
    updatedTopics[topicIndex] = updatedTopic;

    this._topicList.next(updatedTopics);

    if (this._currentTopic.getValue().id === topicId) {
      this._currentTopic.next(updatedTopic);
    }
    this.persistState();
  }

  removeTopic(topicId: number): void {
    const topics = this._topicList.getValue();
    const updatedTopics = topics.filter((t) => t.id !== topicId);
    if (updatedTopics.length === topics.length) return; // no change

    this._topicList.next(updatedTopics);

    if (this._currentTopic.getValue().id === topicId) {
      this._currentTopic.next({ id: NO_SELECTION, name: '', checkList: [] });
    }
    this.persistState();
  }
}
