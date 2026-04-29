import { Platform } from 'react-native';
import AppleHealthKit, { HealthValue, HealthInputOptions } from 'react-native-health';
import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions
} from 'react-native-health-connect';

export type HealthData = {
  steps: number;
  activeCalories: number;
  restingHeartRate: number;
  sleepHours: number;
  weightKg: number | null;
  workoutLogged: boolean;
};

// Android Health Connect permissions
const androidPermissions = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'RestingHeartRate' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'Weight' },
  { accessType: 'read', recordType: 'ExerciseSession' },
];

export async function initHealthKit(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.StepCount,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          AppleHealthKit.Constants.Permissions.RestingHeartRate,
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
          AppleHealthKit.Constants.Permissions.Weight,
          AppleHealthKit.Constants.Permissions.Workout,
        ],
        write: [],
      },
    };

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (err: string | object | null) => {
        if (err) {
          console.log('error initializing Healthkit: ', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else if (Platform.OS === 'android') {
    try {
      const isInitialized = await initialize();
      if (!isInitialized) return false;

      const granted = await requestPermission(androidPermissions as any);
      return granted.length > 0;
    } catch (err) {
      console.log('error initializing Health Connect: ', err);
      return false;
    }
  }
  return false;
}

export async function fetchHealthData(): Promise<HealthData> {
  const data: HealthData = {
    steps: 0,
    activeCalories: 0,
    restingHeartRate: 0,
    sleepHours: 0,
    weightKg: null,
    workoutLogged: false,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (Platform.OS === 'ios') {
    const options: HealthInputOptions = {
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
    };

    // Steps
    try {
      const steps = await new Promise<HealthValue>((resolve, reject) => {
        AppleHealthKit.getStepCount(options, (err: object | string | null, results: HealthValue) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      data.steps = steps?.value || 0;
    } catch (e) { console.log(e); }

    // Active Calories
    try {
      const calories = await new Promise<HealthValue[]>((resolve, reject) => {
        AppleHealthKit.getActiveEnergyBurned(options, (err: object | string | null, results: HealthValue[]) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      data.activeCalories = calories.reduce((sum, item) => sum + item.value, 0);
    } catch (e) { console.log(e); }

    // RHR
    try {
      const rhr = await new Promise<HealthValue[]>((resolve, reject) => {
        AppleHealthKit.getHeartRateSamples(options, (err: object | string | null, results: HealthValue[]) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      if (rhr && rhr.length > 0) {
         data.restingHeartRate = Math.round(rhr.reduce((sum, item) => sum + item.value, 0) / rhr.length);
      }
    } catch (e) { console.log(e); }

    // Sleep (pulling from last 24 hrs to catch previous night)
    try {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(18, 0, 0, 0);
      const sleepOptions: HealthInputOptions = {
        startDate: yesterday.toISOString(),
        endDate: today.toISOString(),
      };

      const sleep = await new Promise<HealthValue[]>((resolve, reject) => {
        AppleHealthKit.getSleepSamples(sleepOptions, (err: object | string | null, results: HealthValue[]) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      // Calculate total sleep in hours (ASLEEP values)
      if (sleep) {
         let msSleep = 0;
         sleep.forEach(s => {
            if (String(s.value) === 'ASLEEP') {
               const start = new Date(s.startDate).getTime();
               const end = new Date(s.endDate).getTime();
               msSleep += (end - start);
            }
         });
         data.sleepHours = Math.round((msSleep / (1000 * 60 * 60)) * 10) / 10;
      }
    } catch (e) { console.log(e); }

    // Weight
    try {
       const weightOptions: HealthInputOptions = {
          startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
          endDate: tomorrow.toISOString(),
          limit: 1,
          ascending: false
       };
       const weight = await new Promise<HealthValue[]>((resolve, reject) => {
          AppleHealthKit.getLatestWeight(weightOptions, (err: object | string | null, results: HealthValue) => {
             if (err) reject(err);
             else resolve([results as any]); // getLatestWeight returns a single object sometimes, coercing to array
          });
       });
       if (weight && weight.length > 0 && weight[0]) {
          const weightKgOptions: HealthInputOptions = { ...weightOptions, unit: 'kg' as any };
          const weightKg = await new Promise<HealthValue>((resolve, reject) => {
            AppleHealthKit.getLatestWeight(weightKgOptions, (err: object | string | null, results: HealthValue) => {
               if (err) reject(err);
               else resolve(results);
            });
          });
          if (weightKg && weightKg.value) {
            data.weightKg = Math.round((weightKg.value / 1000) * 10) / 10;
          }
       }
    } catch(e) { console.log(e); }

    // Workouts
    try {
       const workouts = await new Promise<HealthValue[]>((resolve, reject) => {
          AppleHealthKit.getSamples({
             startDate: today.toISOString(),
             endDate: tomorrow.toISOString(),
             type: 'Workout' as any
          }, (err: object | string | null, results: HealthValue[]) => {
             if (err) reject(err);
             else resolve(results);
          });
       });
       if (workouts && workouts.length > 0) {
          data.workoutLogged = true;
       }
    } catch(e) { console.log(e); }

  } else if (Platform.OS === 'android') {
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime: today.toISOString(),
      endTime: tomorrow.toISOString(),
    };

    try {
      // Steps
      const steps = await readRecords('Steps', { timeRangeFilter });
      data.steps = steps.records.reduce((sum: number, r: any) => sum + r.count, 0);

      // Active Calories
      const cals = await readRecords('ActiveCaloriesBurned', { timeRangeFilter });
      data.activeCalories = cals.records.reduce((sum: number, r: any) => sum + r.energy.inKilocalories, 0);

      // RHR
      const rhr = await readRecords('RestingHeartRate', { timeRangeFilter });
      if (rhr.records.length > 0) {
         data.restingHeartRate = Math.round(
            rhr.records.reduce((sum: number, r: any) => sum + r.beatsPerMinute, 0) / rhr.records.length
         );
      }

      // Sleep
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(18, 0, 0, 0);
      const sleep = await readRecords('SleepSession', {
         timeRangeFilter: {
            operator: 'between',
            startTime: yesterday.toISOString(),
            endTime: today.toISOString(),
         }
      });
      if (sleep.records.length > 0) {
         let msSleep = 0;
         sleep.records.forEach((r: any) => {
            msSleep += (new Date(r.endTime).getTime() - new Date(r.startTime).getTime());
         });
         data.sleepHours = Math.round((msSleep / (1000 * 60 * 60)) * 10) / 10;
      }

      // Weight
      const weightRange = new Date();
      weightRange.setDate(weightRange.getDate() - 7);
      const weight = await readRecords('Weight', {
         timeRangeFilter: {
            operator: 'between',
            startTime: weightRange.toISOString(),
            endTime: tomorrow.toISOString(),
         },
         ascendingOrder: false,
         pageSize: 1
      });
      if (weight.records.length > 0) {
         data.weightKg = Math.round(weight.records[0].weight.inKilograms * 10) / 10;
      }

      // Workouts
      const workouts = await readRecords('ExerciseSession', { timeRangeFilter });
      if (workouts.records.length > 0) {
         data.workoutLogged = true;
      }

    } catch (e) {
      console.log('Error reading Health Connect', e);
    }
  }

  return data;
}
