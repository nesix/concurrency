export const concurrency = <X, T>(
  jobs: T[],
  handler: (job: T) => Promise<X>,
  limit: number,
): Promise<X[]> =>
  new Promise((resolve, reject) => {
    const result: X[] = [];
    if (limit < 1) {
      return reject(new Error('`limit` must be positive'));
    }
    if (jobs.length === 0) return resolve(result);
    let job = 0;
    let complete = 0;
    let stop = false;

    const runJob = async (j: number) => {
      await handler(jobs[j])
        .then((res) => {
          if (stop) return;
          result[j] = res;
          complete++;
          if (complete === jobs.length) {
            resolve(result);
          } else if (jobs[job]) {
            // noinspection JSIgnoredPromiseFromCall
            runJob(job++);
          }
        })
        .catch((error) => {
          stop = true;
          reject(error);
        });
    };

    for (; job < jobs.length && job < limit; job++) {
      // noinspection JSIgnoredPromiseFromCall
      runJob(job);
    }
  });
