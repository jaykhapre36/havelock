import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BookingStateService, BookingState } from '../booking-state.service';

@Component({
  standalone: false,
  selector: 'app-bk-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss']
})
export class Step3Component implements OnInit {

  @Output() back    = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  state!: BookingState;

  constructor(private stateService: BookingStateService) {}

  ngOnInit(): void {
    this.state = this.stateService.snapshot;
  }

  get activeSelections() {
    return this.state.selections.filter(s => s.qty > 0);
  }

  onBack():    void { this.back.emit();    }
  onConfirm(): void { this.confirm.emit(); }
}
