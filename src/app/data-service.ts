import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Topic } from './topic';
import { TopicItem } from './topic-item';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private currentTopicData = new BehaviorSubject<Topic>({
    id: -1,
    name: '',
    checkList: [],
  });

  private topicListData = new BehaviorSubject<Topic[]>([]);

  currentTopic = this.currentTopicData.asObservable();
  topicList = this.topicListData.asObservable();

  updateCurrentTopic(data: Topic) {
    this.currentTopicData.next(data);
  }

  addTopicToList(data: Topic) {
    this.topicListData.value.push(data);
  }

  addChecklistItem(topicID: number, itemName: string) {
    const newItem: TopicItem = {
      id: this.topicListData.value.at(topicID)?.checkList.length!,
      text: itemName,
      done: false,
    };
    this.topicListData.value.at(topicID)?.checkList.push(newItem);
  }
}
