import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeContainerComponent } from './time-container.component';

describe('TimeContainerComponent', () => {
  let component: TimeContainerComponent;
  let fixture: ComponentFixture<TimeContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
