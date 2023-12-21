// import { Item } from '../model/item.schema';
// import { project } from './../model/project.model';
// import { IssuesList } from '../model/issueslist.model';
// import {UserDetailKey} from '../model/userKey.model';
// import {LastTrack} from '../model/lasttrack.model';

import Dexie, { Table } from 'dexie';

interface RequestData {
  id?: number;
  localId?: number;
  endTime?: Date;
  imageName?: string;
  imageSource?: string;
  projectId?: number;
  projectName?: string;
  sourceCode?: string;
  startTime?: string;
  taskId?: number;
  taskname?: string;
  trackTime?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export  class sgDatabase extends Dexie {
  public requestData!: Table<RequestData, number>;
  public constructor() {
      super('sgDatabase');
      this.version(15).stores({
        requestData:'++id,endTime,imageName,imageSource,projectId,projectName,sourceCode,startTime,taskId,taskname,trackTime',
      });
      this.requestData = this.table('requestData');

      this.open().catch(function(err) {
        console.error (err.stack || err);
    });
  }
  }
