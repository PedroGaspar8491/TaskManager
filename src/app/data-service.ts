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

  updateCurrentTopic(data: Topic) {
    this._currentTopic.next(data);
  }

  addTopicToList(data: Topic) {
    this._topicList.value.push(data);
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
  }
}
