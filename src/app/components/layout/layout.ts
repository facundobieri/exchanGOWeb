import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Navbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
