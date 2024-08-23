import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadExpensesComponent } from './upload-expenses.component';

describe('UploadExpensesComponent', () => {
  let component: UploadExpensesComponent;
  let fixture: ComponentFixture<UploadExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
