import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public date:Date = new Date();

  public unset():void {
      this.date = undefined;
  }

  public today():void {
      this.date = new Date();
  }
}
