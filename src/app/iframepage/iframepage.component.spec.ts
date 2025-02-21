import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframepageComponent } from './iframepage.component';

describe('IframepageComponent', () => {
  let component: IframepageComponent;
  let fixture: ComponentFixture<IframepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IframepageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IframepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
