import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMailModalComponent } from './send-mail-modal.component';

describe('SendMailModalComponent', () => {
  let component: SendMailModalComponent;
  let fixture: ComponentFixture<SendMailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendMailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendMailModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
