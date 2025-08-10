import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

import { DataService } from './data-service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    // Ensure clean persisted state between tests
    try { localStorage.clear(); } catch {}

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), DataService],
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw an error when adding a topic with empty name', () => {
    expect(() => service.addTopic('')).toThrowError('Topic name cannot be empty');
    expect(() => service.addTopic('   ')).toThrowError('Topic name cannot be empty');
  });

  it('should add a trimmed topic, assign id 1, set as current topic and update list', async () => {
    const topic = service.addTopic('  Work  ');

    expect(topic.id).toBe(1);
    expect(topic.name).toBe('Work');
    expect(topic.checkList.length).toBe(0);

    const current = await firstValueFrom(service.currentTopic);
    expect(current).toEqual(topic);

    const list = await firstValueFrom(service.topicList);
    expect(list.length).toBe(1);
    expect(list[0]).toEqual(topic);
  });

  it('should increment topic ids sequentially', async () => {
    const t1 = service.addTopic('A');
    const t2 = service.addTopic('B');

    expect(t1.id).toBe(1);
    expect(t2.id).toBe(2);

    const list = await firstValueFrom(service.topicList);
    expect(list.map((t) => t.id)).toEqual([1, 2]);
  });

  it('should add a checklist item and update current topic when matching', async () => {
    const topic = service.addTopic('A');

    service.addChecklistItem(topic.id, 'Task 1');

    const list = await firstValueFrom(service.topicList);
    const updated = list.find((t) => t.id === topic.id)!;

    expect(updated.checkList.length).toBe(1);
    expect(updated.checkList[0]).toEqual(
      jasmine.objectContaining({ id: 1, text: 'Task 1', done: false })
    );

    const current = await firstValueFrom(service.currentTopic);
    expect(current).toEqual(updated);
  });

  it('should toggle a checklist item done status and update current topic', async () => {
    const topic = service.addTopic('A');
    service.addChecklistItem(topic.id, 'Task 1');

    let current = await firstValueFrom(service.currentTopic);
    expect(current.checkList[0].done).toBeFalse();

    service.toggleChecklistItem(topic.id, 1);

    current = await firstValueFrom(service.currentTopic);
    expect(current.checkList[0].done).toBeTrue();

    service.toggleChecklistItem(topic.id, 1);

    current = await firstValueFrom(service.currentTopic);
    expect(current.checkList[0].done).toBeFalse();
  });
});
