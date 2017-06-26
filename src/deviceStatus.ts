export class DeviceStatus {
  displayName: String;
  status: any;

  constructor(displayName: string, status: any){
    this.displayName = displayName;
    this.status = status;
  }
}