import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "genericFilter"
})
export class GenericFilterPipe implements PipeTransform {
  transform(list: any[], key: any): any {
    if (!list || key == "" || key == null) {
      return list;
    }
    return list.filter(function(item1) {
      for (let property in item1) {
        if (!item1[property]) {
          continue;
        }
        if (item1[property].toString().toLowerCase().includes(key.toLowerCase())) {
          return true;
        } else {
          let item2 = item1[property];
          for (let prop2 in item2){
            if (item2[prop2] === null) {
              continue;
            }
            if (item2[prop2].toString().toLowerCase().includes(key.toLowerCase())) {
              return true;
            } else {
              // let item3 = item2[prop2];
              // for (let prop3 in item3){
              //   if (item3[prop3] === null) {
              //     continue;
              //   }
              //   if (item3[prop3].toString().toLowerCase().includes(key.toLowerCase())) {
              //     return true;
              //   } 
              // }
              return false;
            }
          }
        }
      }
      return false;
    });
  }
}