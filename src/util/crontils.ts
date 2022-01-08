import cron from 'node-cron';

// wrap cron schedule in order to force task don't run immediately
export function createTask(schedule: string, taskFunc: Function) {
    const valid = cron.validate(schedule);
    if(!valid) {
        throw new Error("schedule string not valid, please check: https://github.com/node-cron/node-cron")
    }
    const task = cron.schedule(schedule, taskFunc, {
        scheduled: false
    });
    return task;
}