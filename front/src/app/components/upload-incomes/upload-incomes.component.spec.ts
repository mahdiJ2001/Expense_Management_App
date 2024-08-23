import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadIncomesComponent } from './upload-incomes.component';

describe('UploadIncomesComponent', () => {
  let component: UploadIncomesComponent;
  let fixture: ComponentFixture<UploadIncomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadIncomesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
