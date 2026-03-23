import { Component, OnInit } from '@angular/core';
import { ExtrasService, WalletData } from '../../services/extras.service';

@Component({
  standalone: false,
  selector: 'app-my-wallet',
  templateUrl: './my-wallet.component.html',
  styleUrls: ['./my-wallet.component.scss']
})
export class MyWalletComponent implements OnInit {

  loading = true;
  error = '';
  data: WalletData | null = null;

  constructor(private extrasService: ExtrasService) {}

  ngOnInit(): void {
    this.extrasService.getWallet().subscribe({
      next: res => {
        this.data = res.data;
        this.loading = false;
      },
      error: (err) => {
        // 404 = wallet not created yet (new user) — show empty wallet instead of error
        if (err?.status === 404) {
          this.data = { balance: 0, transactions: [] } as any;
        } else {
          this.error = 'Failed to load wallet. Please try again.';
        }
        this.loading = false;
      }
    });
  }
}
