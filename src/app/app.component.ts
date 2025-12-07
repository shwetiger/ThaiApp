import { Component } from '@angular/core';
import { NavigationService } from './shared/service/navigation.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private updates: SwUpdate,
    public navigation: NavigationService) {
    // 检查 Service Worker 是否可用
    if (this.updates.isEnabled) {
      // 监听更新可用事件
      this.updates.available.subscribe(() => {
        this.updates.activateUpdate()
          .then(() => {
            document.location.reload();
          })
          .catch(err => {
            console.error('Failed to activate update:', err);
            // 可选：可以在这里添加用户提示，比如 toast 通知
          });
      }, err => {
        console.error('Error in updates.available observable:', err);
      });
    }
  }

  ngOnInit(): void {
    // 版本显示功能由 AppVersionService 在构造函数中自动初始化
    // 版本更新检测和刷新由 Service Worker 负责（见 constructor）
  }

  onActivate() {
    window.scroll(0, 0);
  }
}



