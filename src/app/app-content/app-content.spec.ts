import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

import { AppContent } from './app-content';
import { DataService } from '../data-service';
import { Topic } from '../topic';
import { TopicItem } from '../topic-item';

class MockDataService {
  topicList$ = new BehaviorSubject<Topic[]>([]);
  currentTopic$ = new BehaviorSubject<Topic>({ id: -1, name: '', checkList: [] });

  topicList = this.topicList$.asObservable();
  currentTopic = this.currentTopic$.asObservable();

  addTopic = jasmine.createSpy('addTopic').and.callFake((name: string) => {
    const topics = this.topicList$.getValue();
    const id = topics.length ? Math.max(...topics.map((t) => t.id)) + 1 : 1;
    const topic: Topic = { id, name: name.trim(), checkList: [] };
    this.topicList$.next([...topics, topic]);
    this.currentTopic$.next(topic);
    return topic;
  });

  addChecklistItem = jasmine
    .createSpy('addChecklistItem')
    .and.callFake((topicId: number, text: string) => {
      const list = this.topicList$.getValue();
      const idx = list.findIndex((t) => t.id === topicId);
      if (idx === -1) return;
      const topic = list[idx];
      const nextId = topic.checkList.length ? Math.max(...topic.checkList.map((i) => i.id)) + 1 : 1;
      const updated: Topic = {
        ...topic,
        checkList: [...topic.checkList, { id: nextId, text, done: false }],
      };
      const copy = [...list];
      copy[idx] = updated;
      this.topicList$.next(copy);
      if (this.currentTopic$.getValue().id === topicId) this.currentTopic$.next(updated);
    });

  toggleChecklistItem = jasmine
    .createSpy('toggleChecklistItem')
    .and.callFake((topicId: number, itemId: number) => {
      const list = this.topicList$.getValue();
      const idx = list.findIndex((t) => t.id === topicId);
      if (idx === -1) return;
      const topic = list[idx];
      const itemIdx = topic.checkList.findIndex((i) => i.id === itemId);
      if (itemIdx === -1) return;
      const updatedItems: TopicItem[] = topic.checkList.map((i, j) =>
        j === itemIdx ? { ...i, done: !i.done } : i
      );
      const updated: Topic = { ...topic, checkList: updatedItems };
      const copy = [...list];
      copy[idx] = updated;
      this.topicList$.next(copy);
      if (this.currentTopic$.getValue().id === topicId) this.currentTopic$.next(updated);
    });
}

describe('AppContent', () => {
  let component: AppContent;
  let fixture: ComponentFixture<AppContent>;
  let dataService: MockDataService;

  beforeEach(async () => {
    dataService = new MockDataService();

    await TestBed.configureTestingModule({
      imports: [AppContent],
      providers: [provideZonelessChangeDetection(), { provide: DataService, useValue: dataService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize selectedTopic from currentTopic stream on ngOnInit', () => {
    const topic: Topic = { id: 1, name: 'T1', checkList: [] };
    dataService.currentTopic$.next(topic);
    component.ngOnInit();
    expect(component.selectedTopic).toEqual(topic);
  });

  it('should addTopic only when text is non-empty after trim', () => {
    component.addTopic('   ');
    expect(dataService.addTopic).not.toHaveBeenCalled();

    component.addTopic('  Work  ');
    expect(dataService.addTopic).toHaveBeenCalledOnceWith('Work');
  });

  it('should add checklist item only when text is non-empty and trimmed', () => {
    const t = dataService.addTopic('A');

    component.addCheckListItem(t.id, '   ');
    expect(dataService.addChecklistItem).not.toHaveBeenCalled();

    component.addCheckListItem(t.id, '  Task 1  ');
    expect(dataService.addChecklistItem).toHaveBeenCalledOnceWith(t.id, 'Task 1');
  });

  it('should toggle item via service', () => {
    const t = dataService.addTopic('A');
    dataService.addChecklistItem(t.id, 'Task 1');

    component.toggleItem(t.id, 1);
    expect(dataService.toggleChecklistItem).toHaveBeenCalledWith(t.id, 1);
  });

  it('trackByItem should return item id', () => {
    const id = component.trackByItem(0, { id: 42, text: 'x', done: false });
    expect(id).toBe(42);
  });

  it('getDoneCount should reflect selectedTopic state', () => {
    const t: Topic = {
      id: 1,
      name: 'A',
      checkList: [
        { id: 1, text: 'a', done: true },
        { id: 2, text: 'b', done: false },
        { id: 3, text: 'c', done: true },
      ],
    };
    dataService.currentTopic$.next(t);
    component.ngOnInit();

    expect(component.getDoneCount()).toBe(2);
  });
});
