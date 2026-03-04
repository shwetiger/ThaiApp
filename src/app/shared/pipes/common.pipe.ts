import { Pipe, PipeTransform } from '@angular/core';
import { TimeAgoPipe } from 'time-ago-pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../service/common.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Pipe({
    name: 'timeAgo',
    pure: false
})
export class TimeAgoExtendsPipePipe extends TimeAgoPipe implements PipeTransform {
    transform(value: string): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) {}
    transform(url) {
      return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Pipe({
    name: "formatTime"
})
export class FormatTimePipe implements PipeTransform {

    transform(value: number): string {
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    return ('00' + hours).slice(-2) + ':' +
     ('00' + minutes).slice(-2) + ':' +
     ('00' + Math.floor(value - minutes * 60)).slice(-2);
    }
}

@Pipe({
    name: "threedformatTime"
})
export class ThreedFormatTimePipe implements PipeTransform {
    constructor(
        private translateService: TranslateService
    ) { }

    transform(value: number): string {
        // const hours: number = Math.floor(value / 3600);
        // const minutes: number = Math.floor((value % 3600) / 60);
        const days: number = Math.floor(value/ 86400);
        const hours: number = Math.floor((value % 86400) / 3600);
        const minutes: number = Math.floor((value % 3600) / 60);
        const seconds: number= Math.floor(value % 60);
        var showDays;

        if(days == 0){
        showDays='';
        }
        else{
        showDays=("00" + days).slice(-2)+
        this.translateService.instant("days");
        }

        return (
        showDays +
        ("00" + hours).slice(-2) +
        ":" +
        ("00" + minutes).slice(-2) +
        ":" +
        ("00" + seconds).slice(-2)
        //("00" + Math.floor(value - minutes * 60)).slice(-2)
        );
    }
}

@Pipe({
  name: 'thai2d3dPhone1' // *********535
})
export class Thai2d3dPhonePipe1 implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
   let result = `+95-${value.substring(1,4).toString()} ***** ${value.substring(value.length - 2, value.length).toString()}`;
   return result;
  }
}

@Pipe({
    name: 'twodSetFormat'
})
export class TwodSetFormatPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) { }
    transform(value: string, ...args: unknown[]): unknown { // 1,680.2<8>
        if (value) {
            const num1 = value.split('').slice(0, -1).join('');
            const num2 = value.charAt(value.length - 1);
            let html = `<span>${num1}</span><span style="color: gold; font-weight: 600;">${num2}</span>`;
            return this.domSanitizer.bypassSecurityTrustHtml(html);
        }
    }
}

@Pipe({
    name: 'twodValFormat'
})
export class TwodValFormatPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) { }
    transform(value: string, ...args: unknown[]): unknown { // 28,06<7>.03
        if (value) {
            const num1 = value.split('.')[0].split('').slice(0, -1).join('');
            const num2 = value.split('.')[0].charAt(value.split('.')[0].length - 1);
            const num3 = value.split('.')[1];
            let html = `<span>${num1}</span><span style="color: gold; font-weight: 600;">${num2}</span>.<span>${num3}</span>`;
            return this.domSanitizer.bypassSecurityTrustHtml(html);
        }
    }
}

@Pipe({
    name: 'usernameFormat'
})
export class UsernameFormatPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) { }
    transform(value: string, ...args: unknown[]): unknown { // ...
        if (value != null && value.length > 30) {
            let name = value.substring(0, 20)+" ...";
            return name;
        } else {
            return value;
        }
    }
}

@Pipe({
    name: 'thai2d3dPhone2' // +95-944*****35
})
export class Thai2d3dPhonePipe2 implements PipeTransform {
    transform(value: string, ...args: unknown[]): unknown {
        if (value) {
            let result = `${value.substring(0,3).toString()}-${value.substring(3,6).toString()} ***** ${value.substring(value.length - 2, value.length).toString()}`;
            return result;
        }
    }
}

@Pipe({
    name: 'thai2d3dPhone3' // +959 445 *** ***
})
export class Thai2d3dPhonePipe3 implements PipeTransform {
    transform(value: string, ...args: unknown[]): unknown {
        if (value) {
            let result = `${value.substring(0,4).toString()} ${value.substring(4,7).toString()} *** ***`;
            return result;
        }
    }
}

@Pipe({
    name: 'thai2d3dPhone4' // +0944*****35
})
export class Thai2d3dPhonePipe4 implements PipeTransform {
    transform(value: string, ...args: unknown[]): unknown {
        if (value) {
            let result = `0${value.substring(3,6).toString()} ***** ${value.substring(value.length - 2, value.length).toString()}`;
            return result;
        }
    }
}

@Pipe({
    name: 'serialNumber' // 1st, 2nd, 3rd, 4th, 5th
})
export class SerialNumberPipe implements PipeTransform {
    transform(value: string, ...args: unknown[]): unknown {
        if (value) {
            let j = parseInt(value) % 10;
            let k = parseInt(value) % 100;
            if (j == 1 && k != 11) {
                return `${value}st`;
            }
            if (j == 2 && k != 12) {
                return `${value}nd`;
            }
            if (j == 3 && k != 13) {
                return `${value}rd`;
            }
            return `${value}th`;
        }
    }
}

@Pipe({
    name: 'listPipe'
  })
  export class ListPipe implements PipeTransform {
      transform(value: string): { text: string, link?: string }[] {
         // const items= value.split(/\d+\.\s*|\n/).filter(item => item.trim().length > 0);
         const items = value.split(/<br>/).filter(item => item.trim().length > 0)
          //const items = value.split(/\n/).filter(item => item.trim().length > 0);
            const parsedItems = items.map(item => {
            const linkMatch = item.match(/(.*?)\[(.*?)\]\((.*?)\)/);
            if (linkMatch && linkMatch.length ===4) {
              return { text: linkMatch[1].trim(), link: linkMatch[3].trim() };
            } else {
              return { text: item.trim() };
            }
          });

          return parsedItems;
        }
  }


