import { TopicItem } from './topic-item';

export interface Topic {
  id: number;
  name: string;
  checkList: TopicItem[];
}
