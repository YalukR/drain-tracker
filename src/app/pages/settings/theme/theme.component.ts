import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeOption } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme.component.html',
})
export class ThemeComponent implements OnInit {
  themeOptions: { value: ThemeOption; label: string; icon: string }[] = [
    { value: 'light', label: 'Claro', icon: 'pi-sun' },
    { value: 'dark', label: 'Oscuro', icon: 'pi-moon' },
    { value: 'system', label: 'Sistema', icon: 'pi-desktop' },
  ];
  currentTheme: ThemeOption = 'system';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.currentTheme = this.themeService.getTheme();
  }

  setTheme(theme: ThemeOption): void {
    this.currentTheme = theme;
    this.themeService.setTheme(theme);
  }
}