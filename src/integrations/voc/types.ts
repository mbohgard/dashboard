interface Results {
  ERS: {
    status: string;
    timestamp: string;
    engineStartWarning: string;
    engineStartWarningTimestamp: string;
  };
  averageFuelConsumption: number;
  averageFuelConsumptionTimestamp: string;
  averageSpeed: number;
  averageSpeedTimestamp: string;
  brakeFluid: string;
  brakeFluidTimestamp: string;
  bulbFailures: any[];
  bulbFailuresTimestamp: string;
  carLocked: boolean;
  carLockedTimestamp: string;
  distanceToEmpty: number;
  distanceToEmptyTimestamp: string;
  doors: {
    tailgateOpen: boolean;
    rearRightDoorOpen: boolean;
    rearLeftDoorOpen: boolean;
    frontRightDoorOpen: boolean;
    frontLeftDoorOpen: boolean;
    hoodOpen: boolean;
    timestamp: string;
  };
  engineRunning: boolean;
  engineRunningTimestamp: string;
  fuelAmount: number;
  fuelAmountLevel: number;
  fuelAmountLevelTimestamp: string;
  fuelAmountTimestamp: string;
  heater: {
    seatSelection: {
      frontDriverSide: boolean;
      frontPassengerSide: boolean;
      rearDriverSide: boolean;
      rearPassengerSide: boolean;
      rearMid: boolean;
    };
    status: string;
    timestamp: string;
  };
  hvBattery: {
    hvBatteryChargeStatusDerived: string;
    hvBatteryChargeStatusDerivedTimestamp: string;
    hvBatteryChargeModeStatus: null;
    hvBatteryChargeModeStatusTimestamp: null;
    hvBatteryChargeStatus: string;
    hvBatteryChargeStatusTimestamp: string;
    hvBatteryLevel: number;
    hvBatteryLevelTimestamp: string;
    distanceToHVBatteryEmpty: null;
    distanceToHVBatteryEmptyTimestamp: string;
    hvBatteryChargeWarning: string;
    hvBatteryChargeWarningTimestamp: string;
    timeToHVBatteryFullyCharged: number;
    timeToHVBatteryFullyChargedTimestamp: string;
  };
  odometer: number;
  odometerTimestamp: string;
  privacyPolicyEnabled: boolean;
  privacyPolicyEnabledTimestamp: string;
  remoteClimatizationStatus: any;
  remoteClimatizationStatusTimestamp: any;
  serviceWarningStatus: string;
  serviceWarningStatusTimestamp: string;
  theftAlarm: any;
  timeFullyAccessibleUntil: string;
  timePartiallyAccessibleUntil: string;
  tripMeter1: number;
  tripMeter1Timestamp: string;
  tripMeter2: number;
  tripMeter2Timestamp: string;
  tyrePressure: {
    frontLeftTyrePressure: string;
    frontRightTyrePressure: string;
    rearLeftTyrePressure: string;
    rearRightTyrePressure: string;
    timestamp: string;
  };
  washerFluidLevel: string;
  washerFluidLevelTimestamp: string;
  windows: {
    frontLeftWindowOpen: boolean;
    frontRightWindowOpen: boolean;
    timestamp: string;
    rearLeftWindowOpen: boolean;
    rearRightWindowOpen: boolean;
  };
}

export type ApiResponse =
  | Results
  | {
      errorLabel: string;
      errorDescription: string;
    };
