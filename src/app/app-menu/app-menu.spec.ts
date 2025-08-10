import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

import { AppMenu } from './app-menu';
import { DataService } from '../data-service';
import { Topic } from '../topic';

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

  updateCurrentTopic = jasmine
    .createSpy('updateCurrentTopic')
    .and.callFake((topic: Topic) => this.currentTopic$.next(topic));
}

describe('AppMenu', () => {
  let component: AppMenu;
  let fixture: ComponentFixture<AppMenu>;
  let dataService: MockDataService;

  beforeEach(async () => {
    dataService = new MockDataService();

    await TestBed.configureTestingModule({
      imports: [AppMenu],
      providers: [provideZonelessChangeDetection(), { provide: DataService, useValue: dataService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to streams and reflect topic list and selection', () => {
    const topics: Topic[] = [
      { id: 1, name: 'Alpha', checkList: [] },
      { id: 2, name: 'Beta', checkList: [] },
    ];
    dataService.topicList$.next(topics);
    dataService.currentTopic$.next(topics[1]);

    expect(component.topicList).toEqual(topics);
    expect(component.selectedTopic).toBe(2);
  });

  it('should filter topics by search term case-insensitively', () => {
    dataService.topicList$.next([
      { id: 1, name: 'Alpha', checkList: [] },
      { id: 2, name: 'Beta', checkList: [] },
      { id: 3, name: 'Gamma', checkList: [] },
    ]);

    component.searchTerm = 'ALP';
    expect(component.filteredTopics.map((t) => t.name)).toEqual(['Alpha']);

    component.searchTerm = '';
    expect(component.filteredTopics.length).toBe(3);
  });

  it('should add a topic with trimmed name via service and ignore empty input', () => {
    component.addTopic('   New Topic   ');
    expect(dataService.addTopic).toHaveBeenCalledOnceWith('New Topic');

    (dataService.addTopic as jasmine.Spy).calls.reset();
    component.addTopic('   ');
    expect(dataService.addTopic).not.toHaveBeenCalled();
  });

  it('should select and deselect topics and propagate to service', () => {
    const topics: Topic[] = [
      { id: 1, name: 'Alpha', checkList: [] },
      { id: 2, name: 'Beta', checkList: [] },
    ];
    dataService.topicList$.next(topics);

    component.selectTopic(1);
    expect(component.selectedTopic).toBe(1);
    expect(dataService.updateCurrentTopic).toHaveBeenCalledWith(topics[0]);

    component.selectTopic(1); // toggle off
    expect(component.selectedTopic).toBe(-1);
    expect(dataService.updateCurrentTopic).toHaveBeenCalledWith({ id: -1, name: '', checkList: [] });
  });

  it('should toggle visibility flags', () => {
    const initialNew = component.showNewTopicInput;
    const initialList = component.showTopics;

    component.toggleNewTopic();
    component.toggleTopicsList();

    expect(component.showNewTopicInput).toBe(!initialNew);
    expect(component.showTopics).toBe(!initialList);
  });
});
