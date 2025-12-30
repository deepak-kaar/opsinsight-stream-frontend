import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechHomeComponent } from './speech-home.component';

describe('SpeechHomeComponent', () => {
  let component: SpeechHomeComponent;
  let fixture: ComponentFixture<SpeechHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpeechHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
